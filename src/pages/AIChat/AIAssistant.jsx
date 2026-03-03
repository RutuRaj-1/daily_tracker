import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Send, Bot, User, Target, TrendingUp, Calendar,
  CheckCircle, Zap, Cpu, Activity, Trash2
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';

const AIAssistant = () => {
  const { messages, isTyping, sendMessage, clearMessages } = useAI();
  const { tasks, getTodayTasks, getCompletionPercentage } = useTasks();
  useAuth(); // ensure auth context is available
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const todayTasks = useMemo(() => getTodayTasks(), [getTodayTasks]);
  const completedToday = useMemo(() => todayTasks.filter(t => t.completed).length, [todayTasks]);
  const highPriority = useMemo(() => tasks.filter(t => t.priority === 'high' && !t.completed).length, [tasks]);
  const pct = useMemo(() => getCompletionPercentage(), [getCompletionPercentage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage, { tasks, dailyLogs: [] });
    setInputMessage('');
  }, [inputMessage, sendMessage, tasks]);

  const handleSuggestion = useCallback((text) => {
    sendMessage(text, { tasks, dailyLogs: [] });
  }, [sendMessage, tasks]);

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-2rem)]">
      <div className="flex gap-6 h-full max-h-[calc(100vh-4rem)]">
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    FlowState AI
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">Active</span>
                  </h1>
                  <p className="text-[11px] text-slate-400">Analyzing your real task data</p>
                </div>
              </div>
              <button onClick={clearMessages} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="Clear"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {[
                { icon: CheckCircle, text: `${completedToday}/${todayTasks.length} today`, color: 'text-emerald-500' },
                { icon: Target, text: `${highPriority} high priority`, color: 'text-rose-500' },
                { icon: Zap, text: `${pct}% done`, color: 'text-amber-500' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg text-[11px] text-slate-600">
                  <s.icon className={`w-3 h-3 ${s.color}`} />{s.text}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} onSuggestion={handleSuggestion} formatTime={formatTime} />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-slate-400" /></div>
                <div className="flex gap-1">{[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 flex-shrink-0">
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about your productivity..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300" />
              <button onClick={handleSend} disabled={!inputMessage.trim()}
                className={`p-2.5 rounded-xl transition-all ${inputMessage.trim() ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 hidden xl:block flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm sticky top-6">
            <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="space-y-2 mb-6">
              {[
                { icon: TrendingUp, text: 'How can I improve?', color: 'from-emerald-400 to-teal-400' },
                { icon: Activity, text: 'Analyze my challenges', color: 'from-amber-400 to-orange-400' },
                { icon: Calendar, text: 'Plan my tomorrow', color: 'from-violet-400 to-purple-400' },
              ].map((a, i) => (
                <button key={i} onClick={() => handleSuggestion(a.text)}
                  className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-all text-left">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${a.color}`}><a.icon className="w-3 h-3 text-white" /></div>
                  <span className="text-xs text-slate-700">{a.text}</span>
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 flex items-center gap-1"><Cpu className="w-3 h-3" /> Powered by Gemini AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized message bubble
const MessageBubble = memo(({ msg, onSuggestion, formatTime }) => (
  <div className={`flex ${msg.type === 'ai' ? 'justify-start' : 'justify-end'}`}>
    <div className={`flex max-w-[80%] ${msg.type === 'ai' ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${msg.type === 'ai' ? 'bg-gradient-to-br from-indigo-500 to-violet-500' : 'bg-slate-200'
        }`}>
        {msg.type === 'ai' ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-slate-600" />}
      </div>
      <div>
        <div className={`rounded-2xl p-3.5 text-sm leading-relaxed ${msg.type === 'ai' ? 'bg-slate-50 border border-slate-100 text-slate-700' : 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
          }`} dangerouslySetInnerHTML={{
            __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
          }} />
        {msg.type === 'ai' && msg.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestion(s)}
                className="px-2.5 py-1 bg-white text-[11px] text-slate-600 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">{s}</button>
            ))}
          </div>
        )}
        <p className="text-[9px] text-slate-400 mt-1">{formatTime(msg.timestamp)}</p>
      </div>
    </div>
  </div>
));
MessageBubble.displayName = 'MessageBubble';

export default AIAssistant;