import React, { useState, useEffect, useCallback } from "react";
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiList,
  FiXCircle,
} from "react-icons/fi"; // Thêm FiXCircle
import Swal from "sweetalert2";
import {
  getMyB2BOrders,
  confirmDelivery,
  cancelOrderByDealer, // Import hàm hủy
} from "../services/dealerSalesService"; // Service của Dealer

// (Copy StatusBadge component hoặc import nếu đã tách riêng)
const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = status;

  switch (status) {
    case "PENDING":
      colorClasses = "bg-yellow-100 text-yellow-800";
      text = "Chờ duyệt";
      break;
    case "CONFIRMED":
      colorClasses = "bg-blue-100 text-blue-800";
      text = "Đã duyệt";
      break;
    case "IN_TRANSIT":
      colorClasses = "bg-cyan-100 text-cyan-800";
      text = "Đang giao";
      break;
    case "DELIVERED":
      colorClasses = "bg-green-100 text-green-800";
      text = "Đã nhận";
      break;
    case "CANCELLED":
      colorClasses = "bg-red-100 text-red-800";
      text = "Đã hủy";
      break;
    default:
      break;
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const DealerOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("PENDING"); // Mặc định hiển thị tab "Chờ duyệt"
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });

  // --- Hàm tải danh sách đơn hàng ---
  const fetchOrders = useCallback(
    async (status, page = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = { status: status, page: page, size: pagination.size };
        const response = await getMyB2BOrders(params); // API của Dealer
        setOrders(response.data.data.content || []);
        setPagination((prev) => ({
          ...prev,
          page: response.data.data.number,
          totalPages: response.data.data.totalPages,
        }));
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.size]
  );

  // Tải lại dữ liệu khi đổi tab hoặc page thay đổi (từ pagination controls)
  useEffect(() => {
    fetchOrders(activeTab, pagination.page);
  }, [activeTab, fetchOrders, pagination.page]); // Thêm pagination.page dependency

  // Hàm đổi trang (cho component Pagination)
  const handlePageChange = (newPage) => {
    if (
      newPage >= 0 &&
      newPage < pagination.totalPages &&
      newPage !== pagination.page
    ) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      // useEffect sẽ tự động gọi fetchOrders khi page thay đổi
    }
  };

  // Hàm đổi tab (reset về trang 0)
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPagination((prev) => ({ ...prev, page: 0 })); // Reset page khi đổi tab
  };

  // --- HÀM XỬ LÝ XÁC NHẬN NHẬN HÀNG ---
  const handleConfirmDelivery = async (orderId) => {
    const result = await Swal.fire({
      /* ... SweetAlert config ... */
    });
    if (result.isConfirmed) {
      try {
        await confirmDelivery(orderId);
        Swal.fire("Thành công!", "Đã xác nhận nhận hàng.", "success");
        fetchOrders(activeTab, pagination.page); // Tải lại trang hiện tại
      } catch (err) {
        Swal.fire(
          "Lỗi!",
          err.response?.data?.message || "Xác nhận thất bại.",
          "error"
        );
      }
    }
  };

  // --- HÀM XỬ LÝ HỦY ĐƠN (Dealer) ---
  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Hủy đơn hàng?",
      text: "Bạn chắc chắn muốn hủy đơn đặt hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đúng, hủy đơn!",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await cancelOrderByDealer(orderId); // Gọi API hủy của dealer
        Swal.fire("Đã hủy!", "Đơn hàng của bạn đã được hủy.", "success");
        fetchOrders(activeTab, pagination.page); // Tải lại
      } catch (err) {
        Swal.fire(
          "Lỗi!",
          err.response?.data?.message || "Hủy đơn thất bại.",
          "error"
        );
      }
    }
  };

  const tabs = [
    { status: "PENDING", label: "Chờ Hãng duyệt" },
    { status: "CONFIRMED", label: "Đã duyệt" },
    { status: "IN_TRANSIT", label: "Đang giao" },
    { status: "DELIVERED", label: "Đã nhận" },
    { status: "CANCELLED", label: "Đã hủy" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Đơn Hàng Của Tôi
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => handleTabChange(tab.status)} // Dùng handleTabChange
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

                  {/* Nút Hủy cho PENDING */}
                  {order.orderStatus === "PENDING" && (
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition duration-150"
                      title="Hủy đơn hàng này"
                    >
                      <FiXCircle className="mr-1" /> Hủy Đơn
                    </button>
                  )}

                  {/* Nút Xác Nhận cho IN_TRANSIT */}
                  {order.orderStatus === "IN_TRANSIT" && (
                    <button
                      onClick={() => handleConfirmDelivery(order.orderId)}
                      className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition duration-150 shadow"
                    >
                      <FiCheckCircle className="mr-1" /> Xác Nhận Đã Nhận
                    </button>
                  )}
                  {/* Không có nút Xóa ở đây */}
                  {/* Có thể thêm nút Xem chi tiết */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Component Phân Trang --- */}
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
    </div>
  );
};

export default DealerOrdersPage;
