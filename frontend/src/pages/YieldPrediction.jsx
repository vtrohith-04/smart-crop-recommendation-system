import React, { useState, useEffect } from 'react';
import { useYieldPrediction } from '../hooks/useYieldPrediction';
import { apiService } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { BarChart3, Sprout, MapPin, Calendar, HelpCircle, Layers, TrendingUp, AlertTriangle } from 'lucide-react';

const DEFAULT_SUPPORTED_CROPS = [
  "arecanut", "arhar/tur", "bajra", "banana", "barley", "black pepper",
  "cardamom", "cashewnut", "castor seed", "coriander", "cowpea(lobia)",
  "dry chillies", "garlic", "ginger", "gram", "groundnut", "guar seed",
  "horse-gram", "jowar", "khesari", "linseed", "maize", "masoor",
  "moong(green gram)", "moth", "niger seed", "onion",
  "peas & beans (pulses)", "potato", "ragi", "rapeseed &mustard", "rice",
  "safflower", "sannhamp", "sesamum", "small millets", "soyabean",
  "sugarcane", "sunflower", "sweet potato", "tapioca", "tobacco",
  "turmeric", "urad", "wheat"
];

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

export default function YieldPrediction() {
  const [supportedCrops, setSupportedCrops] = useState(DEFAULT_SUPPORTED_CROPS);
  const [formData, setFormData] = useState({
    crop: '',
    state: '',
    season: '',
    area: '',
    annual_rainfall: '',
    fertilizer: '',
    pesticide: '',
  });

  useEffect(() => {
    apiService.getSupportedCrops()
      .then(data => {
        if (data && data.supported_crops && Array.isArray(data.supported_crops)) {
          setSupportedCrops(data.supported_crops);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_SUPPORTED_CROPS
      });
  }, []);

  const {
    loading,
    result,
    error,
    loadingMessage,
    predictYield,
    setError,
    setResult,
  } = useYieldPrediction();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInputs = () => {
    const { crop, state, season, area, annual_rainfall, fertilizer, pesticide } = formData;

    if (!crop || !state || !season || area === '' || annual_rainfall === '' || fertilizer === '' || pesticide === '') {
      throw new Error('All fields are required.');
    }

    const areaNum = Number(area);
    const rainNum = Number(annual_rainfall);
    const fertNum = Number(fertilizer);
    const pestNum = Number(pesticide);

    if (isNaN(areaNum) || areaNum <= 0) throw new Error('Area must be a number greater than 0.');
    if (isNaN(rainNum) || rainNum < 0) throw new Error('Annual Rainfall must be greater than or equal to 0.');
    if (isNaN(fertNum) || fertNum < 0) throw new Error('Fertilizer must be greater than or equal to 0.');
    if (isNaN(pestNum) || pestNum < 0) throw new Error('Pesticide must be greater than or equal to 0.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      validateInputs();
      
      const payload = {
        crop: formData.crop,
        state: formData.state,
        season: formData.season,
        area: parseFloat(formData.area),
        annual_rainfall: parseFloat(formData.annual_rainfall),
        fertilizer: parseFloat(formData.fertilizer),
        pesticide: parseFloat(formData.pesticide),
      };

      await predictYield(payload);
    } catch (err) {
      // Errors are handled inside the hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-up">
      {/* Title */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-650 shadow-sm shadow-emerald-500/5">
          <BarChart3 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-section font-heading font-extrabold text-gray-900 tracking-tight">Crop Yield Forecasting</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
          Evaluate expected crop outputs by entering land acreage, technology inputs (fertilizer, pesticide), and climate features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm shadow-gray-100/40">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-8 flex items-center space-x-2.5">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span>Yield Prediction Variables</span>
          </h2>

          {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Categoricals Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Sprout className="h-4 w-4 text-emerald-500" />
                  <span>Crop Type</span>
                </label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 capitalize"
                >
                  <option value="">Select Supported Crop</option>
                  {supportedCrops.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <span>State</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 capitalize"
                >
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span>Season</span>
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 capitalize"
                >
                  <option value="">Select Season</option>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Area and Weather */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  <span>Cultivated Area</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-semibold">hectares</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-emerald-500" />
                  <span>Annual Rainfall</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    name="annual_rainfall"
                    value={formData.annual_rainfall}
                    onChange={handleChange}
                    placeholder="e.g. 1100"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-semibold">mm</div>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Fertilizer Used</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="fertilizer"
                    value={formData.fertilizer}
                    onChange={handleChange}
                    placeholder="e.g. 1200"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-bold uppercase tracking-wider">kg</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Pesticide Used</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="pesticide"
                    value={formData.pesticide}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-bold uppercase tracking-wider">kg</div>
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
                  <BarChart3 className="h-5 w-5" />
                  <span>Forecast Yield</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Container */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md shadow-gray-200/30 text-left relative overflow-hidden space-y-6 animate-fade-up">
              <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-emerald-100 to-emerald-200 opacity-10 blur-2xl" />
              
              {result.yield_available === false ? (
                <div className="space-y-4 text-center">
                  <div className="inline-flex p-4 bg-amber-50 rounded-2xl text-amber-600 mb-2 shadow-sm border border-amber-100">
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-gray-700 text-xs uppercase tracking-widest font-extrabold font-heading">Yield Estimate Unavailable</h3>
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-sm font-semibold leading-relaxed">
                    {result.yield_message || "No reliable yield data for this crop"}
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    This crop does not have reliable historical yield records in standard metric tons/hectare in the agricultural census dataset.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center border-b border-gray-100/70 pb-6">
                    <div className="inline-flex p-4 bg-emerald-50 rounded-2xl text-emerald-600 mb-4 shadow-sm shadow-emerald-500/5">
                      <TrendingUp className="h-10 w-10 animate-pulse" />
                    </div>
                    <h3 className="text-gray-500 text-xs uppercase tracking-widest font-extrabold font-heading">Predicted Crop Yield</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mt-2">
                      {result.predicted_yield_tons_per_ha} <span className="text-sm font-semibold text-slate-400">tons/ha</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center bg-gray-50 p-4.5 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Acreage (Area)</div>
                        <div className="text-lg font-bold text-slate-900 mt-0.5">{result.input_parameters.area} ha</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Output</div>
                        <div className="text-lg font-bold text-emerald-700 mt-0.5">{result.expected_production_tons} tons</div>
                      </div>
                    </div>

                    {result.clipping_warning && (
                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-900 text-xs flex items-start space-x-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">Rate Clipping Notice</span>
                          <span className="text-[11px] text-amber-800 leading-snug block mt-0.5">{result.clipping_warning}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-900 text-white/95 rounded-2xl p-5 border border-slate-800 text-xs leading-relaxed space-y-2 shadow-sm">
                      <span className="font-bold text-emerald-400 uppercase tracking-widest block font-heading">Inference Context:</span>
                      <span>Predicted under seasonal parameters for crop <strong className="capitalize">{result.input_parameters.crop}</strong> in the state of <strong className="capitalize">{result.input_parameters.state}</strong> during <strong className="capitalize">{result.input_parameters.season}</strong>.</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col justify-center items-center text-center space-y-4 min-h-[320px] shadow-sm shadow-gray-50/50">
              <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 shadow-inner">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-gray-800 font-heading font-bold text-base">Inference Ready</h3>
              <p className="text-gray-600 text-xs max-w-xs leading-relaxed font-semibold">
                Provide the crop details, locations, and land area to compute agricultural yields using Scikit-Learn Random Forest regression models.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
