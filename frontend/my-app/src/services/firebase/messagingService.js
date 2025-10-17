// services/firebase/messagingService.js
import { messaging } from './firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';

class MessagingService {
  // Yêu cầu quyền và lấy FCM token
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return await this.getToken();
      } else {
        console.log('Unable to get permission to notify.');
        return null;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return null;
    }
  }

  // Lấy FCM token
  async getToken() {
    try {
      const currentToken = await getToken(messaging, { 
        vapidKey: process.env.REACT_APP_VAPID_KEY 
      });
      
      if (currentToken) {
        console.log('FCM token:', currentToken);
        // Lưu token vào database hoặc gửi lên server
        await this.saveTokenToDatabase(currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Lưu token vào database (cần implement theo backend của bạn)
  async saveTokenToDatabase(token) {
    // Gửi token lên server của bạn
    // Ví dụ: await api.saveFCMToken({ token });
    console.log('Save token to database:', token);
  }

  // Lắng nghe tin nhắn đến khi app đang chạy
  onMessageListener() {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        resolve(payload);
      });
    });
  }

  // Hiển thị thông báo
  displayNotification(payload) {
    const { title, body, icon } = payload.notification;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/logo.png',
        badge: '/badge.png'
      });
    }
  }
}

export default new MessagingService();