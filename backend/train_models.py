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
# 2. Train Crop Yield Prediction Model (Data Cleaning & Retraining)
# -------------------------------------------------------------
print("=" * 60)
print("TRAINING CROP YIELD PREDICTION MODEL (DATA CLEANING & RETRAINING)")
print("=" * 60)

crop_yield_data_path = "../Agricultural Crop Yield in Indian States Dataset/crop_yield.csv"
if os.path.exists(crop_yield_data_path):
    df_yield = pd.read_csv(crop_yield_data_path)
    raw_row_count = len(df_yield)
    print(f"Raw dataset rows: {raw_row_count:,}")
    
    # Step 1: Normalize crop/state/season strings (strip, lowercase, collapse repeated spaces)
    for col in ['Crop', 'State', 'Season']:
        df_yield[col] = df_yield[col].astype(str).str.strip().str.lower().str.replace(r'\s+', ' ', regex=True)
    
    # Step 2: Drop rows for coconut, cotton(lint), jute, mesta and aggregate categories
    drop_crops = [
        'coconut', 'cotton(lint)', 'jute', 'mesta',
        'oilseeds total', 'other cereals', 'other rabi pulses',
        'other kharif pulses', 'other oilseeds', 'other summer pulses'
    ]
    dropped_mask = df_yield['Crop'].isin(drop_crops)
    dropped_count = dropped_mask.sum()
    df_yield = df_yield[~dropped_mask].copy()
    print(f"Dropped {dropped_count:,} rows belonging to excluded/aggregate crops: {drop_crops}")
    print(f"Remaining rows after dropping excluded crops: {len(df_yield):,}")
    print()
    
    # Step 3a: Print Yield == 0 per crop and drop if under 5% of rows
    print("Zero Yield Analysis Per Crop:")
    print(f"{'Crop':<25} | {'Zero Rows':<10} | {'Total Rows':<10} | {'Zero %':<8} | Action")
    print("-" * 65)
    
    zero_dropped_crops = []
    crops_to_keep_zeros = []
    
    for crop, grp in df_yield.groupby('Crop'):
        n_zeros = (grp['Yield'] == 0).sum()
        pct_zeros = (n_zeros / len(grp)) * 100
        if n_zeros > 0:
            if pct_zeros < 5.0:
                action = "Drop 0s (< 5%)"
                zero_dropped_crops.append(crop)
            else:
                action = "Keep 0s (>= 5%)"
                crops_to_keep_zeros.append(crop)
            print(f"{crop:<25} | {n_zeros:<10} | {len(grp):<10} | {pct_zeros:<7.2f}% | {action}")
            
    # Drop Yield == 0 rows for crops where zero percentage is under 5%
    mask_zero_to_drop = (df_yield['Yield'] == 0) & (df_yield['Crop'].isin(zero_dropped_crops))
    n_zeros_dropped = mask_zero_to_drop.sum()
    df_yield = df_yield[~mask_zero_to_drop].copy()
    print(f"\nTotal zero-yield rows dropped: {n_zeros_dropped} across {len(zero_dropped_crops)} crops.")
    print(f"Rows remaining after zero-yield filtering: {len(df_yield):,}")
    print()
    
    # Step 3b: Per crop, drop rows with Yield above Q3 + 3*IQR
    print("Outlier Yield Filtering Per Crop (Yield > Q3 + 3*IQR):")
    print(f"{'Crop':<25} | {'Q1':<8} | {'Q3':<8} | {'IQR':<8} | {'Cutoff':<8} | {'Max':<8} | {'Outliers Dropped':<16}")
    print("-" * 95)
    
    cleaned_crop_dfs = []
    total_outliers_dropped = 0
    
    for crop, grp in df_yield.groupby('Crop'):
        q1 = grp['Yield'].quantile(0.25)
        q3 = grp['Yield'].quantile(0.75)
        iqr = q3 - q1
        cutoff = q3 + 3.0 * iqr
        
        outliers_mask = grp['Yield'] > cutoff
        n_outliers = outliers_mask.sum()
        total_outliers_dropped += n_outliers
        
        if n_outliers > 0:
            print(f"{crop:<25} | {q1:<8.3f} | {q3:<8.3f} | {iqr:<8.3f} | {cutoff:<8.3f} | {grp['Yield'].max():<8.3f} | {n_outliers:<16}")
            
        cleaned_crop_dfs.append(grp[~outliers_mask])
        
    df_clean = pd.concat(cleaned_crop_dfs, ignore_index=True)
    print(f"\nTotal outlier rows dropped: {total_outliers_dropped} across {len(cleaned_crop_dfs)} crops.")
    print(f"Cleaned dataset rows: {len(df_clean):,} (from initial {raw_row_count:,})")
    print()
    
    # Step 4: Per-hectare features & percentiles
    # Replace Fertilizer and Pesticide with log1p(Fertilizer/Area) and log1p(Pesticide/Area)
    # Remove Area from model inputs
    df_clean['Fertilizer_per_ha'] = df_clean['Fertilizer'] / df_clean['Area']
    df_clean['Pesticide_per_ha'] = df_clean['Pesticide'] / df_clean['Area']
    
    fert_p1 = float(df_clean['Fertilizer_per_ha'].quantile(0.01))
    fert_p99 = float(df_clean['Fertilizer_per_ha'].quantile(0.99))
    pest_p1 = float(df_clean['Pesticide_per_ha'].quantile(0.01))
    pest_p99 = float(df_clean['Pesticide_per_ha'].quantile(0.99))
    
    print("Computed Per-Hectare Feature Percentiles (Cleaned Data):")
    print(f"  Fertilizer/Area : 1st percentile = {fert_p1:.2f} kg/ha, 99th percentile = {fert_p99:.2f} kg/ha")
    print(f"  Pesticide/Area  : 1st percentile = {pest_p1:.4f} kg/ha, 99th percentile = {pest_p99:.4f} kg/ha")
    print()
    
    supported_crops = sorted(df_clean['Crop'].unique().tolist())
    print(f"Total supported crops ({len(supported_crops)}): {supported_crops}")
    print()
    
    # Step 5: Save metadata artifact
    metadata_artifact = {
        "supported_crops": supported_crops,
        "feature_percentiles": {
            "fertilizer_per_ha": {
                "p1": fert_p1,
                "p99": fert_p99
            },
            "pesticide_per_ha": {
                "p1": pest_p1,
                "p99": pest_p99
            }
        }
    }
    metadata_path = "models/yield_prediction/v1.0.0/metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata_artifact, f, indent=2)
    print(f"Saved model metadata to: {metadata_path}")
    
    # Save State Rainfall Lookup Table
    state_rainfall_means = df_clean.groupby('State')['Annual_Rainfall'].mean().round(2).to_dict()
    national_rainfall_mean = round(float(df_clean['Annual_Rainfall'].mean()), 2)
    state_rainfall_artifact = {
        "national_mean_rainfall": national_rainfall_mean,
        "state_annual_rainfall_means": state_rainfall_means
    }
    state_rainfall_path = "models/yield_prediction/v1.0.0/state_rainfall.json"
    with open(state_rainfall_path, "w", encoding="utf-8") as f:
        json.dump(state_rainfall_artifact, f, indent=2)
    print(f"Saved state rainfall lookup table to: {state_rainfall_path}")
    print()
    
    # Build Model Input DataFrame
    # Inputs: Crop, State, Season, Annual_Rainfall, Fertilizer, Pesticide (Area removed!)
    X_yield = pd.DataFrame()
    X_yield['Crop'] = df_clean['Crop']
    X_yield['State'] = df_clean['State']
    X_yield['Season'] = df_clean['Season']
    X_yield['Annual_Rainfall'] = df_clean['Annual_Rainfall']
    X_yield['Fertilizer'] = np.log1p(df_clean['Fertilizer_per_ha'])
    X_yield['Pesticide'] = np.log1p(df_clean['Pesticide_per_ha'])
    
    # Target = log1p(Yield)
    y_yield = np.log1p(df_clean['Yield'])
    
    # 80/20 Train/Test split
    X_train_yield, X_test_yield, y_train_yield, y_test_yield = train_test_split(
        X_yield, y_yield, test_size=0.2, random_state=42
    )
    print(f"Training samples: {len(X_train_yield):,}, Held-out test samples: {len(X_test_yield):,}")
    print()
    
    categorical_features = ['Crop', 'State', 'Season']
    numerical_features = ['Annual_Rainfall', 'Fertilizer', 'Pesticide']
    
    # Hyperparameter Grid Search
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
