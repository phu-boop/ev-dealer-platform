import React, { useState, useEffect, useCallback } from "react";
import { FiCheck, FiTruck, FiList } from "react-icons/fi";
// Chúng ta sẽ cần tạo file service này
import {
  getB2BOrders,
  approveB2BOrder,
  shipB2BOrder,
} from "../services/evmSalesService";
import ShipmentModal from "../components/ShipmentModal"; // Component mới để nhập VIN

const AllocationPage = () => {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State cho modal nhập VIN
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState(null);

  const fetchOrders = useCallback(async (status) => {
    setIsLoading(true);
    try {
      // Giả sử bạn có API getB2BOrders(status)
      const res = await getB2BOrders({ status });
      setOrders(res.data.data.content || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab, fetchOrders]);

  // Hàm duyệt đơn
  const handleApprove = async (orderId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn duyệt đơn hàng này? Kho sẽ giữ hàng ngay lập tức."
      )
    )
      return;
    try {
      await approveB2BOrder(orderId);
      alert("Đã duyệt đơn hàng thành công!");
      fetchOrders(activeTab); // Tải lại
    } catch (error) {
      alert("Lỗi: " + error.response?.data?.message);
    }
  };

  // Hàm mở modal để giao hàng
  const handleOpenShipModal = (order) => {
    setOrderToShip(order);
    setIsShipModalOpen(true);
  };

  // Hàm đóng modal
  const handleCloseShipModal = (didShip) => {
    setIsShipModalOpen(false);
    setOrderToShip(null);
    if (didShip) {
      fetchOrders(activeTab); // Tải lại nếu giao hàng thành công
    }
  };

  return (
    <div className="animate-in fade-in-0 duration-500">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Điều Phối Xe</h1>

      {/* Thanh điều hướng Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`... ${
              activeTab === "PENDING" ? "border-b-2 ..." : "..."
            }`}
          >
            Chờ Xác Nhận
          </button>
          <button
            onClick={() => setActiveTab("CONFIRMED")}
            className={`... ${
              activeTab === "CONFIRMED" ? "border-b-2 ..." : "..."
            }`}
          >
            Chờ Xuất Kho
          </button>
          <button
            onClick={() => setActiveTab("IN_TRANSIT")}
            className={`... ${
              activeTab === "IN_TRANSIT" ? "border-b-2 ..." : "..."
            }`}
          >
            Đang Vận Chuyển
          </button>
          <button
            onClick={() => setActiveTab("DELIVERED")}
            className={`... ${
              activeTab === "DELIVERED" ? "border-b-2 ..." : "..."
            }`}
          >
            Đã Giao Hàng
          </button>
        </nav>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="bg-white p-6 rounded-lg shadow">
        {isLoading ? (
          <p>Đang tải đơn hàng...</p>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="border-b p-4 mb-4">
              <p>Đơn hàng: {order.orderId}</p>
              <p>Đại lý: {order.dealerId}</p>
              <p>Trạng thái: {order.orderStatus}</p>
              {/* Nút hành động tùy theo trạng thái */}
              {order.orderStatus === "PENDING" && (
                <button
                  onClick={() => handleApprove(order.orderId)}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  <FiCheck className="mr-2" /> Duyệt Đơn
                </button>
              )}
              {order.orderStatus === "CONFIRMED" && (
                <button
                  onClick={() => handleOpenShipModal(order)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  <FiTruck className="mr-2" /> Giao Hàng (Nhập VIN)
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal nhập VIN */}
      {isShipModalOpen && (
        <ShipmentModal
          isOpen={isShipModalOpen}
          onClose={handleCloseShipModal}
          order={orderToShip}
        />
      )}
    </div>
  );
};

export default AllocationPage;
