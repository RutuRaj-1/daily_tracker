export const appConfig = {
  name: 'flowstate',
  version: '2.0.0',

  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
    geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
    geminiModel: 'gemini-2.0-flash',
    timeout: 30000,
  },

  features: {
    aiAssistant: true,
    analytics: true,
    darkMode: true,
    notifications: true,
  },

  limits: {
    maxTasksPerDay: 50,
    maxStreakDays: 365,
    maxHistoryMonths: 12,
  },

  defaults: {
    theme: 'light',
    workPreference: 'morning',
    focusDuration: 50,
    breakDuration: 10,
    dailyGoal: 8,
  },

  messages: {
    errors: {
      generic: 'Something went wrong. Please try again.',
      network: 'Network error. Check your connection.',
      auth: 'Authentication failed. Please log in again.',
    },
    success: {
      saved: 'Changes saved successfully!',
      taskAdded: 'Task added successfully!',
      taskCompleted: 'Great job! Task completed.',
    },
  },
};