import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import { GoalProvider } from './context/GoalContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Components
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';

// Hooks
import { useAuth } from './hooks/useAuth';

// Styles
import './App.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks/Tasks'));
const Goals = lazy(() => import('./pages/Goals/Goals'));
const Analytics = lazy(() => import('./pages/Analytics/AnalyticsDashboard'));
const Analysis = lazy(() => import('./pages/Analysis/Analysis'));
const AIChat = lazy(() => import('./pages/AIChat/AIAssistant'));
const Settings = lazy(() => import('./pages/Settings/UserSettings'));
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'));

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen message="Authenticating..." />;
  }

  return user ? children : <Navigate to="/auth" replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen message="Checking authentication..." />;
  }

  return !user ? children : <Navigate to="/dashboard" replace />;
};

// 404 Page Component
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center max-w-md mx-auto px-4">
      <h1 className="text-8xl font-light text-indigo-400 mb-4">404</h1>
      <h2 className="text-2xl font-light text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="#/dashboard"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-400 to-violet-400 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-sm hover:shadow-md"
      >
        Go to Dashboard
      </a>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              <GoalProvider>
                <AIProvider>
                  <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                    <Suspense fallback={<Loader fullScreen message="Loading application..." />}>
                      <Routes>
                        {/* Public Auth Routes */}
                        <Route element={<AuthLayout />}>
                          <Route path="/auth" element={
                            <PublicRoute>
                              <AuthPage />
                            </PublicRoute>
                          } />
                          {/* Redirect old auth paths to new one */}
                          <Route path="/auth/login" element={<Navigate to="/auth" replace />} />
                          <Route path="/auth/signup" element={<Navigate to="/auth" replace />} />
                        </Route>

                        {/* Protected Routes */}
                        <Route element={<MainLayout />}>
                          <Route path="/" element={
                            <PrivateRoute>
                              <Navigate to="/dashboard" replace />
                            </PrivateRoute>
                          } />

                          <Route path="/dashboard" element={
                            <PrivateRoute>
                              <Dashboard />
                            </PrivateRoute>
                          } />

                          <Route path="/tasks" element={
                            <PrivateRoute>
                              <Tasks />
                            </PrivateRoute>
                          } />

                          <Route path="/analytics" element={
                            <PrivateRoute>
                              <Analytics />
                            </PrivateRoute>
                          } />

                          <Route path="/analysis" element={
                            <PrivateRoute>
                              <Analysis />
                            </PrivateRoute>
                          } />

                          <Route path="/ai-assistant" element={
                            <PrivateRoute>
                              <AIChat />
                            </PrivateRoute>
                          } />

                          <Route path="/settings" element={
                            <PrivateRoute>
                              <Settings />
                            </PrivateRoute>
                          } />
                          <Route path="/goals" element={
                            <PrivateRoute>
                              <Goals />
                            </PrivateRoute>
                          } />
                        </Route>

                        {/* 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </div>
                </AIProvider>
              </GoalProvider>
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;