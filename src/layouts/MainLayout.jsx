import React, { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';

const MainLayout = memo(() => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Grid layout: sidebar column + content column */}
      <div className="flex min-h-screen">
        {/* Sidebar — fixed width, does not scroll with content */}
        <Sidebar />

        {/* Main content — takes remaining space */}
        {/* ml-0 on mobile (sidebar is overlay), lg:ml-64 for expanded sidebar */}
        <main className="flex-1 min-h-screen ml-0 lg:ml-64 transition-[margin] duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';
export default MainLayout;