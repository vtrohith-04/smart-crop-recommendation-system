import os
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
        # We expect inputs reflecting either preprocessed numerical features or categorical representations.
        # Let's write a simple simulation: yield based on crop type, fertilizer, and rainfall.
        # If input is a dictionary or a structured array, we can decode it.
        # For simplicity, we implement a robust fallback prediction directly in the prediction service.
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
        self.is_mock = False

    def load_artifacts(self) -> None:
        """Attempts to load model artifacts from disk; falls back to mock models if missing."""
        rec_model_path = os.path.join(self.models_dir, "crop_recommendation", "v1.0.0", "classifier.joblib")
        yield_model_path = os.path.join(self.models_dir, "yield_prediction", "v1.0.0", "regressor.joblib")
        scaler_path = os.path.join(self.models_dir, "crop_recommendation", "v1.0.0", "pipeline.joblib")

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

# Global model loader instance
model_loader = ModelLoader()
