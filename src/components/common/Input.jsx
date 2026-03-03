import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        )}
        
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-3 py-2 bg-white border rounded-lg
            focus:outline-none focus:ring-2 transition-all
            ${Icon ? 'pl-9' : ''}
            ${error 
              ? 'border-error-300 focus:border-error-300 focus:ring-error-100' 
              : 'border-neutral-200 focus:border-primary-300 focus:ring-primary-100'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;