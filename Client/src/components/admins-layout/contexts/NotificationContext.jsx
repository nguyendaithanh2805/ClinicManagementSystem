import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications = [
      {
        id: 'n001',
        title: 'Lịch khám sắp tới',
        message: 'Bạn có lịch khám với BS. Trần Thị Bình vào 14:30 ngày mai',
        type: 'appointment',
        priority: 'high',
        timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000),
        read: false
      },
      {
        id: 'n002',
        title: 'Kết quả xét nghiệm',
        message: 'Kết quả xét nghiệm máu của bạn đã có. Vui lòng xem chi tiết.',
        type: 'test_result',
        priority: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false
      },
      {
        id: 'n003',
        title: 'Nhắc nhở uống thuốc',
        message: 'Đã đến giờ uống thuốc huyết áp. Liều: 1 viên sau bữa sáng.',
        type: 'medication',
        priority: 'high',
        timestamp: new Date(),
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};