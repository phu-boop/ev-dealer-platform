// hooks/useFirebaseNotifications.js
import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/firebase/notificationService';
import messagingService from '../services/firebase/messagingService';

export const useFirebaseNotifications = (userRole) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Chỉ admin mới nhận được thông báo
  const isAdmin = userRole === 'admin';

  // Lấy danh sách thông báo
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = notificationService.getAdminNotifications((notifs) => {
      setNotifications(notifs);
      const unread = notifs.filter(n => n.status === 'unread').length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Yêu cầu quyền thông báo
  const requestNotificationPermission = useCallback(async () => {
    setLoading(true);
    try {
      await messagingService.requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Đánh dấu đã đọc
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'unread');
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.id)));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [notifications]);

  // Lắng nghe tin nhắn real-time
  useEffect(() => {
    if (!isAdmin) return;

    messagingService.onMessageListener().then((payload) => {
      console.log('Received message:', payload);
      messagingService.displayNotification(payload);
      
      // Cập nhật số lượng thông báo chưa đọc
      setUnreadCount(prev => prev + 1);
    });
  }, [isAdmin]);

  return {
    notifications,
    unreadCount,
    loading,
    requestNotificationPermission,
    markAsRead,
    markAllAsRead,
    isAdmin
  };
};

export default useFirebaseNotifications;