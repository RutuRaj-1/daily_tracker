import React from 'react';

const Card = ({ 
  children, 
  className = '',
  padding = true,
  hover = false,
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-neutral-200 shadow-sm
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-md hover:border-neutral-300 transition-all' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-medium text-neutral-800 ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export default Card;