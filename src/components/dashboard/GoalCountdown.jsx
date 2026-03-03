import React from 'react';
import Card from '../common/Card';
import { Target, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { calculateDaysLeft } from '../../utils/dateHelpers';

const GoalCountdown = () => {
  const { userProfile } = useAuth();
  const daysLeft = calculateDaysLeft(userProfile?.goalEndDate);
  const progress = ((30 - daysLeft) / 30) * 100;

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Target className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">Goal Countdown</p>
          <p className="text-2xl font-light text-neutral-800">{daysLeft} days</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">Progress</span>
          <span className="text-neutral-700">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Monthly Indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
        <Calendar className="w-3 h-3" />
        <span>Target: {userProfile?.goalEndDate || 'Dec 31, 2024'}</span>
      </div>
    </Card>
  );
};

export default GoalCountdown;