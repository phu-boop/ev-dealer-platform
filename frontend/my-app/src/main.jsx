// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import AppRoutes from "./routes/index.jsx";
import initFirebaseMessaging from "./services/firebase/firebaseMessagingListener.jsx";
// 🔥 Khởi động FCM với error handling
try {
  initFirebaseMessaging();
  console.log("✅ Firebase Messaging initialized");
} catch (error) {
  console.error("❌ Firebase Messaging initialization failed:", error);
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
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
        toastClassName="!p-0 !m-0 !h-10 !p-4 !bg-white !shadow-none !min-h-0"
        bodyClassName="!p-0 !m-0"
        className="!top-40 !right-4 !z-[9999] !max-w-sm"
        limit={3}
      />
      <AppRoutes />
    </QueryClientProvider>
  </BrowserRouter>
  // </StrictMode>
);
