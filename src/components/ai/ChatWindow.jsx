import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';
import Input from '../common/Input';
import Button from '../common/Button';
import { Send, Bot } from 'lucide-react';

const ChatWindow = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-neutral-200">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-ai-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Bot className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 className="font-medium text-neutral-800">AI Assistant</h3>
            <p className="text-xs text-neutral-500">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-neutral-400">
            <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3" />
            </div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <SuggestionChips onSelect={(suggestion) => setInput(suggestion)} />

      {/* Input */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            icon={Send}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;