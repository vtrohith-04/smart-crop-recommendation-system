import os
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.schemas import (
    CropRecommendationInput,
    CropRecommendationResponse,
    YieldPredictionInput,
    YieldPredictionResponse,
    CombinedPredictionInput,
    CombinedPredictionResponse
)
from app.models.model_loader import model_loader
from app.services.prediction_service import PredictionService
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler: executes artifact loading on application startup."""
    try:
        model_loader.load_artifacts()
    except Exception as e:
        print(f"Error loading models during startup sequence: {e}")
    yield
    # Cleanup operations (if any) can be placed here

# Initialize FastAPI application with lifespan context
app = FastAPI(
    title="Smart Crop Recommendation and Yield Prediction API",
    description="Machine Learning backend service providing real-time crop recommendations and yield predictions.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React Frontend integration
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# CUSTOM ERROR HANDLERS
# ==========================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Intercepts input validation failures and formats structured JSON responses."""
    error_details = []
    for error in exc.errors():
        field = " -> ".join([str(loc) for loc in error.get("loc", [])])
        msg = error.get("msg", "Value validation error")
        error_details.append({"field": field, "error": msg})
        
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Input validation failed. Please check the parameter constraints.",
            "errors": error_details
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Intercepts standard HTTP exceptions and formats JSON output."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all error handler for unexpected server errors to prevent system exposure."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected server error occurred during request processing.",
            "error_detail": str(exc)
        }
    )

# ==========================================
# REST ENDPOINTS
# ==========================================

@app.get("/", status_code=status.HTTP_200_OK)
@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """System status and API health endpoint."""
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "fallback_mode_active": model_loader.is_mock,
        "models_loaded": {
            "crop_recommendation": "MockEngine" if model_loader.is_mock else "RandomForestClassifier",
            "yield_prediction": "MockEngine" if model_loader.is_mock else "RandomForestRegressor"
        }
    }


@app.get("/supported-crops", status_code=status.HTTP_200_OK)
async def get_supported_crops():
    """Returns the list of crops supported by the yield prediction regression engine."""
    crops = model_loader.get_supported_yield_crops()
    return {
        "count": len(crops),
        "supported_crops": crops
    }


@app.post("/crop-recommendation", response_model=CropRecommendationResponse, status_code=status.HTTP_200_OK)
async def crop_recommendation(payload: CropRecommendationInput):
    """Recommends the best crop suitability based on soil nutrients and weather metrics."""
    try:
        result = PredictionService.get_crop_recommendation(payload)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation computation failed: {str(e)}"
        )


@app.post("/yield-prediction", response_model=YieldPredictionResponse, status_code=status.HTTP_200_OK)
async def yield_prediction(payload: YieldPredictionInput):
    """Forecasts expected crop yield (tons per hectare) based on acreage, inputs, and regional weather."""
    try:
        result = PredictionService.get_yield_prediction(payload)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Yield forecasting failed: {str(e)}"
        )


@app.post("/predict", response_model=CombinedPredictionResponse, status_code=status.HTTP_200_OK)
@app.post("/smart-predict", response_model=CombinedPredictionResponse, status_code=status.HTTP_200_OK)
async def predict_combined(payload: CombinedPredictionInput):
    """Executes recommendation classifier and pipes the output crop dynamically to the yield regressor."""
    try:
        # 1. Execute Crop Recommendation first
        rec_payload = CropRecommendationInput(
            N=payload.N,
            P=payload.P,
            K=payload.K,
            temperature=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall
        )
        rec_result = PredictionService.get_crop_recommendation(rec_payload)
        recommended_crop = rec_result["recommended_crop"]
        recommendation_confidence = rec_result["confidence"]

        # 2. Extract recommended crop name and compile yield prediction payload
        # Annual rainfall is dynamically resolved from historical state meteorological averages
        annual_rainfall = model_loader.get_state_rainfall(payload.state)

        yield_payload = YieldPredictionInput(
            crop=recommended_crop,
            state=payload.state,
            season=payload.season,
            area=payload.area,
            annual_rainfall=annual_rainfall,
            fertilizer=payload.fertilizer,
            pesticide=payload.pesticide
        )
        
        yield_result = PredictionService.get_yield_prediction(yield_payload)

        # 3. Consolidate results into a single output payload
        return {
            "recommended_crop": recommended_crop,
            "recommendation_confidence": recommendation_confidence,
            "yield_available": yield_result.get("yield_available", True),
            "predicted_yield_tons_per_ha": yield_result.get("predicted_yield_tons_per_ha"),
            "expected_production_tons": yield_result.get("expected_production_tons"),
            "yield_message": yield_result.get("yield_message"),
            "clipping_warning": yield_result.get("clipping_warning"),
            "input_parameters": payload.model_dump()
        }
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Integration error between models: {str(val_err)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Combined pipeline execution failed: {str(e)}"
        )
