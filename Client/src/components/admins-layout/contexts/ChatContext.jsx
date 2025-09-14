import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize mock chat data based on user role
    if (user) {
      initializeChatData();
    }
  }, [user]);

  const initializeChatData = () => {
    const mockChats = generateMockChats(user);
    setChats(mockChats);
    updateUnreadCount(mockChats);
  };

  const generateMockChats = (currentUser) => {
    const baseChats = [];

    if (currentUser.role === 'patient') {
      // Patient can chat with doctors and nurses
      baseChats.push({
        id: 'chat_doctor_001',
        participantId: 'd001',
        participantName: 'BS. Trần Thị Bình',
        participantRole: 'doctor',
        participantAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        department: 'Nội khoa',
        specialization: 'Tim mạch',
        lastMessage: 'Kết quả xét nghiệm của bạn đã có',
        lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
        unreadCount: 2,
        isOnline: true,
        messages: []
      });

      baseChats.push({
        id: 'chat_nurse_001',
        participantId: 'n001',
        participantName: 'Y tá Lê Thị Cẩm',
        participantRole: 'nurse',
        participantAvatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        department: 'Khoa Ngoại',
        lastMessage: 'Lịch tái khám đã được xác nhận',
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: false,
        messages: []
      });
    } else if (currentUser.role === 'doctor') {
      // Doctor can chat with patients and other medical staff
      baseChats.push({
        id: 'chat_patient_001',
        participantId: 'p001',
        participantName: 'Nguyễn Văn An',
        participantRole: 'patient',
        participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        patientId: 'BN001',
        lastMessage: 'Cảm ơn bác sĩ đã tư vấn',
        lastMessageTime: new Date(Date.now() - 45 * 60 * 1000),
        unreadCount: 1,
        isOnline: true,
        messages: []
      });

      baseChats.push({
        id: 'chat_patient_002',
        participantId: 'p002',
        participantName: 'Trần Thị Mai',
        participantRole: 'patient',
        participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        patientId: 'BN002',
        lastMessage: 'Tôi có thể đặt lịch khám không?',
        lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: false,
        messages: []
      });
    } else if (currentUser.role === 'nurse') {
      // Nurse can chat with patients and doctors
      baseChats.push({
        id: 'chat_patient_003',
        participantId: 'p003',
        participantName: 'Lê Minh Tuấn',
        participantRole: 'patient',
        participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        patientId: 'BN003',
        lastMessage: 'Cần hỗ trợ về thủ tục nhập viện',
        lastMessageTime: new Date(Date.now() - 60 * 60 * 1000),
        unreadCount: 3,
        isOnline: true,
        messages: []
      });
    }

    return baseChats;
  };

  const updateUnreadCount = (chatList) => {
    const total = chatList.reduce((sum, chat) => sum + chat.unreadCount, 0);
    setUnreadCount(total);
  };

  const sendMessage = (chatId, messageContent) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: messageContent,
      timestamp: new Date(),
      type: 'text',
      isOwn: true
    };

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...(chat.messages || []), newMessage],
              lastMessage: messageContent,
              lastMessageTime: new Date()
            }
          : chat
      )
    );

    // Update active chat if it's the current one
    if (activeChat?.id === chatId) {
      setActiveChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      }));
    }

    return newMessage;
  };

  const markChatAsRead = (chatId) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
    updateUnreadCount(chats);
  };

  const getChatById = (chatId) => {
    return chats.find(chat => chat.id === chatId);
  };

  const createNewChat = (participantData) => {
    const newChat = {
      id: `chat_${Date.now()}`,
      participantId: participantData.id,
      participantName: participantData.name,
      participantRole: participantData.role,
      participantAvatar: participantData.avatar,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: participantData.isOnline || false,
      messages: []
    };

    setChats(prev => [newChat, ...prev]);
    return newChat;
  };

  const value = {
    chats,
    activeChat,
    unreadCount,
    setActiveChat,
    sendMessage,
    markChatAsRead,
    getChatById,
    createNewChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};