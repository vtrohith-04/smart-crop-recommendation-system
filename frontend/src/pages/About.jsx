import React from 'react';
import { Info, Cpu, Database, Award, Zap, AlertTriangle, BarChart3, CheckCircle2 } from 'lucide-react';

export default function About() {
  const pipelineSteps = [
    { step: '1', title: 'Datasets Ingestion', desc: 'Raw datasets representing localized soil experimental plots (2,200 samples) and national historical agricultural census records (19,689 raw records cleaned to 17,334).' },
    { step: '2', title: 'Data Cleaning & Preprocessing', desc: 'String normalization, exclusion of non-standard units, zero-yield filtering, per-crop IQR outlier filtering, and per-hectare log1p rates.' },
    { step: '3', title: 'Leakage-Free Preprocessing', desc: 'StandardScaler inside sklearn Pipeline for recommendation; ColumnTransformer with OneHotEncoder for yield, fit strictly on training splits.' },
    { step: '4', title: 'Model Training & Pruning', desc: 'Scikit-Learn RandomForestClassifier (100 trees) and RandomForestRegressor pruned via grid search to compress artifact size to 5.44MB.' },
    { step: '5', title: 'State Rainfall Lookup', desc: 'Precomputed state-level annual rainfall lookup table (state_rainfall.json) enabling automated meteorological resolution in smart predictions.' },
    { step: '6', title: 'FastAPI Serving & Joblib', desc: 'FastAPI asynchronous backend serving serialized Joblib pipelines with Pydantic v2 boundary checks and percentile rate clipping warnings.' },
  ];

  const technologies = [
    { category: 'Frontend', items: ['React 19 (Vite)', 'Tailwind CSS v4', 'React Router DOM v7', 'Lucide React Icons', 'Recharts (Visualizations)', 'Axios (HTTP Client)'] },
    { category: 'Backend', items: ['FastAPI REST API', 'Uvicorn ASGI Server', 'Pydantic v2 Validation', 'Joblib Serialization'] },
    { category: 'Machine Learning', items: ['Scikit-Learn (Random Forest)', 'XGBoost (Evaluation Baseline)', 'Pandas (Data Wrangling)', 'NumPy (Scientific Math)'] },
  ];

  const classificationBaselines = [
    { model: 'Random Forest (Implemented)', acc: '99.55%', f1: '99.54%', std: '± 0.32%', badge: 'Active Model' },
    { model: 'XGBoost', acc: '99.32%', f1: '99.32%', std: '± 0.25%', badge: 'Baseline' },
    { model: 'Decision Tree', acc: '98.77%', f1: '98.77%', std: '± 0.68%', badge: 'Baseline' },
    { model: 'K-Nearest Neighbors (k=5)', acc: '97.14%', f1: '97.12%', std: '± 0.68%', badge: 'Baseline' },
    { model: 'Logistic Regression', acc: '97.09%', f1: '97.07%', std: '± 0.22%', badge: 'Baseline' },
  ];

  const yieldBaselines = [
    { model: 'Random Forest (Implemented, n=50, leaf=3)', randomR2: '0.9506', randomMae: '0.1081', timeR2: '0.9469', timeMae: '0.1269', badge: 'Active Model' },
    { model: 'XGBoost Regressor (n=100, lr=0.1, depth=6)', randomR2: '0.9153', randomMae: '0.1764', timeR2: '0.9076', timeMae: '0.1940', badge: 'Baseline' },
    { model: 'Ridge Regression (alpha=1.0)', randomR2: '0.8378', randomMae: '0.2390', timeR2: '0.8546', timeMae: '0.2350', badge: 'Baseline' },
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
          A deep dive into the engineering details, empirical benchmarks, and architectures driving AgriIntellect.
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
            AgriIntellect is built as a final-year engineering project to address the key challenges of agricultural decision-making. Standard models struggle when soil classification and geographic yield forecasting are merged into a single table. AgriIntellect addresses this by decoupling the **Crop Recommendation classification** and **Crop Yield forecasting** pipelines, backed by Scikit-Learn Random Forest architectures.
          </p>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span>Decoupled Scikit-Learn Random Forest Architecture</span>
          </div>
        </div>
        <div className="h-full bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-450">Production Architecture</span>
          <div className="text-xs space-y-2.5 mt-6">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-gray-300 font-medium">Recommendation:</span>
              <strong className="text-white">Random Forest (n=100)</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-gray-300 font-medium">Yield Forecasting:</span>
              <strong className="text-white">Random Forest (n=50, leaf=3)</strong>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-gray-300 font-medium">Model Serving:</span>
              <strong className="text-white">FastAPI + Joblib</strong>
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

      {/* Empirical Model Benchmarks */}
      <div className="space-y-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center space-x-2.5">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <span>Measured Model Benchmarks</span>
        </h2>

        {/* Classification Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm shadow-gray-100/30 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-heading font-bold text-gray-900">Crop Recommendation: 5-Fold Stratified Cross-Validation</h3>
              <p className="text-xs text-gray-500">Evaluated on 2,200 samples across 22 crop classes with zero data leakage.</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">Classification</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Mean Accuracy</th>
                  <th className="py-2.5 px-3">Std Dev</th>
                  <th className="py-2.5 px-3">Mean Macro-F1</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {classificationBaselines.map((row) => (
                  <tr key={row.model} className={row.badge === 'Active Model' ? 'bg-emerald-50/50 font-bold text-emerald-950' : ''}>
                    <td className="py-2.5 px-3">{row.model}</td>
                    <td className="py-2.5 px-3">{row.acc}</td>
                    <td className="py-2.5 px-3">{row.std}</td>
                    <td className="py-2.5 px-3">{row.f1}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${row.badge === 'Active Model' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {row.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regression Baselines Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm shadow-gray-100/30 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-heading font-bold text-gray-900">Yield Forecasting: Random vs Chronological Time Split</h3>
              <p className="text-xs text-gray-500">Evaluated on 17,334 cleaned records across 45 supported crops (Random 80/20 split and Time split trained on years &le; 2017, tested on 2018–2020).</p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">Regression</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Random Split (Log R²)</th>
                  <th className="py-2.5 px-3">Random Split (Log MAE)</th>
                  <th className="py-2.5 px-3">Time Split (Log R²)</th>
                  <th className="py-2.5 px-3">Time Split (Log MAE)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {yieldBaselines.map((row) => (
                  <tr key={row.model} className={row.badge === 'Active Model' ? 'bg-emerald-50/50 font-bold text-emerald-950' : ''}>
                    <td className="py-2.5 px-3">{row.model}</td>
                    <td className="py-2.5 px-3 font-mono">{row.randomR2}</td>
                    <td className="py-2.5 px-3 font-mono">{row.randomMae}</td>
                    <td className="py-2.5 px-3 font-mono">{row.timeR2}</td>
                    <td className="py-2.5 px-3 font-mono">{row.timeMae}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${row.badge === 'Active Model' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {row.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Limitations Section */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-amber-800">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600" />
          <h2 className="text-xl font-heading font-bold">Project Limitations & Critical Analysis</h2>
        </div>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
          Honest academic evaluation requires highlighting existing system limitations and dataset constraints:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs text-amber-900">
          <div className="bg-white/80 border border-amber-200/80 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-950 block text-sm">1. Benchmark Dataset (100 samples/crop)</span>
            <p className="leading-relaxed">
              The crop recommendation dataset is a synthetic benchmark containing exactly 100 non-overlapping samples per crop across 22 classes. This clean separation accounts for the high benchmark accuracy (99.55%), which will degrade in messy real-world soils.
            </p>
          </div>
          <div className="bg-white/80 border border-amber-200/80 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-950 block text-sm">2. Macro State-Level Yield Data</span>
            <p className="leading-relaxed">
              92.27% of records in the yield dataset represent aggregated district/state agricultural acreages (mean: 179,926 hectares; median: 9,317 hectares) rather than individual smallholder family plots (&lt; 2–5 hectares).
            </p>
          </div>
          <div className="bg-white/80 border border-amber-200/80 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-950 block text-sm">3. No Real Field Validation Yet</span>
            <p className="leading-relaxed">
              Predictions have not yet undergone in-situ physical farm trials, real-time IoT soil sensor validation, or multi-season agronomic field testing in active agricultural environments.
            </p>
          </div>
          <div className="bg-white/80 border border-amber-200/80 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-950 block text-sm">4. Low Rate Variance (No Dose-Response)</span>
            <p className="leading-relaxed">
              Per-hectare fertilizer and pesticide values in the source data vary very little (P1–P99: 94.67–171.76 kg/ha and 0.09–0.38 kg/ha), so the model cannot learn a real dose-response and out-of-range inputs are clipped.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
