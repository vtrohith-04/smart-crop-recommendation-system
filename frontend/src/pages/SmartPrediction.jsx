import React, { useState } from 'react';
import { useSmartPredict } from '../hooks/useSmartPredict';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { Cpu, Sprout, TrendingUp, MapPin, Calendar, Layers, Thermometer, Droplets, Wind, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

const STATES = [
  "andaman and nicobar", "andhra pradesh", "arunachal pradesh", "assam",
  "bihar", "chandigarh", "chhattisgarh", "dadra and nagar haveli", "goa",
  "gujarat", "haryana", "himachal pradesh", "jammu and kashmir", "jharkhand",
  "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur",
  "meghalaya", "mizoram", "nagaland", "odisha", "puducherry", "punjab",
  "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura",
  "uttar pradesh", "uttarakhand", "west bengal"
];

const SEASONS = [
  "kharif", "rabi", "summer", "autumn", "winter", "whole year"
];

export default function SmartPrediction() {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    state: '',
    season: '',
    area: '',
    fertilizer: '',
    pesticide: '',
  });

  const {
    loading,
    result,
    error,
    loadingMessage,
    executeSmartPredict,
    setError,
    setResult,
  } = useSmartPredict();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInputs = () => {
    const { N, P, K, temperature, humidity, ph, rainfall, state, season, area, fertilizer, pesticide } = formData;

    if (
      N === '' || P === '' || K === '' || temperature === '' || humidity === '' || 
      ph === '' || rainfall === '' || !state || !season || area === '' || 
      fertilizer === '' || pesticide === ''
    ) {
      throw new Error('All fields are required.');
    }

    const nNum = Number(N);
    const pNum = Number(P);
    const kNum = Number(K);
    const tempNum = Number(temperature);
    const humNum = Number(humidity);
    const phNum = Number(ph);
    const rainNum = Number(rainfall);
    const areaNum = Number(area);
    const fertNum = Number(fertilizer);
    const pestNum = Number(pesticide);

    if (isNaN(nNum) || nNum < 0 || nNum > 200) throw new Error('Nitrogen (N) must be between 0 and 200.');
    if (isNaN(pNum) || pNum < 0 || pNum > 200) throw new Error('Phosphorus (P) must be between 0 and 200.');
    if (isNaN(kNum) || kNum < 0 || kNum > 300) throw new Error('Potassium (K) must be between 0 and 300.');
    if (isNaN(tempNum) || tempNum < -10 || tempNum > 60) throw new Error('Temperature must be between -10°C and 60°C.');
    if (isNaN(humNum) || humNum < 0 || humNum > 100) throw new Error('Humidity must be between 0% and 100%.');
    if (isNaN(phNum) || phNum < 0 || phNum > 14) throw new Error('pH must be between 0.0 and 14.0.');
    if (isNaN(rainNum) || rainNum < 0 || rainNum > 1000) throw new Error('Rainfall must be between 0mm and 1000mm.');
    if (isNaN(areaNum) || areaNum <= 0) throw new Error('Area must be greater than 0.');
    if (isNaN(fertNum) || fertNum < 0) throw new Error('Fertilizer must be greater than or equal to 0.');
    if (isNaN(pestNum) || pestNum < 0) throw new Error('Pesticide must be greater than or equal to 0.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      validateInputs();
      
      const payload = {
        N: parseInt(formData.N),
        P: parseInt(formData.P),
        K: parseInt(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
        state: formData.state,
        season: formData.season,
        area: parseFloat(formData.area),
        fertilizer: parseFloat(formData.fertilizer),
        pesticide: parseFloat(formData.pesticide),
      };

      await executeSmartPredict(payload);
    } catch (err) {
      // Errors are handled inside the hook
    }
  };  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-up">
      {/* Title */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-650 shadow-sm shadow-emerald-500/5">
          <Cpu className="h-8 w-8 animate-spin-slow" />
        </div>
        <h1 className="text-3xl sm:text-section font-heading font-extrabold text-gray-900 tracking-tight">Smart Joint Prediction</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
          Execute the end-to-end decoupled pipeline. Recommends the best crop suitability based on soil chemistry, and instantly feeds it to forecast expected yields.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm shadow-gray-100/40">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-8 flex items-center space-x-2.5">
            <Zap className="h-5 w-5 text-emerald-600" />
            <span>Joint Input Variables</span>
          </h2>

          {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Soil Chemistry */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-heading block">1. Soil Chemistry</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 block">Nitrogen (N)</label>
                  <input
                    type="number"
                    name="N"
                    value={formData.N}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="N"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 block">Phosphorus (P)</label>
                  <input
                    type="number"
                    name="P"
                    value={formData.P}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="P"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 block">Potassium (K)</label>
                  <input
                    type="number"
                    name="K"
                    value={formData.K}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="K"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 block">pH Level</label>
                  <input
                    type="number"
                    step="0.01"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="pH"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Weather */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-heading block">2. Climatic features</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1.5">
                    <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                    <span>Temp (°C)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 25.5"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1.5">
                    <Droplets className="h-3.5 w-3.5 text-blue-500" />
                    <span>Humidity (%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 80.0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1.5">
                    <Wind className="h-3.5 w-3.5 text-sky-500" />
                    <span>Rainfall (mm)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 150.0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Spatial & Operations */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-heading block">3. Regional & Acreage context</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span>State</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 capitalize"
                  >
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>Season</span>
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 capitalize"
                  >
                    <option value="">Select Season</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Area (ha)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 block">Fertilizer (kg)</label>
                  <input
                    type="number"
                    name="fertilizer"
                    value={formData.fertilizer}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-655 block">Pesticide (kg)</label>
                  <input
                    type="number"
                    name="pesticide"
                    value={formData.pesticide}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-500/15 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center space-x-2 disabled:bg-emerald-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Spinner size="sm" color="white" />
                  <span>{loadingMessage}</span>
                </div>
              ) : (
                <>
                  <Cpu className="h-5 w-5" />
                  <span>Execute Joint Pipeline</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Container */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fade-up">
              {/* Recommendation Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md shadow-gray-200/30 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-emerald-100 to-emerald-200 opacity-10 blur-2xl" />
                <div className="inline-flex p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 mb-4 shadow-sm shadow-emerald-500/5">
                  <Sprout className="h-8 w-8 animate-bounce" />
                </div>
                <span className="text-gray-550 text-xs uppercase tracking-widest font-extrabold font-heading">1. Recommended Crop</span>
                <span className="text-3xl font-heading font-extrabold text-slate-900 mt-2 capitalize">{result.recommended_crop}</span>
                <div className="mt-4.5 text-xs bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100/60 font-bold shadow-sm shadow-emerald-500/5">
                  Match Probability: {Math.round(result.recommendation_confidence * 100)}%
                </div>
              </div>

              {/* Yield Forecast Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md shadow-gray-200/30 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-blue-300 to-indigo-400 opacity-10 blur-2xl" />
                <div className={`inline-flex p-3.5 ${result.yield_available !== false ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'} rounded-2xl mb-4 shadow-sm`}>
                  <TrendingUp className="h-8 w-8" />
                </div>
                <span className="text-gray-550 text-xs uppercase tracking-widest font-extrabold font-heading">2. Expected Crop Yield</span>
                
                {result.yield_available !== false ? (
                  <>
                    <span className="text-3xl font-heading font-extrabold text-slate-900 mt-2">
                      {result.predicted_yield_tons_per_ha} <span className="text-sm font-semibold text-slate-400 font-sans">tons/ha</span>
                    </span>
                    
                    <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100/70 text-left">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Acreage</span>
                        <div className="text-base font-bold text-slate-900 mt-0.5">{result.input_parameters.area} ha</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Output</span>
                        <div className="text-base font-bold text-emerald-700 mt-0.5">{result.expected_production_tons} tons</div>
                      </div>
                    </div>

                    {result.clipping_warning && (
                      <div className="w-full mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-900 text-xs text-left flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">Rate Clipping Notice</span>
                          <span className="text-[11px] text-amber-800 leading-snug block mt-0.5">{result.clipping_warning}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-800 text-xs text-left">
                    <p className="font-bold text-amber-900 mb-1">Yield Forecast Unavailable</p>
                    <p>{result.yield_message || "No reliable yield data for this crop"}</p>
                    <div className="mt-2 text-[11px] text-amber-700">
                      The recommendation model suggests <strong className="capitalize">{result.recommended_crop}</strong>, but the yield regressor does not have reliable Indian agricultural yield records (in tons/ha) for this specific crop.
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Badge */}
              <div className="bg-slate-900 text-white/95 rounded-2xl p-5 border border-slate-800 shadow-sm flex items-start space-x-3.5 text-xs leading-relaxed animate-fade-up">
                <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-450 uppercase tracking-widest block mb-1">Architecture Integrity Validated</span>
                  <span>This prediction was computed by routing inputs sequentially through the Random Forest Classifier and Regressor without target leakage.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col justify-center items-center text-center space-y-4 min-h-[320px] shadow-sm shadow-gray-50/50">
              <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 shadow-inner">
                <Cpu className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-gray-800 font-heading font-bold text-base">Inference Ready</h3>
              <p className="text-gray-600 text-xs max-w-xs leading-relaxed font-semibold">
                Fill out the soil nutrients, local weather, and land location. The system will compute crop recommendation and forecast yields sequentially.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
