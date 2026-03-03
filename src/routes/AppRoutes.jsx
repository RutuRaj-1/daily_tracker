import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Tasks from '../pages/Tasks/Tasks';
import Analytics from '../pages/Analytics/Analytics';
import AIChat from '../pages/AIChat/AIChat';
import Settings from '../pages/Settings/Settings';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
  </div>;
  
  return user ? children : <Navigate to="/auth/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/tasks" element={
          <PrivateRoute><Tasks /></PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute><Analytics /></PrivateRoute>
        } />
        <Route path="/ai-assistant" element={
          <PrivateRoute><AIChat /></PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute><Settings /></PrivateRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;