import React, { createContext, useState, useCallback, useMemo } from 'react';
import { aiService } from '../services/aIService';

export const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your **FlowState AI** coach. I analyze your real task data to give specific, actionable advice.\n\nTry asking me anything about your productivity patterns!",
      timestamp: new Date().toISOString(),
      suggestions: ['How can I improve?', 'Plan my tomorrow', 'Analyze my patterns'],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content, taskContext = {}) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await aiService.getResponse(content, taskContext);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions || [],
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toISOString(),
        suggestions: ['Try again'],
      }]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date().toISOString(),
      suggestions: ['How can I improve?', 'Plan my tomorrow'],
    }]);
  }, []);

  const value = useMemo(() => ({
    messages, isTyping, sendMessage, clearMessages,
  }), [messages, isTyping, sendMessage, clearMessages]);

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};