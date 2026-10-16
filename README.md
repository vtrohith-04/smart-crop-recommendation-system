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
*Dataset: 17,334 cleaned records across 45 supported crops (10 excluded/aggregate categories, 76 zero-yield rows, and 192 per-crop $Q3 + 3\times IQR$ outliers removed).*  
*Features: `Crop`, `State`, `Season`, `Annual_Rainfall`, `Fertilizer` ($\log(1 + \text{kg/ha})$), `Pesticide` ($\log(1 + \text{kg/ha})$). Total `Area` is removed from model inputs.*

* **Random 80/20 Holdout Split** ($N=3,467$ test samples):
  * **Random Forest (Implemented, $n=50$, leaf$=3$):** Log $R^2 = \mathbf{0.9506}$, Log MAE = $\mathbf{0.1081}$ (Artifact Size: 5.44 MB)
  * **XGBoost Regressor ($n=100$, lr$=0.1$, depth$=6$):** Log $R^2 = 0.9153$, Log MAE = $0.1764$
  * **Ridge Regression ($\alpha=1.0$):** Log $R^2 = 0.8378$, Log MAE = $0.2390$
* **Chronological Time-Based Split** (Trained strictly on years $\le 2017$ [$15,457$ samples], Tested on $2018\text{--}2020$ [$1,877$ samples]):
  * **Random Forest (Implemented, $n=50$, leaf$=3$):** Log $R^2 = \mathbf{0.9469}$, Log MAE = $\mathbf{0.1269}$
  * **XGBoost Regressor ($n=100$, lr$=0.1$, depth$=6$):** Log $R^2 = 0.9076$, Log MAE = $0.1940$
  * **Ridge Regression ($\alpha=1.0$):** Log $R^2 = 0.8546$, Log MAE = $0.2350$

---

## ⚠️ Limitations

1. **Benchmark Recommendation Dataset (100 samples/crop):** The crop recommendation dataset is a synthetic benchmark containing exactly 100 well-separated samples per crop across 22 classes. This clean separation accounts for the high benchmark accuracy ($99.55\%$), which will degrade in real-world agricultural conditions with uncalibrated measurements.
2. **Aggregated State-Level Yield Data:** In the historical yield dataset, $92.27\%$ of records represent aggregated district or state agricultural acreages ($\ge 100$ hectares; mean: 179,926 hectares; median: 9,317 hectares) rather than individual smallholder family plots ($< 2\text{--}5$ hectares).
3. **No Real Field Validation Yet:** The system's predictions have not yet undergone physical in-situ farm trials, IoT soil-sensor calibration, or multi-season agronomic field testing in active farming environments.
4. **Low Application Rate Variance (No Real Dose-Response):** Per-hectare fertilizer and pesticide values in the source data vary very little (P1–P99: 94.67–171.76 kg/ha and 0.09–0.38 kg/ha), so the model cannot learn a real dose-response and out-of-range inputs are clipped.

---

## 🚀 Quick Setup & Installation

### Prerequisites
* [Python](https://www.python.org/) (v3.9 or higher)
* [Node.js](https://nodejs.org/) (v18 or higher)
* Git

---

### 1. Clone the Repository
```bash
git clone https://github.com/vtrohith-04/smart-crop-recommendation-system.git
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

### 4. 🌐 Cloud Deployment (Render & Vercel)

#### Backend Deployment (Render Web Service)
* **Runtime:** Python 3
* **Root Directory:** `backend`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Environment Variables:**
  * `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins (e.g. `https://your-app.vercel.app,http://localhost:5173`).

*(Note: If deploying with the repository root as the working directory, use `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`)*

#### Frontend Deployment (Vercel)
* **Framework Preset:** Vite
* **Root Directory:** `frontend`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **SPA Routing:** Configured automatically via `frontend/vercel.json` (and `frontend/public/_redirects`).
* **Environment Variables:**
  * `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://your-backend.onrender.com`).

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
