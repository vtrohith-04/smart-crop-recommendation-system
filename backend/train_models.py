import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

# Ensure target directories exist
os.makedirs("models/crop_recommendation/v1.0.0", exist_ok=True)
os.makedirs("models/yield_prediction/v1.0.0", exist_ok=True)

# -------------------------------------------------------------
# 1. Train Crop Recommendation Model (80/20 Train-Test Split with Stratification)
# -------------------------------------------------------------
print("=" * 60)
print("TRAINING CROP RECOMMENDATION MODEL")
print("=" * 60)

crop_rec_data_path = "../Crop Recommendation dataset/Crop_recommendation.csv"
if os.path.exists(crop_rec_data_path):
    df_rec = pd.read_csv(crop_rec_data_path)
    X_rec = df_rec[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y_rec = df_rec['label']
    
    # 80/20 Train/Test split with stratification
    X_train_rec, X_test_rec, y_train_rec, y_test_rec = train_test_split(
        X_rec, y_rec, test_size=0.2, random_state=42, stratify=y_rec
    )
    print(f"Training samples: {len(X_train_rec)}, Held-out test samples: {len(X_test_rec)}")
    
    # Fit StandardScaler on TRAINING data only to avoid data leakage
    scaler = StandardScaler()
    X_train_rec_scaled = scaler.fit_transform(X_train_rec)
    joblib.dump(scaler, "models/crop_recommendation/v1.0.0/pipeline.joblib", compress=3)
    print("Saved pipeline.joblib (scaler)")
    
    # Train Classifier on scaled training data
    classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    classifier.fit(X_train_rec_scaled, y_train_rec)
    joblib.dump(classifier, "models/crop_recommendation/v1.0.0/classifier.joblib", compress=3)
    print("Saved classifier.joblib (model)")
else:
    print(f"Error: Could not find crop recommendation dataset at {crop_rec_data_path}")

print()

# -------------------------------------------------------------
# 2. Train Crop Yield Prediction Model (Grid Search & State Rainfall Extraction)
# -------------------------------------------------------------
print("=" * 60)
print("TRAINING CROP YIELD PREDICTION MODEL (HYPERPARAMETER SEARCH)")
print("=" * 60)

crop_yield_data_path = "../Agricultural Crop Yield in Indian States Dataset/crop_yield.csv"
if os.path.exists(crop_yield_data_path):
    df_yield = pd.read_csv(crop_yield_data_path)
    
    # Clean data matching schemas.py validation
    df_yield['Crop'] = df_yield['Crop'].astype(str).str.strip().str.lower()
    df_yield['State'] = df_yield['State'].astype(str).str.strip().str.lower()
    df_yield['Season'] = df_yield['Season'].astype(str).str.strip().str.lower()
    
    # Compute and save state-level mean annual rainfall lookup table
    state_rainfall_means = df_yield.groupby('State')['Annual_Rainfall'].mean().round(2).to_dict()
    national_rainfall_mean = round(float(df_yield['Annual_Rainfall'].mean()), 2)
    
    state_rainfall_artifact = {
        "national_mean_rainfall": national_rainfall_mean,
        "state_annual_rainfall_means": state_rainfall_means
    }
    
    state_rainfall_path = "models/yield_prediction/v1.0.0/state_rainfall.json"
    with open(state_rainfall_path, "w", encoding="utf-8") as f:
        json.dump(state_rainfall_artifact, f, indent=2)
    print(f"Saved state rainfall lookup table to: {state_rainfall_path}")
    
    # Preprocess inputs matching prediction_service.py logic
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
    
    # 80/20 Train/Test split
    X_train_yield, X_test_yield, y_train_yield, y_test_yield = train_test_split(
        X_yield, y_yield, test_size=0.2, random_state=42
    )
    print(f"Training samples: {len(X_train_yield)}, Held-out test samples: {len(X_test_yield)}")
    print()
    
    categorical_features = ['Crop', 'State', 'Season']
    numerical_features = ['Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
    
    # Grid search candidate configurations
    n_estimators_list = [50, 100]
    min_samples_leaf_list = [1, 3, 5, 10]
    max_depth_list = [None, 20]
    
    results = []
    temp_dir = "models/yield_prediction/temp"
    os.makedirs(temp_dir, exist_ok=True)
    
    print(f"{'n_estimators':>12} | {'min_samples_leaf':>16} | {'max_depth':>10} | {'Held-out R²':>12} | {'Held-out MAE':>12} | {'Size (MB)':>10}")
    print("-" * 85)
    
    for n_est in n_estimators_list:
        for min_leaf in min_samples_leaf_list:
            for max_d in max_depth_list:
                preprocessor = ColumnTransformer(
                    transformers=[
                        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
                        ('num', 'passthrough', numerical_features)
                    ]
                )
                
                pipe = Pipeline(steps=[
                    ('preprocessor', preprocessor),
                    ('regressor', RandomForestRegressor(
                        n_estimators=n_est,
                        min_samples_leaf=min_leaf,
                        max_depth=max_d,
                        random_state=42,
                        n_jobs=-1
                    ))
                ])
                
                # Fit ONLY on training data
                pipe.fit(X_train_yield, y_train_yield)
                
                # Evaluate on held-out test data
                y_pred_val = pipe.predict(X_test_yield)
                r2_val = r2_score(y_test_yield, y_pred_val)
                mae_val = mean_absolute_error(y_test_yield, y_pred_val)
                
                # Check compressed joblib size
                temp_file = os.path.join(temp_dir, f"temp_{n_est}_{min_leaf}_{max_d}.joblib")
                joblib.dump(pipe, temp_file, compress=3)
                file_size_mb = os.path.getsize(temp_file) / (1024 * 1024)
                
                depth_str = str(max_d) if max_d is not None else "None"
                print(f"{n_est:>12} | {min_leaf:>16} | {depth_str:>10} | {r2_val:>12.4f} | {mae_val:>12.4f} | {file_size_mb:>9.2f} MB")
                
                results.append({
                    'n_estimators': n_est,
                    'min_samples_leaf': min_leaf,
                    'max_depth': max_d,
                    'r2': r2_val,
                    'mae': mae_val,
                    'size_mb': file_size_mb,
                    'pipeline': pipe
                })
                
                # Cleanup temp file
                if os.path.exists(temp_file):
                    os.remove(temp_file)
    
    if os.path.exists(temp_dir):
        os.rmdir(temp_dir)
        
    # Select best configuration: smallest size within 0.01 of best R²
    best_r2 = max(r['r2'] for r in results)
    eligible = [r for r in results if r['r2'] >= (best_r2 - 0.01)]
    chosen = min(eligible, key=lambda x: x['size_mb'])
    
    print("-" * 85)
    print(f"Best Held-out R² Score : {best_r2:.4f}")
    print(f"Chosen Configuration   : n_estimators={chosen['n_estimators']}, min_samples_leaf={chosen['min_samples_leaf']}, max_depth={chosen['max_depth']}")
    print(f"Chosen Model R² Score  : {chosen['r2']:.4f} (within {best_r2 - chosen['r2']:.4f} of best)")
    print(f"Chosen Model MAE       : {chosen['mae']:.4f}")
    print(f"Chosen Model File Size : {chosen['size_mb']:.2f} MB")
    
    # Save selected pipeline as final artifact
    final_yield_path = "models/yield_prediction/v1.0.0/regressor.joblib"
    joblib.dump(chosen['pipeline'], final_yield_path, compress=3)
    print(f"Saved final compressed artifact: {final_yield_path}")
else:
    print(f"Error: Could not find crop yield dataset at {crop_yield_data_path}")

print()
print("Model training and selection completed successfully!")
