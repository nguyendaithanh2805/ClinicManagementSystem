import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSignalRConnection } from './SignalRConnectionContext';
import api from "../../admins-layout/contexts/Api";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { connection, on, off } = useSignalRConnection();
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Hàm bật/tắt dropdown
  const toggleDropdown = () => {
      setIsDropdownOpen(prev => !prev);
  };

  const addNotification = (serverNotification) => {
    const newNotification = {
      id: serverNotification.id,
      title: serverNotification.title,
      message: serverNotification.message,
      type: serverNotification.type,
      createdAt: serverNotification.createdAt,
      isRead: serverNotification.isRead,
    };
    setNotifications(prev => [newNotification, ...prev]);
    toast.info("Bạn có thông báo mới")
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.status) {
        setNotifications(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải lịch hẹn cá nhân.');
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    }
  };
  useEffect(() => {
    // A. Hàm lấy thông báo cũ
    fetchNotifications();

    // B. Lắng nghe sự kiện SignalR
    if (connection) {
        // Đăng ký listener khi connection đã có
        on("ReceiveNotification", addNotification);
    }

    // C. Dọn dẹp
    return () => {
        // Chỉ xóa listener, KHÔNG DỪNG KẾT NỐI
        if (connection) {
            off("ReceiveNotification"); 
        }
    };
    }, [connection, on, off]);

  // Các hàm này giờ chỉ cập nhật local state
  const markAsRead = async (notificationId) => {
    // 1. Tìm bản ghi hiện tại VÀ chuẩn bị dữ liệu gửi đi
    const notificationToUpdate = notifications.find(n => n.id === notificationId);
    if (!notificationToUpdate || notificationToUpdate.isRead) return;

    const dtoForApi = {
        Id: notificationToUpdate.id,
        AccountId: notificationToUpdate.accountId,
        Title: notificationToUpdate.title,
        Message: notificationToUpdate.message,
        Type: notificationToUpdate.type,
        CreatedAt: notificationToUpdate.createdAt,
        IsRead: notificationToUpdate.isRead,
    };

    try {
        const response = await api.put(`/notifications/${notificationId}`, dtoForApi);
        if (response.data.status) {
           setNotifications(prev => 
              prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
          );
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật thông báo:", error);
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
        );
    }
};

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    isDropdownOpen,
    toggleDropdown,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};