import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Plus, Search, CheckCircle, Circle, Trash2, Edit3,
  ChevronLeft, ChevronRight, ChevronDown, X
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useGoals } from '../../hooks/useGoals';

// ── Mini Calendar Component ────────────────────────────────────────────────────
const MiniCalendar = memo(({ selectedDate, onSelectDate }) => {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate);
    d.setDate(1);
    return d;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedStr = selectedDate.toISOString().split('T')[0];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Days in current month view
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = useCallback(() => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(today);
  }, [onSelectDate]);

  const handleDayClick = useCallback((day) => {
    onSelectDate(new Date(year, month, day));
  }, [year, month, onSelectDate]);

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Build grid cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{monthLabel}</span>
          {selectedStr !== todayStr && (
            <button
              onClick={goToToday}
              className="text-xs text-indigo-500 px-2 py-0.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateStr === selectedStr;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                ${isSelected
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm scale-105'
                  : isToday
                    ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
});
MiniCalendar.displayName = 'MiniCalendar';

// ── Main Tasks Component ───────────────────────────────────────────────────────
const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, loading } = useTasks();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { goals } = useGoals();
  const monthlyGoals = goals.filter(g => g.type === 'monthly');
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium', dueDate: '', category: 'general', linkedGoalId: ''
  });

  const dateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      const td = task.dueDate ? task.dueDate.split('T')[0] : '';
      return td === dateStr || (!task.dueDate && dateStr === todayStr);
    });

    switch (filter) {
      case 'pending': result = result.filter(t => !t.completed); break;
      case 'completed': result = result.filter(t => t.completed); break;
      case 'high': result = result.filter(t => t.priority === 'high'); break;
      case 'overdue': result = result.filter(t => !t.completed && t.dueDate && t.dueDate.split('T')[0] < todayStr); break;
      default: break;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }

    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const w = { high: 3, medium: 2, low: 1 };
      return (w[b.priority] || 1) - (w[a.priority] || 1);
    });
  }, [tasks, filter, searchQuery, dateStr, todayStr]);

  const completedCount = useMemo(() => filteredTasks.filter(t => t.completed).length, [filteredTasks]);
  const totalCount = filteredTasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = useCallback(async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    await addTask({ ...newTask, dueDate: newTask.dueDate || dateStr });
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', category: 'general', linkedGoalId: '' });
    setShowAddTask(false);
  }, [newTask, addTask, dateStr]);

  const handleEditSave = useCallback(async () => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: editingTask.title,
      priority: editingTask.priority,
      description: editingTask.description || '',
      dueDate: editingTask.dueDate || dateStr,
    });
    setEditingTask(null);
  }, [editingTask, updateTask, dateStr]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Done' },
    { id: 'high', label: 'High Priority' },
    { id: 'overdue', label: 'Overdue' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-light text-slate-800">Task Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Organize, prioritize, execute</p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* ── Mini Calendar ── */}
      <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* Selected date label + progress */}
      <div className="bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            {dateStr === todayStr
              ? 'Today — ' + selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
              : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs font-semibold text-slate-500">{completedCount}/{totalCount} done</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completionPct}%`,
              background: completionPct === 100
                ? 'linear-gradient(135deg, #10B981, #34D399)'
                : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            }}
          />
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === f.id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
            <CheckCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {filter !== 'all' ? 'No matching tasks' : 'No tasks for this day'}
            </p>
            <button
              onClick={() => setShowAddTask(true)}
              className="mt-3 text-indigo-500 text-xs hover:text-indigo-600"
            >
              <Plus className="w-3 h-3 inline mr-1" /> Add Task
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} onEdit={setEditingTask} onDelete={deleteTask} />
          ))
        )}
      </div>

      {/* ── Add Task Modal ── */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-content bg-white rounded-2xl p-6 shadow-2xl max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-slate-800">Add New Task</h3>
              <button onClick={() => setShowAddTask(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={newTask.title}
                onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                rows="2"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {/* Date input — no border-radius override to keep browser picker icon fully accessible */}
                <div className="relative">
                  <input
                    type="date"
                    value={newTask.dueDate || dateStr}
                    onChange={(e) => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    style={{ colorScheme: 'light' }}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 cursor-pointer"
                  />
                </div>
              </div>
              {monthlyGoals.length > 0 && (
                <div className="relative">
                  <select
                    value={newTask.linkedGoalId}
                    onChange={(e) => setNewTask(p => ({ ...p, linkedGoalId: e.target.value }))}
                    className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm focus:outline-none appearance-none text-indigo-700"
                  >
                    <option value="">🎯 Link to a Monthly Goal (optional)</option>
                    {monthlyGoals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-medium shadow-sm hover:from-indigo-600 hover:to-violet-600 transition-all"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Task Modal ── */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content bg-white rounded-2xl p-6 shadow-2xl max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-slate-800">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSave(); }} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={editingTask.title}
                onChange={(e) => setEditingTask(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300"
              />
              <textarea
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask(p => ({ ...p, description: e.target.value }))}
                rows="2"
                placeholder="Description (optional)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={editingTask.dueDate ? editingTask.dueDate.split('T')[0] : dateStr}
                    onChange={(e) => setEditingTask(p => ({ ...p, dueDate: e.target.value }))}
                    style={{ colorScheme: 'light' }}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-medium shadow-sm hover:from-indigo-600 hover:to-violet-600 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Memoized TaskCard ──────────────────────────────────────────────────────────
const TaskCard = memo(({ task, onToggle, onEdit, onDelete }) => {
  const pc = {
    high: { dot: 'bg-rose-400', badge: 'bg-rose-50 text-rose-600' },
    medium: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-600' },
    low: { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-600' },
  };
  const p = pc[task.priority] || pc.medium;

  return (
    <div className={`group bg-white rounded-xl p-3.5 border transition-all ${task.completed ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
      }`}>
      <div className="flex items-center gap-3">
        <button onClick={() => onToggle(task.id)} className="flex-shrink-0">
          {task.completed
            ? <CheckCircle className="w-5 h-5 text-emerald-400" />
            : <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400 transition-colors" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${p.badge}`}>{task.priority}</span>
          <div className="hidden group-hover:flex gap-0.5">
            <button onClick={() => onEdit({ ...task })} className="p-1 hover:bg-slate-100 rounded-lg">
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-rose-50 rounded-lg">
              <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
TaskCard.displayName = 'TaskCard';

export default Tasks;