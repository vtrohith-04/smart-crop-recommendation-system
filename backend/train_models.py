import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

# Ensure target directories exist
os.makedirs("models/crop_recommendation/v1.0.0", exist_ok=True)
os.makedirs("models/yield_prediction/v1.0.0", exist_ok=True)

# -------------------------------------------------------------
# 1. Train Crop Recommendation Model
# -------------------------------------------------------------
print("Training Crop Recommendation Model...")
crop_rec_data_path = "../Crop Recommendation dataset/Crop_recommendation.csv"
if os.path.exists(crop_rec_data_path):
    df_rec = pd.read_csv(crop_rec_data_path)
    X_rec = df_rec[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y_rec = df_rec['label']
    
    # Train StandardScaler and save it as pipeline.joblib (as expected by model_loader.py)
    scaler = StandardScaler()
    X_rec_scaled = scaler.fit_transform(X_rec)
    joblib.dump(scaler, "models/crop_recommendation/v1.0.0/pipeline.joblib")
    print("Saved pipeline.joblib (scaler)")
    
    # Train Classifier
    classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    classifier.fit(X_rec_scaled, y_rec)
    joblib.dump(classifier, "models/crop_recommendation/v1.0.0/classifier.joblib")
    print("Saved classifier.joblib (model)")
else:
    print(f"Error: Could not find crop recommendation dataset at {crop_rec_data_path}")

# -------------------------------------------------------------
# 2. Train Crop Yield Prediction Model
# -------------------------------------------------------------
print("Training Crop Yield Prediction Model...")
crop_yield_data_path = "../Agricultural Crop Yield in Indian States Dataset/crop_yield.csv"
if os.path.exists(crop_yield_data_path):
    df_yield = pd.read_csv(crop_yield_data_path)
    
    # Clean data to match schemas.py cleaning (strip whitespace and convert to lowercase)
    df_yield['Crop'] = df_yield['Crop'].astype(str).str.strip().str.lower()
    df_yield['State'] = df_yield['State'].astype(str).str.strip().str.lower()
    df_yield['Season'] = df_yield['Season'].astype(str).str.strip().str.lower()
    
    # Preprocess inputs matching prediction_service.py logic
    X_yield = pd.DataFrame()
    X_yield['Crop'] = df_yield['Crop']
    X_yield['State'] = df_yield['State']
    X_yield['Season'] = df_yield['Season']
    X_yield['Area'] = np.log1p(df_yield['Area'])
    X_yield['Annual_Rainfall'] = df_yield['Annual_Rainfall']
    X_yield['Fertilizer'] = np.log1p(df_yield['Fertilizer'])
    X_yield['Pesticide'] = np.log1p(df_yield['Pesticide'])
    
    # target = log1p(Yield)
    y_yield = np.log1p(df_yield['Yield'])
    
    categorical_features = ['Crop', 'State', 'Season']
    numerical_features = ['Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', 'passthrough', numerical_features)
        ])
    
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
    ])
    
    model_pipeline.fit(X_yield, y_yield)
    joblib.dump(model_pipeline, "models/yield_prediction/v1.0.0/regressor.joblib")
    print("Saved regressor.joblib (pipeline)")
else:
    print(f"Error: Could not find crop yield dataset at {crop_yield_data_path}")

print("Model training complete!")
