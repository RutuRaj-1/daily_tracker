import {
    doc, getDoc, setDoc, getDocs, collection,
    query, where, orderBy, Timestamp
} from "firebase/firestore";
import { db } from "./firebase/config";

const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const dailyLogService = {
    // Get or create today's daily log
    getDailyLog: async (userId, date = new Date()) => {
        try {
            const dateStr = getDateString(date);
            const docId = `${userId}_${dateStr}`;
            const docRef = doc(db, "dailyLogs", docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            }
            return { success: true, data: null };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Save/update daily log snapshot
    saveDailyLog: async (userId, tasks, date = new Date()) => {
        try {
            const dateStr = getDateString(date);
            const docId = `${userId}_${dateStr}`;

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.completed).length;
            const highPriorityTotal = tasks.filter(t => t.priority === 'high').length;
            const highPriorityCompleted = tasks.filter(t => t.priority === 'high' && t.completed).length;

            // Priority-weighted completion
            const priorityWeights = { high: 3, medium: 2, low: 1 };
            const totalWeight = tasks.reduce((sum, t) => sum + (priorityWeights[t.priority] || 1), 0);
            const completedWeight = tasks.filter(t => t.completed)
                .reduce((sum, t) => sum + (priorityWeights[t.priority] || 1), 0);

            const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const weightedCompletion = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

            const logData = {
                userId,
                date: dateStr,
                totalTasks,
                completedTasks,
                completionPercentage,
                weightedCompletion,
                highPriorityTotal,
                highPriorityCompleted,
                tasks: tasks.map(t => ({
                    id: t.id,
                    title: t.title,
                    priority: t.priority,
                    completed: t.completed || false,
                })),
                updatedAt: Timestamp.now(),
            };

            await setDoc(doc(db, "dailyLogs", docId), logData, { merge: true });
            return { success: true, data: logData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Save daily reflective analysis separately
    saveDailyAnalysis: async (userId, dateStr, analysisText) => {
        try {
            const docId = `${userId}_${dateStr}`;
            await setDoc(doc(db, "dailyLogs", docId), {
                userId,
                date: dateStr,
                analysis: analysisText,
                updatedAt: Timestamp.now()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get logs for the last N days
    getRecentLogs: async (userId, days = 7) => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const startStr = getDateString(startDate);
            const endStr = getDateString(endDate);

            const q = query(
                collection(db, "dailyLogs"),
                where("userId", "==", userId),
                where("date", ">=", startStr),
                where("date", "<=", endStr),
                orderBy("date", "asc")
            );

            const snapshot = await getDocs(q);
            const logs = [];
            snapshot.forEach(doc => {
                logs.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: logs };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Calculate streak from daily logs
    calculateStreak: async (userId) => {
        try {
            const result = await dailyLogService.getRecentLogs(userId, 60);
            if (!result.success) return { success: false, error: result.error };

            const logs = result.data;
            let streak = 0;
            const today = new Date();

            for (let i = 0; i < 60; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                const dateStr = getDateString(checkDate);

                const dayLog = logs.find(l => l.date === dateStr);

                if (dayLog && dayLog.completionPercentage >= 50) {
                    streak++;
                } else if (i > 0) {
                    // Skip today if no log yet (grace period)
                    break;
                }
            }

            return { success: true, data: streak };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
};

export default dailyLogService;
