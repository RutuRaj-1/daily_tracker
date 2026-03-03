import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { Sparkles } from 'lucide-react';

const QuoteCard = () => {
  const [quote, setQuote] = useState({
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  });

  // In production, fetch from API
  useEffect(() => {
    // Mock rotation
    const quotes = [
      { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
      { text: "It's not about having time, it's about making time.", author: "Unknown" },
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    ];
    
    const interval = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 86400000); // Daily rotation
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-ai-50 border-primary-100">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
        <div>
          <p className="text-neutral-700 italic">"{quote.text}"</p>
          <p className="text-sm text-neutral-500 mt-2">— {quote.author}</p>
        </div>
      </div>
    </Card>
  );
};

export default QuoteCard;