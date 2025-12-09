import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, Smile, Mic } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage({
      type: 'text',
      content: message.trim()
    });
    
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Handle voice recording logic here
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end gap-3">
        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors"
            title="Đính kèm file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors"
            title="Gửi hình ảnh"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording
                ? 'text-red-600 bg-red-100'
                : 'text-medical-600 hover:text-medical-900 hover:bg-medical-100'
            }`}
            title={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 pr-12 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
            placeholder={isRecording ? 'Đang ghi âm...' : 'Nhập tin nhắn...'}
            disabled={disabled || isRecording}
            rows="1"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-medical-600 hover:text-medical-900 transition-colors"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
        
        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Gửi tin nhắn"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx"
      />
    </div>
  );
};

export default ChatInput;