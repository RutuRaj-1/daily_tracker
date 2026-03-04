import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Calendar, Save, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dailyLogService } from '../../services/dailyLogService';
import { useTasks } from '../../hooks/useTasks';

const Analysis = () => {
    const { user } = useAuth();
    const { tasks } = useTasks();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [analysisText, setAnalysisText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
    const [loadingLog, setLoadingLog] = useState(false);

    // Derive active date string
    const dateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Fetch log for the selected date
    const loadDailyLog = useCallback(async () => {
        if (!user) return;
        setLoadingLog(true);
        setSaveStatus(null);
        try {
            const result = await dailyLogService.getDailyLog(user.uid, selectedDate);
            if (result.success && result.data && result.data.analysis) {
                setAnalysisText(result.data.analysis);
            } else {
                setAnalysisText('');
            }
        } catch (error) {
            console.error("Error loading analysis:", error);
        } finally {
            setLoadingLog(false);
        }
    }, [user, selectedDate]);

    useEffect(() => {
        loadDailyLog();
    }, [loadDailyLog]);

    // Save the reflection
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveStatus(null);
        try {
            // Create/Update the daily log analysis side
            const result = await dailyLogService.saveDailyAnalysis(user.uid, dateStr, analysisText);
            if (result.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus('error');
            }

            // Also ensure tasks are saved for this specific date snapshot if they aren't already
            const dateTasks = tasks.filter(t => (t.dueDate ? t.dueDate.split('T')[0] : '') === dateStr);
            if (dateTasks.length > 0) {
                await dailyLogService.saveDailyLog(user.uid, dateTasks, selectedDate);
            }
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const changeDate = (days) => {
        setSelectedDate(prev => {
            const next = new Date(prev);
            next.setDate(next.getDate() + days);
            return next;
        });
    };

    const goToToday = () => setSelectedDate(new Date());

    return (
        <div className="p-6 lg:p-8 flex flex-col h-full max-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 flex-shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-light text-slate-800">Daily Analysis</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Reflect on your progress and plan ahead</p>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-center min-w-[140px] px-2 relative">
                        <span className="text-sm font-medium text-slate-700">
                            {dateStr === todayStr
                                ? 'Today'
                                : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <input
                            type="date"
                            value={dateStr}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>

                    <button
                        onClick={() => changeDate(1)}
                        disabled={dateStr === todayStr}
                        className={`p-2 rounded-lg transition-colors ${dateStr === todayStr ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {dateStr !== todayStr && (
                <div className="mb-4 flex-shrink-0">
                    <button onClick={goToToday} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                        → Return to Today
                    </button>
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                {loadingLog && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-2" />
                        <p className="text-xs text-slate-500 font-medium tracking-wide">Loading journal...</p>
                    </div>
                )}

                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-slate-700">Journal Entry</h2>
                </div>

                <textarea
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    placeholder="How did today go? What were the challenges, successes, and lessons learned?"
                    className="flex-1 w-full p-6 text-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:ring-inset focus:ring-1 focus:ring-indigo-100 bg-transparent placeholder:text-slate-300"
                />

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {saveStatus === 'success' && (
                            <span className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Saved to journal
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="flex items-center text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                <AlertCircle className="w-3 h-3 mr-1" /> Failed to save
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all shadow-sm text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
