from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any

# Define the allowed lists of categorical values to prevent out-of-distribution inputs
ALLOWED_CROPS = [
    "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans",
    "mungbean", "blackgram", "lentil", "pomegranate", "banana", "mango",
    "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya",
    "coconut", "cotton", "jute", "coffee", "arecanut", "arhar/tur", "urad",
    "moong", "gram", "sugarcane", "wheat", "potato"
]

ALLOWED_STATES = [
    "andaman and nicobar", "andhra pradesh", "arunachal pradesh", "assam",
    "bihar", "chandigarh", "chhattisgarh", "dadra and nagar haveli", "goa",
    "gujarat", "haryana", "himachal pradesh", "jammu and kashmir", "jharkhand",
    "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur",
    "meghalaya", "mizoram", "nagaland", "odisha", "puducherry", "punjab",
    "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura",
    "uttar pradesh", "uttarakhand", "west bengal"
]

ALLOWED_SEASONS = [
    "kharif", "rabi", "summer", "autumn", "winter", "whole year"
]

# ==========================================
# INPUT SCHEMAS
# ==========================================

class CropRecommendationInput(BaseModel):
    """Input model for the Crop Recommendation Classification Model."""
    N: int = Field(..., description="Nitrogen content in soil (mg/kg)", ge=0, le=200)
    P: int = Field(..., description="Phosphorus content in soil (mg/kg)", ge=0, le=200)
    K: int = Field(..., description="Potassium content in soil (mg/kg)", ge=0, le=300)
    temperature: float = Field(..., description="Temperature in Celsius (°C)", ge=-10.0, le=60.0)
    humidity: float = Field(..., description="Relative humidity (%)", ge=0.0, le=100.0)
    ph: float = Field(..., description="Soil pH level", ge=0.0, le=14.0)
    rainfall: float = Field(..., description="Average rainfall (mm)", ge=0.0, le=1000.0)


class YieldPredictionInput(BaseModel):
    """Input model for the Crop Yield Prediction Regression Model."""
    crop: str = Field(..., description="Type of crop being cultivated")
    state: str = Field(..., description="State where crop is cultivated")
    season: str = Field(..., description="Sowing season (e.g. Kharif, Rabi, Summer, Whole Year)")
    area: float = Field(..., description="Area of land under cultivation (hectares)", gt=0.0)
    annual_rainfall: float = Field(..., description="Average annual rainfall (mm)", ge=0.0)
    fertilizer: float = Field(..., description="Fertilizer applied (kg)", ge=0.0)
    pesticide: float = Field(..., description="Pesticide applied (kg)", ge=0.0)

    @field_validator('crop')
    @classmethod
    def validate_crop(cls, v: str) -> str:
        val = v.strip().lower()
        if val not in ALLOWED_CROPS:
            raise ValueError(f"Crop '{v}' is not supported. Supported crops: {ALLOWED_CROPS}")
        return val

    @field_validator('state')
    @classmethod
    def validate_state(cls, v: str) -> str:
        val = v.strip().lower()
        if val not in ALLOWED_STATES:
            raise ValueError(f"State '{v}' is not supported. Supported states: {ALLOWED_STATES}")
        return val

    @field_validator('season')
    @classmethod
    def validate_season(cls, v: str) -> str:
        val = v.strip().lower()
        if val not in ALLOWED_SEASONS:
            raise ValueError(f"Season '{v}' is not supported. Supported seasons: {ALLOWED_SEASONS}")
        return val


class CombinedPredictionInput(BaseModel):
    """Input model for the joint Recommendation and Yield Prediction endpoint."""
    # Soil parameters for Recommendation
    N: int = Field(..., description="Nitrogen content in soil (mg/kg)", ge=0, le=200)
    P: int = Field(..., description="Phosphorus content in soil (mg/kg)", ge=0, le=200)
    K: int = Field(..., description="Potassium content in soil (mg/kg)", ge=0, le=300)
    temperature: float = Field(..., description="Temperature in Celsius (°C)", ge=-10.0, le=60.0)
    humidity: float = Field(..., description="Relative humidity (%)", ge=0.0, le=100.0)
    ph: float = Field(..., description="Soil pH level", ge=0.0, le=14.0)
    rainfall: float = Field(..., description="Average rainfall (mm)", ge=0.0, le=1000.0)
    
    # Location and operational metrics for Yield Prediction
    state: str = Field(..., description="State where crop is cultivated")
    season: str = Field(..., description="Sowing season")
    area: float = Field(..., description="Area of land under cultivation (hectares)", gt=0.0)
    fertilizer: float = Field(..., description="Fertilizer applied (kg)", ge=0.0)
    pesticide: float = Field(..., description="Pesticide applied (kg)", ge=0.0)

    @field_validator('state')
    @classmethod
    def validate_state(cls, v: str) -> str:
        val = v.strip().lower()
        if val not in ALLOWED_STATES:
            raise ValueError(f"State '{v}' is not supported.")
        return val

    @field_validator('season')
    @classmethod
    def validate_season(cls, v: str) -> str:
        val = v.strip().lower()
        if val not in ALLOWED_SEASONS:
            raise ValueError(f"Season '{v}' is not supported.")
        return val


# ==========================================
# OUTPUT SCHEMAS
# ==========================================

class CropRecommendationResponse(BaseModel):
    """Response model for the Crop Recommendation Classification Model."""
    recommended_crop: str
    confidence: float
    probabilities: Dict[str, float]
    input_parameters: Dict[str, Any]


class YieldPredictionResponse(BaseModel):
    """Response model for the Crop Yield Prediction Regression Model."""
    predicted_yield_tons_per_ha: float
    expected_production_tons: float
    input_parameters: Dict[str, Any]


class CombinedPredictionResponse(BaseModel):
    """Response model for the joint Recommendation and Yield Prediction endpoint."""
    recommended_crop: str
    recommendation_confidence: float
    predicted_yield_tons_per_ha: float
    expected_production_tons: float
    input_parameters: Dict[str, Any]
