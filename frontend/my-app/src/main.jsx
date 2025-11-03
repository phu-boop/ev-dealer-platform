// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'
import AppRoutes from './routes/index.jsx'
import initFirebaseMessaging from "./services/firebase/firebaseMessagingListener.jsx";

// 🔥 Khởi động FCM với error handling
try {
  initFirebaseMessaging();
  console.log('✅ Firebase Messaging initialized');
} catch (error) {
  console.error('❌ Firebase Messaging initialization failed:', error);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastContainer 
        position="top-right" 
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        limit={5}
      />
      <AppRoutes/>
    </BrowserRouter>
  </StrictMode>
)