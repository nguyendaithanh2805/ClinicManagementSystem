import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as signalR from '@microsoft/signalr';
import api from "../../admins-layout/contexts/Api";

// Tạo Context cho Chat, sử dụng nó để chia sẻ trạng thái và các hàm chat
const ChatContext = createContext();

// Hook tùy chỉnh để sử dụng ChatContext dễ dàng hơn
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Provider component để bọc ứng dụng và cung cấp ChatContext
export const ChatProvider = ({ children }) => {
  const { user } = useAuth(); // Lấy thông tin người dùng và token từ AuthContext
  const [chats, setChats] = useState([]); // Danh sách tất cả các cuộc trò chuyện
  const [activeChat, setActiveChat] = useState(null); // Cuộc trò chuyện đang được mở/xem
  const [unreadCount, setUnreadCount] = useState(0); // Tổng số tin nhắn chưa đọc từ tất cả các cuộc trò chuyện
  const connectionRef = useRef(null); // Ref để giữ đối tượng SignalR HubConnection, tránh tạo lại không cần thiết
  const [connectionState, setConnectionState] = useState('Disconnected'); // Trạng thái kết nối SignalR

  // Hàm cập nhật tổng số tin nhắn chưa đọc dựa trên danh sách chat hiện tại
  const updateTotalUnreadCount = useCallback((currentChats) => {
    const total = currentChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    setUnreadCount(total);
  }, []);

  // Hàm khởi tạo và quản lý kết nối SignalR
  const startSignalRConnection = useCallback(async () => {
    console.log("startSignalRConnection called.");
    if (!user || !user.token) {
      console.log("User or token not available, cannot start SignalR connection.");
      return; // Không kết nối nếu không có user hoặc token
    }

    // Nếu đã có kết nối và đang ở trạng thái Connected thì không làm gì
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      console.log("SignalR connection already connected.");
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL;
    // Xây dựng kết nối SignalR Hub
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/chatHub`, {
        // Cung cấp token xác thực cho SignalR
        accessTokenFactory: () => user?.token
      })
      .withAutomaticReconnect() // Tự động kết nối lại khi mất kết nối
      .build();

    // Lắng nghe sự kiện khi trạng thái online của người dùng khác thay đổi
    newConnection.on("UserStatusChanged", (userId, isOnline) => {
      console.log(`User ${userId} is now ${isOnline ? "Đang hoạt động" : "Ngoại tuyến"}`);
      // Cập nhật trạng thái online của người tham gia trong danh sách chats
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.participantId === userId ? { ...chat, isOnline } : chat
        )
      );
    });

    // Lắng nghe sự kiện khi SignalR đang cố gắng kết nối lại
    newConnection.onreconnecting(() => {
      console.log("SignalR reconnecting...");
      setConnectionState('Reconnecting');
    });

    // Lắng nghe sự kiện khi SignalR đã kết nối lại thành công
    newConnection.onreconnected(() => {
      console.log("SignalR reconnected!");
      setConnectionState('Connected');
    });

    // Lắng nghe sự kiện khi kết nối SignalR bị đóng
    newConnection.onclose(() => {
      console.log("SignalR connection closed.");
      setConnectionState('Disconnected');
    });

    // Lắng nghe sự kiện nhận tin nhắn từ Hub
    newConnection.on("ReceiveMessage", (senderId, messageContent) => {
      console.log(`Received message from ${senderId}: ${messageContent}`);
      setChats(prevChats => {
        let chatUpdated = false;
        const updatedChats = prevChats.map(chat => {
          if (chat.participantId === senderId) {
            chatUpdated = true;
            const newMessage = {
              id: `msg_${Date.now()}`,
              senderId: senderId,
              senderName: chat.participantName,
              content: messageContent,
              timestamp: new Date(),
              type: 'text',
              isOwn: false // Đây là tin nhắn nhận được
            };
            return {
              ...chat,
              messages: [...(chat.messages || []), newMessage],
              lastMessage: messageContent,
              lastMessageTime: new Date(),
              // Tăng unreadCount nếu tin nhắn không đến từ chat đang mở
              unreadCount: chat.unreadCount + (activeChat?.participantId === senderId ? 0 : 1)
            };
          }
          return chat;
        });

        // Nếu tin nhắn đến từ một người chưa có trong danh sách chat (trường hợp hiếm)
        // Hiện tại không có logic để tạo chat mới tự động, giả định danh sách chat được lấy từ API ban đầu.
        // if (!chatUpdated) { ... }

        updateTotalUnreadCount(updatedChats); // Cập nhật tổng số tin nhắn chưa đọc
        return updatedChats;
      });

      // Nếu tin nhắn đến từ người đang chat, cập nhật activeChat ngay lập tức để hiển thị
      setActiveChat(prevActiveChat => {
        if (prevActiveChat && prevActiveChat.participantId === senderId) {
          const newMessage = {
            id: `msg_${Date.now()}_active`,
            senderId: senderId,
            senderName: prevActiveChat.participantName,
            content: messageContent,
            timestamp: new Date(),
            type: 'text',
            isOwn: false
          };
          return {
            ...prevActiveChat,
            messages: [...(prevActiveChat.messages || []), newMessage]
          };
        }
        return prevActiveChat;
      });
    });

    try {
      await newConnection.start(); // Bắt đầu kết nối SignalR
      connectionRef.current = newConnection;
      setConnectionState('Connected');
      console.log("SignalR Connected!");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      // Thử kết nối lại sau 5 giây nếu có lỗi
      setTimeout(startSignalRConnection, 5000);
    }
  }, [user, activeChat, updateTotalUnreadCount]);

  // Hàm để lấy danh sách người dùng (Lễ tân hoặc Bệnh nhân) để chat
  const fetchParticipants = useCallback(async () => {
    if (!user) return; // Không fetch nếu không có thông tin user

    let apiUrl = '';
    let roleToFetch = '';

    // Xác định API endpoint và vai trò cần fetch dựa trên vai trò của người dùng hiện tại
    if (user.role === 'Patient') {
      apiUrl = '/accounts/receptionists';
      roleToFetch = 'Receptionist';
    } else if (user.role === 'Receptionist') {
      apiUrl = '/accounts/patients';
      roleToFetch = 'Patient';
    } else {
      console.log("Current user role is not patient or receptionist, not fetching chat participants.");
      setChats([]); // Xóa danh sách chat nếu user không phải Patient/Receptionist
      return;
    }

    try {
      const response = await api.get(apiUrl);
      if (response.data?.status && response.data?.data) {
        // Ánh xạ dữ liệu nhận được thành định dạng participant
        const participantData = response.data.data.map(p => ({
          id: p.accountId,
          fullName: p.fullName,
          role: roleToFetch,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=random&color=fff`,
        }));

        // Khởi tạo hoặc cập nhật các cuộc trò chuyện
        setChats(prevChats => {
          const newChats = participantData.map(p => {
            const existingChat = prevChats.find(chat => chat.participantId === p.id);
            if (existingChat) {
              return existingChat; // Giữ lại chat cũ nếu đã tồn tại
            }
            return {
              id: `chat_${p.id}`,
              participantId: p.id,
              participantName: p.fullName,
              participantRole: p.role,
              participantAvatar: p.avatar,
              lastMessage: 'Bắt đầu cuộc trò chuyện mới',
              lastMessageTime: new Date(),
              unreadCount: 0,
              isOnline: p.isOnline || false, // Mặc định là offline nếu không có thông tin
              messages: [] // Bắt đầu với mảng tin nhắn rỗng
            };
          });
          updateTotalUnreadCount(newChats); // Cập nhật tổng số tin nhắn chưa đọc
          return newChats;
        });
      }
    } catch (error) {
      console.error(`Error fetching ${roleToFetch}s:`, error);
    }
  }, [user, updateTotalUnreadCount]);

  // useEffect để quản lý vòng đời kết nối SignalR và tải danh sách participant
  useEffect(() => {
    console.log("ChatProvider useEffect được kích hoạt.");
    if (user?.token && !connectionRef.current) {
      fetchParticipants(); // Lấy danh sách participant khi có token
      startSignalRConnection(); // Bắt đầu kết nối SignalR
    }

    // Hàm dọn dẹp khi component unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop(); // Dừng kết nối SignalR
        connectionRef.current = null;
        console.log("SignalR Disconnected.");
      }
    };
  }, [user, fetchParticipants, startSignalRConnection]);

  // Hàm gửi tin nhắn qua SignalR Hub
  const sendMessage = useCallback(async (receiverAccountId, messageContent) => {
    // Kiểm tra trạng thái kết nối SignalR
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      console.error("SignalR is not connected.");
      return;
    }

    if (!messageContent.trim()) return; // Không gửi tin nhắn rỗng

    const newMessage = {
      id: `msg_${Date.now()}_own`,
      senderId: user.id, // ID của người gửi (người dùng hiện tại)
      senderName: user.fullName || user.username,
      content: messageContent.trim(),
      timestamp: new Date(),
      type: 'text',
      isOwn: true // Đây là tin nhắn do mình gửi
    };

    try {
      // Gọi phương thức SendMessageToUser trên ChatHub
      await connectionRef.current.invoke("SendMessageToUser", receiverAccountId, messageContent.trim());
      console.log(`Message sent to ${receiverAccountId}: ${messageContent}`);

      // Cập nhật UI ngay lập tức cho người gửi
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat =>
          chat.participantId === receiverAccountId
            ? {
                ...chat,
                messages: [...(chat.messages || []), newMessage], // Thêm tin nhắn mới vào cuộc trò chuyện
                lastMessage: messageContent.trim(),
                lastMessageTime: new Date()
              }
            : chat
        );
        updateTotalUnreadCount(updatedChats); // Cập nhật tổng số tin nhắn chưa đọc
        return updatedChats;
      });

      // Cập nhật active chat nếu là cuộc trò chuyện hiện tại
      setActiveChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      }));

    } catch (err) {
      console.error("Error sending message:", err);
    }
  }, [user, updateTotalUnreadCount]);

  // Hàm đánh dấu một cuộc trò chuyện là đã đọc (reset unreadCount về 0)
  const markChatAsRead = useCallback((chatId) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      );
      updateTotalUnreadCount(updatedChats); // Cập nhật tổng số tin nhắn chưa đọc
      return updatedChats;
    });
  }, [updateTotalUnreadCount]);

  // Hàm lấy thông tin chat bằng ID
  const getChatById = useCallback((chatId) => {
    return chats.find(chat => chat.id === chatId);
  }, [chats]);

  // Hàm tạo một cuộc trò chuyện mới (thường dùng khi user tương tác với người chưa từng chat)
  const createNewChat = useCallback((participantData) => {
    const newChat = {
      id: `chat_${participantData.id}`,
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

    setChats(prev => {
        const existingChat = prev.find(chat => chat.participantId === participantData.id);
        if (existingChat) {
            return prev; // Không tạo nếu đã tồn tại
        }
        const updatedChats = [newChat, ...prev]; // Thêm chat mới vào đầu danh sách
        updateTotalUnreadCount(updatedChats);
        return updatedChats;
    });
    return newChat;
  }, [updateTotalUnreadCount]);


  // Giá trị được cung cấp bởi ChatContext
  const value = {
    chats,
    activeChat,
    unreadCount,
    setActiveChat,
    sendMessage,
    markChatAsRead,
    getChatById,
    createNewChat,
    connectionState // Trạng thái kết nối SignalR
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};