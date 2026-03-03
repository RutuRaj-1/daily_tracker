import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { tasksService } from '../services/taskService';
import { dailyLogService } from '../services/dailyLogService';
import { useAuth } from '../hooks/useAuth';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userTasks = await tasksService.getUserTasks(user.uid);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Debounced daily log save — only runs once per minute max
  useEffect(() => {
    if (!user || tasks.length === 0) return;
    const timer = setTimeout(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTasks = tasks.filter(t => {
        if (!t.dueDate) return true;
        return t.dueDate.split('T')[0] === todayStr;
      });
      if (todayTasks.length > 0) {
        dailyLogService.saveDailyLog(user.uid, todayTasks).catch(() => { });
      }
    }, 2000); // 2s debounce
    return () => clearTimeout(timer);
  }, [tasks, user]);

  const addTask = useCallback(async (taskData) => {
    try {
      const newTask = await tasksService.createTask({
        ...taskData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      setTasks(prev => [newTask, ...prev]);
      return { success: true, task: newTask };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [user]);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      await tasksService.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await tasksService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const toggleTask = useCallback(async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      const updates = await tasksService.toggleTask(taskId, task.completed);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [tasks]);

  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return true;
      return (task.dueDate.split('T')[0] || '') === today;
    });
  }, [tasks]);

  const getTasksByDate = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === dateStr;
    });
  }, [tasks]);

  const getCompletedToday = useCallback(() => {
    return getTodayTasks().filter(t => t.completed).length;
  }, [getTodayTasks]);

  const getMissedTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => !t.completed && t.dueDate && t.dueDate.split('T')[0] < today).length;
  }, [tasks]);

  const getCompletionPercentage = useCallback((taskList = null) => {
    const list = taskList || getTodayTasks();
    if (list.length === 0) return 0;
    return Math.round((list.filter(t => t.completed).length / list.length) * 100);
  }, [getTodayTasks]);

  const value = useMemo(() => ({
    tasks, loading,
    addTask, updateTask, deleteTask, toggleTask,
    getTodayTasks, getTasksByDate, getCompletedToday, getMissedTasks,
    getCompletionPercentage, refreshTasks: loadTasks,
  }), [tasks, loading, addTask, updateTask, deleteTask, toggleTask,
    getTodayTasks, getTasksByDate, getCompletedToday, getMissedTasks,
    getCompletionPercentage, loadTasks]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};