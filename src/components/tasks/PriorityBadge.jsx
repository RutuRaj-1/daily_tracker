import React from 'react';
import { Flag } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    high: {
      bg: 'bg-error-50',
      text: 'text-error-600',
      border: 'border-error-200',
      label: 'High'
    },
    medium: {
      bg: 'bg-warning-50',
      text: 'text-warning-600',
      border: 'border-warning-200',
      label: 'Medium'
    },
    low: {
      bg: 'bg-success-50',
      text: 'text-success-600',
      border: 'border-success-200',
      label: 'Low'
    }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.text} border ${config.border}`}>
      <Flag className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default PriorityBadge;