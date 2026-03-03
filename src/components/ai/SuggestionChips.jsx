import React from 'react';
import { Sparkles, TrendingUp, Calendar, Brain } from 'lucide-react';

const SuggestionChips = ({ onSelect }) => {
  const suggestions = [
    { text: "How can I improve?", icon: TrendingUp, color: "text-primary-500" },
    { text: "Plan my tomorrow", icon: Calendar, color: "text-warning-500" },
    { text: "Why did I fail?", icon: Brain, color: "text-ai-500" },
    { text: "Productivity tips", icon: Sparkles, color: "text-success-500" }
  ];

  return (
    <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-neutral-100">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-full text-xs transition-colors group"
          >
            <Icon className={`w-3 h-3 ${suggestion.color} group-hover:scale-110 transition-transform`} />
            <span className="text-neutral-600">{suggestion.text}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SuggestionChips;