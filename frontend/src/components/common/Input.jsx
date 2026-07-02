import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({ label, error, className = '', ...props }) => (
  <div className={`flex flex-col ${className}`}>
    {label && <label className="text-[13px] font-medium text-ink-700 mb-1.5">{label}</label>}
    <input
      className={`px-4 py-2.5 border rounded-lg text-sm text-ink-900 transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-accent-soft focus:border-accent placeholder:text-ink-300 ${error ? 'border-danger' : 'border-border'}`}
      {...props}
    />
    {error && (
      <span className="flex items-center gap-1 text-xs text-danger mt-1.5">
        <AlertCircle className="h-3 w-3" />{error}
      </span>
    )}
  </div>
);

export default Input;
