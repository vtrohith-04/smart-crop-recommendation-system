from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, Optional, List

# ==========================================
# CANONICAL CROP MAPPING & WHITELISTS
# ==========================================

# Canonical mapping from regional/common names to yield census dataset names
CANONICAL_CROP_MAP: Dict[str, str] = {
    "blackgram": "urad",
    "chickpea": "gram",
    "lentil": "masoor",
    "mothbeans": "moth",
    "mungbean": "moong(green gram)",
    "moong": "moong(green gram)",
    "pigeonpeas": "arhar/tur",
    "cotton": "cotton(lint)",
}

def normalize_crop_name(crop: str) -> str:
    """Normalizes crop names and maps known aliases to their canonical dataset representation."""
    cleaned = crop.strip().lower()
    return CANONICAL_CROP_MAP.get(cleaned, cleaned)

# Inconsistent unit crops (nuts/ha or bales/ha instead of metric tons/ha)
INCONSISTENT_UNIT_CROPS = {"coconut", "cotton(lint)", "cotton", "jute", "mesta"}

# 45 Crops learned by regressor with valid metric tons/ha yield data
SUPPORTED_YIELD_CROPS: List[str] = [
    "arecanut", "arhar/tur", "bajra", "banana", "barley", "black pepper",
    "cardamom", "cashewnut", "castor seed", "coriander", "cowpea(lobia)",
    "dry chillies", "garlic", "ginger", "gram", "groundnut", "guar seed",
    "horse-gram", "jowar", "khesari", "linseed", "maize", "masoor",
    "moong(green gram)", "moth", "niger seed", "onion",
    "peas & beans (pulses)", "potato", "ragi", "rapeseed &mustard", "rice",
    "safflower", "sannhamp", "sesamum", "small millets", "soyabean",
    "sugarcane", "sunflower", "sweet potato", "tapioca", "tobacco",
    "turmeric", "urad", "wheat"
]

# 22 Crops output by the crop recommendation classifier
RECOMMENDER_CROPS: List[str] = [
    "apple", "banana", "blackgram", "chickpea", "coconut", "coffee",
    "cotton", "grapes", "jute", "kidneybeans", "lentil", "maize",
    "mango", "mothbeans", "mungbean", "muskmelon", "orange", "papaya",
    "pigeonpeas", "pomegranate", "rice", "watermelon"
]

# Recognized crop pool for request validation
ALL_RECOGNIZED_CROPS = set(SUPPORTED_YIELD_CROPS) | set(CANONICAL_CROP_MAP.keys()) | set(RECOMMENDER_CROPS)

# Yield crop whitelist (supported crops for yield regression)
ALLOWED_CROPS = list(SUPPORTED_YIELD_CROPS)

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
        if val not in ALL_RECOGNIZED_CROPS and normalize_crop_name(val) not in set(SUPPORTED_YIELD_CROPS):
            raise ValueError(
                f"Crop '{v}' is not recognized. For the list of supported yield forecasting crops, "
                f"call GET /supported-crops."
            )
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
    yield_available: bool = True
    predicted_yield_tons_per_ha: Optional[float] = None
    expected_production_tons: Optional[float] = None
    yield_message: Optional[str] = None
    clipping_warning: Optional[str] = None
    input_parameters: Dict[str, Any]


class CombinedPredictionResponse(BaseModel):
    """Response model for the joint Recommendation and Yield Prediction endpoint."""
    recommended_crop: str
    recommendation_confidence: float
    yield_available: bool = True
    predicted_yield_tons_per_ha: Optional[float] = None
    expected_production_tons: Optional[float] = None
    yield_message: Optional[str] = None
    clipping_warning: Optional[str] = None
    input_parameters: Dict[str, Any]
