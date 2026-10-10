import React from 'react';
import { Info, Cpu, Database, Award, Zap } from 'lucide-react';

export default function About() {
  const pipelineSteps = [
    { step: '1', title: 'Datasets Ingestion', desc: 'Raw Kaggle datasets representing localized soil experimental plots and national historical agricultural census records.' },
    { step: '2', title: 'Data Cleaning & Validation', desc: 'Category stripping, lowercase normalization, missing production value handling, and log transforms for highly skewed columns.' },
    { step: '3', title: 'Feature Engineering', desc: 'Synthesis of specialized agricultural indices: Soil Fertility Index (SFI), Vapor Pressure Deficit (VPD), and Water Availability Score (WAS).' },
    { step: '4', title: 'Train-Test Splitting', desc: 'Implementing Stratified Splits for classification to prevent class imbalance, and Chronological splits for yield forecasting to prevent future-data leakage.' },
    { step: '5', title: 'Model Training & Tuning', desc: 'Automated Bayesian search using Optuna to select hyperparameter weights for CatBoost classification and XGBoost regression.' },
    { step: '6', title: 'FastAPI REST Endpoint serving', desc: 'FastAPI backend router loading serialized ONNX pipelines to serve real-time user requests.' },
  ];

  const technologies = [
    { category: 'Frontend', items: ['React.js (Vite)', 'Tailwind CSS', 'React Router DOM', 'Lucide React Icons', 'Recharts (Charts)', 'Axios (HTTP Client)'] },
    { category: 'Backend', items: ['FastAPI REST API', 'Uvicorn Server', 'Pydantic schemas', 'Joblib / ONNX Runtimes'] },
    { category: 'Machine Learning', items: ['CatBoost Classifier', 'XGBoost Regressor', 'Optuna (Hyperparameter Tuning)', 'Scikit-Learn', 'Pandas / NumPy'] },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16 text-left animate-fade-up">
      {/* Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-650 shadow-sm shadow-emerald-500/5">
          <Info className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-section font-heading font-extrabold text-gray-900 tracking-tight">About The Project</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
          A deep dive into the engineering details, technologies, and pipelines driving AgriIntellect.
        </p>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm shadow-gray-100/40 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center space-x-2.5">
            <Award className="h-6 w-6 text-emerald-600 animate-pulse" />
            <span>Project Overview</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-semibold">
            AgriIntellect is built as a final-year engineering project to address the key challenges of agricultural decision-making. Standard models struggle when soil classification and geographic yield forecasting are merged into a single table. AgriIntellect addresses this by decoupling the **Crop Recommendation classification** and **Crop Yield forecasting** pipelines.
          </p>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span>Decoupled Machine Learning Architectures</span>
          </div>
        </div>
        <div className="h-full bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-450">Core Architecture</span>
          <div className="text-xs space-y-2.5 mt-6">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-gray-300 font-medium">Recommendation:</span>
              <strong className="text-white">CatBoost</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-gray-300 font-medium">Yield Forecasting:</span>
              <strong className="text-white">XGBoost</strong>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-gray-300 font-medium">Serving Serving:</span>
              <strong className="text-white">FastAPI + ONNX</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ML Pipeline Diagram */}
      <div className="space-y-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center space-x-2.5">
          <Cpu className="h-5 w-5 text-emerald-600" />
          <span>Machine Learning Pipeline</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipelineSteps.map((step) => (
            <div key={step.step} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm shadow-gray-100/30 flex items-start space-x-4 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500 transition-all duration-300">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-heading font-bold text-sm flex-shrink-0 shadow-sm shadow-emerald-500/5">
                {step.step}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-heading font-bold text-gray-800 leading-tight">{step.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies List */}
      <div className="space-y-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center space-x-2.5">
          <Database className="h-5 w-5 text-emerald-600" />
          <span>Technologies Used</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {technologies.map((tech) => (
            <div key={tech.category} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm shadow-gray-100/30 space-y-4 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500 transition-all duration-300">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-heading border-b border-gray-100 pb-2.5">
                {tech.category}
              </h3>
              <ul className="space-y-2">
                {tech.items.map((item) => (
                  <li key={item} className="flex items-center space-x-2 text-sm text-gray-650 font-semibold">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Future Enhancements */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden space-y-6 shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_50%)]" />
        <h3 className="text-xl font-heading font-bold">Future System Enhancements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <span className="font-bold text-emerald-400">1. Satellite Imagery Integration (NDVI)</span>
            <p className="text-xs text-gray-300 leading-relaxed font-semibold font-sans">
              Integrate Sentinel-2 satellite data to fetch Normalized Difference Vegetation Index (NDVI) mapping during growing seasons to refine local yield forecasts.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-emerald-400">2. Decentralized Federated Learning</span>
            <p className="text-xs text-gray-300 leading-relaxed font-semibold font-sans">
              Harness distributed federated learning protocols across agricultural research stations to train recommendation parameters without centralizing proprietary soil logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
