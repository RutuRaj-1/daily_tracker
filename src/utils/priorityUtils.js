export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const PRIORITY_LABELS = {
  [PRIORITIES.HIGH]: 'High',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.LOW]: 'Low'
};

export const PRIORITY_COLORS = {
  [PRIORITIES.HIGH]: {
    bg: 'bg-error-50',
    text: 'text-error-600',
    border: 'border-error-200',
    badge: 'bg-error-100 text-error-600'
  },
  [PRIORITIES.MEDIUM]: {
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    border: 'border-warning-200',
    badge: 'bg-warning-100 text-warning-600'
  },
  [PRIORITIES.LOW]: {
    bg: 'bg-success-50',
    text: 'text-success-600',
    border: 'border-success-200',
    badge: 'bg-success-100 text-success-600'
  }
};

export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS[PRIORITIES.MEDIUM];
};

export const sortByPriority = (tasks) => {
  const priorityWeight = {
    [PRIORITIES.HIGH]: 3,
    [PRIORITIES.MEDIUM]: 2,
    [PRIORITIES.LOW]: 1
  };
  
  return [...tasks].sort((a, b) => 
    (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
  );
};