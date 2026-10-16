# AgriIntellect - Smart Crop Recommendation & Yield Prediction System

An end-to-end Machine Learning web application designed to empower agricultural decision-making. The system provides real-time crop recommendations based on soil nutrient chemistry and climatic parameters, predicts crop yield (tons/hectare) and total farm production, and features a dual-model intelligent advisory pipeline.

---

## 🏗️ System Architecture

* **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, React Hot Toast
* **Backend:** FastAPI, Uvicorn, Pydantic v2
* **Machine Learning:** Scikit-Learn (`RandomForestClassifier`, `RandomForestRegressor`), NumPy, Pandas, Joblib
* **Datasets:** Indian Agricultural Crop Yield & Crop Recommendation datasets

---

## 📊 Measured Model Performance & Baselines

All metrics below are computed directly from the project's evaluation scripts ([`backend/evaluate_robustness.py`](file:///d:/Downloads/smart-crop-recommendation-system/backend/evaluate_robustness.py) and [`backend/evaluate_yield_robustness.py`](file:///d:/Downloads/smart-crop-recommendation-system/backend/evaluate_yield_robustness.py)) with zero data leakage:

### 1. Crop Recommendation (5-Fold Stratified Cross-Validation)
*Dataset: 2,200 samples across 22 crop classes, StandardScaler inside Pipeline.*

| Model | Preprocessing | Mean Accuracy | Std Dev | Mean Macro-F1 | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Random Forest (n=100)** | StandardScaler (Pipeline) | **0.995455 (99.55%)** | ± 0.003214 | **0.995448 (99.54%)** | **Implemented** |
| **XGBoost** | StandardScaler (Pipeline) | 0.993182 (99.32%) | ± 0.002490 | 0.993178 (99.32%) | Baseline |
| **Decision Tree** | StandardScaler (Pipeline) | 0.987727 (98.77%) | ± 0.006833 | 0.987724 (98.77%) | Baseline |
| **KNN (k=5)** | StandardScaler (Pipeline) | 0.971364 (97.14%) | ± 0.006833 | 0.971212 (97.12%) | Baseline |
| **Logistic Regression** | StandardScaler (Pipeline) | 0.970909 (97.09%) | ± 0.002227 | 0.970725 (97.07%) | Baseline |

### 2. Crop Yield Forecasting (Random 80/20 vs Time-Based Split)
*Dataset: 19,689 records. Features: Crop, State, Season, Area, Annual_Rainfall, Fertilizer, Pesticide.*

* **Random 80/20 Split** (15,751 train / 3,938 test):
  * **Random Forest (Implemented):** Log $R^2 = \mathbf{0.9649}$, Log MAE = $\mathbf{0.1180}$ | Original Tons/ha $R^2 = \mathbf{0.9271}$, MAE = $\mathbf{13.61\text{ t/ha}}$
  * **XGBoost Regressor:** Log $R^2 = 0.9177$, Log MAE = $0.2057$ | Original Tons/ha $R^2 = 0.9204$, MAE = $18.05\text{ t/ha}$
  * **Ridge Regression:** Log $R^2 = 0.8605$, Log MAE = $0.2583$ | Original Tons/ha $R^2 = 0.7677$, MAE = $33.27\text{ t/ha}$
* **Chronological Time-Based Split** (Train $\le 2017$ [17,510 samples], Test $2018\text{--}2020$ [2,179 samples]):
  * **Random Forest (Implemented):** Log $R^2 = \mathbf{0.9426}$, Log MAE = $\mathbf{0.1523}$ | Original Tons/ha $R^2 = \mathbf{0.9521}$, MAE = $\mathbf{12.60\text{ t/ha}}$
  * **XGBoost Regressor:** Log $R^2 = 0.8962$, Log MAE = $0.2345$ | Original Tons/ha $R^2 = 0.9151$, MAE = $17.34\text{ t/ha}$
  * **Ridge Regression:** Log $R^2 = 0.8440$, Log MAE = $0.2685$ | Original Tons/ha $R^2 = 0.7826$, MAE = $27.96\text{ t/ha}$

---

## ⚠️ Limitations

1. **Benchmark Recommendation Dataset (100 samples/crop):** The crop recommendation dataset is a synthetic benchmark containing exactly 100 well-separated samples per crop across 22 classes. This clean separation accounts for the high benchmark accuracy ($99.55\%$), which will degrade in real-world agricultural conditions with uncalibrated measurements.
2. **Aggregated State-Level Yield Data:** In the historical yield dataset, $92.27\%$ of records represent aggregated district or state agricultural acreages ($\ge 100$ hectares; mean: 179,926 hectares; median: 9,317 hectares) rather than individual smallholder family plots ($< 2\text{--}5$ hectares).
3. **No Real Field Validation Yet:** The system's predictions have not yet undergone physical in-situ farm trials, IoT soil-sensor calibration, or multi-season agronomic field testing in active farming environments.

---

## 🚀 Quick Setup & Installation

### Prerequisites
* [Python](https://www.python.org/) (v3.9 or higher)
* [Node.js](https://nodejs.org/) (v18 or higher)
* Git

---

### 1. Clone the Repository
```bash
git clone https://github.com/kaleeswaran185/smart-crop-recommendation-system.git
cd smart-crop-recommendation-system
```

---

### 2. Backend Setup & Model Training

1. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\activate

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Train the ML models (Generates compressed `.joblib` artifacts):
   ```bash
   python train_models.py
   ```

4. Launch the FastAPI server:
   ```bash
   python run.py
   ```
   * The API server will be live at `http://127.0.0.1:8000`
   * Interactive OpenAPI documentation: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

1. In a new terminal, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Configure environment variables (if not already set):
   ```bash
   cp .env.example .env
   ```

3. Install Node packages and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
   * Open `http://localhost:5173` in your browser.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check and model loading status |
| `POST` | `/crop-recommendation` | Recommends optimal crops given soil ($N, P, K, pH$) and climate metrics |
| `POST` | `/yield-prediction` | Predicts crop yield (tons/ha) and total production for a given state & acreage |
| `POST` | `/smart-predict` | Chained pipeline executing crop recommendation and yield prediction together |

---

## 👥 Collaboration Guide

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make and test your changes.
3. Commit and push:
   ```bash
   git commit -m "Add feature description"
   git push origin feature/your-feature-name
   ```
4. Open a Pull Request on GitHub.
