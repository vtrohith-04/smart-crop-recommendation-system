# AgriIntellect - Smart Crop Recommendation & Yield Prediction System Frontend

This is a modern, responsive, and professional React frontend built with Vite, Tailwind CSS, Lucide Icons, and Recharts, integrated with the FastAPI backend.

---

## 🛠️ Tech Stack
* **Framework:** React.js + Vite
* **Styling:** Tailwind CSS (v4)
* **Icons:** Lucide React
* **Charts:** Recharts
* **HTTP Client:** Axios
* **Routing:** React Router DOM
* **Notifications:** React Hot Toast

---

## 📂 Project Structure
```
frontend/
├── dist/                  # Production-compiled static assets
├── public/                # Static public assets
├── src/
│   ├── assets/            # SVG images/icons
│   ├── components/        # Reusable global components (Navbar, Footer, Spinner, Alert)
│   ├── pages/             # Page views (Home, CropRecommendation, YieldPrediction, SmartPrediction, About, Contact)
│   ├── services/          # Services layer (api.js Axios client)
│   ├── App.jsx            # Routing and global layout structure
│   ├── index.css          # Tailwind CSS styling and global styles
│   └── main.jsx           # App mounting point
├── index.html             # HTML entry point (SEO metadata included)
├── tailwind.config.js     # Tailwind design system configuration
├── postcss.config.js      # PostCSS compilation rules
├── package.json           # Declarative dependencies list
└── README.md              # Installation and execution guide
```

---

## 🚀 Installation & Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) and [Python](https://www.python.org/) (v3.9 or higher) installed on your system.

---

### Step 1: Start the FastAPI Backend Server
Before running the React frontend, ensure the FastAPI backend is running on `http://127.0.0.1:8000`.

1. Open a terminal in the root project directory:
   ```powershell
   # Activate virtual environment (Windows)
   .venv\Scripts\activate

   # Launch backend server
   python backend/run.py
   ```
2. Verify the server is running by opening `http://127.0.0.1:8000/` in your browser. You should receive a healthy status response JSON.

---

### Step 2: Set Up and Start the React Frontend

1. Open a new terminal in the `frontend` folder:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Launch the local Vite development server:
   ```powershell
   npm run dev
   ```
4. Open the link provided in your terminal (usually `http://localhost:5173`) to view the application.

---

## 📦 Production Build

To compile a minified production bundle of the application, run:
```powershell
npm run build
```
This generates a production-ready `dist/` directory that can be hosted on static platforms like Netlify, Vercel, or AWS S3.
