// importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// // 🚀 Khởi tạo Firebase App trong Service Worker
// firebase.initializeApp({
//   apiKey: "AIzaSyDM7qyWVqh3kYbbECM9TPaFRTYXf_2Vb4k",
//   authDomain: "eletricvehicl.firebaseapp.com",
//   projectId: "eletricvehicl",
//   storageBucket: "eletricvehicl.appspot.com",
//   messagingSenderId: "903235101201",
//   appId: "1:903235101201:web:e7a6ef46f73d8a086b47b0",
//   measurementId: "G-H10W8LJ2ZF",
// });

// // 💬 Lấy instance của Firebase Messaging
// const messaging = firebase.messaging();

// // ----------------------------------------------------------
// // 📩 Lắng nghe khi có thông báo đến (app ở background)
// // ----------------------------------------------------------
// messaging.onBackgroundMessage((payload) => {
//   console.group("📨 [Service Worker] Nhận thông báo background");
//   console.log("🔧 Payload chi tiết:", payload);
//   console.groupEnd();

//   const notification = payload.notification || {};
//   const title = notification.title || "🔔 Thông báo mới";
//   const body = notification.body || "Bạn có thông báo mới từ ứng dụng.";
//   const icon = notification.icon || "/logo.png";

//   const options = {
//     body,
//     icon,
//     badge: "/badge.png", // (optional) hiển thị nhỏ trên icon tab
//     data: {
//       url: notification.click_action || "/", // Link đích khi người dùng click
//     },
//   };

//   // 🖥️ Hiển thị notification popup
//   self.registration.showNotification(title, options);
// });

// // ----------------------------------------------------------
// // 🖱️ Xử lý sự kiện khi người dùng click vào thông báo
// // ----------------------------------------------------------
// self.addEventListener("notificationclick", (event) => {
//   console.log("🖱️ [Service Worker] Notification click:", event);
//   event.notification.close();

//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
//       // 🔄 Nếu tab của web đã mở → focus vào đó
//       for (const client of clientList) {
//         if ("focus" in client) return client.focus();
//       }

//       // 🆕 Nếu chưa mở → mở tab mới
//       if (clients.openWindow) {
//         return clients.openWindow(event.notification.data?.url || "/");
//       }
//     })
//   );
// });




// ===========================================================
// 🔥 Firebase Cloud Messaging Service Worker (FCM)
// ===========================================================

// 🔹 Import Firebase compat libraries
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// -----------------------------------------------------------
// 🚀 Initialize Firebase App (Service Worker context)
// -----------------------------------------------------------
firebase.initializeApp({
  apiKey: "AIzaSyDM7qyWVqh3kYbbECM9TPaFRTYXf_2Vb4k",
  authDomain: "eletricvehicle.firebaseapp.com",
  projectId: "eletricvehicle",
  storageBucket: "eletricvehicle.appspot.com",
  messagingSenderId: "903235101201",
  appId: "1:903235101201:web:e7a6ef46f73d8a086b47b0",
  measurementId: "G-H10W8LJ2ZF",
});

// -----------------------------------------------------------
// 💬 Get Firebase Messaging instance
// -----------------------------------------------------------
const messaging = firebase.messaging();

// -----------------------------------------------------------
// 📩 Handle background message
// -----------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.group("📨 [Service Worker] Background Notification Received");
  console.log("Payload:", payload);
  console.groupEnd();

  const { title, body, icon } = payload.notification || {};

  const notificationTitle = title || "🔔 New Notification";
  const notificationOptions = {
    body: body || "You have a new message.",
    icon: icon || "/logo.png",
    badge: "/badge.png",
    // 🚫 Ép cứng luôn mở trang login, bỏ qua mọi click_action từ payload
    data: {
      url: "http://localhost:5173/login",
    },
  };

  // 🖥️ Hiển thị notification popup
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// -----------------------------------------------------------
// 🖱️ Handle notification click event
// -----------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ [Service Worker] Notification clicked:", event);
  event.notification.close();

  // 🎯 Trang đích cố định khi click thông báo
  const targetUrl = "http://localhost:5173/login";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 🔄 Nếu tab ứng dụng đã mở, điều hướng nó sang /login
      for (const client of clientList) {
        if (client.url.includes("localhost:5173") && "focus" in client) {
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
