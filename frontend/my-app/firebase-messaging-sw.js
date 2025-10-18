// firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Khởi tạo Firebase trong service worker
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

// Nhận thông báo khi app bị đóng hoặc background
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
