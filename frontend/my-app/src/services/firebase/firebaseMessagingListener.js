// src/firebaseMessagingListener.js
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

export default function initFirebaseMessaging() {
  if (!("Notification" in window)) {
    console.warn("🚫 Trình duyệt không hỗ trợ Notification API.");
    return;
  }

  // ✅ Đăng ký lắng nghe thông báo FCM realtime
  onMessage(messaging, (payload) => {
    console.log("📩 Nhận thông báo realtime:", payload);

    const { title, body, icon } = payload.notification || {};

    if (Notification.permission === "granted") {
      new Notification(title || "Thông báo mới", {
        body: body || "Bạn có thông báo mớiiii app.",
        icon: icon || "/logo.png",
        badge: "/badge.png",
        silent: false,
      });
    } else {
      console.warn("🔒 Quyền thông báo chưa được cấp, bỏ qua hiển thị popup.");
    }
  });
}
