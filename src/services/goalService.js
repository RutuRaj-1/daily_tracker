import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    onSnapshot, query, where, orderBy, Timestamp
} from "firebase/firestore";
import { db } from "./firebase/config";

const GOALS_COLLECTION = "goals";

export const goalService = {

    // ── Real-time listener for all user goals ──────────────────────────────
    subscribeToGoals: (userId, callback) => {
        const q = query(
            collection(db, GOALS_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "asc")
        );
        return onSnapshot(q, (snapshot) => {
            const goals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(goals);
        }, (error) => {
            console.error("Goals subscription error:", error);
            callback([]);
        });
    },

    // ── Create a goal ──────────────────────────────────────────────────────
    createGoal: async (userId, goalData) => {
        try {
            const payload = {
                userId,
                title: goalData.title,
                type: goalData.type,          // 'yearly' | 'quarterly' | 'monthly'
                parentId: goalData.parentId || null,
                category: goalData.category || 'personal', // 'career'|'health'|'learning'|'personal'
                weight: goalData.weight || 2,  // 1=low, 2=medium, 3=high
                startDate: goalData.startDate || null,
                endDate: goalData.endDate || null,
                status: 'active',
                progress: 0,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };
            const docRef = await addDoc(collection(db, GOALS_COLLECTION), payload);
            return { success: true, data: { id: docRef.id, ...payload } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ── Update a goal ──────────────────────────────────────────────────────
    updateGoal: async (goalId, updates) => {
        try {
            await updateDoc(doc(db, GOALS_COLLECTION, goalId), {
                ...updates,
                updatedAt: Timestamp.now(),
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ── Update progress property on a goal ─────────────────────────────────
    updateGoalProgress: async (goalId, progress) => {
        try {
            await updateDoc(doc(db, GOALS_COLLECTION, goalId), {
                progress: Math.min(100, Math.max(0, Math.round(progress))),
                updatedAt: Timestamp.now(),
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ── Delete a goal (and optionally orphan or cascade-delete children) ────
    deleteGoal: async (goalId) => {
        try {
            await deleteDoc(doc(db, GOALS_COLLECTION, goalId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ── Helpers ────────────────────────────────────────────────────────────
    getGoalsByType: (goals, type) => goals.filter(g => g.type === type),
    getChildGoals: (goals, parentId) => goals.filter(g => g.parentId === parentId),
    getRootGoals: (goals) => goals.filter(g => !g.parentId),

    // Generate quarterly date ranges (4-month blocks)
    getQuarterlyRange: (startMonth, startYear) => {
        const start = new Date(startYear, startMonth - 1, 1);
        const end = new Date(startYear, startMonth + 3, 0); // last day of 4th month
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        };
    },

    // Days remaining helper
    getDaysRemaining: (endDate) => {
        if (!endDate) return null;
        const diff = new Date(endDate).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / 86400000));
    },
};

export default goalService;
