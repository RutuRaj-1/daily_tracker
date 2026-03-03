export const analyticsService = {
  // Calculate weekly completion from daily logs
  calculateWeeklyCompletion: (dailyLogs) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();

    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + index + 1);
      const dateStr = date.toISOString().split('T')[0];

      const dayLog = dailyLogs.find(l => l.date === dateStr);

      return {
        day,
        date: dateStr,
        completed: dayLog ? dayLog.completedTasks : 0,
        total: dayLog ? dayLog.totalTasks : 0,
        percentage: dayLog ? dayLog.completionPercentage : 0,
      };
    });
  },

  // Calculate monthly trend from daily logs (4-week buckets)
  calculateMonthlyTrend: (dailyLogs) => {
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    const today = new Date();

    return weeks.map((week, index) => {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 28 + index * 7);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const weekLogs = dailyLogs.filter(l => l.date >= startStr && l.date < endStr);

      const avgCompletion = weekLogs.length > 0
        ? Math.round(weekLogs.reduce((sum, l) => sum + (l.completionPercentage || 0), 0) / weekLogs.length)
        : 0;

      const avgWeighted = weekLogs.length > 0
        ? Math.round(weekLogs.reduce((sum, l) => sum + (l.weightedCompletion || 0), 0) / weekLogs.length)
        : 0;

      return {
        week,
        completion: avgCompletion,
        focus: avgWeighted,
        productivity: Math.round((avgCompletion + avgWeighted) / 2),
      };
    });
  },

  // Calculate real discipline score from tasks and daily logs
  calculateDisciplineScore: (tasks, dailyLogs = []) => {
    const completedTasks = tasks.filter(t => t.completed);
    const totalTasks = tasks.length;

    // 1. Consistency: % of last 30 days with at least 1 task completed
    const last30 = dailyLogs.filter(l => {
      const logDate = new Date(l.date);
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - 30);
      return logDate >= threshold;
    });
    const activeDays = last30.filter(l => l.completedTasks > 0).length;
    const consistencyScore = last30.length > 0 ? Math.round((activeDays / Math.min(last30.length, 30)) * 100) : 70;

    // 2. Timeliness: % of completed tasks finished before/on due date
    const onTimeTasks = completedTasks.filter(t => {
      if (!t.dueDate) return true;
      const dueDate = new Date(t.dueDate);
      const completedDate = t.completedAt ? new Date(t.completedAt) : new Date();
      return completedDate <= dueDate;
    });
    const timelinessScore = completedTasks.length > 0
      ? Math.round((onTimeTasks.length / completedTasks.length) * 100) : 75;

    // 3. Priority Execution: % of high-priority tasks completed
    const highPriorityTotal = tasks.filter(t => t.priority === 'high').length;
    const highPriorityDone = tasks.filter(t => t.priority === 'high' && t.completed).length;
    const priorityScore = highPriorityTotal > 0
      ? Math.round((highPriorityDone / highPriorityTotal) * 100) : 80;

    // 4. Completion Rate
    const completionScore = totalTasks > 0
      ? Math.round((completedTasks.length / totalTasks) * 100) : 70;

    // 5. Focus: derived from weighted completion
    const focusScore = dailyLogs.length > 0
      ? Math.round(dailyLogs.reduce((sum, l) => sum + (l.weightedCompletion || 0), 0) / dailyLogs.length) : 78;

    const metrics = [
      { metric: 'Consistency', score: consistencyScore },
      { metric: 'Timeliness', score: timelinessScore },
      { metric: 'Priority', score: priorityScore },
      { metric: 'Completion', score: completionScore },
      { metric: 'Focus', score: focusScore },
    ];

    return metrics;
  },

  // Overall discipline score (single number)
  getOverallDisciplineScore: (metrics) => {
    if (!metrics || metrics.length === 0) return 0;
    return Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length);
  },

  // Calculate streak from daily logs
  calculateStreak: (dailyLogs) => {
    if (!dailyLogs || dailyLogs.length === 0) return 0;

    // Sort by date descending
    const sorted = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const dayLog = sorted.find(l => l.date === dateStr);

      if (dayLog && dayLog.completionPercentage >= 50) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  },

  // Priority completion ratios
  calculatePriorityRatios: (tasks) => {
    const priorities = ['high', 'medium', 'low'];
    const colors = { high: '#F43F5E', medium: '#F59E0B', low: '#10B981' };

    return priorities.map(priority => {
      const total = tasks.filter(t => t.priority === priority).length;
      const completed = tasks.filter(t => t.priority === priority && t.completed).length;
      return {
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        completed,
        total,
        ratio: total > 0 ? Math.round((completed / total) * 100) : 0,
        color: colors[priority],
      };
    });
  },

  // Find best and worst performing days
  findBestWorstDays: (dailyLogs) => {
    if (!dailyLogs || dailyLogs.length === 0) {
      return {
        best: { day: 'N/A', completion: 0, tasks: 0 },
        worst: { day: 'N/A', completion: 0, tasks: 0 },
      };
    }

    // Group by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = {};

    dailyLogs.forEach(log => {
      const dayOfWeek = new Date(log.date + 'T12:00:00').getDay();
      const dayName = dayNames[dayOfWeek];
      if (!dayStats[dayName]) {
        dayStats[dayName] = { totalCompletion: 0, totalTasks: 0, count: 0 };
      }
      dayStats[dayName].totalCompletion += log.completionPercentage || 0;
      dayStats[dayName].totalTasks += log.completedTasks || 0;
      dayStats[dayName].count++;
    });

    let best = { day: 'N/A', completion: 0, tasks: 0 };
    let worst = { day: 'N/A', completion: 100, tasks: 0 };

    Object.entries(dayStats).forEach(([day, stats]) => {
      const avgCompletion = Math.round(stats.totalCompletion / stats.count);
      const avgTasks = Math.round(stats.totalTasks / stats.count);
      if (avgCompletion >= best.completion) {
        best = { day, completion: avgCompletion, tasks: avgTasks };
      }
      if (avgCompletion <= worst.completion) {
        worst = { day, completion: avgCompletion, tasks: avgTasks };
      }
    });

    return { best, worst };
  },

  // Generate dynamic insights from real data
  generateInsights: (tasks, dailyLogs = []) => {
    const insights = [];
    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);
    const streak = analyticsService.calculateStreak(dailyLogs);

    // Productivity insight
    if (completed.length > 0) {
      const rate = Math.round((completed.length / tasks.length) * 100);
      insights.push({
        type: rate > 70 ? 'positive' : 'warning',
        message: `Completion rate: ${rate}% (${completed.length}/${tasks.length} tasks)`,
        action: rate > 70 ? 'Excellent work! Maintain this pace.' : 'Try to focus on high-priority items first.',
      });
    }

    // Pending tasks
    if (pending.length > 5) {
      insights.push({
        type: 'warning',
        message: `${pending.length} tasks pending attention`,
        action: 'Consider batch-completing or deprioritizing some tasks.',
      });
    }

    // High priority alert
    const highPriorityPending = pending.filter(t => t.priority === 'high').length;
    if (highPriorityPending > 0) {
      insights.push({
        type: 'warning',
        message: `${highPriorityPending} high-priority task${highPriorityPending > 1 ? 's' : ''} need attention`,
        action: 'Focus on these first thing tomorrow.',
      });
    }

    // Streak
    if (streak > 3) {
      insights.push({
        type: 'positive',
        message: `🔥 ${streak}-day streak!`,
        action: "You're building great momentum. Keep it going!",
      });
    } else {
      insights.push({
        type: 'tip',
        message: 'Build your streak today',
        action: 'Complete at least 50% of your tasks to extend your streak.',
      });
    }

    return insights.slice(0, 4);
  },
};

export default analyticsService;