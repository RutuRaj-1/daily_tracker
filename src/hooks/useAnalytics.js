import { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';
import { dailyLogService } from '../services/dailyLogService';
import { useAuth } from './useAuth';
import { useTasks } from './useTasks';

export const useAnalytics = (timeframe = 'week') => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDailyLogs = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const days = timeframe === 'month' ? 30 : timeframe === 'quarter' ? 90 : 7;
      const result = await dailyLogService.getRecentLogs(user.uid, days);
      if (result.success) setDailyLogs(result.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user, timeframe]);

  useEffect(() => { loadDailyLogs(); }, [loadDailyLogs]);

  // MEMOIZE all expensive calculations — these were running on every render
  const weeklyData = useMemo(
    () => analyticsService.calculateWeeklyCompletion(dailyLogs),
    [dailyLogs]
  );
  const monthlyData = useMemo(
    () => analyticsService.calculateMonthlyTrend(dailyLogs),
    [dailyLogs]
  );
  const disciplineMetrics = useMemo(
    () => analyticsService.calculateDisciplineScore(tasks, dailyLogs),
    [tasks, dailyLogs]
  );
  const overallScore = useMemo(
    () => analyticsService.getOverallDisciplineScore(disciplineMetrics),
    [disciplineMetrics]
  );
  const streak = useMemo(
    () => analyticsService.calculateStreak(dailyLogs),
    [dailyLogs]
  );
  const priorityRatios = useMemo(
    () => analyticsService.calculatePriorityRatios(tasks),
    [tasks]
  );
  const bestWorstDays = useMemo(
    () => analyticsService.findBestWorstDays(dailyLogs),
    [dailyLogs]
  );
  const insights = useMemo(
    () => analyticsService.generateInsights(tasks, dailyLogs),
    [tasks, dailyLogs]
  );

  return {
    loading, dailyLogs,
    weeklyData, monthlyData, disciplineMetrics, overallScore,
    streak, priorityRatios, bestWorstDays, insights,
    refresh: loadDailyLogs,
  };
};

export default useAnalytics;