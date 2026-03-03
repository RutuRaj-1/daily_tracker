import React from 'react';
import Card from '../common/Card';
import { Brain, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

const InsightsCard = ({ insights }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-success-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning-500" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-primary-500" />;
      default:
        return <Brain className="w-4 h-4 text-ai-500" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-ai-50">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-ai-500" />
        <h3 className="font-medium text-neutral-800">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
            <div className="p-1.5 bg-white rounded-lg">
              {getIcon(insight.type)}
            </div>
            <div>
              <p className="text-sm text-neutral-700">{insight.message}</p>
              <p className="text-xs text-neutral-400 mt-1">{insight.action}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InsightsCard;