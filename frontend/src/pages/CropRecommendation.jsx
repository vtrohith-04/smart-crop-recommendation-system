import React, { useState } from 'react';
import { usePrediction } from '../hooks/usePrediction';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { HelpCircle, Sprout, Wind, Droplets, Thermometer, FlaskConical, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CropRecommendation() {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
  });

  const {
    loading,
    result,
    error,
    loadingMessage,
    recommendCrop,
    setError,
    setResult,
  } = usePrediction();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInputs = () => {
    const { N, P, K, temperature, humidity, ph, rainfall } = formData;
    
    if (N === '' || P === '' || K === '' || temperature === '' || humidity === '' || ph === '' || rainfall === '') {
      throw new Error('All fields are required.');
    }

    const nNum = Number(N);
    const pNum = Number(P);
    const kNum = Number(K);
    const tempNum = Number(temperature);
    const humNum = Number(humidity);
    const phNum = Number(ph);
    const rainNum = Number(rainfall);

    if (isNaN(nNum) || nNum < 0 || nNum > 200) throw new Error('Nitrogen (N) must be a number between 0 and 200.');
    if (isNaN(pNum) || pNum < 0 || pNum > 200) throw new Error('Phosphorus (P) must be a number between 0 and 200.');
    if (isNaN(kNum) || kNum < 0 || kNum > 300) throw new Error('Potassium (K) must be a number between 0 and 300.');
    if (isNaN(tempNum) || tempNum < -10 || tempNum > 60) throw new Error('Temperature must be between -10°C and 60°C.');
    if (isNaN(humNum) || humNum < 0 || humNum > 100) throw new Error('Humidity must be between 0% and 100%.');
    if (isNaN(phNum) || phNum < 0 || phNum > 14) throw new Error('pH must be between 0.0 and 14.0.');
    if (isNaN(rainNum) || rainNum < 0 || rainNum > 1000) throw new Error('Rainfall must be between 0mm and 1000mm.');
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
      };

      await recommendCrop(payload);
    } catch (err) {
      // Errors are handled inside the hook
    }
  };

  // Process probability dictionary to array for charting, showing top 5 crops
  const getChartData = () => {
    if (!result || !result.probabilities) return [];
    return Object.entries(result.probabilities)
      .map(([name, value]) => ({ name: name.toUpperCase(), probability: Math.round(value * 100) }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  };

  const chartData = getChartData();
  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-up">
      {/* Title */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-650 shadow-sm shadow-emerald-500/5">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-section font-heading font-extrabold text-gray-900 tracking-tight">Smart Crop Recommendation</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
          Input your chemical soil properties and local micro-climate metrics. The classification engine will recommend the most suitable crop category.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm shadow-gray-100/40">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-8 flex items-center space-x-2.5">
            <FlaskConical className="h-5 w-5 text-emerald-600" />
            <span>Soil & Weather Parameters</span>
          </h2>

          {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Soil Nutrients Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Nitrogen (N)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="N"
                    value={formData.N}
                    onChange={handleChange}
                    placeholder="e.g. 90"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-bold uppercase tracking-wider">mg/kg</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Phosphorus (P)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="P"
                    value={formData.P}
                    onChange={handleChange}
                    placeholder="e.g. 42"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-bold uppercase tracking-wider">mg/kg</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Potassium (K)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="K"
                    value={formData.K}
                    onChange={handleChange}
                    placeholder="e.g. 43"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-550 font-bold uppercase tracking-wider">mg/kg</div>
                </div>
              </div>
            </div>

            {/* Weather / Climatic parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span>Temperature</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    placeholder="e.g. 20.8"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-semibold">°C</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>Humidity</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    placeholder="e.g. 82.0"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-semibold">%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <FlaskConical className="h-4 w-4 text-purple-500" />
                  <span>Soil pH Level</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  placeholder="e.g. 6.5"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Wind className="h-4 w-4 text-sky-500" />
                  <span>Rainfall</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    placeholder="e.g. 202.9"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-gray-500 font-semibold">mm</div>
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
                  <Sprout className="h-5 w-5" />
                  <span>Recommend Crop</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Container */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <>
              {/* Prediction Result Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md shadow-gray-200/30 text-center relative overflow-hidden animate-fade-up">
                <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-emerald-100 to-emerald-200 opacity-10 blur-2xl" />
                <div className="inline-flex p-4 bg-emerald-50 rounded-2xl text-emerald-600 mb-5 shadow-sm shadow-emerald-500/5">
                  <Sprout className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-gray-500 text-xs uppercase tracking-widest font-extrabold font-heading">Recommended Crop</h3>
                <div className="text-3xl sm:text-card-title font-heading font-extrabold text-slate-900 mt-2.5 capitalize">{result.recommended_crop}</div>
                
                <div className="mt-5 inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100/60 px-4.5 py-2 rounded-xl text-emerald-700 text-sm font-bold shadow-sm shadow-emerald-500/5">
                  <span>Confidence:</span>
                  <span>{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md shadow-gray-200/30 animate-fade-up">
                <h3 className="text-sm font-heading font-bold text-gray-900 mb-5 flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  <span>Probability Distribution (Top 5)</span>
                </h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 15, right: 30, top: 10, bottom: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '11px', fontWeight: 600, fill: '#4b5563', fontFamily: 'Inter' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Match Rate']} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontFamily: 'Inter' }} />
                      <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={16}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col justify-center items-center text-center space-y-4 min-h-[320px] shadow-sm shadow-gray-50/50">
              <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 shadow-inner">
                <FlaskConical className="h-8 w-8" />
              </div>
              <h3 className="text-gray-800 font-heading font-bold text-base">Inference Ready</h3>
              <p className="text-gray-600 text-xs max-w-xs leading-relaxed font-semibold">
                Fill out the soil parameters and click predict to run the multiclass classification algorithm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
