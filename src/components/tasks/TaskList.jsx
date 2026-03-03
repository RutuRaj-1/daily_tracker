import React from 'react';
import TaskItem from './TaskItem';
import Card from '../common/Card';
import { Filter } from 'lucide-react';

const TaskList = ({ 
  tasks, 
  onToggle, 
  onEdit, 
  onDelete, 
  filter = 'all',
  onFilterChange 
}) => {
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' }
  ];

  const priorities = ['high', 'medium', 'low'];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-neutral-800">Tasks</h3>
        
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="text-sm border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary-300"
          >
            {filters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex gap-2 mb-6">
        {priorities.map(p => (
          <button
            key={p}
            className="px-3 py-1 text-xs rounded-full border border-neutral-200 hover:border-primary-300 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Task Items */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            No tasks to display
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </Card>
  );
};

export default TaskList;