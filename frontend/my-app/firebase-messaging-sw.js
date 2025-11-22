// ===========================================================
// 🔥 Firebase Cloud Messaging Service Worker (FCM)
// ===========================================================

// 🔹 Import Firebase compat libraries
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// -----------------------------------------------------------
// ⚙️ 1. Lấy Config từ URL Query Parameters
// -----------------------------------------------------------
// Service Worker không đọc được .env trực tiếp, ta lấy từ URL lúc register
const params = new URLSearchParams(self.location.search);

const firebaseConfig = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
  measurementId: params.get("measurementId"),
};

// -----------------------------------------------------------
// 🚀 2. Initialize Firebase App
// -----------------------------------------------------------
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
} else {
  console.error("❌ [Service Worker] Thiếu cấu hình Firebase.");
}

// // -----------------------------------------------------------
// // 🚀 Initialize Firebase App (Service Worker context)
// // -----------------------------------------------------------
// firebase.initializeApp({
//   apiKey: "AIzaSyDM7qyWVqh3kYbbECM9TPaFRTYXf_2Vb4k",
//   authDomain: "eletricvehicle.firebaseapp.com",
//   projectId: "eletricvehicle",
//   storageBucket: "eletricvehicle.appspot.com",
//   messagingSenderId: "903235101201",
//   appId: "1:903235101201:web:e7a6ef46f73d8a086b47b0",
//   measurementId: "G-H10W8LJ2ZF",
// });

// -----------------------------------------------------------
// 💬 Get Firebase Messaging instance
// -----------------------------------------------------------
const messaging = firebase.messaging();

// -----------------------------------------------------------
// 📩 Handle background message
// -----------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.group("📨 [Service Worker] Background Notification Received");
  console.groupEnd();

  const { title, body, icon } = payload.notification || {};

  const loginUrl = new URL("/login", self.location.origin).href;

  const notificationTitle = title || "🔔 New Notification";
  const notificationOptions = {
    body: body || "You have a new message.",
    icon: icon || "/logo.png",
    badge: "/badge.png",
    // 🚫 Ép cứng luôn mở trang login, bỏ qua mọi click_action từ payload
    data: {
      url: loginUrl,
    },
  };

  // 🖥️ Hiển thị notification popup
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// -----------------------------------------------------------
// 🖱️ Handle notification click event
// -----------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // 🎯 Trang đích cố định khi click thông báo
  const targetUrl = new URL("/login", self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 🔄 Nếu tab ứng dụng đã mở, điều hướng nó sang /login
        for (const client of clientList) {
          const clientUrl = new URL(client.url, self.location.origin);
          if (clientUrl.origin === self.location.origin && "focus" in client) {
            return client.navigate(targetUrl).then((c) => c.focus());
          }
        }

        // 🆕 Nếu chưa mở tab nào → mở tab mới đến trang login
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
