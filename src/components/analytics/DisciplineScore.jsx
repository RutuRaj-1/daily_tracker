import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import Card from '../common/Card';
import { Award } from 'lucide-react';

const DisciplineScore = ({ data }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary-400" />
        <h3 className="font-medium text-neutral-800">Discipline Score</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="metric" stroke="#64748b" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-2xl font-light text-neutral-800">
          {Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length)}%
        </p>
        <p className="text-xs text-neutral-400">Overall Discipline</p>
      </div>
    </Card>
  );
};

export default DisciplineScore;