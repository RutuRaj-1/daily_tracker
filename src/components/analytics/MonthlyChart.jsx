import React from 'react';
import {
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '../common/Card';
import { TrendingUp } from 'lucide-react';

const MonthlyChart = ({ data }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-400" />
        <h3 className="font-medium text-neutral-800">Monthly Trend</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="completion"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="focus"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MonthlyChart;