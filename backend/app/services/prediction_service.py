import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from app.schemas import CropRecommendationInput, YieldPredictionInput, CombinedPredictionInput, normalize_crop_name
from app.models.model_loader import model_loader

# Define typical base yield statistics (tons per hectare) for different crops
BASE_CROP_YIELDS = {
    "rice": 3.6,
    "maize": 4.5,
    "chickpea": 1.6,
    "kidneybeans": 1.4,
    "pigeonpeas": 1.2,
    "mothbeans": 0.8,
    "mungbean": 0.9,
    "blackgram": 1.0,
    "lentil": 1.1,
    "pomegranate": 8.5,
    "banana": 35.0,
    "mango": 9.2,
    "grapes": 15.4,
    "watermelon": 25.0,
    "muskmelon": 20.0,
    "apple": 12.5,
    "orange": 14.0,
    "papaya": 28.0,
    "coconut": 18.0,
    "cotton": 2.2,
    "jute": 2.8,
    "coffee": 1.5,
    "arecanut": 1.8,
    "arhar/tur": 1.2,
    "urad": 1.0,
    "moong": 0.9,
    "gram": 1.5,
    "sugarcane": 78.0,
    "wheat": 3.4,
    "potato": 22.0
}

# List of crops corresponding to the recommendation model label indexes
RECOGNITION_CROPS = [
    "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans",
    "mungbean", "blackgram", "lentil", "pomegranate", "banana", "mango",
    "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya",
    "coconut", "cotton", "jute", "coffee"
]

class PredictionService:
    """Business logic layer processing features and executing machine learning predictions."""
    
    @staticmethod
    def get_crop_recommendation(payload: CropRecommendationInput) -> Dict[str, Any]:
        # Convert input Pydantic model to DataFrame with matching feature names
        feature_df = pd.DataFrame([{
            'N': payload.N,
            'P': payload.P,
            'K': payload.K,
            'temperature': payload.temperature,
            'humidity': payload.humidity,
            'ph': payload.ph,
            'rainfall': payload.rainfall
        }])

        feature_vector = feature_df
        # Preprocessing scaling (if actual scaler is loaded)
        if model_loader.scaler is not None:
            try:
                feature_vector = model_loader.scaler.transform(feature_df)
            except Exception:
                # Fallback if scaling fails
                pass

        # Execute Prediction
        if model_loader.recommendation_model is None:
            raise ValueError("Recommendation model is not initialized.")
        
        recommended_crop_arr = model_loader.recommendation_model.predict(feature_vector)
        recommended_crop = str(recommended_crop_arr[0])

        # Get probabilities
        probabilities_arr = model_loader.recommendation_model.predict_proba(feature_vector)[0]
        
        # Build probability dictionary using model's classes if available
        if hasattr(model_loader.recommendation_model, "classes_"):
            classes = model_loader.recommendation_model.classes_
            probabilities = {
                str(crop): round(float(probabilities_arr[idx]), 4)
                for idx, crop in enumerate(classes)
                if idx < len(probabilities_arr)
            }
        else:
            probabilities = {
                crop: round(float(probabilities_arr[idx]), 4)
                for idx, crop in enumerate(RECOGNITION_CROPS)
                if idx < len(probabilities_arr)
            }
        
        # Ensure the predicted crop exists in the probabilities
        if recommended_crop not in probabilities:
            probabilities[recommended_crop] = 1.0

        confidence = probabilities.get(recommended_crop, 1.0)

        return {
            "recommended_crop": recommended_crop,
            "confidence": confidence,
            "probabilities": probabilities,
            "input_parameters": payload.model_dump()
        }

    @staticmethod
    def get_yield_prediction(payload: YieldPredictionInput) -> Dict[str, Any]:
        crop = payload.crop.strip().lower()
        mapped_crop = normalize_crop_name(crop)
        area = payload.area
        rainfall = payload.annual_rainfall

        # If the mapped crop is not supported by the yield regressor, return yield_available=False
        if not model_loader.is_crop_supported(mapped_crop):
            return {
                "yield_available": False,
                "predicted_yield_tons_per_ha": None,
                "expected_production_tons": None,
                "yield_message": "No reliable yield data for this crop",
                "clipping_warning": None,
                "input_parameters": payload.model_dump()
            }

        # Compute per-hectare input application rates
        fert_per_ha = payload.fertilizer / area
        pest_per_ha = payload.pesticide / area

        # Retrieve 1st and 99th percentiles from model metadata
        percentiles = model_loader.get_feature_percentiles()
        fert_p1 = percentiles.get("fertilizer_per_ha", {}).get("p1", 94.67)
        fert_p99 = percentiles.get("fertilizer_per_ha", {}).get("p99", 171.76)
        pest_p1 = percentiles.get("pesticide_per_ha", {}).get("p1", 0.09)
        pest_p99 = percentiles.get("pesticide_per_ha", {}).get("p99", 0.38)

        # Clip per-hectare features to dataset bounds and register clipping warning
        clipping_warnings = []
        fert_clipped = fert_per_ha
        if fert_per_ha < fert_p1:
            fert_clipped = fert_p1
            clipping_warnings.append(f"Fertilizer rate ({fert_per_ha:.1f} kg/ha) was below 1st percentile ({fert_p1:.1f} kg/ha) and clipped.")
        elif fert_per_ha > fert_p99:
            fert_clipped = fert_p99
            clipping_warnings.append(f"Fertilizer rate ({fert_per_ha:.1f} kg/ha) exceeded 99th percentile ({fert_p99:.1f} kg/ha) and clipped.")

        pest_clipped = pest_per_ha
        if pest_per_ha < pest_p1:
            pest_clipped = pest_p1
            clipping_warnings.append(f"Pesticide rate ({pest_per_ha:.3f} kg/ha) was below 1st percentile ({pest_p1:.3f} kg/ha) and clipped.")
        elif pest_per_ha > pest_p99:
            pest_clipped = pest_p99
            clipping_warnings.append(f"Pesticide rate ({pest_per_ha:.3f} kg/ha) exceeded 99th percentile ({pest_p99:.3f} kg/ha) and clipped.")

        clipping_warning = " ".join(clipping_warnings) if clipping_warnings else None

        # If real model is loaded, we preprocess and run it with per-hectare log features (Area excluded)
        if not model_loader.is_mock and model_loader.yield_model is not None:
            try:
                df_input = pd.DataFrame([{
                    "Crop": mapped_crop,
                    "State": payload.state.strip().lower(),
                    "Season": payload.season.strip().lower(),
                    "Annual_Rainfall": rainfall,
                    "Fertilizer": np.log1p(fert_clipped),
                    "Pesticide": np.log1p(pest_clipped)
                }])
                pred_log_yield = model_loader.yield_model.predict(df_input)
                predicted_yield = float(np.expm1(pred_log_yield[0]))
            except Exception:
                # Fall back to simulation if real pipeline fails
                predicted_yield = PredictionService._simulate_yield(mapped_crop, payload.fertilizer, payload.pesticide, rainfall)
        else:
            # Fallback mock simulation (rule-based)
            predicted_yield = PredictionService._simulate_yield(mapped_crop, payload.fertilizer, payload.pesticide, rainfall)

        # Expected Production in tons = Yield (tons/ha) * Area (ha)
        expected_production = round(predicted_yield * area, 2)

        return {
            "yield_available": True,
            "predicted_yield_tons_per_ha": round(predicted_yield, 3),
            "expected_production_tons": expected_production,
            "yield_message": None,
            "clipping_warning": clipping_warning,
            "input_parameters": payload.model_dump()
        }

    @staticmethod
    def _simulate_yield(crop: str, fertilizer: float, pesticide: float, rainfall: float) -> float:
        """Simulates yield values using standard agricultural constants and input adjustments."""
        base_yield = BASE_CROP_YIELDS.get(crop, 3.0)

        # 1. Input scaling adjustments: Yield increases with fertilizer/pesticides up to a logarithmic limit
        # Yield multiplier based on input rates (kg per hectare equivalent)
        input_mult = 1.0
        if fertilizer > 0:
            input_mult += 0.08 * np.log1p(fertilizer / 100.0)
        if pesticide > 0:
            input_mult += 0.04 * np.log1p(pesticide / 10.0)

        # 2. Weather adjustments: Deviations from ideal rainfall diminish yield
        weather_mult = 1.0
        # Simple optimal rainfall check
        if rainfall > 0:
            if rainfall < 500:
                weather_mult -= 0.15 # Drought stress
            elif rainfall > 1500:
                weather_mult -= 0.10 # Excessive moisture stress

        simulated_yield = base_yield * input_mult * weather_mult
        
        # Ensure positive yield bounds
        return max(0.1, float(simulated_yield))
