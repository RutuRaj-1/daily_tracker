import { appConfig } from '../config/appConfig';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || appConfig?.gemini?.apiKey || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Rate limiting
let lastCallTime = 0;
const MIN_INTERVAL = 1500; // 1.5s between calls

// System prompt — makes Gemini behave as a productivity coach
const SYSTEM_PROMPT = `You are FlowState AI, a senior productivity coach analyzing real task execution data.

RULES:
1. Always reference SPECIFIC numbers from the data (e.g. "You completed 6/8 tasks yesterday — 75%")
2. Never give generic advice like "try harder" or "stay motivated"
3. Identify patterns: time-of-day performance, priority neglect, streak breaks
4. Be direct, specific, and actionable
5. Format with markdown: use **bold** for key metrics, bullet points for action items
6. Keep responses under 200 words unless asked for detailed analysis
7. If task data is empty, help the user set up their first productive day
8. Suggest specific time blocks, priority reordering, or task splitting

PERSONALITY: Professional but warm. Think of a supportive senior mentor who uses data, not platitudes.`;

/**
 * Build structured context from real task data
 * Only sends last 30 days to stay within context window
 */
const buildContext = (taskData = {}) => {
  const { tasks = [] } = taskData;
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Filter to last 30 days
  const recentTasks = tasks.filter(t => {
    if (!t.createdAt) return true;
    return new Date(t.createdAt) >= thirtyDaysAgo;
  });

  const todayStr = now.toISOString().split('T')[0];
  const todayTasks = recentTasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const pendingAll = recentTasks.filter(t => !t.completed);

  // Priority breakdown
  const byPriority = { high: 0, medium: 0, low: 0 };
  const completedByPriority = { high: 0, medium: 0, low: 0 };
  recentTasks.forEach(t => {
    const p = t.priority || 'medium';
    byPriority[p] = (byPriority[p] || 0) + 1;
    if (t.completed) completedByPriority[p] = (completedByPriority[p] || 0) + 1;
  });

  // Streak calculation
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayTasks = recentTasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === ds);
    if (dayTasks.length > 0 && dayTasks.filter(t => t.completed).length / dayTasks.length >= 0.5) {
      streak++;
    } else if (i > 0) break;
  }

  return `
USER DATA SNAPSHOT (last 30 days):
- Total tasks: ${recentTasks.length}
- Completed: ${recentTasks.filter(t => t.completed).length} (${recentTasks.length > 0 ? Math.round(recentTasks.filter(t => t.completed).length / recentTasks.length * 100) : 0}%)
- Today: ${completedToday}/${todayTasks.length} tasks done
- Pending: ${pendingAll.length} tasks
- Current streak: ${streak} days
- High priority: ${completedByPriority.high}/${byPriority.high} completed
- Medium priority: ${completedByPriority.medium}/${byPriority.medium} completed
- Low priority: ${completedByPriority.low}/${byPriority.low} completed
- Overdue tasks: ${pendingAll.filter(t => t.dueDate && t.dueDate.split('T')[0] < todayStr).length}

TODAY'S TASKS:
${todayTasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.priority})`).join('\n') || 'No tasks scheduled'}
`.trim();
};

/**
 * Call Gemini API with structured prompt
 */
const callGemini = async (userMessage, context) => {
  // Rate limiting
  const now = Date.now();
  if (now - lastCallTime < MIN_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL - (now - lastCallTime)));
  }
  lastCallTime = Date.now();

  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${context}\n\nUSER MESSAGE: ${userMessage}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API Error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
};

/**
 * Smart local fallback — uses actual task data for specific advice
 */
const getLocalFallback = (message, taskData) => {
  const { tasks = [] } = taskData;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === todayStr);
  const completed = todayTasks.filter(t => t.completed).length;
  const pending = todayTasks.filter(t => !t.completed);
  const highPriority = pending.filter(t => t.priority === 'high');
  const pct = todayTasks.length > 0 ? Math.round(completed / todayTasks.length * 100) : 0;

  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('plan') || lowerMsg.includes('tomorrow')) {
    return {
      message: `**Planning Mode** 📋\n\nBased on your current load:\n- You have **${pending.length}** pending tasks today\n- **${highPriority.length}** are high priority\n\n**Suggested approach:**\n${highPriority.length > 0 ? `1. Start with: **${highPriority[0]?.title}** (high priority)\n` : ''}2. Focus on completing 3-4 tasks max per session\n3. Take a 10-minute break after every 50 minutes\n\n*For personalized AI analysis, add your Gemini API key in Settings.*`,
      suggestions: ['Show my stats', 'What should I focus on?'],
    };
  }

  if (lowerMsg.includes('improve') || lowerMsg.includes('better')) {
    return {
      message: `**Performance Review** 📊\n\nToday's progress: **${pct}%** (${completed}/${todayTasks.length} tasks)\n\n${pct >= 80 ? '🎉 Excellent! You\'re on track.' : pct >= 50 ? '👍 Good progress. Push for the remaining tasks.' : '⚠️ Below average. Focus on high-priority items first.'}\n\n**Quick wins:**\n${pending.slice(0, 3).map(t => `- ${t.title} (${t.priority})`).join('\n') || '- All caught up!'}\n\n*Add your Gemini API key in Settings for detailed AI insights.*`,
      suggestions: ['Plan my day', 'Show priorities'],
    };
  }

  return {
    message: `**Today's Snapshot** 📈\n\n- Progress: **${pct}%** (${completed}/${todayTasks.length})\n- Pending: **${pending.length}** tasks\n- High priority remaining: **${highPriority.length}**\n\n${pending.length > 0 ? `**Next up:** ${pending[0]?.title}` : '✅ All tasks completed!'}\n\n*For full AI coaching, add your Gemini API key in Settings → AI Configuration.*`,
    suggestions: ['How can I improve?', 'Plan my tomorrow', 'Show priorities'],
  };
};

/**
 * Generate follow-up suggestions based on response
 */
const generateSuggestions = (response) => {
  const suggestions = [];
  if (response.includes('priority') || response.includes('high')) suggestions.push('Reprioritize my tasks');
  if (response.includes('streak') || response.includes('consistency')) suggestions.push('How to maintain streaks?');
  if (response.includes('plan') || response.includes('schedule')) suggestions.push('Create a time-blocked plan');
  if (suggestions.length === 0) suggestions.push('What else should I know?', 'Plan my next day');
  return suggestions.slice(0, 3);
};

/**
 * Main AI service
 */
export const aiService = {
  /**
   * Get AI response — tries Gemini first, falls back to local
   */
  getResponse: async (message, taskData = {}) => {
    const context = buildContext(taskData);

    // Try Gemini if key is available
    if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
      try {
        const response = await callGemini(message, context);
        return {
          message: response,
          suggestions: generateSuggestions(response),
          source: 'gemini',
        };
      } catch (error) {
        console.warn('Gemini API error, using fallback:', error.message);
      }
    }

    // Local fallback
    return { ...getLocalFallback(message, taskData), source: 'local' };
  },

  /**
   * Generate daily analysis — called automatically
   */
  generateDailyAnalysis: async (taskData = {}) => {
    const prompt = 'Analyze my productivity for today. What patterns do you see? What should I change tomorrow? Be specific with numbers.';
    return aiService.getResponse(prompt, taskData);
  },

  /**
   * Get adaptive planning suggestions
   */
  getPlanningSuggestions: async (taskData = {}) => {
    const prompt = 'Based on my task completion patterns, suggest an optimal schedule for tomorrow. Include specific time blocks and priority ordering.';
    return aiService.getResponse(prompt, taskData);
  },
};

export default aiService;