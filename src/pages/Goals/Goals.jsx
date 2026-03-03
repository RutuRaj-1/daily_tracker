import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    Target, Plus, ChevronDown, ChevronRight, Trash2, Edit3,
    Calendar, TrendingUp, Award, Zap, BookOpen, Heart, User, X, Check,
    AlertTriangle, Clock
} from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';
import { getTimeRiskLevel, getDaysRemaining, getTimeElapsedPct, getGoalStats } from '../../utils/progressEngine';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_META = {
    career: { label: 'Career', color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
    health: { label: 'Health', color: 'bg-emerald-100 text-emerald-700', icon: Heart },
    learning: { label: 'Learning', color: 'bg-violet-100 text-violet-700', icon: BookOpen },
    personal: { label: 'Personal', color: 'bg-amber-100 text-amber-700', icon: User },
};

const RISK_META = {
    safe: { label: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    warning: { label: 'At Risk', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    danger: { label: 'Behind', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

const RING_COLORS = {
    yearly: 'stroke-indigo-500',
    quarterly: 'stroke-violet-500',
    monthly: 'stroke-blue-400',
};

const RING_BG = {
    yearly: 'stroke-indigo-100',
    quarterly: 'stroke-violet-100',
    monthly: 'stroke-blue-100',
};

// ── Circular Progress Ring ────────────────────────────────────────────────────
const ProgressRing = memo(({ progress = 0, size = 64, type = 'yearly' }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="6"
                className={RING_BG[type]} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="6"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" className={`${RING_COLORS[type]} transition-all duration-700`} />
        </svg>
    );
});

// ── Goal Form Modal ───────────────────────────────────────────────────────────
const GoalFormModal = memo(({ onClose, onSave, editGoal, parentGoals, type }) => {
    const [form, setForm] = useState({
        title: editGoal?.title || '',
        type: editGoal?.type || type || 'yearly',
        parentId: editGoal?.parentId || '',
        category: editGoal?.category || 'career',
        weight: editGoal?.weight || 2,
        startDate: editGoal?.startDate || '',
        endDate: editGoal?.endDate || '',
    });

    const handleQuarterSelect = (e) => {
        const month = parseInt(e.target.value);
        const year = new Date().getFullYear();
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month + 3, 0);
        setForm(f => ({
            ...f,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave({ ...form, weight: Number(form.weight) });
        onClose();
    };

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">
                        {editGoal ? 'Edit Goal' : `New ${form.type.charAt(0).toUpperCase() + form.type.slice(1)} Goal`}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Goal Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Crack Internship, Master DSA..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                            required autoFocus
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(CATEGORY_META).map(([key, meta]) => {
                                const Icon = meta.icon;
                                return (
                                    <button key={key} type="button"
                                        onClick={() => setForm(f => ({ ...f, category: key }))}
                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all ${form.category === key
                                                ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">
                            Impact Weight: {['', 'Low', 'Medium', 'High'][form.weight]}
                        </label>
                        <input type="range" min="1" max="3" step="1"
                            value={form.weight}
                            onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                            className="w-full accent-indigo-600"
                        />
                    </div>

                    {/* Parent Goal (for quarterly and monthly) */}
                    {(form.type === 'quarterly' || form.type === 'monthly') && parentGoals?.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">Link to Parent Goal</label>
                            <select
                                value={form.parentId}
                                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                            >
                                <option value="">— No parent —</option>
                                {parentGoals.map(g => (
                                    <option key={g.id} value={g.id}>{g.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date Range */}
                    {form.type === 'quarterly' ? (
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">Start Month (4-month block)</label>
                            <select onChange={handleQuarterSelect}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 outline-none">
                                <option value="">Select start month</option>
                                {MONTHS.map((m, i) => (
                                    <option key={i} value={i + 1}>{m} {new Date().getFullYear()} → {MONTHS[(i + 3) % 12]} {i <= 8 ? new Date().getFullYear() : new Date().getFullYear() + 1}</option>
                                ))}
                            </select>
                            {form.startDate && (
                                <p className="text-xs text-indigo-600 mt-1">
                                    Range: {form.startDate} to {form.endDate}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Start Date</label>
                                <input type="date" value={form.startDate}
                                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">End Date</label>
                                <input type="date" value={form.endDate}
                                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                            {editGoal ? 'Save Changes' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

// ── Goal Card ─────────────────────────────────────────────────────────────────
const GoalCard = memo(({ goal, progressMap, childGoals = [], onEdit, onDelete, allGoals }) => {
    const [expanded, setExpanded] = useState(false);
    const progress = progressMap[goal.id] ?? goal.progress ?? 0;
    const risk = getTimeRiskLevel({ ...goal, progress });
    const daysLeft = getDaysRemaining(goal.endDate);
    const timeElapsed = getTimeElapsedPct(goal);
    const catMeta = CATEGORY_META[goal.category] || CATEGORY_META.personal;
    const riskMeta = RISK_META[risk];
    const CatIcon = catMeta.icon;

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${risk === 'danger' ? 'border-red-200' : risk === 'warning' ? 'border-amber-200' : 'border-slate-100'
            }`}>
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Progress Ring */}
                    <div className="relative flex-shrink-0 flex items-center justify-center">
                        <ProgressRing progress={progress} size={72} type={goal.type} />
                        <div className="absolute text-center">
                            <div className="text-sm font-bold text-slate-700">{progress}%</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catMeta.color}`}>
                                <CatIcon size={10} className="inline mr-1" />
                                {catMeta.label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${riskMeta.bg} ${riskMeta.color}`}>
                                {riskMeta.label}
                            </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">{goal.title}</h3>

                        {/* Timeline bar */}
                        {goal.startDate && goal.endDate && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>{progress}% done</span>
                                    <span>{timeElapsed}% time used</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all"
                                        style={{ width: `${progress}%` }} />
                                </div>
                                {risk === 'danger' && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                                        <AlertTriangle size={10} />
                                        <span>Behind schedule — needs attention!</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            {daysLeft !== null && (
                                <span className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {daysLeft}d left
                                </span>
                            )}
                            {childGoals.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Target size={10} />
                                    {childGoals.length} sub-goals
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Zap size={10} />
                                {'★'.repeat(goal.weight || 1)}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                        <button onClick={() => onEdit(goal)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit3 size={14} />
                        </button>
                        <button onClick={() => onDelete(goal.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                        </button>
                        {childGoals.length > 0 && (
                            <button onClick={() => setExpanded(e => !e)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Child Goals */}
            {expanded && childGoals.length > 0 && (
                <div className="border-t border-slate-50 bg-slate-50/50 px-5 py-3 space-y-2">
                    {childGoals.map(child => {
                        const childProgress = progressMap[child.id] ?? child.progress ?? 0;
                        const childCat = CATEGORY_META[child.category] || CATEGORY_META.personal;
                        const childDays = getDaysRemaining(child.endDate);
                        return (
                            <div key={child.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                                <div className="relative">
                                    <ProgressRing progress={childProgress} size={44} type={child.type} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-bold text-slate-600">{childProgress}%</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-700 truncate">{child.title}</div>
                                    <div className="text-xs text-slate-400">
                                        {childCat.label}{childDays !== null ? ` • ${childDays}d left` : ''}
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${getTimeRiskLevel({ ...child, progress: childProgress }) === 'danger' ? 'bg-red-400' :
                                        getTimeRiskLevel({ ...child, progress: childProgress }) === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

// ── Goal Pyramid Overview ─────────────────────────────────────────────────────
const GoalPyramidOverview = memo(({ goals, progressMap }) => {
    const yearly = goals.filter(g => g.type === 'yearly');
    const quarterly = goals.filter(g => g.type === 'quarterly');
    const monthly = goals.filter(g => g.type === 'monthly');

    const avgProgress = (list) => {
        if (!list.length) return 0;
        return Math.round(list.reduce((s, g) => s + (progressMap[g.id] ?? g.progress ?? 0), 0) / list.length);
    };

    const categoryStats = useMemo(() => {
        const allGoals = [...yearly, ...quarterly, ...monthly];
        const cats = {};
        for (const g of allGoals) {
            const cat = g.category || 'personal';
            if (!cats[cat]) cats[cat] = { total: 0, count: 0 };
            cats[cat].total += progressMap[g.id] ?? g.progress ?? 0;
            cats[cat].count += 1;
        }
        return Object.entries(cats).map(([cat, d]) => ({
            cat, avg: Math.round(d.total / d.count), meta: CATEGORY_META[cat] || CATEGORY_META.personal
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goals, progressMap]);

    const levels = [
        { label: 'Yearly Goals', goals: yearly, avg: avgProgress(yearly), color: 'from-indigo-500 to-indigo-600' },
        { label: 'Quarterly Goals', goals: quarterly, avg: avgProgress(quarterly), color: 'from-violet-500 to-violet-600' },
        { label: 'Monthly Goals', goals: monthly, avg: avgProgress(monthly), color: 'from-blue-400 to-blue-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Pyramid bars */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Award size={16} className="text-indigo-500" />
                    Goal Pyramid
                </h3>
                <div className="space-y-3">
                    {levels.map((lvl, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 font-medium">{lvl.label}</span>
                                <span className="text-slate-500">{lvl.goals.length} goals · {lvl.avg}%</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${lvl.color} rounded-full transition-all duration-700`}
                                    style={{ width: `${lvl.avg}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category breakdown */}
            {categoryStats.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Category Breakdown</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categoryStats.map(({ cat, avg, meta }) => {
                            const Icon = meta.icon;
                            return (
                                <div key={cat} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon size={14} className="text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700">{meta.label}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800">{avg}%</div>
                                    <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${meta.color.replace('text-', 'bg-').split(' ')[0]}`}
                                            style={{ width: `${avg}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
});

// ── Main Goals Page ───────────────────────────────────────────────────────────
const Goals = () => {
    const { goals, loading, progressMap, addGoal, updateGoal, deleteGoal } = useGoals();
    const [activeTab, setActiveTab] = useState('overview');
    const [showForm, setShowForm] = useState(false);
    const [editGoal, setEditGoal] = useState(null);
    const [formType, setFormType] = useState('yearly');

    const TABS = [
        { id: 'overview', label: 'Overview', icon: Award },
        { id: 'yearly', label: 'Yearly', icon: TrendingUp },
        { id: 'quarterly', label: 'Quarterly', icon: Calendar },
        { id: 'monthly', label: 'Monthly', icon: Target },
    ];

    const openAddForm = (type) => { setFormType(type); setEditGoal(null); setShowForm(true); };
    const openEditForm = (goal) => { setEditGoal(goal); setFormType(goal.type); setShowForm(true); };

    const handleSave = useCallback(async (data) => {
        if (editGoal) {
            await updateGoal(editGoal.id, data);
        } else {
            await addGoal(data);
        }
    }, [editGoal, addGoal, updateGoal]);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Delete this goal?')) await deleteGoal(id);
    }, [deleteGoal]);

    // Compute parent goals for form dropdowns
    const parentGoalsForType = useMemo(() => {
        if (formType === 'quarterly') return goals.filter(g => g.type === 'yearly');
        if (formType === 'monthly') return goals.filter(g => g.type === 'quarterly');
        return [];
    }, [formType, goals]);

    const tabGoals = useMemo(() => {
        if (activeTab === 'overview') return [];
        return goals.filter(g => g.type === activeTab);
    }, [goals, activeTab]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-400 text-sm animate-pulse">Loading goals...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Goal Pyramid</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Strategy → Execution, tracked in 4 levels</p>
                </div>
                <button
                    onClick={() => openAddForm(activeTab === 'overview' ? 'yearly' : activeTab)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-indigo-200"
                >
                    <Plus size={16} />
                    Add {activeTab === 'overview' ? 'Goal' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Goal
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Icon size={14} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
                goals.length === 0 ? (
                    <div className="text-center py-20">
                        <Target size={48} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No goals yet</p>
                        <p className="text-slate-400 text-sm mb-4">Start by adding a Yearly goal</p>
                        <button onClick={() => openAddForm('yearly')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                            Add Yearly Goal
                        </button>
                    </div>
                ) : (
                    <GoalPyramidOverview goals={goals} progressMap={progressMap} />
                )
            ) : (
                <div className="space-y-4">
                    {tabGoals.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                            <Target size={40} className="text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500">No {activeTab} goals yet</p>
                            <button onClick={() => openAddForm(activeTab)}
                                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                                Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Goal
                            </button>
                        </div>
                    ) : (
                        tabGoals.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                progressMap={progressMap}
                                childGoals={goals.filter(g => g.parentId === goal.id)}
                                allGoals={goals}
                                onEdit={openEditForm}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <GoalFormModal
                    onClose={() => { setShowForm(false); setEditGoal(null); }}
                    onSave={handleSave}
                    editGoal={editGoal}
                    type={formType}
                    parentGoals={parentGoalsForType}
                />
            )}
        </div>
    );
};

export default Goals;
