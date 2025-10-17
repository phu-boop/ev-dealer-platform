// services/firebase/notificationService.js
import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

class NotificationService {
  // Gửi thông báo khi có khuyến mãi mới
  async sendPromotionNotification(promotion, createdBy) {
    try {
      const notification = {
        type: 'NEW_PROMOTION',
        title: 'Khuyến mãi mới cần xác nhận',
        message: `"${promotion.promotionName}" đang chờ phê duyệt`,
        promotionId: promotion.promotionId,
        createdBy: createdBy,
        status: 'unread',
        createdAt: serverTimestamp(),
        data: {
          discountRate: promotion.discountRate,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          createdBy: createdBy
        }
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      console.log('Notification sent with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'read',
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Lấy danh sách thông báo cho admin
  getAdminNotifications(callback) {
    const q = query(
      collection(db, 'notifications'),
      where('type', '==', 'NEW_PROMOTION'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(notifications);
    });
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount() {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('status', '==', 'unread'),
        where('type', '==', 'NEW_PROMOTION')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export default new NotificationService();