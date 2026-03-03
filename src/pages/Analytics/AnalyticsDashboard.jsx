import React, { useState, useMemo, memo } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Calendar, Award, Target, Star,
  Activity, Zap, Cpu
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useAnalytics } from '../../hooks/useAnalytics';

const AnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState('week');

  const {
    loading, weeklyData, monthlyData, disciplineMetrics,
    overallScore, streak, priorityRatios, bestWorstDays, insights
  } = useAnalytics(timeframe);

  const weeklyAverage = useMemo(() => {
    const active = weeklyData.filter(d => d.total > 0);
    return active.length > 0 ? Math.round(active.reduce((s, d) => s + d.percentage, 0) / active.length) : 0;
  }, [weeklyData]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-light text-slate-800">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Performance metrics & insights</p>
        </div>
        <div className="flex gap-1.5">
          {['week', 'month', 'quarter'].map(p => (
            <button key={p} onClick={() => setTimeframe(p)} className={`px-3.5 py-2 rounded-lg text-xs font-medium capitalize transition-all ${timeframe === p ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Discipline" value={overallScore} unit="%" icon={Cpu} color="violet" />
        <MetricCard title="Weekly Avg" value={weeklyAverage} unit="%" icon={Activity} color="emerald" />
        <MetricCard title="Streak" value={streak} unit="days" icon={Zap} color="amber" />
        <MetricCard title="Best Day" value={bestWorstDays.best.day} icon={Star} color="indigo" sub={`${bestWorstDays.best.completion}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Weekly Completion" icon={Calendar}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <defs><linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} /><stop offset="95%" stopColor="#6366F1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="completed" stroke="#6366F1" fillOpacity={1} fill="url(#gc)" name="Done" />
              <Area type="monotone" dataKey="total" stroke="#CBD5E1" fillOpacity={0.15} fill="#E2E8F0" name="Total" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="completion" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} name="Completion" />
              <Line type="monotone" dataKey="focus" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} name="Focus" />
              <Line type="monotone" dataKey="productivity" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} name="Productivity" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Priority + Discipline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Priority Completion" icon={Target}>
          <div className="space-y-4">
            {priorityRatios.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} /><span className="text-slate-700">{p.name}</span></div>
                  <span className="font-medium text-slate-700">{p.ratio}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.ratio}%`, backgroundColor: p.color }} /></div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>{p.completed} done</span><span>{p.total} total</span></div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Discipline Radar" icon={Award}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={disciplineMetrics}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="metric" stroke="#64748B" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={10} />
              <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.map((insight, i) => (
              <div key={i} className={`p-3 rounded-xl border text-xs ${insight.type === 'positive' ? 'bg-emerald-50 border-emerald-100' :
                insight.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50/50 border-indigo-100'
                }`}>
                <p className="font-medium text-slate-700">{insight.message}</p>
                {insight.action && <p className="text-slate-500 mt-0.5">{insight.action}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = memo(({ title, value, unit, icon: Icon, color, sub }) => {
  const colors = { violet: 'bg-violet-50 text-violet-500', emerald: 'bg-emerald-50 text-emerald-500', amber: 'bg-amber-50 text-amber-500', indigo: 'bg-indigo-50 text-indigo-500' };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className={`p-2.5 rounded-xl ${colors[color]} w-fit mb-3`}><Icon className="w-4 h-4" /></div>
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-xl font-light text-slate-800 mt-0.5">{value}{unit && <span className="text-xs text-slate-400 ml-0.5">{unit}</span>}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
});
MetricCard.displayName = 'MetricCard';

const ChartCard = memo(({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-indigo-50 rounded-lg"><Icon className="w-4 h-4 text-indigo-500" /></div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
));
ChartCard.displayName = 'ChartCard';

export default AnalyticsDashboard;