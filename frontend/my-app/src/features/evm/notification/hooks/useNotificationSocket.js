// src/hooks/useNotificationSocket.js
import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "../services/notificationApi";
import Swal from "sweetalert2";

const SOCKET_URL = "http://localhost:8080/ws"; // Thay bằng URL Spring Boot của bạn

export const useNotificationSocket = (isEnabled = true) => {
  const queryClient = useQueryClient(); // Để refresh lại data khi có tin mới

  useEffect(() => {
    if (!isEnabled) {
      return; // Dừng lại
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: (str) => {
        console.log("STOMP: " + str);
      },
      onConnect: () => {
        console.log("Đã kết nối WebSocket");
        // Lắng nghe topic mà Kafka Listener đẩy tới
        client.subscribe("/topic/staff-notifications", (message) => {
          // Khi có tin nhắn mới, làm 2 việc:
          // 1. Refresh lại danh sách thông báo (có phân trang)
          queryClient.invalidateQueries(["staffNotifications"]);

          // 2. Refresh lại số lượng chưa đọc
          queryClient.invalidateQueries(["unreadNotificationCount"]);
        });
      },
      onStompError: (frame) => {
        Swal.fire(
          "Lỗi Kết Nối Real-time",
          "Không thể kết nối với máy chủ thông báo. Vui lòng tải lại trang.",
          "error"
        );
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [queryClient, isEnabled]);
};

// Hook để "Đánh dấu TẤT CẢ đã đọc"
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation(() => markAllNotificationsAsRead(), {
    onSuccess: () => {
      // Refresh lại cả 2:
      queryClient.invalidateQueries(["staffNotifications"]);
      queryClient.invalidateQueries(["unreadNotificationCount"]);
    },
    onError: (err) => {},
  });
};
