import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { goalService } from '../services/goalService';
import { computeAllProgress } from '../utils/progressEngine';
import { useAuth } from '../hooks/useAuth';

const GoalContext = createContext(null);

export const GoalProvider = ({ children }) => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Real-time subscription to goals
    useEffect(() => {
        if (!user?.uid) {
            setGoals([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const unsubscribe = goalService.subscribeToGoals(user.uid, (fetchedGoals) => {
            setGoals(fetchedGoals);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user?.uid]);

    // ── Derived: computed progress map (updated whenever goals or tasks change) ──
    // We pass an empty tasks array here; TaskContext will call updateProgressForTasks
    const [allTasks, setAllTasks] = useState([]);

    const progressMap = useMemo(() => {
        return computeAllProgress(goals, allTasks);
    }, [goals, allTasks]);

    // ── CRUD actions ────────────────────────────────────────────────────────
    const addGoal = useCallback(async (goalData) => {
        if (!user?.uid) return { success: false, error: 'Not logged in.' };
        return goalService.createGoal(user.uid, goalData);
    }, [user?.uid]);

    const updateGoal = useCallback(async (goalId, updates) => {
        return goalService.updateGoal(goalId, updates);
    }, []);

    const deleteGoal = useCallback(async (goalId) => {
        return goalService.deleteGoal(goalId);
    }, []);

    // ── Selectors ────────────────────────────────────────────────────────────
    const getGoalsByType = useCallback((type) => {
        return goals.filter(g => g.type === type);
    }, [goals]);

    const getChildGoals = useCallback((parentId) => {
        return goals.filter(g => g.parentId === parentId);
    }, [goals]);

    const getGoalWithProgress = useCallback((goalId) => {
        const g = goals.find(g => g.id === goalId);
        if (!g) return null;
        return { ...g, computedProgress: progressMap[goalId] ?? g.progress ?? 0 };
    }, [goals, progressMap]);

    // Expose setter so TaskContext can push tasks in for aggregation
    const registerTasks = useCallback((tasks) => {
        setAllTasks(tasks);
    }, []);

    const contextValue = useMemo(() => ({
        goals,
        loading,
        progressMap,
        addGoal,
        updateGoal,
        deleteGoal,
        getGoalsByType,
        getChildGoals,
        getGoalWithProgress,
        registerTasks,
    }), [
        goals, loading, progressMap,
        addGoal, updateGoal, deleteGoal,
        getGoalsByType, getChildGoals, getGoalWithProgress, registerTasks,
    ]);

    return (
        <GoalContext.Provider value={contextValue}>
            {children}
        </GoalContext.Provider>
    );
};

export const useGoalContext = () => {
    const ctx = useContext(GoalContext);
    if (!ctx) throw new Error('useGoalContext must be used inside GoalProvider');
    return ctx;
};
