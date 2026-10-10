import React from 'react';
import { Sprout, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-slate-500 border-t border-gray-250/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-emerald-600 to-emerald-450 rounded-xl text-white shadow-sm shadow-emerald-500/10">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">AgriIntellect</span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed font-medium">
              An intelligent machine learning platform helping farmers make data-driven decisions on crop selection and yield forecasting.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-600 tracking-widest uppercase font-heading">Navigation</h3>
            <ul className="grid grid-cols-2 gap-3 text-sm">
              <li>
                <Link to="/" className="text-slate-600 hover:text-emerald-500 transition-colors font-semibold">Home</Link>
              </li>
              <li>
                <Link to="/crop-recommendation" className="text-slate-600 hover:text-emerald-500 transition-colors font-semibold">Crop Rec</Link>
              </li>
              <li>
                <Link to="/yield-prediction" className="text-slate-600 hover:text-emerald-500 transition-colors font-semibold">Yield Prediction</Link>
              </li>
              <li>
                <Link to="/smart-prediction" className="text-slate-600 hover:text-emerald-500 transition-colors font-semibold">Smart Predict</Link>
              </li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-600 tracking-widest uppercase font-heading">Contact Info</h3>
            <div className="flex space-x-3">
              <a href="mailto:contact@agriintellect.com" className="p-2.5 bg-white rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-500 hover:scale-105 border border-gray-200 transition-all duration-300 shadow-sm text-slate-600">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-500 hover:scale-105 border border-gray-200 transition-all duration-300 shadow-sm text-slate-600">
                <GithubIcon className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-500 hover:scale-105 border border-gray-200 transition-all duration-300 shadow-sm text-slate-600">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-slate-400 font-bold">
              Final Year Engineering Project © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
