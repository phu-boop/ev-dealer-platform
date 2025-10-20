// firebase-messaging-sw.js

// 🔹 Import Firebase App & Messaging (compat version để tương thích FCM web)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// 🔹 Khởi tạo Firebase trong Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDM7qyWVqh3kYbbECM9TPaFRTYXf_2Vb4k",
  authDomain: "eletricvehicl.firebaseapp.com",
  projectId: "eletricvehicl",
  storageBucket: "eletricvehicl.appspot.com",
  messagingSenderId: "903235101201",
  appId: "1:903235101201:web:e7a6ef46f73d8a086b47b0",
  measurementId: "G-H10W8LJ2ZF"
});

const messaging = firebase.messaging();

// 🔹 Lắng nghe khi có tin nhắn đến lúc app ở background
messaging.onBackgroundMessage((payload) => {
  console.log("📩 [firebase-messaging-sw.js] Background message:", payload);

  const notification = payload.notification || {};
  const notificationTitle = notification.title || "Thông báo mới khoong appp";
  const notificationOptions = {
    body: notification.body || "Bạn có thông báo mới.",
    icon: notification.icon || "/logo.png",
    badge: "/badge.png", // (tùy chọn) icon nhỏ hiển thị trên tab
    data: {
      url: notification.click_action || "/", // link đích khi click
    },
  };

  // 🔹 Hiển thị notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔹 Xử lý khi người dùng click vào notification
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification click event:", event);
  event.notification.close();

  // 🔹 Mở tab tương ứng hoặc chuyển sang tab đang mở
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || "/");
      }
    })
  );
});
