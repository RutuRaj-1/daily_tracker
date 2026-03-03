/**
 * progressEngine.js
 * Cascading progress aggregation utility for the 4-layer Goal Pyramid.
 * 
 * Hierarchy: Yearly → Quarterly → Monthly → Daily Tasks
 */

/**
 * Calculate the time risk level for a goal.
 * @returns 'safe' | 'warning' | 'danger'
 */
export function getTimeRiskLevel(goal) {
    if (!goal.startDate || !goal.endDate) return 'safe';
    const now = Date.now();
    const start = new Date(goal.startDate).getTime();
    const end = new Date(goal.endDate).getTime();
    const totalDuration = end - start;
    if (totalDuration <= 0) return 'safe';

    const timeElapsedPct = Math.min(100, ((now - start) / totalDuration) * 100);
    const progress = goal.progress || 0;

    if (progress >= timeElapsedPct - 5) return 'safe';      // on track
    if (progress >= timeElapsedPct - 25) return 'warning';  // slightly behind
    return 'danger';                                         // critically behind
}

/**
 * Get days remaining until end of goal.
 */
export function getDaysRemaining(endDate) {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
}

/**
 * Get % of time elapsed for a goal.
 */
export function getTimeElapsedPct(goal) {
    if (!goal.startDate || !goal.endDate) return 0;
    const now = Date.now();
    const start = new Date(goal.startDate).getTime();
    const end = new Date(goal.endDate).getTime();
    if (end <= start) return 100;
    return Math.min(100, Math.round(((now - start) / (end - start)) * 100));
}

/**
 * Compute progress for ALL goals given full goals list and tasks.
 * Returns a map: { [goalId]: progress (0-100) }
 *
 * Logic:
 *   - Monthly goal: % of linked tasks that are completed (with priority weighting)
 *   - Quarterly goal: weighted avg of child monthly goals' progress
 *   - Yearly goal: weighted avg of child quarterly goals' progress
 */
export function computeAllProgress(goals, tasks) {
    const progressMap = {};

    // Helper: get weight value
    const weightValue = (w) => ({ high: 3, medium: 2, low: 1 }[w] || 2);

    // Step 1: Compute monthly goal progress from linked tasks
    const monthlyGoals = goals.filter(g => g.type === 'monthly');
    for (const mg of monthlyGoals) {
        const linked = tasks.filter(t => t.linkedGoalId === mg.id);
        if (linked.length === 0) {
            progressMap[mg.id] = mg.progress || 0;
            continue;
        }
        const totalWeight = linked.reduce((sum, t) => sum + weightValue(t.priority), 0);
        const completedWeight = linked
            .filter(t => t.completed)
            .reduce((sum, t) => sum + weightValue(t.priority), 0);
        progressMap[mg.id] = totalWeight > 0
            ? Math.round((completedWeight / totalWeight) * 100)
            : 0;
    }

    // Step 2: Compute quarterly goal progress from child monthly goals
    const quarterlyGoals = goals.filter(g => g.type === 'quarterly');
    for (const qg of quarterlyGoals) {
        const children = goals.filter(g => g.type === 'monthly' && g.parentId === qg.id);
        if (children.length === 0) {
            progressMap[qg.id] = qg.progress || 0;
            continue;
        }
        const totalWeight = children.reduce((sum, c) => sum + (c.weight || 2), 0);
        const weightedProgress = children.reduce((sum, c) => {
            return sum + ((progressMap[c.id] ?? c.progress ?? 0) * (c.weight || 2));
        }, 0);
        progressMap[qg.id] = totalWeight > 0
            ? Math.round(weightedProgress / totalWeight)
            : 0;
    }

    // Step 3: Compute yearly goal progress from child quarterly goals
    const yearlyGoals = goals.filter(g => g.type === 'yearly');
    for (const yg of yearlyGoals) {
        const children = goals.filter(g => g.type === 'quarterly' && g.parentId === yg.id);
        if (children.length === 0) {
            progressMap[yg.id] = yg.progress || 0;
            continue;
        }
        const totalWeight = children.reduce((sum, c) => sum + (c.weight || 2), 0);
        const weightedProgress = children.reduce((sum, c) => {
            return sum + ((progressMap[c.id] ?? c.progress ?? 0) * (c.weight || 2));
        }, 0);
        progressMap[yg.id] = totalWeight > 0
            ? Math.round(weightedProgress / totalWeight)
            : 0;
    }

    return progressMap;
}

/**
 * Get aggregate stats across all goals.
 */
export function getGoalStats(goals, progressMap) {
    const byCategory = {};
    for (const goal of goals) {
        const cat = goal.category || 'personal';
        if (!byCategory[cat]) byCategory[cat] = { goals: [], totalProgress: 0 };
        byCategory[cat].goals.push(goal);
        byCategory[cat].totalProgress += (progressMap[goal.id] ?? goal.progress ?? 0);
    }
    const result = {};
    for (const [cat, data] of Object.entries(byCategory)) {
        result[cat] = Math.round(data.totalProgress / data.goals.length);
    }
    return result;
}
