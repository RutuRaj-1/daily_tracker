import React, { useState } from 'react';
import { CheckCircle, Circle, Edit2, Trash2, Flag } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0"
      >
        {task.completed ? (
          <CheckCircle className="w-5 h-5 text-success-500" />
        ) : (
          <Circle className="w-5 h-5 text-neutral-300 group-hover:text-primary-400 transition-colors" />
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
          {task.title}
        </p>
        
        {/* Metadata */}
        <div className="flex items-center gap-2 mt-1">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className="text-xs text-neutral-400">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onEdit(task)}
          className="p-1 rounded hover:bg-neutral-200 transition-colors"
        >
          <Edit2 className="w-4 h-4 text-neutral-500" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded hover:bg-error-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-error-400" />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;