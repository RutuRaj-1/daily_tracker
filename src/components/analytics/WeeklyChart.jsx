import React from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import Card from '../common/Card';
import { Calendar } from 'lucide-react';

const WeeklyChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="text-sm font-medium text-neutral-700">{label}</p>
          <p className="text-sm text-primary-500">
            Completed: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary-400" />
        <h3 className="font-medium text-neutral-800">Weekly Completion</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorCompletion)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;