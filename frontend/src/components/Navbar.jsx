import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Menu, X, Info, Phone, Cpu, BarChart3, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Sprout },
    { name: 'Crop Rec', path: '/crop-recommendation', icon: HelpCircle },
    { name: 'Yield Prediction', path: '/yield-prediction', icon: BarChart3 },
    { name: 'Smart Predict', path: '/smart-prediction', icon: Cpu },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0 lg:flex-1 lg:justify-start transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-emerald-450 rounded-xl text-white shadow-sm shadow-emerald-600/20 transition-all group-hover:scale-105 duration-200">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-slate-900 tracking-tight leading-tight block">AgriIntellect</span>
              <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-extrabold block">Crop AI System</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-center space-x-2 py-1.5 px-3 rounded-xl text-nav transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                      : 'text-slate-700 hover:bg-gray-150/50 hover:text-emerald-500'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Spacer for Desktop Balance / Mobile Menu Button */}
          <div className="flex justify-end lg:flex-1">
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-gray-150/50 hover:text-emerald-500 focus:outline-none transition-colors duration-300"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-md shadow-inner ${
          isOpen ? 'max-height-screen py-4 border-t border-gray-100' : 'max-h-0 py-0'
        }`}
      >
        <div className="px-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-emerald-50/55 hover:text-emerald-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
