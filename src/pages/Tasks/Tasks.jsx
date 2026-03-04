import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import {
  Plus, Search, CheckCircle, Circle, Trash2, Edit3,
  ChevronLeft, ChevronRight, ChevronDown, X, Save, FileText, Check
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useGoals } from '../../hooks/useGoals';
import { useAuth } from '../../hooks/useAuth';
import { dailyLogService } from '../../services/dailyLogService';

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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-slate-800">{monthLabel}</span>
          {selectedStr !== todayStr && (
            <button
              onClick={goToToday}
              className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 mt-0.5 transition-colors"
            >
              Go to Today
            </button>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
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
                w-full aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200
                ${isSelected
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-200 scale-105'
                  : isToday
                    ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200 ring-inset'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
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
  const { user } = useAuth();
  const { tasks, addTask, updateTask, deleteTask, toggleTask, loading } = useTasks();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Tab and Analysis State
  const [activeTab, setActiveTab] = useState('tasks');
  const [analysisText, setAnalysisText] = useState('');
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { goals } = useGoals();
  const monthlyGoals = goals.filter(g => g.type === 'monthly');
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium', dueDate: '', category: 'general', linkedGoalId: ''
  });

  const dateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch Analysis
  useEffect(() => {
    if (!user) return;
    const fetchAnalysis = async () => {
      const res = await dailyLogService.getDailyLog(user.uid, selectedDate);
      if (res.success && res.data && res.data.analysis) {
        setAnalysisText(res.data.analysis);
      } else {
        setAnalysisText('');
      }
    };
    fetchAnalysis();
  }, [user, dateStr, selectedDate]);

  // Save Analysis
  const handleSaveAnalysis = async () => {
    if (!user) return;
    setIsSavingAnalysis(true);
    setSaveSuccess(false);
    const res = await dailyLogService.saveDailyAnalysis(user.uid, dateStr, analysisText);
    setIsSavingAnalysis(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filter === 'overdue') {
      result = result.filter(t => !t.completed && t.dueDate && t.dueDate.split('T')[0] < todayStr);
    } else {
      result = result.filter(task => {
        const td = task.dueDate ? task.dueDate.split('T')[0] : '';
        const isSelectedDate = td === dateStr || (!task.dueDate && dateStr === todayStr);
        const isOverdueRollover = dateStr === todayStr && !task.completed && td && td < todayStr;
        return isSelectedDate || isOverdueRollover;
      });

      switch (filter) {
        case 'pending': result = result.filter(t => !t.completed); break;
        case 'completed': result = result.filter(t => t.completed); break;
        case 'high': result = result.filter(t => t.priority === 'high'); break;
        default: break;
      }
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
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-5">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">Task Management</h1>
          <p className="text-slate-500 font-medium mt-1">Organize, prioritize, execute</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'tasks' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            <CheckCircle className="w-4 h-4" /> Tasks
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'analysis' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            <FileText className="w-4 h-4" /> Analysis
          </button>
        </div>

        {activeTab === 'tasks' && (
          <button
            onClick={() => setShowAddTask(true)}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all shadow-md hover:shadow-lg text-sm font-bold"
          >
            <Plus className="w-5 h-5" /> Add Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Sidebar (Calendar & Progress) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          {/* Selected date progress */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-slate-800">
                {dateStr === todayStr
                  ? 'Today\'s Progress'
                  : selectedDate.toLocaleDateString('en-US', { disable: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${completionPct}%`,
                  background: completionPct === 100
                    ? 'linear-gradient(135deg, #10B981, #34D399)'
                    : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium text-center">
              {completionPct === 100 && totalCount > 0 ? 'All tasks complete! 🎉' : `${completionPct}% completed`}
            </p>
          </div>

          {/* Mobile Add Task Button */}
          {activeTab === 'tasks' && (
            <button
              onClick={() => setShowAddTask(true)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl shadow-md text-sm font-bold"
            >
              <Plus className="w-5 h-5" /> Add New Task
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          {activeTab === 'tasks' ? (
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-5 md:p-8 border border-slate-100 shadow-sm h-full min-h-[600px] flex flex-col">
              {/* Search + Filters */}
              <div className="flex flex-col xl:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your tasks..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all shadow-sm text-slate-700"
                  />
                </div>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 xl:pb-0">
                  {filters.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${filter === f.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 shadow-sm'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task list */}
              <div className="space-y-3.5 flex-1">
                {filteredTasks.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm mt-8 flex flex-col items-center justify-center h-full min-h-[300px]">
                    <div className="w-20 h-20 bg-indigo-50/50 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      {filter !== 'all' ? 'No matches found' : 'A clear day ahead'}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mb-6 max-w-xs">
                      {filter !== 'all' ? 'Try adjusting your filters or search query.' : 'You have no tasks scheduled for this date. Enjoy the free time or plan ahead!'}
                    </p>
                    <button
                      onClick={() => setShowAddTask(true)}
                      className="px-6 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4 inline mr-1" /> Create Task
                    </button>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} onEdit={setEditingTask} onDelete={deleteTask} />
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Analysis View */
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm h-full min-h-[600px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Daily Analysis</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {dateStr === todayStr
                      ? "Reflect on today's progress and learnings"
                      : `Reflection for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </p>
                </div>
                <button
                  onClick={handleSaveAnalysis}
                  disabled={isSavingAnalysis}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${saveSuccess
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-800 text-white hover:bg-slate-900 hover:shadow-md'
                    } disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]`}
                >
                  {isSavingAnalysis ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saveSuccess ? (
                    <><Check className="w-4 h-4" /> Saved Successfully</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Analysis</>
                  )}
                </button>
              </div>

              <div className="flex-1 flex flex-col relative group rounded-2xl overflow-hidden border border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Journal Entry
                </div>
                <textarea
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  placeholder="What went well today? What could be improved? Did you hit any roadblocks? Write your thoughts here..."
                  className="flex-1 w-full bg-white p-6 text-slate-700 text-base leading-relaxed resize-none outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Task Modal ── */}
      {showAddTask && (
        <div className="modal-overlay fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddTask(false)}>
          <div className="modal-content bg-white rounded-3xl p-7 shadow-2xl max-w-lg w-full transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Create New Task</h3>
              <button onClick={() => setShowAddTask(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Task Title</label>
                <input
                  type="text"
                  autoFocus
                  value={newTask.title}
                  onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="Add any extra details..."
                  rows="3"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 resize-none transition-all text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <div className="relative">
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(p => ({ ...p, priority: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 appearance-none text-slate-700 transition-all"
                    >
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newTask.dueDate || dateStr}
                      onChange={(e) => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                      style={{ colorScheme: 'light' }}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 cursor-pointer text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>
              {monthlyGoals.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Goal</label>
                  <div className="relative">
                    <select
                      value={newTask.linkedGoalId}
                      onChange={(e) => setNewTask(p => ({ ...p, linkedGoalId: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 appearance-none text-indigo-800 transition-all"
                    >
                      <option value="">🎯 Select Monthly Goal (optional)</option>
                      {monthlyGoals.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:text-slate-800 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl text-sm font-bold shadow-md hover:from-indigo-600 hover:to-violet-600 hover:shadow-lg transition-all"
                >
                  Confirm Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Task Modal ── */}
      {editingTask && (
        <div className="modal-overlay fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingTask(null)}>
          <div className="modal-content bg-white rounded-3xl p-7 shadow-2xl max-w-lg w-full transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSave(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Task Title</label>
                <input
                  type="text"
                  autoFocus
                  value={editingTask.title}
                  onChange={(e) => setEditingTask(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask(p => ({ ...p, description: e.target.value }))}
                  rows="3"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 resize-none transition-all text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <div className="relative">
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask(p => ({ ...p, priority: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 appearance-none text-slate-700 transition-all"
                    >
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={editingTask.dueDate ? editingTask.dueDate.split('T')[0] : dateStr}
                      onChange={(e) => setEditingTask(p => ({ ...p, dueDate: e.target.value }))}
                      style={{ colorScheme: 'light' }}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 cursor-pointer text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:text-slate-800 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl text-sm font-bold shadow-md hover:from-indigo-600 hover:to-violet-600 hover:shadow-lg transition-all"
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
    high: { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-100', bg: 'hover:border-rose-200 hover:shadow-rose-100/50' },
    medium: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-100', bg: 'hover:border-amber-200 hover:shadow-amber-100/50' },
    low: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', bg: 'hover:border-emerald-200 hover:shadow-emerald-100/50' },
  };
  const p = pc[task.priority] || pc.medium;

  return (
    <div className={`group bg-white rounded-2xl p-4 md:p-5 border transition-all duration-300 ${task.completed ? 'border-slate-100 bg-slate-50/50 opacity-75 grayscale-[0.2]' : `border-slate-200 shadow-sm hover:shadow-md ${p.bg}`
      }`}>
      <div className="flex items-center gap-4">
        <button onClick={() => onToggle(task.id)} className="flex-shrink-0 focus:outline-none">
          {task.completed
            ? <CheckCircle className="w-6 h-6 text-emerald-500 transition-transform hover:scale-110 duration-200" />
            : <Circle className="w-6 h-6 text-slate-300 hover:text-indigo-400 transition-all hover:scale-110 duration-200" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-base ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800 font-bold'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-slate-500 mt-1 truncate font-medium">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${p.badge} hidden sm:flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            {task.priority}
          </span>
          <div className="flex sm:hidden">
            <span className={`w-2 h-2 rounded-full ${p.dot}`} />
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-200 -mr-1">
            <button onClick={() => onEdit({ ...task })} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-xl transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
TaskCard.displayName = 'TaskCard';

export default Tasks;