import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSignalRConnection } from './SignalRConnectionContext'; 
import api from "../../admins-layout/contexts/Api";

// Tạo Context cho Chat
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
    const { user } = useAuth();
    const { 
        connection, // Đối tượng HubConnection đã được khởi tạo
        connectionState, // Trạng thái kết nối (Connected, Disconnected, Reconnecting)
        on, // Hàm để đăng ký listener
        off, // Hàm để hủy đăng ký listener
        invoke // Hàm để gọi phương thức trên Hub
    } = useSignalRConnection(); 

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Hàm cập nhật tổng số tin nhắn chưa đọc dựa trên danh sách chat hiện tại
    const updateTotalUnreadCount = useCallback((currentChats) => {
        const total = currentChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
        setUnreadCount(total);
    }, []);

    // Hàm xử lý khi nhận tin nhắn
    const handleReceiveMessage = useCallback((senderId, messageContent) => {
        console.log(`Received message from ${senderId}: ${messageContent}`);
        
        // 1. Cập nhật danh sách Chats (setChats)
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.participantId === senderId) {
                    const newMessage = {
                        id: `msg_${Date.now()}`,
                        senderId: senderId,
                        senderName: chat.participantName,
                        content: messageContent,
                        timestamp: new Date(),
                        type: 'text',
                        isOwn: false
                    };
                    return {
                        ...chat,
                        messages: [...(chat.messages || []), newMessage],
                        lastMessage: messageContent,
                        lastMessageTime: new Date(),
                        // Tăng unreadCount chỉ khi tin nhắn KHÔNG đến từ chat đang mở
                        unreadCount: chat.unreadCount + (activeChat?.participantId === senderId ? 0 : 1) 
                    };
                }
                return chat;
            });
            updateTotalUnreadCount(updatedChats);
            return updatedChats;
        });

        // 2. Cập nhật Active Chat (setActiveChat) để tin nhắn hiển thị ngay lập tức
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
    }, [activeChat, updateTotalUnreadCount]);

    // Hàm xử lý khi trạng thái online thay đổi
    const handleUserStatusChanged = useCallback((userId, isOnline) => {
        console.log(`User ${userId} is now ${isOnline ? "Đang hoạt động" : "Ngoại tuyến"}`);
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.participantId === userId ? { ...chat, isOnline } : chat
            )
        );
    }, []);


    // useEffect để đăng ký và hủy đăng ký các listener SignalR
    useEffect(() => {
        if (connection) {
            // Đăng ký listener khi connection đã sẵn sàng
            on("ReceiveMessage", handleReceiveMessage);
            on("UserStatusChanged", handleUserStatusChanged);

            // Hàm dọn dẹp: Hủy đăng ký listener khi component unmount hoặc connection thay đổi
            return () => {
                off("ReceiveMessage");
                off("UserStatusChanged");
            };
        }
    }, [connection, on, off, handleReceiveMessage, handleUserStatusChanged]);

    const fetchParticipants = useCallback(async () => {
        if (!user) return; 

        let apiUrl = '';
        let roleToFetch = '';

        if (user.role === 'Patient') {
            apiUrl = '/accounts/receptionists';
            roleToFetch = 'Receptionist';
        } else if (user.role === 'Receptionist') {
            apiUrl = '/accounts/patients';
            roleToFetch = 'Patient';
        } else {
            console.log("Current user role is not patient or receptionist, not fetching chat participants.");
            setChats([]);
            return;
        }

        try {
            const response = await api.get(apiUrl);
            if (response.data?.status && response.data?.data) {
                const participantData = response.data.data.map(p => ({
                    id: p.accountId,
                    fullName: p.fullName,
                    role: roleToFetch,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=random&color=fff`,
                }));

                setChats(prevChats => {
                    const newChats = participantData.map(p => {
                        const existingChat = prevChats.find(chat => chat.participantId === p.id);
                        if (existingChat) {
                            return existingChat;
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
                            isOnline: p.isOnline || false,
                            messages: []
                        };
                    });
                    updateTotalUnreadCount(newChats);
                    return newChats;
                });
            }
        } catch (error) {
            console.error(`Error fetching ${roleToFetch}s:`, error);
        }
    }, [user, updateTotalUnreadCount]);

    // useEffect để tải danh sách participant khi người dùng thay đổi hoặc component được mount
    useEffect(() => {
        if (user?.token) {
            fetchParticipants();
        }
    }, [user, fetchParticipants]);


    // Hàm gửi tin nhắn qua SignalR Hub
    const sendMessage = useCallback(async (receiverAccountId, messageContent) => {
        // Kiểm tra trạng thái kết nối
        if (connectionState !== 'Connected' || !invoke) {
            console.error("SignalR is not connected or invoke function is unavailable.");
            return;
        }

        if (!messageContent.trim()) return;

        const messageToSend = messageContent.trim();

        const newMessage = {
            id: `msg_${Date.now()}_own`,
            senderId: user.id,
            senderName: user.fullName || user.username,
            content: messageToSend,
            timestamp: new Date(),
            type: 'text',
            isOwn: true
        };

        try {
            await invoke("SendMessageToUser", receiverAccountId, messageToSend); 
            console.log(`Message sent to ${receiverAccountId}: ${messageToSend}`);

            // Cập nhật UI ngay lập tức cho người gửi
            setChats(prevChats => {
                const updatedChats = prevChats.map(chat =>
                    chat.participantId === receiverAccountId
                        ? {
                            ...chat,
                            messages: [...(chat.messages || []), newMessage],
                            lastMessage: messageToSend,
                            lastMessageTime: new Date()
                        }
                        : chat
                );
                updateTotalUnreadCount(updatedChats);
                return updatedChats;
            });

            // Cập nhật active chat nếu là cuộc trò chuyện hiện tại
            setActiveChat(prev => ({
                ...prev,
                messages: [...(prev.messages || []), newMessage]
            }));

        } catch (err) {
            console.error("Error invoking SendMessageToUser:", err);
        }
    }, [user, updateTotalUnreadCount, connectionState, invoke]);

    const markChatAsRead = useCallback((chatId) => {
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat =>
                chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
            );
            updateTotalUnreadCount(updatedChats);
            return updatedChats;
        });
    }, [updateTotalUnreadCount]);

    const getChatById = useCallback((chatId) => {
        return chats.find(chat => chat.id === chatId);
    }, [chats]);

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
                return prev;
            }
            const updatedChats = [newChat, ...prev];
            updateTotalUnreadCount(updatedChats);
            return updatedChats;
        });
        return newChat;
    }, [updateTotalUnreadCount]);
    
    const value = {
        chats,
        activeChat,
        unreadCount,
        setActiveChat,
        sendMessage,
        markChatAsRead,
        getChatById,
        createNewChat,
        connectionState
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};