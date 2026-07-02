import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-dark hover:-translate-y-px hover:shadow-card",
    secondary: "bg-transparent text-ink-700 border border-border hover:bg-surface",
    outline: "border border-accent text-accent hover:bg-accent-soft",
    danger: "bg-danger text-white hover:brightness-95 hover:-translate-y-px",
    success: "bg-success text-white hover:brightness-95 hover:-translate-y-px",
    ghost: "bg-transparent text-ink-500 hover:text-ink-900",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
