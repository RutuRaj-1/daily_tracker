import React, { useState, useCallback, memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, BarChart3, Bot, Settings,
  Target, Calendar, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';

const Sidebar = memo(() => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const pendingCount = tasks.filter(t => !t.completed).length;
  const displayName = user?.displayName || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks', badge: pendingCount > 0 ? String(pendingCount) : null },
    { id: 'goals', label: 'Goals', icon: Target, path: '/goals' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, path: '/ai-assistant', badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/auth');
  }, [logout, navigate]);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return (
    <>
      {/* Mobile hamburger — visible only on small screens */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-xl shadow-md border border-slate-200"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar — fixed position, always w-64 on desktop */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-40
        w-64 bg-white border-r border-slate-200
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-sm">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-800 tracking-tight">flowstate</span>
          </div>
          <button
            onClick={closeMobile}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full leading-none ${item.badge === 'AI'
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-rose-100 text-rose-600'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Date widget */}
        <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl">
            <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Today</p>
              <p className="text-xs font-medium text-slate-700 truncate">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* User section */}
        <div className="border-t border-slate-200 p-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;