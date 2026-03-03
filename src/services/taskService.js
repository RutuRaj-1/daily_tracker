import { firestoreService } from './firebase/firestore';
import {
  collection, getDocs, query, where, orderBy
} from "firebase/firestore";
import { db } from "./firebase/config";

export const tasksService = {
  getUserTasks: async (userId) => {
    const result = await firestoreService.getUserTasks(userId);
    if (result.success) return result.data;
    throw new Error(result.error);
  },

  getTasksByDate: async (userId, date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      const q = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("dueDate", ">=", dateStr),
        where("dueDate", "<", nextDateStr),
        orderBy("dueDate", "asc")
      );
      const snapshot = await getDocs(q);
      const tasks = [];
      snapshot.forEach(d => {
        tasks.push({ id: d.id, ...d.data() });
      });
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks by date:', error);
      // Fallback: get all tasks and filter client-side
      const allResult = await firestoreService.getUserTasks(userId);
      if (!allResult.success) return [];
      const dateStr = date.toISOString().split('T')[0];
      return allResult.data.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : '';
        return taskDate === dateStr;
      });
    }
  },

  getTasksInRange: async (userId, startDate, endDate) => {
    try {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const q = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("dueDate", ">=", startStr),
        where("dueDate", "<=", endStr)
      );
      const snapshot = await getDocs(q);
      const tasks = [];
      snapshot.forEach(d => {
        tasks.push({ id: d.id, ...d.data() });
      });
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks in range:', error);
      return [];
    }
  },

  createTask: async (taskData) => {
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    const enriched = {
      ...taskData,
      priorityWeight: priorityWeights[taskData.priority] || 1,
      completed: false,
      completedAt: null,
    };
    const result = await firestoreService.createTask(enriched);
    if (result.success) return result.data;
    throw new Error(result.error);
  },

  updateTask: async (taskId, updates) => {
    const result = await firestoreService.updateTask(taskId, updates);
    if (result.success) return result;
    throw new Error(result.error);
  },

  toggleTask: async (taskId, currentCompleted) => {
    const updates = {
      completed: !currentCompleted,
      completedAt: !currentCompleted ? new Date().toISOString() : null,
    };
    const result = await firestoreService.updateTask(taskId, updates);
    if (result.success) return updates;
    throw new Error(result.error);
  },

  deleteTask: async (taskId) => {
    const result = await firestoreService.deleteTask(taskId);
    if (result.success) return result;
    throw new Error(result.error);
  },

  bulkUpdate: async (taskIds, updates) => {
    const promises = taskIds.map(id =>
      firestoreService.updateTask(id, updates)
    );
    return Promise.all(promises);
  },
};

export default tasksService;