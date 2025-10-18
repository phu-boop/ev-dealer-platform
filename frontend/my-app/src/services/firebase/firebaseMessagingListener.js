// src/firebaseMessagingListener.js
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

export default function initFirebaseMessaging() {
  // Khi app đang mở và có thông báo từ FCM
  onMessage(messaging, (payload) => {
    console.log("📩 Notification realtime:", payload);

    if (Notification.permission === "granted") {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || "/logo.png",
      });
    } else {
      console.warn("🔒 Notification permission not granted.");
    }
  });
}
