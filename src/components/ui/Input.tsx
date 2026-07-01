import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full h-11 px-4 rounded-xl border bg-white focus:bg-white text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
