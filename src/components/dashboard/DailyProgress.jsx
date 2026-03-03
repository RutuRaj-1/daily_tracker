import React from 'react';
import Card from '../common/Card';
import { CheckCircle, Circle } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';

const DailyProgress = () => {
  const { getTodayTasks, toggleTask } = useTasks();
  const tasks = getTodayTasks();
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-neutral-800">Today's Progress</h3>
        <span className="text-sm text-neutral-500">{completedCount}/{tasks.length} tasks</span>
      </div>

      {/* Progress Circle */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="#6366f1"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 58}`}
            strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-light text-neutral-800">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Mini Task List */}
      <div className="space-y-2">
        {tasks.slice(0, 3).map(task => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            {task.completed ? (
              <CheckCircle className="w-4 h-4 text-success-500" />
            ) : (
              <Circle className="w-4 h-4 text-neutral-300" />
            )}
            <span className={`text-sm flex-1 text-left ${task.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
              {task.title}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default DailyProgress;