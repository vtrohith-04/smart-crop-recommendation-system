import os
import json
import logging
import joblib
import numpy as np

# Configure logging
logger = logging.getLogger("uvicorn.error")

class MockCropRecommendationModel:
    """Mock classifier that simulates the Crop Recommendation model based on agricultural heuristics."""
    def predict(self, features: np.ndarray) -> np.ndarray:
        # features shape: (1, 7) -> [N, P, K, temp, humidity, ph, rainfall]
        feat = features[0]
        N, P, K, temp, hum, ph, rain = feat
        
        # Rule-based heuristics matching the Crop Recommendation Dataset ranges
        if rain > 200.0:
            return np.array(["rice"])
        elif rain > 130.0 and N > 60:
            return np.array(["jute"])
        elif P > 100 and K > 100:
            if temp > 25.0:
                return np.array(["grapes"])
            else:
                return np.array(["apple"])
        elif hum > 80.0:
            if temp > 28.0:
                return np.array(["coconut"])
            else:
                return np.array(["watermelon"])
        elif temp > 30.0 and hum < 50.0:
            return np.array(["mango"])
        elif ph < 5.0:
            return np.array(["coffee"])
        elif N < 30 and P > 50:
            return np.array(["chickpea"])
        else:
            return np.array(["maize"])

    def predict_proba(self, features: np.ndarray) -> np.ndarray:
        # Returns mock probabilities for 22 classes
        crops = [
            "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans",
            "mungbean", "blackgram", "lentil", "pomegranate", "banana", "mango",
            "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya",
            "coconut", "cotton", "jute", "coffee"
        ]
        pred_crop = self.predict(features)[0]
        
        # Create a mock probability array centered on the predicted crop
        probas = np.zeros(len(crops))
        pred_idx = crops.index(pred_crop) if pred_crop in crops else 0
        probas[pred_idx] = 0.85
        
        # Distribute remaining 15% probability across other classes
        rem_proba = 0.15 / (len(crops) - 1)
        for i in range(len(crops)):
            if i != pred_idx:
                probas[i] = rem_proba
                
        return np.array([probas])


class MockYieldPredictionModel:
    """Mock regressor that simulates the Crop Yield prediction model using base yields and inputs."""
    def predict(self, features: np.ndarray) -> np.ndarray:
        return np.array([2.5])


class ModelLoader:
    """Handles the lazy loading and caching of model binaries and preprocessing artifacts."""
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            # Resolve to the backend/models directory relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.models_dir = os.path.join(base_dir, "models")
        else:
            self.models_dir = models_dir
        self.recommendation_model = None
        self.yield_model = None
        self.scaler = None
        self.encoder = None
        self.state_rainfall = {}
        self.national_rainfall_mean = 1437.76
        self.supported_crops = []
        self.feature_percentiles = {
            "fertilizer_per_ha": {"p1": 94.67, "p99": 171.76},
            "pesticide_per_ha": {"p1": 0.09, "p99": 0.38}
        }
        self.is_mock = False

    def load_artifacts(self) -> None:
        """Attempts to load model artifacts and lookup tables from disk; falls back to mock models if missing."""
        rec_model_path = os.path.join(self.models_dir, "crop_recommendation", "v1.0.0", "classifier.joblib")
        yield_model_path = os.path.join(self.models_dir, "yield_prediction", "v1.0.0", "regressor.joblib")
        scaler_path = os.path.join(self.models_dir, "crop_recommendation", "v1.0.0", "pipeline.joblib")
        state_rainfall_path = os.path.join(self.models_dir, "yield_prediction", "v1.0.0", "state_rainfall.json")

        logger.info(f"Checking for ML models in path: {os.path.abspath(self.models_dir)}")
        
        # Load Crop Recommendation Classification Model
        if os.path.exists(rec_model_path):
            try:
                self.recommendation_model = joblib.load(rec_model_path)
                logger.info("Successfully loaded Crop Recommendation Model (Classification).")
            except Exception as e:
                logger.error(f"Error loading Crop Recommendation Model: {e}. Falling back to mock.")
                self.recommendation_model = MockCropRecommendationModel()
                self.is_mock = True
        else:
            logger.warning("Crop Recommendation Model binary not found. Falling back to Mock Engine.")
            self.recommendation_model = MockCropRecommendationModel()
            self.is_mock = True

        # Load Crop Yield Prediction Regression Model
        if os.path.exists(yield_model_path):
            try:
                self.yield_model = joblib.load(yield_model_path)
                logger.info("Successfully loaded Crop Yield Prediction Model (Regression).")
            except Exception as e:
                logger.error(f"Error loading Crop Yield Model: {e}. Falling back to mock.")
                self.yield_model = MockYieldPredictionModel()
                self.is_mock = True
        else:
            logger.warning("Crop Yield Prediction Model binary not found. Falling back to Mock Engine.")
            self.yield_model = MockYieldPredictionModel()
            self.is_mock = True

        # Load Preprocessing scaler/pipelines if they exist
        if os.path.exists(scaler_path):
            try:
                self.scaler = joblib.load(scaler_path)
                logger.info("Successfully loaded Preprocessing Pipeline (Scalers/Encoders).")
            except Exception as e:
                logger.error(f"Error loading Preprocessing Pipeline: {e}.")
        else:
            logger.warning("Preprocessing Pipeline not found. Scaling will be bypassed or mocked.")

        # Load metadata (supported crops and per-hectare percentiles)
        metadata_path = os.path.join(self.models_dir, "yield_prediction", "v1.0.0", "metadata.json")
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                    self.supported_crops = meta.get("supported_crops", [])
                    if "feature_percentiles" in meta:
                        self.feature_percentiles = meta["feature_percentiles"]
                logger.info(f"Successfully loaded yield metadata ({len(self.supported_crops)} crops).")
            except Exception as e:
                logger.error(f"Error loading yield metadata: {e}")
        else:
            # Fallback: Extract supported yield crops from OneHotEncoder categories_
            self.supported_crops = []
            inconsistent_crops = {
                "coconut", "cotton(lint)", "cotton", "jute", "mesta",
                "oilseeds total", "other cereals", "other rabi pulses",
                "other kharif pulses", "other oilseeds", "other summer pulses"
            }
            if self.yield_model is not None and hasattr(self.yield_model, "named_steps"):
                try:
                    preprocessor = self.yield_model.named_steps.get("preprocessor")
                    if preprocessor and hasattr(preprocessor, "named_transformers_"):
                        ohe = preprocessor.named_transformers_.get("cat")
                        if ohe and hasattr(ohe, "categories_") and len(ohe.categories_) > 0:
                            learned_crops = list(ohe.categories_[0])
                            self.supported_crops = sorted([
                                str(c).strip().lower() for c in learned_crops
                                if str(c).strip().lower() not in inconsistent_crops
                            ])
                            logger.info(f"Loaded {len(self.supported_crops)} supported yield crops from regressor categories.")
                except Exception as e:
                    logger.error(f"Error extracting learned crop categories from regressor: {e}")

        # Load State Annual Rainfall Lookup Table
        if os.path.exists(state_rainfall_path):
            try:
                with open(state_rainfall_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.national_rainfall_mean = data.get("national_mean_rainfall", 1437.76)
                    self.state_rainfall = data.get("state_annual_rainfall_means", {})
                logger.info(f"Successfully loaded State Annual Rainfall Lookup Table ({len(self.state_rainfall)} states).")
            except Exception as e:
                logger.error(f"Error loading State Rainfall Lookup Table: {e}.")
        else:
            logger.warning("State Rainfall Lookup Table not found. Defaulting to national mean fallback.")

    def get_feature_percentiles(self) -> dict:
        """Returns the 1st and 99th percentiles for per-hectare features."""
        if not hasattr(self, "feature_percentiles") or not self.feature_percentiles:
            self.load_artifacts()
        return getattr(self, "feature_percentiles", {
            "fertilizer_per_ha": {"p1": 94.67, "p99": 171.76},
            "pesticide_per_ha": {"p1": 0.09, "p99": 0.38}
        })

    def get_supported_yield_crops(self) -> list:
        """Returns the list of crops with valid, reliable yield regression data."""
        if getattr(self, "supported_crops", None):
            return list(self.supported_crops)
        if self.yield_model is None:
            self.load_artifacts()
            if getattr(self, "supported_crops", None):
                return list(self.supported_crops)
        from app.schemas import SUPPORTED_YIELD_CROPS
        return list(SUPPORTED_YIELD_CROPS)

    def is_crop_supported(self, crop: str) -> bool:
        """Checks if a canonical crop name is supported by the yield regressor."""
        from app.schemas import normalize_crop_name
        canonical = normalize_crop_name(crop)
        supported_set = set(self.get_supported_yield_crops())
        return canonical in supported_set

    def get_state_rainfall(self, state: str) -> float:
        """Retrieves mean annual rainfall for a state or logs a clear warning and falls back to national mean."""
        state_clean = state.strip().lower()
        if self.state_rainfall and state_clean in self.state_rainfall:
            return float(self.state_rainfall[state_clean])
        
        logger.warning(
            f"State '{state}' was not found in the historical annual rainfall dataset. "
            f"Falling back to national mean ({self.national_rainfall_mean:.2f} mm)."
        )
        return float(self.national_rainfall_mean)

# Global model loader instance
model_loader = ModelLoader()
