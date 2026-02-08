import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, Minimize2, Maximize2, X, Send, Loader2, Circle } from 'lucide-react';
import { ChatSession, Category, QuickActionResponse, Transaction, Projection } from '../types';
import { geminiService } from '../services/geminiService';

interface QuickActionManagerProps {
  categories: Category[];
  projections: Projection[];
  onTransactionCreate: (data: Partial<Transaction>) => void;
  onProjectionCreate: (data: Partial<Projection>) => void;
  onProjectionUpdate: (id: string, data: Partial<Projection>) => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

const QuickActionManager: React.FC<QuickActionManagerProps> = ({
  categories,
  projections,
  onTransactionCreate,
  onProjectionCreate,
  onProjectionUpdate,
  onToast
}) => {
  const [chats, setChats] = useState<ChatSession[]>([]);

  // Listen for Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        startNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startNewChat = () => {
    const newChat: ChatSession = {
      id: uuidv4(),
      messages: [{ role: 'model', text: 'How can I help? (e.g. "Spent 50 on groceries" or "Electricity bills are up 20")' }],
      isMinimized: false,
      isLoading: false,
      hasUnread: false
    };
    setChats(prev => [...prev, newChat]);
  };

  const closeChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
  };

  const toggleMinimize = (id: string) => {
    setChats(prev => prev.map(c => 
      c.id === id ? { ...c, isMinimized: !c.isMinimized, hasUnread: false } : c
    ));
  };

  const handleSendMessage = async (chatId: string, text: string) => {
    if (!text.trim()) return;

    // 1. Update UI with User Message
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, { role: 'user', text }],
          isLoading: true
        };
      }
      return c;
    }));

    // 2. Call Gemini
    const currentChat = chats.find(c => c.id === chatId);
    const history = currentChat 
      ? [...currentChat.messages, { role: 'user', text }] 
      : [{ role: 'user', text }];

    try {
      // Pass existing projections so AI can find matches for updates
      const response: QuickActionResponse = await geminiService.processNaturalLanguageAction(
        history, 
        categories,
        projections
      );

      // 3. Handle Response
      if (response.status === 'COMPLETED') {
        const action = response.actionType || 'CREATE';
        
        if (action === 'CREATE') {
             if (response.recordType === 'TRANSACTION' && response.transactionData) {
                onTransactionCreate(response.transactionData);
             } else if (response.recordType === 'PROJECTION' && response.projectionData) {
                onProjectionCreate(response.projectionData);
             }
        } else if (action === 'UPDATE') {
             if (response.recordType === 'PROJECTION' && response.projectionData && response.projectionData.id) {
                onProjectionUpdate(response.projectionData.id, response.projectionData);
             }
        }
        
        onToast(response.message || "Action completed successfully", 'success');
        closeChat(chatId);
      } else {
        // Clarification needed
        setChats(prev => prev.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              messages: [...c.messages, { role: 'user', text }, { role: 'model', text: response.message }],
              isLoading: false,
              hasUnread: c.isMinimized // If minimized, mark unread
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error(error);
      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
           return {
             ...c,
             messages: [...c.messages, { role: 'user', text }, { role: 'model', text: "Sorry, I encountered an error. Please try again." }],
             isLoading: false,
             hasUnread: c.isMinimized
           };
        }
        return c;
      }));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3 pointer-events-none">
      {chats.map(chat => (
        <ChatWindow 
          key={chat.id} 
          chat={chat} 
          onClose={() => closeChat(chat.id)}
          onMinimize={() => toggleMinimize(chat.id)}
          onSend={(text) => handleSendMessage(chat.id, text)}
        />
      ))}
    </div>
  );
};

const ChatWindow: React.FC<{
  chat: ChatSession;
  onClose: () => void;
  onMinimize: () => void;
  onSend: (text: string) => void;
}> = ({ chat, onClose, onMinimize, onSend }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chat.isMinimized) {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, chat.isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chat.isLoading) return;
    onSend(input);
    setInput('');
  };

  if (chat.isMinimized) {
    return (
      <div className="pointer-events-auto relative">
        <button 
          onClick={onMinimize}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center w-12 h-12"
        >
          <MessageSquare size={20} />
        </button>
        {chat.hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
        {chat.isLoading && (
            <span className="absolute -top-1 -left-1 bg-white rounded-full p-0.5 shadow">
                <Loader2 size={12} className="animate-spin text-indigo-600"/>
            </span>
        )}
      </div>
    );
  }

  return (
    <div className="pointer-events-auto w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-600">
          <MessageSquare size={16} />
          <span className="font-bold text-sm text-slate-700">Quick Action</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={onMinimize} className="p-1 hover:bg-slate-200 rounded text-slate-500">
            <Minimize2 size={14} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-red-100 hover:text-red-500 rounded text-slate-500">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 h-64 overflow-y-auto bg-slate-50/50 custom-scrollbar space-y-3">
        {chat.messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {chat.isLoading && (
          <div className="flex justify-start">
             <div className="bg-white text-slate-500 border border-slate-200 rounded-lg rounded-bl-none px-3 py-2 text-xs shadow-sm flex items-center space-x-1">
                <Loader2 size={10} className="animate-spin" />
                <span>Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
        <div className="relative">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a request..."
            className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={chat.isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || chat.isLoading}
            className="absolute right-1.5 top-1.5 p-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickActionManager;