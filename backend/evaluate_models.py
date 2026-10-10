import os
import subprocess
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    r2_score,
    mean_absolute_error,
    mean_squared_error
)

# Define paths
models_dir = "models"
rec_model_path = os.path.join(models_dir, "crop_recommendation", "v1.0.0", "classifier.joblib")
rec_scaler_path = os.path.join(models_dir, "crop_recommendation", "v1.0.0", "pipeline.joblib")
yield_model_path = os.path.join(models_dir, "yield_prediction", "v1.0.0", "regressor.joblib")

crop_rec_data_path = "../Crop Recommendation dataset/Crop_recommendation.csv"
crop_yield_data_path = "../Agricultural Crop Yield in Indian States Dataset/crop_yield.csv"

# 1. Fallback: Retrain models if any file is missing
if not (os.path.exists(rec_model_path) and os.path.exists(rec_scaler_path) and os.path.exists(yield_model_path)):
    print("Saved models are missing. Retraining models...")
    subprocess.run(["python", "train_models.py"], check=True)

# 2. Load model artifacts
scaler = joblib.load(rec_scaler_path)
classifier = joblib.load(rec_model_path)
regressor = joblib.load(yield_model_path)

# -------------------------------------------------------------
# 3. Evaluate Crop Recommendation Model on Held-out 20% Test Split
# -------------------------------------------------------------
accuracy = 0.0
precision = 0.0
recall = 0.0
f1 = 0.0
report_rec = ""
cm_rec = None

if os.path.exists(crop_rec_data_path):
    df_rec = pd.read_csv(crop_rec_data_path)
    X_rec = df_rec[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y_rec = df_rec['label']
    
    # Reproduce exact same 80/20 train/test split with stratify=y_rec and random_state=42
    _, X_test_rec, _, y_test_rec = train_test_split(
        X_rec, y_rec, test_size=0.2, random_state=42, stratify=y_rec
    )
    
    # Scale test features using the loaded scaler (fitted on training data only)
    X_test_rec_scaled = scaler.transform(X_test_rec)
    
    # Predict and evaluate on held-out test data
    y_pred_rec = classifier.predict(X_test_rec_scaled)
    accuracy = accuracy_score(y_test_rec, y_pred_rec)
    precision = precision_score(y_test_rec, y_pred_rec, average='weighted')
    recall = recall_score(y_test_rec, y_pred_rec, average='weighted')
    f1 = f1_score(y_test_rec, y_pred_rec, average='weighted')
    report_rec = classification_report(y_test_rec, y_pred_rec)
    cm_rec = confusion_matrix(y_test_rec, y_pred_rec)
else:
    print(f"Error: Could not find crop recommendation dataset at {crop_rec_data_path}")

# -------------------------------------------------------------
# 4. Evaluate Crop Yield Prediction Model on Held-out 20% Test Split
# -------------------------------------------------------------
r2 = 0.0
mae = 0.0
mse = 0.0
rmse = 0.0

if os.path.exists(crop_yield_data_path):
    df_yield = pd.read_csv(crop_yield_data_path)
    
    # Clean data matching train_models.py
    df_yield['Crop'] = df_yield['Crop'].astype(str).str.strip().str.lower()
    df_yield['State'] = df_yield['State'].astype(str).str.strip().str.lower()
    df_yield['Season'] = df_yield['Season'].astype(str).str.strip().str.lower()
    
    # Preprocess inputs matching train_models.py logic
    X_yield = pd.DataFrame()
    X_yield['Crop'] = df_yield['Crop']
    X_yield['State'] = df_yield['State']
    X_yield['Season'] = df_yield['Season']
    X_yield['Area'] = np.log1p(df_yield['Area'])
    X_yield['Annual_Rainfall'] = df_yield['Annual_Rainfall']
    X_yield['Fertilizer'] = np.log1p(df_yield['Fertilizer'])
    X_yield['Pesticide'] = np.log1p(df_yield['Pesticide'])
    
    # Target = log1p(Yield)
    y_yield = np.log1p(df_yield['Yield'])
    
    # Reproduce exact same 80/20 train/test split with random_state=42
    _, X_test_yield, _, y_test_yield = train_test_split(
        X_yield, y_yield, test_size=0.2, random_state=42
    )
    
    # Predict and evaluate on held-out test data
    y_pred_yield = regressor.predict(X_test_yield)
    r2 = r2_score(y_test_yield, y_pred_yield)
    mae = mean_absolute_error(y_test_yield, y_pred_yield)
    mse = mean_squared_error(y_test_yield, y_pred_yield)
    rmse = np.sqrt(mse)
else:
    print(f"Error: Could not find crop yield dataset at {crop_yield_data_path}")

# -------------------------------------------------------------
# 5. Print Results
# -------------------------------------------------------------
print("==================================================")
print("SMART CROP RECOMMENDATION SYSTEM")
print("MODEL EVALUATION REPORT (HELD-OUT 20% TEST SET)")
print("==================================================")
print()
print("Crop Recommendation (Classification)")
print()
print(f"Accuracy             : {accuracy:.6f}")
print(f"Precision            : {precision:.6f}")
print(f"Recall               : {recall:.6f}")
print(f"F1 Score             : {f1:.6f}")
print()
print("Classification Report")
print(report_rec)
print()
print("Confusion Matrix")
print(cm_rec)
print()
print("--------------------------------------------------")
print()
print("Crop Yield Prediction (Regression)")
print()
print(f"R² Score             : {r2:.6f}")
print(f"MAE                  : {mae:.6f}")
print(f"MSE                  : {mse:.6f}")
print(f"RMSE                 : {rmse:.6f}")
print()
print("==================================================")
print("Evaluation Completed Successfully")
print("==================================================")
