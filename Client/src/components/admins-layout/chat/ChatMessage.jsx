import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

const ChatMessage = ({ message, isOwn }) => {
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
              : 'bg-white text-medical-900 shadow-sm border border-gray-200'
          }`}
        >
          {message.type === 'text' && (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
          
          {message.type === 'image' && (
            <div>
              <img
                src={message.content}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto mb-2"
              />
              {message.caption && (
                <p className="text-sm">{message.caption}</p>
              )}
            </div>
          )}
          
          {message.type === 'file' && (
            <div className="flex items-center gap-3 p-2 bg-black/10 rounded-lg">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xs font-medium">📄</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{message.fileName}</p>
                <p className="text-xs opacity-75">{message.fileSize}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Message Info */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-medical-500">
            {format(message.timestamp, 'HH:mm dd/MM', { locale: vi })}
          </span>
          {isOwn && message.status && (
            <span className="text-medical-500">
              {getMessageStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;