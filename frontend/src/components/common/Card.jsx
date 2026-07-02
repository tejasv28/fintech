import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-surface-card rounded-card shadow-card border border-border overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-border ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-display text-base font-semibold text-ink-900 ${className}`}>{children}</h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
