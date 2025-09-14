import React from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatList = ({ 
  chats, 
  selectedChat, 
  onSelectChat, 
  searchTerm, 
  onSearchChange 
}) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return 'text-blue-600';
      case 'nurse':
        return 'text-green-600';
      case 'patient':
        return 'text-cyan-600';
      case 'lab_technician':
        return 'text-teal-600';
      case 'receptionist':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'doctor':
        return 'Bác sĩ';
      case 'nurse':
        return 'Y tá';
      case 'patient':
        return 'Bệnh nhân';
      case 'lab_technician':
        return 'KTV Xét nghiệm';
      case 'receptionist':
        return 'Lễ tân';
      default:
        return 'Người dùng';
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-medical-900 mb-4">Tin nhắn</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medical-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            placeholder="Tìm kiếm cuộc trò chuyện..."
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 text-medical-300 mb-4" />
            <p className="text-medical-600">
              {searchTerm ? 'Không tìm thấy cuộc trò chuyện' : 'Không có cuộc trò chuyện nào'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.participantAvatar}
                      alt={chat.participantName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-medical-900 truncate">
                        {chat.participantName}
                      </h3>
                      <span className="text-xs text-medical-500 flex-shrink-0">
                        {format(chat.lastMessageTime, 'HH:mm', { locale: vi })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-medical-600 truncate">
                        {chat.lastMessage || 'Chưa có tin nhắn'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${getRoleColor(chat.participantRole)}`}>
                        {getRoleText(chat.participantRole)}
                      </p>
                      {chat.department && (
                        <p className="text-xs text-medical-500">
                          {chat.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;