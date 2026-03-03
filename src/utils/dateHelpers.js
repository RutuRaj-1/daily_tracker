export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  const options = format === 'short' 
    ? { month: 'short', day: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' };
  
  return d.toLocaleDateString('en-US', options);
};

export const getWeekDays = (date = new Date()) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);
  
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
};

export const calculateDaysLeft = (targetDate) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};