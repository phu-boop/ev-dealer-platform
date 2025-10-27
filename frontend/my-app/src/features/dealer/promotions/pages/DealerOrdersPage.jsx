import React, { useState, useEffect, useCallback } from "react";
import { FiTruck, FiCheckCircle, FiBox, FiAlertCircle } from "react-icons/fi";
import {
  getMyB2BOrders,
  confirmDelivery,
} from "../services/dealerSalesService";

import { getVariantDetailsByIds } from "../../../evm/catalog/services/vehicleCatalogService";

const DealerOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("IN_TRANSIT"); // Mặc định xem đơn đang giao
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // (Chúng ta cần gộp dữ liệu để hiển thị tên sản phẩm, nhưng tạm thời sẽ hiển thị ID)

  const fetchOrders = useCallback(async (status) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyB2BOrders({ status: status, size: 50 }); // Lấy 50 đơn hàng
      const ordersData = res.data.data?.content || [];

      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab, fetchOrders]);

  // Hàm xử lý khi Đại lý nhấn "Xác Nhận Nhận Hàng"
  const handleConfirmDelivery = async (orderId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn đã nhận đủ hàng và muốn xác nhận đơn hàng này?"
      )
    ) {
      return;
    }

    try {
      await confirmDelivery(orderId);
      alert("Xác nhận nhận hàng thành công!");
      fetchOrders(activeTab); // Tải lại danh sách
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xác nhận"));
    }
  };

  const renderOrderList = () => {
    if (isLoading) {
      return (
        <p className="text-center text-gray-500 py-10">Đang tải đơn hàng...</p>
      );
    }
    if (error) {
      return <p className="text-center text-red-500 py-10">{error}</p>;
    }
    if (orders.length === 0) {
      return (
        <p className="text-center text-gray-500 py-10">
          Không có đơn hàng nào trong trạng thái này.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white p-4 rounded-lg shadow-md border"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  Đơn hàng #{order.orderId}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  Ngày đặt: {new Date(order.orderDate).toLocaleString("vi-VN")}
                </p>
                {order.status === "DELIVERED" && (
                  <p className="text-sm text-green-600 font-medium">
                    Đã nhận ngày:{" "}
                    {new Date(order.deliveryDate).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
              <div
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  order.status === "IN_TRANSIT"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {order.status === "IN_TRANSIT"
                  ? "Đang Vận Chuyển"
                  : "Đã Nhận Hàng"}
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold mb-2">Chi tiết sản phẩm:</h4>
              <ul className="list-disc list-inside space-y-1">
                {order.orderItems.map((item) => (
                  <li key={item.variantId}>
                    {item.quantity} x (SKU:{" "}
                    {item.skuCode || `ID ${item.variantId}`}) -{" "}
                    {item.versionName || "..."}
                  </li>
                ))}
              </ul>
            </div>

            {/* NÚT HÀNH ĐỘNG */}
            {order.orderStatus === "IN_TRANSIT" && (
              <div className="text-right mt-4">
                <button
                  onClick={() => handleConfirmDelivery(order.orderId)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <FiCheckCircle className="mr-2" /> Xác Nhận Đã Nhận Hàng
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in-0 duration-500 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Đơn Hàng Của Tôi
      </h1>

      {/* Thanh điều hướng Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("IN_TRANSIT")}
            className={`flex items-center space-x-2 pb-3 font-medium ${
              activeTab === "IN_TRANSIT"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiTruck />
            <span>Đang Vận Chuyển</span>
          </button>
          <button
            onClick={() => setActiveTab("DELIVERED")}
            className={`flex items-center space-x-2 pb-3 font-medium ${
              activeTab === "DELIVERED"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiBox />
            <span>Lịch Sử Nhận Hàng</span>
          </button>
        </nav>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div>{renderOrderList()}</div>
    </div>
  );
};

export default DealerOrdersPage;
