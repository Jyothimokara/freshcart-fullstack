import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 hover:shadow-lg',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-950',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100 hover:shadow-lg',
    ghost: 'hover:bg-slate-50 text-slate-600 hover:text-slate-950',
  };

  const sizes = {
    sm: 'px-3.5 h-9 text-xs',
    md: 'px-5 h-11 text-sm',
    lg: 'px-7 h-13 text-base',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
