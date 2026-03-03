import React from 'react';
import Card from '../common/Card';
import { Flame, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useAnalytics } from '../../hooks/useAnalytics';

const QuickStats = () => {
  const { getCompletedToday, getMissedTasks } = useTasks();
  const { getStreak } = useAnalytics();

  const stats = [
    { 
      label: 'Current Streak', 
      value: getStreak(), 
      icon: Flame, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Completed Today', 
      value: getCompletedToday(), 
      icon: CheckCircle, 
      color: 'text-success-500', 
      bg: 'bg-success-50' 
    },
    { 
      label: 'Missed', 
      value: getMissedTasks(), 
      icon: AlertCircle, 
      color: 'text-error-500', 
      bg: 'bg-error-50' 
    },
    { 
      label: 'Productivity', 
      value: '85%', 
      icon: TrendingUp, 
      color: 'text-primary-500', 
      bg: 'bg-primary-50' 
    }
  ];

  return (
    <Card>
      <h3 className="font-medium text-neutral-800 mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-lg font-light text-neutral-800">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default QuickStats;