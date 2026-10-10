import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, BarChart3, BrainCircuit, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [featuresVisible, setFeaturesVisible] = React.useState(false);
  const [benefitsVisible, setBenefitsVisible] = React.useState(false);
  const [ctaVisible, setCtaVisible] = React.useState(false);

  const featuresRef = React.useRef(null);
  const benefitsRef = React.useRef(null);
  const ctaRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === featuresRef.current) {
            setFeaturesVisible(true);
            observer.unobserve(entry.target);
          } else if (entry.target === benefitsRef.current) {
            setBenefitsVisible(true);
            observer.unobserve(entry.target);
          } else if (entry.target === ctaRef.current) {
            setCtaVisible(true);
            observer.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.1 });

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (benefitsRef.current) observer.observe(benefitsRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: 'Smart Crop Recommendation',
      desc: 'Analyze chemical composition of soil (N, P, K, pH) and micro-climate parameters (temperature, humidity, rainfall) to classify the best matching crop.',
      link: '/crop-recommendation',
      icon: Sprout,
      color: 'bg-emerald-500',
      text: 'text-emerald-700',
      shadow: 'hover:shadow-emerald-100',
    },
    {
      title: 'Crop Yield Forecasting',
      desc: 'Predict total crop productivity (Yield in tons/hectare) by feeding land area, location (state/district centroids), rainfall, and technological inputs.',
      link: '/yield-prediction',
      icon: BarChart3,
      color: 'bg-forest-500',
      text: 'text-forest-700',
      shadow: 'hover:shadow-forest-100',
    },
    {
      title: 'End-to-End Joint Predictor',
      desc: 'Pipes the predicted optimal crop suitability dynamically into the yield prediction engine to output recommendations and yields in one single click.',
      link: '/smart-prediction',
      icon: BrainCircuit,
      color: 'bg-mint-500',
      text: 'text-mint-800',
      shadow: 'hover:shadow-mint-100',
    },
  ];

  const benefits = [
    'Maximize Agricultural Output per Hectare',
    'Optimize Fertilizer Usage and Soil Nutrition',
    'Mitigate Risks of Sowing Incompatible Crops',
    'Enhance Revenue Streams with Accurate Forecasts',
    'Incorporate Live Weather API & Gridded Soil Data',
    'Harness State-of-the-Art ML Models (CatBoost & XGBoost)'
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-28 lg:py-36 px-4 sm:px-6 lg:px-8 text-slate-900 animate-fade-up">
        {/* Animated Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Moving mesh gradient blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#ECFDF5]/80 blur-[100px] animate-blob-drift-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#F0FDF4]/90 blur-[120px] animate-blob-drift-2" />
          <div className="absolute top-[20%] right-[15%] w-[40%] h-[40%] rounded-full bg-[#A7F3D0]/30 blur-[90px] animate-blob-drift-3" />
          <div className="absolute bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-[#ECFDF5]/60 blur-[110px] animate-blob-drift-4" />

          {/* Glowing Radial breathing background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,253,244,0.65),transparent_70%)] animate-breath" />

          {/* Small glowing particles */}
          <div className="absolute top-[15%] left-[25%] w-2 h-2 rounded-full bg-[#6EE7B7] opacity-60 blur-[1px] animate-particle-float-1" />
          <div className="absolute top-[40%] left-[65%] w-3 h-3 rounded-full bg-[#34D399] opacity-40 blur-[2px] animate-particle-float-2" />
          <div className="absolute top-[75%] left-[15%] w-2 h-2 rounded-full bg-[#22C55E] opacity-50 blur-[1px] animate-particle-float-3" />
          <div className="absolute top-[60%] left-[80%] w-2.5 h-2.5 rounded-full bg-[#10B981] opacity-45 blur-[1.5px] animate-particle-float-4" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_45%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Hero Left */}
            <div className="space-y-8 text-left max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-hero font-heading font-extrabold tracking-tight text-slate-900 leading-[1.02]">
                Machine Learning-Based<br className="hidden lg:inline" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">Smart Crop</span> System
              </h1>
              <p className="text-base sm:text-body-premium text-gray-600 leading-[1.6] max-w-lg">
                An intelligent data-driven platform that integrates agricultural census data with live weather APIs and chemical soil tests to recommend optimal crop suitability and forecast yields with high statistical accuracy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/smart-prediction"
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-500/15 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200"
                >
                  <span>Launch Joint Predictor</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Hero Right - Card Graphic */}
            <div className="hidden lg:block relative animate-inference-card">
              <div className="w-full h-80 bg-white rounded-2xl p-8 shadow-xl shadow-gray-150/40 relative overflow-hidden flex flex-col justify-between border border-gray-200">
                <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-emerald-450 to-teal-500 opacity-10 blur-3xl" />
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">AI Inference Engine</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Status: Healthy</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="space-y-2.5">
                    <div className="text-xs text-slate-400 font-medium">Class Probability Matrix</div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full w-[85%] animate-fill-bar" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 font-bold">
                      <span>Rice (Recommended)</span>
                      <span className="text-emerald-600">85% Match</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-3">
                    <div className="text-xs text-slate-400 font-medium">Forecasted Crop Yield</div>
                    <div className="text-3xl font-extrabold text-slate-900">5.83 <span className="text-sm font-semibold text-slate-400">tons/hectare</span></div>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/60">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs text-slate-655 font-medium leading-relaxed">Validated against Indian Agricultural Census datasets.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className={`reveal-on-scroll ${featuresVisible ? 'is-visible' : ''} py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-150/40`}>
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-xs text-emerald-600 font-bold uppercase tracking-widest font-heading">Platform Capabilities</h2>
            <h3 className="text-3xl sm:text-section font-heading font-extrabold text-gray-900 tracking-tight leading-tight">
              Machine Learning Solutions for Modern Agriculture
            </h3>
            <p className="text-gray-605 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
              We separate high-precision biological data classification from large-scale geographic census regression to maximize model performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm shadow-gray-100/50 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-200/50 hover:border-emerald-500 flex flex-col justify-between text-left group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-md shadow-emerald-500/15 transition-transform duration-200 group-hover:scale-[1.05]">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl sm:text-card-title font-heading font-extrabold text-gray-800 leading-tight">{feat.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed font-semibold">{feat.desc}</p>
                  </div>
                  <div className="pt-8">
                    <Link
                      to={feat.link}
                      className={`inline-flex items-center space-x-2 text-sm font-bold ${feat.text} hover:opacity-85 transition-opacity`}
                    >
                      <span>Get Predictions</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className={`reveal-on-scroll ${benefitsVisible ? 'is-visible' : ''} py-24 px-4 sm:px-6 lg:px-8 bg-white`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Benefits Left - Graphic */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-3xl opacity-10 blur-2xl group-hover:opacity-15 transition-opacity duration-300" />
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800"
                alt="Modern Digital Farm"
                className="w-full rounded-3xl shadow-lg border border-gray-200 object-cover h-96 transition-transform duration-500 group-hover:scale-[1.005]"
              />
            </div>

            {/* Benefits Right */}
            <div className="space-y-10 text-left">
              <div className="space-y-4">
                <h2 className="text-xs text-emerald-600 font-bold uppercase tracking-widest font-heading">Why AgriIntellect?</h2>
                <h3 className="text-3xl sm:text-section font-heading font-extrabold text-gray-900 tracking-tight leading-tight">
                  Empowering Decoupled Intelligent Decisions
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base font-semibold">
                  Conventional models try to solve recommendation and yield in a single merged database, leading to structural data leakage and diluted margins. AgriIntellect solves this by keeping classification and regression separated and verified.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 font-bold leading-normal">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className={`reveal-on-scroll ${ctaVisible ? 'is-visible' : ''} py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 text-center relative overflow-hidden border-t border-gray-200/80`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_55%)]" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-section font-heading font-extrabold tracking-tight leading-tight">
            Ready to Optimize Your Agricultural Output?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
            Input your local soil nutrients and select your state/district geography to compute crop suitability recommendations and expected yields.
          </p>
          <div className="pt-4">
            <Link
              to="/smart-prediction"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-500/15 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
