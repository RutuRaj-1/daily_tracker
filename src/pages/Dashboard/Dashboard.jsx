import React, { useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle, Circle, Flame, Plus, Target,
  AlertCircle, RefreshCw, X, ChevronDown
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { useQuotes } from '../../hooks/useQuotes';
import { useGoals } from '../../hooks/useGoals';
import { TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const {
    tasks, loading, addTask, toggleTask,
    getTodayTasks, getCompletedToday, getMissedTasks, getCompletionPercentage
  } = useTasks();
  const { quote, refreshQuote } = useQuotes();
  const { goals, progressMap } = useGoals();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', dueDate: '', linkedGoalId: '' });
  const monthlyGoals = goals.filter(g => g.type === 'monthly');

  const todayTasks = useMemo(() => getTodayTasks(), [getTodayTasks]);
  const completedCount = useMemo(() => getCompletedToday(), [getCompletedToday]);
  const missedCount = useMemo(() => getMissedTasks(), [getMissedTasks]);
  const progress = useMemo(() => getCompletionPercentage(todayTasks), [getCompletionPercentage, todayTasks]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const displayName = user?.displayName || userProfile?.displayName || 'there';
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const goalEndDate = userProfile?.settings?.goalEndDate ||
    new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
  const daysLeft = Math.max(0, Math.ceil((new Date(goalEndDate) - today) / (1000 * 60 * 60 * 24)));

  // Streak — memoized
  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dt = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === ds);
      const dc = dt.filter(t => t.completed).length;
      if (dt.length > 0 && dc / dt.length >= 0.5) s++;
      else if (i > 0) break;
    }
    return s;
    // eslint-disable-next-line
  }, [tasks]);

  // Last 7 days — memoized
  const last7Days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    const dt = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === ds);
    const dc = dt.filter(t => t.completed).length;
    return {
      active: dt.length > 0 && dc / dt.length >= 0.5,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
    };
    // eslint-disable-next-line
  }), [tasks]);

  const handleAddTask = useCallback(async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const todayStr = new Date().toISOString().split('T')[0];
    await addTask({
      title: newTask.title,
      priority: newTask.priority,
      dueDate: newTask.dueDate || todayStr,
      category: 'general',
      linkedGoalId: newTask.linkedGoalId || null,
    });
    setNewTask({ title: '', priority: 'medium', dueDate: '', linkedGoalId: '' });
    setShowAddTask(false);
  }, [newTask, addTask]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-light text-slate-800">
          {greeting}, <span className="font-semibold">{displayName}</span>
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Let's execute today's objectives</p>
      </div>

      {/* Top row — 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Quote */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex gap-3">
            <span className="text-3xl text-indigo-200 font-serif leading-none">"</span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 italic text-sm leading-relaxed line-clamp-3">{quote.text}</p>
              <p className="text-slate-400 text-xs mt-2">— {quote.author}</p>
            </div>
            <button onClick={refreshQuote} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg self-start transition-opacity flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl flex-shrink-0">
              <Calendar className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Today</p>
              <p className="text-slate-800 font-medium text-sm">{formattedDate}</p>
              <p className="text-slate-500 text-xs">{dayOfWeek}</p>
            </div>
          </div>
        </div>

        {/* Goal countdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl flex-shrink-0">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Goal Countdown</p>
              <p className="text-2xl font-light text-slate-800">{daysLeft} <span className="text-xs text-slate-400">days</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main section — tasks + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task list — 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-semibold text-slate-800">Today's Objectives</h2>
              <span className="text-xs text-slate-400">{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</span>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500">Progress</span>
                <span className="text-slate-700 font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: progress === 100
                      ? 'linear-gradient(135deg, #10B981, #34D399)'
                      : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No tasks for today</p>
                  <button onClick={() => setShowAddTask(true)} className="mt-2 text-indigo-500 text-xs hover:text-indigo-600">Add your first task →</button>
                </div>
              ) : (
                todayTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} />)
              )}
            </div>
          </div>
        </div>

        {/* Stats sidebar — 1/3 */}
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <StatItem icon={Flame} label="Streak" value={streak} color="text-orange-500" bg="bg-orange-50" />
              <StatItem icon={CheckCircle} label="Done Today" value={completedCount} color="text-emerald-500" bg="bg-emerald-50" />
              <StatItem icon={AlertCircle} label="Overdue" value={missedCount} color="text-rose-500" bg="bg-rose-50" />
            </div>

            {/* Mini streak */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Last 7 days</p>
              <div className="flex gap-1">
                {last7Days.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className={`h-7 rounded-lg mb-1 ${d.active ? 'bg-gradient-to-b from-indigo-400 to-violet-500' : 'bg-slate-100'}`} />
                    <span className="text-[9px] text-slate-400">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl shadow-sm hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            View Analytics →
          </button>

          {/* Goal Pyramid Mini Widget */}
          {goals.length > 0 && (() => {
            const yearly = goals.filter(g => g.type === 'yearly');
            const quarterly = goals.filter(g => g.type === 'quarterly');
            const avgY = yearly.length ? Math.round(yearly.reduce((s, g) => s + (progressMap[g.id] ?? g.progress ?? 0), 0) / yearly.length) : null;
            const avgQ = quarterly.length ? Math.round(quarterly.reduce((s, g) => s + (progressMap[g.id] ?? g.progress ?? 0), 0) / quarterly.length) : null;
            return (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-indigo-500" /> Goal Pyramid
                  </h3>
                  <button onClick={() => navigate('/goals')} className="text-xs text-indigo-500 hover:text-indigo-700">View all →</button>
                </div>
                <div className="space-y-2">
                  {avgY !== null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Yearly</span>
                        <span className="font-medium text-slate-700">{avgY}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: `${avgY}%` }} />
                      </div>
                    </div>
                  )}
                  {avgQ !== null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Quarterly</span>
                        <span className="font-medium text-slate-700">{avgQ}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full" style={{ width: `${avgQ}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal — uses proper isolation layer */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-content bg-white rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-slate-800">Add New Task</h3>
              <button onClick={() => setShowAddTask(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input
                type="text" autoFocus value={newTask.title}
                onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 appearance-none"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input
                  type="date" value={newTask.dueDate}
                  onChange={(e) => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300"
                />
              </div>
              {monthlyGoals.length > 0 && (
                <div className="relative">
                  <select value={newTask.linkedGoalId}
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
                <button type="button" onClick={() => setShowAddTask(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all text-sm font-medium shadow-sm">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized task item
const TaskItem = memo(({ task, onToggle }) => {
  const pc = {
    high: 'bg-rose-50 text-rose-600 border-rose-100',
    medium: 'bg-amber-50 text-amber-600 border-amber-100',
    low: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${task.completed ? 'bg-slate-50/50 border-slate-100' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'
      }`}>
      <button onClick={() => onToggle(task.id)} className="flex-shrink-0">
        {task.completed
          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
          : <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400 transition-colors" />
        }
      </button>
      <span className={`flex-1 text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</span>
      <span className={`px-2 py-0.5 text-[11px] rounded-full border ${pc[task.priority] || pc.medium}`}>{task.priority}</span>
    </div>
  );
});
TaskItem.displayName = 'TaskItem';

const StatItem = memo(({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className={`p-2 rounded-xl ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <span className="text-lg font-light text-slate-800">{value}</span>
  </div>
));
StatItem.displayName = 'StatItem';

export default Dashboard;