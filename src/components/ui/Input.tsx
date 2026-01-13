import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  fullWidth = true,
  className = '',
  id,
  ...props
}: InputProps) {
  const baseStyles = 'rounded-xl border-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const borderStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : 'border-slate-200 focus:border-[#FF4757] focus:ring-red-200';

  const widthStyles = fullWidth ? 'w-full' : '';

  const containerStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={containerStyles}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          className={`${baseStyles} ${sizeStyles[size]} ${borderStyles} ${widthStyles} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  size = 'md',
  fullWidth = true,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const baseStyles = 'rounded-xl border-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none';

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const borderStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : 'border-slate-200 focus:border-[#FF4757] focus:ring-red-200';

  const widthStyles = fullWidth ? 'w-full' : '';

  const containerStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={containerStyles}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        className={`${baseStyles} ${sizeStyles[size]} ${borderStyles} ${widthStyles} ${className}`}
        {...props}
      />

      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  helperText,
  size = 'md',
  fullWidth = true,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const baseStyles = 'rounded-xl border-2 bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const borderStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : 'border-slate-200 focus:border-[#FF4757] focus:ring-red-200';

  const widthStyles = fullWidth ? 'w-full' : '';

  const containerStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={containerStyles}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <select
        id={id}
        className={`${baseStyles} ${sizeStyles[size]} ${borderStyles} ${widthStyles} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
