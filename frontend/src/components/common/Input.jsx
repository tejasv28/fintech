import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input 
        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-finBlue focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;
