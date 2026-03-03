import React from 'react';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isAI = message.type === 'ai';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[80%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isAI ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isAI ? 'bg-primary-100' : 'bg-neutral-100'
          }`}>
            {isAI ? (
              <Bot className="w-4 h-4 text-primary-500" />
            ) : (
              <User className="w-4 h-4 text-neutral-500" />
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <div className={`rounded-2xl p-3 ${
            isAI 
              ? 'bg-white border border-neutral-200' 
              : 'bg-primary-500 text-white'
          }`}>
            <p className="text-sm whitespace-pre-line">{message.content}</p>
          </div>
          
          {/* Timestamp */}
          <p className="text-xs text-neutral-400 mt-1 ml-1">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;