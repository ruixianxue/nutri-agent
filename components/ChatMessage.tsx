import React from 'react';
import { Message, AgentRole } from '../types';
import { User, BrainCircuit, Bot } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { AnalysisCard } from './AnalysisCard';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === AgentRole.USER;
  
  // We treat both Orchestrator and Consultant roles as the single "Agent"
  // but in the new flow we primarily use Consultant.
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border
          ${isUser ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white'}
        `}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-2">
          {/* Agent Name Tag */}
          {!isUser && (
            <span className="text-xs font-semibold text-slate-400 ml-1">
              NutriAgent
            </span>
          )}

          {/* Text Bubble */}
          <div className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed
            ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}
          `}>
             {message.isThinking ? (
               <div className="flex items-center gap-2 text-slate-500">
                 <BrainCircuit className="w-4 h-4 animate-pulse text-indigo-500" />
                 <span className="italic">{message.thinkingStep}</span>
                 <span className="flex space-x-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                 </span>
               </div>
             ) : (
               message.text
             )}
          </div>

          {/* Optional Attachments (Stacked for single agent view) */}
          {!message.isThinking && message.productData && (
            <ProductCard data={message.productData} />
          )}
          {!message.isThinking && message.analysis && (
             <AnalysisCard analysis={message.analysis} />
          )}

        </div>
      </div>
    </div>
  );
};