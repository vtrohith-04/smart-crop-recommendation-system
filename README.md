# AgriIntellect - Smart Crop Recommendation & Yield Prediction System

An end-to-end Machine Learning web application designed to empower agricultural decision-making. The system provides real-time crop recommendations based on soil nutrient chemistry and climatic parameters, predicts crop yield (tons/hectare) and total farm production, and features a dual-model intelligent advisory pipeline.

---

## 🏗️ System Architecture

* **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, React Hot Toast
* **Backend:** FastAPI, Uvicorn, Pydantic v2
* **Machine Learning:** Scikit-Learn, NumPy, Pandas, Joblib
* **Datasets:** Indian Agricultural Crop Yield & Crop Recommendation datasets

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

3. Train the ML models (Generates `.joblib` artifacts):
   ```bash
   # Make sure you are inside the backend directory
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
