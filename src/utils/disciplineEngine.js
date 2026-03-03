/**
 * Discipline Engine — Core utility functions
 * Reusable, pure functions for PEIS calculations
 */

/** Priority weights for weighted completion */
const PRIORITY_WEIGHTS = { high: 3, medium: 2, low: 1 };

/**
 * Calculate raw completion percentage
 * @param {Array} tasks - Array of task objects
 * @returns {number} 0-100
 */
export const calculateCompletion = (tasks = []) => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
};

/**
 * Calculate weighted completion (high priority tasks worth more)
 * @param {Array} tasks
 * @returns {number} 0-100
 */
export const calculateWeightedCompletion = (tasks = []) => {
    if (tasks.length === 0) return 0;
    let totalWeight = 0;
    let completedWeight = 0;
    tasks.forEach(t => {
        const w = PRIORITY_WEIGHTS[t.priority] || 1;
        totalWeight += w;
        if (t.completed) completedWeight += w;
    });
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
};

/**
 * Calculate discipline score (0-100)
 * Formula: consistency(30%) + timeliness(30%) + priorityExecution(20%) + completionRate(20%)
 * @param {Array} tasks - All tasks (recent period)
 * @param {Array} dailyLogs - Daily log history
 * @returns {Object} { overall, breakdown: { consistency, timeliness, priorityExecution, completionRate } }
 */
export const calculateDisciplineScore = (tasks = [], dailyLogs = []) => {
    // 1. Consistency — % of days with ≥50% completion
    const consistency = (() => {
        if (dailyLogs.length === 0) return 0;
        const activeDays = dailyLogs.filter(l => l.totalTasks > 0);
        if (activeDays.length === 0) return 0;
        const goodDays = activeDays.filter(l => l.completionPercentage >= 50).length;
        return Math.round((goodDays / activeDays.length) * 100);
    })();

    // 2. Timeliness — % of tasks completed before/on due date
    const timeliness = (() => {
        const withDueDate = tasks.filter(t => t.dueDate && t.completed);
        if (withDueDate.length === 0) return 50; // neutral if no data
        const onTime = withDueDate.filter(t => {
            const completedDate = t.completedAt ? new Date(t.completedAt) : new Date();
            const dueDate = new Date(t.dueDate);
            return completedDate <= dueDate;
        }).length;
        return Math.round((onTime / withDueDate.length) * 100);
    })();

    // 3. Priority execution — completion rate of high priority tasks
    const priorityExecution = (() => {
        const highTasks = tasks.filter(t => t.priority === 'high');
        if (highTasks.length === 0) return 50;
        return Math.round((highTasks.filter(t => t.completed).length / highTasks.length) * 100);
    })();

    // 4. Overall completion rate
    const completionRate = calculateCompletion(tasks);

    // Weighted average
    const overall = Math.round(
        consistency * 0.30 +
        timeliness * 0.30 +
        priorityExecution * 0.20 +
        completionRate * 0.20
    );

    return {
        overall: Math.min(100, Math.max(0, overall)),
        breakdown: { consistency, timeliness, priorityExecution, completionRate },
    };
};

/**
 * Calculate current streak
 * A day counts if ≥50% of tasks were completed
 * @param {Array} tasks - All tasks with dueDate
 * @returns {number} streak in days
 */
export const calculateStreak = (tasks = []) => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === ds);
        if (dayTasks.length === 0) {
            if (i === 0) continue; // today might not have tasks yet
            break;
        }
        const completed = dayTasks.filter(t => t.completed).length;
        if (completed / dayTasks.length >= 0.5) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

/**
 * Calculate goal probability based on current trajectory
 * @param {Object} params - { currentProgress, daysRemaining, dailyTargetRate }
 * @returns {number} 0-100 probability
 */
export const calculateGoalProbability = ({ currentProgress = 0, daysRemaining = 30, dailyTargetRate = 3 }) => {
    if (currentProgress >= 100) return 100;
    if (daysRemaining <= 0) return currentProgress >= 100 ? 100 : 0;

    const remaining = 100 - currentProgress;
    const needed = remaining / daysRemaining; // daily rate needed
    const canAchieve = dailyTargetRate >= needed;
    const ratio = Math.min(1, dailyTargetRate / needed);

    return Math.round(ratio * 100);
};

/**
 * Get productivity grade from score
 * @param {number} score 0-100
 * @returns {Object} { grade, label, color }
 */
export const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', label: 'Outstanding', color: 'emerald' };
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'emerald' };
    if (score >= 70) return { grade: 'B+', label: 'Very Good', color: 'indigo' };
    if (score >= 60) return { grade: 'B', label: 'Good', color: 'indigo' };
    if (score >= 50) return { grade: 'C', label: 'Average', color: 'amber' };
    if (score >= 40) return { grade: 'D', label: 'Below Average', color: 'amber' };
    return { grade: 'F', label: 'Needs Improvement', color: 'rose' };
};

export const disciplineEngine = {
    calculateCompletion,
    calculateWeightedCompletion,
    calculateDisciplineScore,
    calculateStreak,
    calculateGoalProbability,
    getGrade,
    PRIORITY_WEIGHTS,
};

export default disciplineEngine;
