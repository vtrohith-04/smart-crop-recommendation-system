import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose }) {
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-800',
      iconText: 'text-red-500',
      icon: AlertCircle,
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-800',
      iconText: 'text-emerald-500',
      icon: CheckCircle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-800',
      iconText: 'text-blue-500',
      icon: Info,
    },
  };

  const currentStyle = styles[type] || styles.error;
  const Icon = currentStyle.icon;

  return (
    <div className={`p-4 rounded-xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} shadow-sm animate-fade-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${currentStyle.iconText}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-lg p-1.5 focus:outline-none transition-colors duration-200 hover:bg-black/5`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
