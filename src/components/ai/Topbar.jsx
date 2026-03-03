import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const Topbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between">
      {/* Page Title */}
      <h1 className="text-xl font-light text-neutral-800">
        {getPageTitle()}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm w-64 focus:outline-none focus:border-primary-300 focus:bg-white transition-colors"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-neutral-500" />
          ) : (
            <Sun className="w-5 h-5 text-neutral-500" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <Bell className="w-5 h-5 text-neutral-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error-400 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;