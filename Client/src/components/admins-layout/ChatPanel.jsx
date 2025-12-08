import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useChat } from './contexts/ChatContext';
import { MessageCircle, X, Send, Phone, Video, Bot, MoreVertical, Search, Paperclip, Smile, Image } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';

// Component chính hiển thị giao diện chat
const ChatPanel = () => {
  const { user } = useAuth();
  const {
    chats,
    activeChat,
    unreadCount,
    setActiveChat,
    sendMessage,
    markChatAsRead,
    connectionState // Trạng thái kết nối SignalR
  } = useChat(); // Sử dụng ChatContext để lấy dữ liệu và các hàm chat

  const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở panel chat
  const [message, setMessage] = useState(''); // Nội dung tin nhắn đang nhập
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm trong danh sách chat
  const messagesEndRef = useRef(null); // Ref để cuộn đến cuối danh sách tin nhắn
  const [isBotResponding, setIsBotResponding] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL_AI;
  // Hàm cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // useEffect để cuộn xuống cuối khi activeChat hoặc tin nhắn thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, scrollToBottom]);

  const CHATBOT_ID = 'chatbot-medical-consult';
  const CHATBOT_NAME = 'AI Tư vấn Y tế';
  const CHATBOT_ROLE = 'Bot';
  const CHATBOT_AVATAR = 'https://ui-avatars.com/api/?name=AI&background=008080&color=fff'; // Màu Teal

  // 1. Thêm Chatbot vào danh sách chat nếu user là Patient
  const isPatient = user?.role === 'Patient';
  const [internalChats, setInternalChats] = useState([]);

  useEffect(() => {
    let combinedChats = [...chats];
    
    // Nếu là Patient, thêm chatbot vào đầu danh sách
    if (isPatient && !chats.some(c => c.id === CHATBOT_ID)) {
      const botChat = {
        id: CHATBOT_ID,
        participantId: CHATBOT_ID,
        participantName: CHATBOT_NAME,
        participantRole: CHATBOT_ROLE,
        participantAvatar: CHATBOT_AVATAR,
        lastMessage: 'Hỏi bất kỳ vấn đề sức khỏe nào!',
        lastMessageTime: new Date(),
        unreadCount: 0,
        isOnline: true,
        messages: [] // Chatbot không cần lịch sử tải từ server
      };
      combinedChats = [botChat, ...chats];
    }
     
    // Sắp xếp lại danh sách chat
    combinedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    setInternalChats(combinedChats);
  }, [chats, isPatient]);

  // Hàm xử lý gửi tin nhắn tới Chatbot
  const sendChatbotMessage = useCallback(async (messageContent) => {
    setIsBotResponding(true);

    // Thêm tin nhắn của người dùng vào UI ngay lập tức
    const userMessage = {
      id: `msg_${Date.now()}_own`,
      senderId: user.id,
      senderName: user.fullName || user.username,
      content: messageContent,
      timestamp: new Date(),
      type: 'text',
      isOwn: true
    };

    setInternalChats(prevChats => {
      return prevChats.map(chat =>
        chat.id === CHATBOT_ID
          ? {
              ...chat,
              messages: [...(chat.messages || []), userMessage],
              lastMessage: messageContent,
              lastMessageTime: new Date()
            }
          : chat
      );
    });

    setActiveChat(prev => ({
      ...prev,
      messages: [...(prev.messages || []), userMessage]
    }));
    
    try {
      const response = await axios.post(`${API_BASE_URL}/consult`, {
        message: messageContent
      }, {
          headers: {
              'Content-Type': 'application/json',
          },
          timeout: 30000 
      });

      const botResponseContent = response.data?.response || "Xin lỗi, tôi không thể tìm thấy thông tin tư vấn y tế cho câu hỏi này.";
      const botMessage = {
        id: `msg_${Date.now()}_bot`,
        senderId: CHATBOT_ID,
        senderName: CHATBOT_NAME,
        content: botResponseContent,
        timestamp: new Date(),
        type: 'text',
        isOwn: false
      };

      // Cập nhật UI với câu trả lời của Bot
      setInternalChats(prevChats => {
        return prevChats.map(chat =>
          chat.id === CHATBOT_ID
            ? {
                ...chat,
                messages: [...(chat.messages || []), botMessage],
                lastMessage: botMessage.content,
                lastMessageTime: new Date()
              }
            : chat
        );
      });
      
      setActiveChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), botMessage]
      }));

    } catch (error) {
      console.error("Error calling chatbot API:", error);
      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        senderId: CHATBOT_ID,
        senderName: CHATBOT_NAME,
        content: "Lỗi kết nối. Xin lỗi, tôi không thể trả lời lúc này.",
        timestamp: new Date(),
        type: 'text',
        isOwn: false
      };

      setActiveChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), errorMessage]
      }));
    } finally {
      setIsBotResponding(false);
    }
  }, [user]);

  // Xử lý khi người dùng chọn một cuộc trò chuyện từ danh sách
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    if (chat.unreadCount > 0 && chat.id !== CHATBOT_ID) { // Bot không cần đánh dấu đã đọc
      markChatAsRead(chat.id);
    }
  };

  // Cập nhật lại logic gửi tin nhắn chính
  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const messageToSend = message.trim();
    setMessage('');
    
    if (activeChat.id === CHATBOT_ID) {
      await sendChatbotMessage(messageToSend);
    } else {
      await sendMessage(activeChat.participantId, messageToSend);
    }
    
    scrollToBottom();
  };

  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Gửi khi nhấn Enter (không kèm Shift)
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Lọc danh sách chat dựa trên từ khóa tìm kiếm
  const filteredChats = internalChats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm trả về màu sắc cho vai trò của người dùng
  const getRoleColor = (role) => {
    switch (role) {
      case 'Doctor': return 'text-blue-600';
      case 'Patient': return 'text-cyan-600';
      case 'Receptionist': return 'text-purple-600';
      case 'Bot': return 'text-teal-600';
      default: return 'text-gray-600';
    }
  };

  // Hàm trả về tên hiển thị của vai trò
  const getRoleText = (role) => {
    switch (role) {
      case 'Receptionist': return 'Lễ tân';
      case 'Patient': return 'Bệnh nhân';
      case 'Bot': return 'AI';
      default: return 'Người dùng';
    }
  };

  return (
    <>
      {/* Nút kích hoạt mở Chat Panel */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-20 w-14 h-14 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
        {/* Hiển thị số lượng tin nhắn chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel chính */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Lớp phủ nền mờ khi panel mở */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl flex">
            {/* Cột danh sách các cuộc trò chuyện */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header của danh sách chat */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-medical-900">Tin nhắn</h2>
                  {/* Nút đóng panel */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-medical-400 hover:text-medical-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Thanh tìm kiếm chat */}
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

              {/* Trạng thái kết nối SignalR */}
              <div className={`py-1 px-4 text-xs font-medium text-center ${connectionState === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Trạng thái: {connectionState === 'Connected' ? 'Đã kết nối' : 'Đang ngắt kết nối...'}
              </div>

              {/* Danh sách các cuộc trò chuyện đã lọc */}
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
                        onClick={() => handleSelectChat(chat)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          activeChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative flex-shrink-0">
                            {chat.id === CHATBOT_ID ? (
                              <div className="w-12 h-12 rounded-full object-cover bg-teal-600 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                                </div>
                                ) : (
                                <img src={chat.participantAvatar} alt={chat.participantName} className="w-12 h-12 rounded-full object-cover"
                                />)}
                                {/* Hiển thị trạng thái online (Bot luôn online) */}
                                {(chat.isOnline || chat.id === CHATBOT_ID) && (
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
                              {/* Hiển thị số tin nhắn chưa đọc của từng chat */}
                              {chat.unreadCount > 0 && chat.id !== CHATBOT_ID && (
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

            {/* Cột hiển thị tin nhắn của cuộc trò chuyện đang active */}
            <div className="flex-1 flex flex-col">
              {activeChat ? (
                <>
                  {/* Header của cuộc trò chuyện đang active */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-shrink-0">
                            {activeChat.id === CHATBOT_ID ? (
                              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <img
                                src={activeChat.participantAvatar}
                                alt={activeChat.participantName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}

                            {(activeChat.isOnline || activeChat.id === CHATBOT_ID) && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                        <div>
                          <h3 className="font-medium text-medical-900">
                            {activeChat.participantName}
                          </h3>
                          <p className={`text-xs ${getRoleColor(activeChat.participantRole)}`}>
                            {getRoleText(activeChat.participantRole)} • {activeChat.isOnline || activeChat.id === CHATBOT_ID ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
                          {activeChat.id === CHATBOT_ID && (
                                <p className="text-xs text-medical-500 italic mt-0.5">
                                    *Chỉ cung cấp thông tin chung, KHÔNG thay thế lời khuyên y tế.
                                </p>
                            )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Ẩn nút Gọi/Video cho Chatbot */}
                        {activeChat.id !== CHATBOT_ID && (
                            <>
                                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                                    <Video className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Khu vực hiển thị tin nhắn */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {(activeChat.messages || []).map((msg) => (
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
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className={`text-xs text-medical-500 mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                            {format(msg.timestamp, 'HH:mm dd/MM', { locale: vi })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isBotResponding && activeChat.id === CHATBOT_ID && (
                        <div className="flex justify-start">
                            <div className="bg-white text-medical-900 shadow-sm border border-gray-200 px-4 py-2 rounded-2xl max-w-xs lg:max-w-md">
                                <span className="text-sm italic">AI đang trả lời...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} /> {/* Dùng để cuộn xuống cuối */}
                  </div>

                  {/* Input nhập tin nhắn */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-3">
                      <div className="flex gap-2">
                        {activeChat.id !== CHATBOT_ID && (
                            <div className="flex gap-2">
                                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                                    <Image className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                      </div>
                      
                      <div className="flex-1 relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-4 py-3 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                          placeholder={activeChat.id === CHATBOT_ID ? "Hỏi thông tin sức khỏe..." : "Nhập tin nhắn..."}
                          rows="1"
                          style={{ minHeight: '44px', maxHeight: '120px' }}
                          disabled={activeChat.id === CHATBOT_ID && isBotResponding} // Vô hiệu hóa khi Bot đang trả lời
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-medical-600 hover:text-medical-900 transition-colors">
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || connectionState !== 'Connected'} // Vô hiệu hóa nút gửi khi không có tin nhắn hoặc chưa kết nối
                        className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Hiển thị khi chưa có cuộc trò chuyện nào được chọn
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