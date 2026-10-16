# Crop Yield Model Robustness & Evaluation Report

**Dataset:** `Agricultural Crop Yield in Indian States Dataset/crop_yield.csv`  
**Total Records:** 19,689 rows  
**Preprocessing:** Identical to `train_models.py` (`np.log1p` on Area, Fertilizer, Pesticide, Yield; `OneHotEncoder` on Crop, State, Season; `passthrough` on Annual_Rainfall).  

---

## 1. Random 80/20 Split Model Comparison

* **Train Samples:** 15,751 (80%)  
* **Test Samples:** 3,938 (20%)  
* **Random State:** 42  

| Model | Log R² | Log MAE | Original Tons/ha R² | Original Tons/ha MAE | Original Tons/ha RMSE |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest (current params: n=50, min_leaf=3, depth=None)** | 0.9649 | 0.1180 | **0.9271** | 13.61 t/ha | 241.76 t/ha |
| **XGBoost Regressor (n=100, lr=0.1, max_depth=6)** | 0.9177 | 0.2057 | **0.9204** | 18.05 t/ha | 252.55 t/ha |
| **Ridge Regression (alpha=1.0)** | 0.8605 | 0.2583 | **0.7677** | 33.27 t/ha | 431.45 t/ha |

---

## 2. Time-Based Split Model Comparison (Chronological Holdout)

* **Dataset Year Span:** 1997 to 2020  
* **Training Partition:** `Crop_Year <= 2017` (1997 - 2017, 17,510 samples / 88.9%)  
* **Testing Partition:** `Crop_Year > 2017` (2018 - 2020, 2,179 samples / 11.1%) [Last 3 Years: 2018, 2019, 2020]  

| Model | Log R² | Log MAE | Original Tons/ha R² | Original Tons/ha MAE | Original Tons/ha RMSE |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest (current params: n=50, min_leaf=3, depth=None)** | 0.9426 | 0.1523 | **0.9521** | 12.60 t/ha | 185.81 t/ha |
| **XGBoost Regressor (n=100, lr=0.1, max_depth=6)** | 0.8962 | 0.2345 | **0.9151** | 17.34 t/ha | 247.31 t/ha |
| **Ridge Regression (alpha=1.0)** | 0.8440 | 0.2685 | **0.7826** | 27.96 t/ha | 395.79 t/ha |

---

## 3. Dataset Descriptive Statistics & Acreage Distribution

Descriptive statistics for numerical features and target variable:

| Metric | Area (ha) | Fertilizer (kg) | Pesticide (kg) | Annual_Rainfall (mm) | Yield (t/ha) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **count** | 19,689.00 | 19,689.00 | 19,689.00 | 19,689.00 | 19,689.00 |
| **mean** | 179,926.57 | 24,103,312.45 | 48,848.35 | 1,437.76 | 79.95 |
| **std** | 732,828.68 | 94,946,004.48 | 213,287.35 | 816.91 | 878.31 |
| **min** | 0.50 | 54.17 | 0.09 | 301.30 | 0.00 |
| **25%** | 1,390.00 | 188,014.62 | 356.70 | 940.70 | 0.60 |
| **50%** | 9,317.00 | 1,234,957.44 | 2,421.90 | 1,247.60 | 1.03 |
| **75%** | 75,112.00 | 10,003,847.20 | 20,041.70 | 1,643.70 | 2.39 |
| **max** | 50,808,100.00 | 4,835,406,877.00 | 15,750,511.00 | 6,552.70 | 21,105.00 |

### Farm Size Distribution Breakdown (Area < 100 Hectares)

* **Total Rows:** 19,689
* **Rows with Area < 100 hectares:** **1,521 (7.73%)**
* **Rows with Area >= 100 hectares:** **18,168 (92.27%)**

> **Key Agricultural Observation:** 92.27% of records in this dataset represent aggregated district/state agricultural acreages (mean: 179,926 hectares; median: 9,317 hectares), rather than individual smallholder family plots (< 2-5 hectares). This is a critical domain finding for project evaluators.

---

## 4. Production Random Forest Model Artifact Size

* **File Path:** `backend/models/yield_prediction/v1.0.0/regressor.joblib`
* **Compressed Size (compress=3):** **6.43 MB** (6,738,680 bytes)
* **Uncompressed Baseline Size:** ~167 MB (before hyperparameter pruning: `min_samples_leaf=3`, `n_estimators=50`)

