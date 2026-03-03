export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return sum / numbers.length;
};

export const calculateTrend = (current, previous) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

export const calculateProductivityScore = (tasks) => {
  const weights = {
    completion: 0.4,
    timeliness: 0.3,
    priority: 0.3
  };
  
  const completionRate = tasks.length > 0
    ? tasks.filter(t => t.completed).length / tasks.length
    : 0;
    
  const timelinessRate = tasks.filter(t => t.completed && t.dueDate)
    .length / tasks.length || 0;
    
  const priorityScore = tasks.filter(t => t.priority === 'high' && t.completed)
    .length / tasks.filter(t => t.priority === 'high').length || 0;
  
  return Math.round(
    (completionRate * weights.completion +
     timelinessRate * weights.timeliness +
     priorityScore * weights.priority) * 100
  );
};