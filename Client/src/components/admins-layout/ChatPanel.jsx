import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { MessageCircle, X, Send, Phone, Video, MoreVertical, Search, Paperclip, Smile, Image } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatPanel = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Mock chat data
  const [chats, setChats] = useState([
    {
      id: 'chat001',
      participantId: user?.role === 'patient' ? 'd001' : 'p001',
      participantName: user?.role === 'patient' ? 'BS. Trần Thị Bình' : 'Nguyễn Văn An',
      participantRole: user?.role === 'patient' ? 'doctor' : 'patient',
      participantAvatar: user?.role === 'patient' 
        ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Cảm ơn bác sĩ đã tư vấn',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 2,
      isOnline: true,
      messages: [
        {
          id: 'm001',
          senderId: user?.role === 'patient' ? 'p001' : 'd001',
          senderName: user?.role === 'patient' ? 'Nguyễn Văn An' : 'BS. Trần Thị Bình',
          content: 'Chào bác sĩ, tôi muốn hỏi về kết quả xét nghiệm',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text',
          isOwn: user?.role === 'patient'
        },
        {
          id: 'm002',
          senderId: user?.role === 'patient' ? 'd001' : 'p001',
          senderName: user?.role === 'patient' ? 'BS. Trần Thị Bình' : 'Nguyễn Văn An',
          content: 'Chào bạn! Tôi đã xem kết quả xét nghiệm của bạn. Các chỉ số đều trong giới hạn bình thường.',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          type: 'text',
          isOwn: user?.role === 'doctor'
        },
        {
          id: 'm003',
          senderId: user?.role === 'patient' ? 'p001' : 'd001',
          senderName: user?.role === 'patient' ? 'Nguyễn Văn An' : 'BS. Trần Thị Bình',
          content: 'Vậy tôi có cần uống thuốc gì không ạ?',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          type: 'text',
          isOwn: user?.role === 'patient'
        },
        {
          id: 'm004',
          senderId: user?.role === 'patient' ? 'd001' : 'p001',
          senderName: user?.role === 'patient' ? 'BS. Trần Thị Bình' : 'Nguyễn Văn An',
          content: 'Hiện tại chưa cần thiết. Bạn chỉ cần duy trì chế độ ăn uống lành mạnh và tập thể dục đều đặn.',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          type: 'text',
          isOwn: user?.role === 'doctor'
        },
        {
          id: 'm005',
          senderId: user?.role === 'patient' ? 'p001' : 'd001',
          senderName: user?.role === 'patient' ? 'Nguyễn Văn An' : 'BS. Trần Thị Bình',
          content: 'Cảm ơn bác sĩ đã tư vấn',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'text',
          isOwn: user?.role === 'patient'
        }
      ]
    },
    {
      id: 'chat002',
      participantId: user?.role === 'patient' ? 'n001' : 'p002',
      participantName: user?.role === 'patient' ? 'Y tá Lê Thị Cẩm' : 'Trần Thị Mai',
      participantRole: user?.role === 'patient' ? 'nurse' : 'patient',
      participantAvatar: user?.role === 'patient'
        ? 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
        : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Lịch tái khám đã được xác nhận',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: 'm006',
          senderId: user?.role === 'patient' ? 'p001' : 'n001',
          senderName: user?.role === 'patient' ? 'Nguyễn Văn An' : 'Y tá Lê Thị Cẩm',
          content: 'Xin chào, tôi muốn đặt lịch tái khám',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          type: 'text',
          isOwn: user?.role === 'patient'
        },
        {
          id: 'm007',
          senderId: user?.role === 'patient' ? 'n001' : 'p002',
          senderName: user?.role === 'patient' ? 'Y tá Lê Thị Cẩm' : 'Trần Thị Mai',
          content: 'Lịch tái khám đã được xác nhận cho ngày 15/12 lúc 14:30',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text',
          isOwn: user?.role !== 'patient'
        }
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: `m${Date.now()}`,
      senderId: user?.id,
      senderName: user?.username,
      content: message.trim(),
      timestamp: new Date(),
      type: 'text',
      isOwn: true
    };

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: message.trim(),
              lastMessageTime: new Date()
            }
          : chat
      )
    );

    setSelectedChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return 'text-blue-600';
      case 'nurse':
        return 'text-green-600';
      case 'patient':
        return 'text-cyan-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'Doctor':
        return 'Bác sĩ';
      case 'Receptionist':
        return 'Bác sĩ';
      case 'Patient':
        return 'Bệnh nhân';
      default:
        return 'Người dùng';
    }
  };

  return (
    <>
      {/* Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-20 w-14 h-14 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl flex">
            {/* Chat List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-medical-900">Tin nhắn</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-medical-400 hover:text-medical-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medical-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <p className="text-medical-600">Không có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <img
                              src={chat.participantAvatar}
                              alt={chat.participantName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            {chat.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-medical-900 truncate">
                                {chat.participantName}
                              </h3>
                              <span className="text-xs text-medical-500">
                                {format(chat.lastMessageTime, 'HH:mm', { locale: vi })}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-medical-600 truncate">
                                {chat.lastMessage}
                              </p>
                              {chat.unreadCount > 0 && (
                                <span className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                            
                            <p className={`text-xs ${getRoleColor(chat.participantRole)} mt-1`}>
                              {getRoleText(chat.participantRole)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={selectedChat.participantAvatar}
                            alt={selectedChat.participantName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {selectedChat.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-medical-900">
                            {selectedChat.participantName}
                          </h3>
                          <p className={`text-xs ${getRoleColor(selectedChat.participantRole)}`}>
                            {getRoleText(selectedChat.participantRole)} • {selectedChat.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {selectedChat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              msg.isOwn
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                : 'bg-white text-medical-900 shadow-sm border border-gray-200'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className={`text-xs text-medical-500 mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                            {format(msg.timestamp, 'HH:mm dd/MM', { locale: vi })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-3">
                      <div className="flex gap-2">
                        <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                          <Image className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1 relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-4 py-3 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                          placeholder="Nhập tin nhắn..."
                          rows="1"
                          style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-medical-600 hover:text-medical-900 transition-colors">
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-medical-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-medical-900 mb-2">
                      Chọn cuộc trò chuyện
                    </h3>
                    <p className="text-medical-600">
                      Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;