import React, { useState, useEffect, useCallback } from "react";
import { FiCheck, FiTruck, FiList, FiTrash2, FiXCircle } from "react-icons/fi";
import {
  getB2BOrders,
  approveB2BOrder,
  shipB2BOrder,
  cancelOrderByStaff,
  deleteOrder,
} from "../services/evmSalesService"; // Service của EVM/Admin
import { getAllDealersList } from "../../../dealer/promotions/services/dealerSalesService"; // Service để lấy tên dealer
import ShipmentModal from "../components/ShipmentModal"; // Modal nhập VIN khi giao hàng

// (Bạn có thể tách StatusBadge thành component riêng nếu muốn)
const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = status; // Mặc định hiển thị text gốc

  switch (status) {
    case "PENDING":
      colorClasses = "bg-yellow-100 text-yellow-800";
      text = "Chờ duyệt";
      break;
    case "CONFIRMED":
      colorClasses = "bg-blue-100 text-blue-800";
      text = "Chờ xuất kho";
      break;
    case "IN_TRANSIT":
      colorClasses = "bg-cyan-100 text-cyan-800";
      text = "Đang giao";
      break;
    case "DELIVERED":
      colorClasses = "bg-green-100 text-green-800";
      text = "Đã giao";
      break;
    case "CANCELLED":
      colorClasses = "bg-red-100 text-red-800";
      text = "Đã hủy";
      break;
    default:
      break; // Giữ màu xám mặc định
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const AllocationPage = () => {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  }); // Thêm state phân trang

  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState(null);

  const [dealerMap, setDealerMap] = useState(new Map());
  const [isLoadingDealers, setIsLoadingDealers] = useState(false);

  // --- Hàm tải danh sách đại lý ---
  const fetchDealers = useCallback(async () => {
    setIsLoadingDealers(true);
    try {
      const response = await getAllDealersList();
      const dealers = response.data.data || [];
      const map = new Map();
      dealers.forEach((dealer) => {
        map.set(
          dealer.dealerId,
          dealer.dealerName || `Đại lý ${dealer.dealerId.substring(0, 6)}`
        ); // Thêm tên fallback
      });
      setDealerMap(map);
    } catch (error) {
      console.error("Failed to fetch dealers", error);
      setError("Không thể tải danh sách đại lý.");
    } finally {
      setIsLoadingDealers(false);
    }
  }, []);

  // --- Hàm tải danh sách đơn hàng ---
  const fetchOrders = useCallback(
    async (status, page = 0) => {
      setIsLoading(true);
      setError(null); // Reset lỗi mỗi khi fetch
      try {
        const params = { status: status, page: page, size: pagination.size };
        const res = await getB2BOrders(params);
        setOrders(res.data.data.content || []);
        setPagination((prev) => ({
          ...prev,
          page: res.data.data.number,
          totalPages: res.data.data.totalPages,
        }));
      } catch (error) {
        console.error("Failed to fetch orders", error);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.size]
  ); // Chỉ phụ thuộc size để không fetch lại khi page thay đổi từ pagination controls

  // --- useEffect ---
  useEffect(() => {
    fetchDealers(); // Tải dealers 1 lần
  }, [fetchDealers]);

  useEffect(() => {
    fetchOrders(activeTab, 0); // Fetch orders khi tab thay đổi, reset về trang 0
  }, [activeTab, fetchOrders]); // fetchOrders giờ ổn định hơn

  // --- Các hàm xử lý hành động ---
  const handleApprove = async (orderId) => {
    if (!window.confirm("Duyệt đơn hàng này và giữ hàng trong kho?")) return;
    try {
      await approveB2BOrder(orderId);
      alert("Đã duyệt đơn hàng thành công!");
      fetchOrders(activeTab, pagination.page); // Tải lại trang hiện tại
    } catch (error) {
      alert(`Lỗi duyệt đơn: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await cancelOrderByStaff(orderId);
      alert("Hủy đơn hàng thành công!");
      fetchOrders(activeTab, pagination.page);
    } catch (error) {
      alert(`Lỗi hủy đơn: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("XÓA VĨNH VIỄN đơn hàng đã hủy này?")) return;
    try {
      await deleteOrder(orderId);
      alert("Xóa đơn hàng thành công!");
      fetchOrders(activeTab, pagination.page);
    } catch (error) {
      alert(`Lỗi xóa đơn: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleOpenShipModal = (order) => {
    setOrderToShip(order);
    setIsShipModalOpen(true);
  };

  const handleCloseShipModal = (didShip) => {
    setIsShipModalOpen(false);
    setOrderToShip(null);
    if (didShip) {
      fetchOrders(activeTab, pagination.page);
    }
  };

  const getDealerName = (dealerId) => {
    if (isLoadingDealers) return "...";
    return dealerMap.get(dealerId) || `ID: ${dealerId.substring(0, 8)}...`;
  };

  // Hàm đổi trang (cho component Pagination nếu có)
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchOrders(activeTab, newPage);
    }
  };

  const tabs = [
    { status: "PENDING", label: "Chờ Xác Nhận" },
    { status: "CONFIRMED", label: "Chờ Xuất Kho" },
    { status: "IN_TRANSIT", label: "Đang Vận Chuyển" },
    { status: "DELIVERED", label: "Đã Giao Hàng" },
    { status: "CANCELLED", label: "Đã Hủy" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-in fade-in-0 duration-500">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Điều Phối Đơn Hàng B2B
      </h1>

      {/* Thanh Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`py-3 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === tab.status
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isLoading ? (
          <p className="text-gray-500">Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">Không có đơn hàng nào trong mục này.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start gap-4"
              >
                {/* Thông tin đơn */}
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Mã ĐH: {order.orderId}
                  </p>
                  <p className="font-semibold">
                    Đại lý: {getDealerName(order.dealerId)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Ngày đặt:{" "}
                    {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="font-bold text-lg text-blue-700 mt-1">
                    Tổng:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalAmount)}
                  </p>
                  {order.orderItems && order.orderItems.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2 pl-4">
                      {order.orderItems.map((item) => (
                        <li key={item.orderItemId}>
                          {item.quantity} x (Variant: {item.variantId}) - Đơn
                          giá:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.unitPrice)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {order.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      Ghi chú: {order.notes}
                    </p>
                  )}
                </div>

                {/* Trạng thái và Hành động */}
                <div className="flex-shrink-0 flex flex-col items-end space-y-2 w-full md:w-auto">
                  <StatusBadge status={order.orderStatus} />

                  {order.orderStatus === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApprove(order.orderId)}
                        className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition duration-150"
                      >
                        <FiCheck className="mr-1" /> Duyệt
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition duration-150"
                      >
                        <FiXCircle className="mr-1" /> Hủy
                      </button>
                    </>
                  )}
                  {order.orderStatus === "CONFIRMED" && (
                    <button
                      onClick={() => handleOpenShipModal(order)}
                      className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition duration-150"
                    >
                      <FiTruck className="mr-1" /> Giao hàng
                    </button>
                  )}
                  {order.orderStatus === "CANCELLED" && (
                    <button
                      onClick={() => handleDeleteOrder(order.orderId)}
                      className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition duration-150"
                      title="Xóa đơn hàng vĩnh viễn"
                    >
                      <FiTrash2 className="mr-1" /> Xóa
                    </button>
                  )}
                  {/* Có thể thêm nút xem chi tiết ở đây nếu cần */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Component Phân Trang --- */}
        {/* Bạn có thể tạo component Pagination riêng và truyền props vào */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span>
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Modal nhập VIN */}
      {isShipModalOpen && (
        <ShipmentModal
          isOpen={isShipModalOpen}
          onClose={handleCloseShipModal}
          order={orderToShip} // Truyền cả object order vào modal
        />
      )}
    </div>
  );
};

export default AllocationPage;
