// TaskManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  ChevronDown,
  Flag,
  Circle,
  CheckCircle,
  Filter
} from 'lucide-react';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        title: newTask.title,
        priority: newTask.priority,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', priority: 'medium' });
      setIsAddingTask(false);
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEdit = (task) => {
    setEditingTask({ ...task });
  };

  const saveEdit = () => {
    if (editingTask.title.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setEditingTask(null);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const getFilteredTasks = () => {
    switch(filter) {
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'pending':
        return tasks.filter(task => !task.completed);
      default:
        return tasks;
    }
  };

  const priorityColors = {
    high: {
      bg: 'bg-rose-50',
      text: 'text-rose-500',
      border: 'border-rose-200',
      hover: 'hover:border-rose-300',
      icon: 'text-rose-400',
      dot: 'bg-rose-400'
    },
    medium: {
      bg: 'bg-amber-50',
      text: 'text-amber-500',
      border: 'border-amber-200',
      hover: 'hover:border-amber-300',
      icon: 'text-amber-400',
      dot: 'bg-amber-400'
    },
    low: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-500',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-300',
      icon: 'text-emerald-400',
      dot: 'bg-emerald-400'
    }
  };

  const filteredTasks = getFilteredTasks();
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-slate-700">Task Flow</h1>
          <p className="text-slate-500 mt-1">Organize your priorities, execute with clarity</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-light text-slate-700 mt-1">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-light text-emerald-500 mt-1">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-light text-amber-500 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Add Task Button / Form */}
        <div className="mb-8">
          {!isAddingTask ? (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full group flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition-all"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Add New Task</span>
            </button>
          ) : (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300 transition-colors"
                  autoFocus
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300 text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'completed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === filterOption
                  ? 'bg-indigo-400 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
              <div className="text-slate-300 mb-3">
                <Circle className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-slate-400">No tasks found</p>
              <p className="text-sm text-slate-300 mt-1">Add a task to get started</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isEditing={editingTask?.id === task.id}
                editingTask={editingTask}
                onToggle={toggleComplete}
                onDelete={deleteTask}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onEditChange={setEditingTask}
                priorityColors={priorityColors}
              />
            ))
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-4 bg-white/50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            Click on a task to edit • Use priority flags to organize • Double-click to toggle complete
          </p>
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ 
  task, 
  isEditing, 
  editingTask, 
  onToggle, 
  onDelete, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit,
  onEditChange,
  priorityColors 
}) => {
  const colors = priorityColors[task.priority];

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-indigo-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={editingTask.title}
            onChange={(e) => onEditChange({ ...editingTask, title: e.target.value })}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300"
            autoFocus
          />
          <select
            value={editingTask.priority}
            onChange={(e) => onEditChange({ ...editingTask, priority: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={onSaveEdit}
            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={onCancelEdit}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group bg-white rounded-xl p-4 shadow-sm border ${colors.border} ${colors.hover} transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className="flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          ) : (
            <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text}`}>
              <Flag className="w-3 h-3" />
              {task.priority}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onStartEdit(task)}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Indicator */}
        <div className={`w-1 h-8 rounded-full ${colors.dot}`} />
      </div>
    </div>
  );
};

export default TaskManagement;