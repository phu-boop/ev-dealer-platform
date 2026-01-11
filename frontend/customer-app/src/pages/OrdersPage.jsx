import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getCustomerOrders } from "../services/orderService";
import { toast } from "react-toastify";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const customerId = user?.memberId;
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Fetch customer orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      try {
        const response = await getCustomerOrders(customerId);
        return response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Không thể tải danh sách đơn hàng");
        return [];
      }
    },
    enabled: !!customerId,
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800' },
      PROCESSING: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
      SHIPPING: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800' },
      DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
      REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
      FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-800' },
      REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (!customerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const orders = ordersData || [];
  const filteredOrders = filterStatus === "ALL"
    ? orders
    : orders.filter(order => order.orderStatusB2C === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : getStatusInfo(status).label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào</p>
            <button
              onClick={() => navigate('/vehicles')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá xe điện
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.orderStatusB2C);
              const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
              
              return (
                <div key={order.orderId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-600">
                        Mã đơn hàng: <span className="font-mono font-semibold text-gray-900">{order.orderId}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Ngày đặt: {formatDate(order.orderDate)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentInfo.color}`}>
                        {paymentInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    {order.orderItems && order.orderItems.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                Variant ID: {item.variantId}
                              </div>
                              <div className="text-sm text-gray-600">
                                Số lượng: {item.quantity} × {formatPrice(item.unitPrice)}
                              </div>
                            </div>
                            <div className="font-semibold text-blue-600">
                              {formatPrice(item.finalPrice || (item.quantity * item.unitPrice))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600 mb-4">Không có thông tin sản phẩm</div>
                    )}

                    {/* Order Total & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-600">Tổng tiền:</div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/orders/${order.orderId}`)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Xem chi tiết
                        </button>
                        {order.orderStatusB2C === 'PENDING' && (
                          <button
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
