import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getCustomerOrders, getOrderById, cancelOrder } from "../services/orderService";
import { toast } from "react-toastify";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { memberId } = useAuth();
  const customerId = memberId;
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Fetch customer orders (only if logged in)
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      try {
        const response = await getCustomerOrders(customerId);
        return response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Don't show error if user is not logged in
        if (customerId) {
          toast.error("Không thể tải danh sách đơn hàng");
        }
        return [];
      }
    },
    enabled: !!customerId,
  });

  // Search order by ID
  const handleSearchOrder = async () => {
    if (!orderIdSearch.trim()) {
      toast.warning("Vui lòng nhập mã đơn hàng");
      return;
    }

    setIsSearching(true);
    try {
      const response = await getOrderById(orderIdSearch.trim());
      if (response.data) {
        setSearchedOrder(response.data);
        toast.success("Tìm thấy đơn hàng!");
      }
    } catch (error) {
      console.error("Error searching order:", error);
      toast.error("Không tìm thấy đơn hàng với mã này");
      setSearchedOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }) => cancelOrder(orderId, reason),
    onSuccess: () => {
      toast.success("Đơn hàng đã được hủy thành công");
      queryClient.invalidateQueries(['orders', customerId]);
    },
    onError: (error) => {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    },
  });

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      const reason = prompt("Lý do hủy đơn (tùy chọn):");
      cancelOrderMutation.mutate({ orderId, reason: reason || "Khách hàng yêu cầu hủy" });
    }
  };

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
      PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      EDITED: { label: 'Đã chỉnh sửa', color: 'bg-purple-100 text-purple-800', icon: '✏️' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: '✅' },
      APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800', icon: '👍' },
      IN_PRODUCTION: { label: 'Đang sản xuất', color: 'bg-indigo-100 text-indigo-800', icon: '🏭' },
      READY_FOR_DELIVERY: { label: 'Sẵn sàng giao', color: 'bg-teal-100 text-teal-800', icon: '📦' },
      DELIVERED: { label: 'Đã giao hàng', color: 'bg-green-100 text-green-800', icon: '🚚' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800', icon: '🎉' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' },
      REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-800', icon: '🚫' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
  };

  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      NONE: { label: 'Chưa thanh toán', color: 'bg-gray-100 text-gray-600', icon: '⚪' },
      PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      PARTIALLY_PAID: { label: 'Đã cọc', color: 'bg-blue-100 text-blue-800', icon: '💰' },
      PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800', icon: '✅' },
      FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-800', icon: '❌' },
      REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-purple-100 text-purple-800', icon: '↩️' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
  };

  if (isLoading && customerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const orders = ordersData || [];
  
  // Combine customer orders and searched order
  const displayOrders = searchedOrder 
    ? [searchedOrder, ...orders.filter(o => o.orderId !== searchedOrder.orderId)]
    : orders;
  
  const finalFilteredOrders = filterStatus === "ALL"
    ? displayOrders
    : displayOrders.filter(order => order.orderStatusB2C === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">
            {customerId ? 'Đơn hàng của tôi' : 'Tra cứu đơn hàng'}
          </h1>
          <p className="mt-2 text-blue-100">
            {customerId ? 'Quản lý và theo dõi đơn hàng của bạn' : 'Nhập mã đơn hàng để tra cứu'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Order Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 Tra cứu đơn hàng bằng mã
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={orderIdSearch}
              onChange={(e) => setOrderIdSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchOrder()}
              placeholder="Nhập mã đơn hàng (VD: 123e4567-e89b-12d3-a456-426614174000)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearchOrder}
              disabled={isSearching}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tìm...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tra cứu
                </>
              )}
            </button>
          </div>
          {!customerId && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">💡 Mẹo tra cứu</p>
                <p className="text-sm text-blue-700 mt-1">
                  Bạn có thể tra cứu đơn hàng mà không cần đăng nhập bằng cách nhập mã đơn hàng. 
                  Mã đơn hàng đã được gửi qua email sau khi đặt hàng thành công.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Đăng nhập để xem tất cả đơn hàng →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards - Only show if logged in */}
        {customerId && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600">Tổng đơn hàng</div>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600">Chờ xử lý</div>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.orderStatusB2C === 'PENDING' || o.orderStatusB2C === 'EDITED').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600">Đang xử lý</div>
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => ['CONFIRMED', 'APPROVED', 'IN_PRODUCTION'].includes(o.orderStatusB2C)).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600">Hoàn thành</div>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.orderStatusB2C === 'COMPLETED' || o.orderStatusB2C === 'DELIVERED').length}
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs - Only show if has orders */}
        {((customerId && orders.length > 0) || searchedOrder) && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'EDITED', 'CONFIRMED', 'APPROVED', 'IN_PRODUCTION', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status !== 'ALL' && <span>{getStatusInfo(status).icon}</span>}
                  {status === 'ALL' ? 'Tất cả' : getStatusInfo(status).label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Orders List */}
        {finalFilteredOrders.length === 0 ? (
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {customerId ? 'Chưa có đơn hàng' : 'Chưa tìm thấy đơn hàng'}
            </h2>
            <p className="text-gray-600 mb-6">
              {customerId 
                ? 'Bạn chưa có đơn hàng nào. Hãy khám phá và đặt xe điện ngay!' 
                : 'Vui lòng nhập mã đơn hàng ở trên để tra cứu'}
            </p>
            {customerId && (
              <button
                onClick={() => navigate('/vehicles')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Khám phá xe điện
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {finalFilteredOrders.map((order) => {
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
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                        <span>{statusInfo.icon}</span>
                        {statusInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${paymentInfo.color}`}>
                        <span>{paymentInfo.icon}</span>
                        {paymentInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    {order.orderItems && order.orderItems.length > 0 ? (
                      <div className="space-y-4 mb-4">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                              {item.imageUrl && item.imageUrl !== '/placeholder-car.png' ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.variantName || item.modelName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-car.png';
                                  }}
                                />
                              ) : (
                                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zm11 6a1 1 0 10-2 0v2a1 1 0 002 0v-2zm-1-5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H8a1 1 0 110-2h4V6a1 1 0 011-1z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-lg mb-1">
                                {item.modelName || `Xe điện - Variant ${item.variantId}`}
                              </div>
                              {item.variantName && (
                                <div className="text-sm text-gray-700 mb-1">
                                  Phiên bản: {item.variantName}
                                </div>
                              )}
                              {item.color && (
                                <div className="text-sm text-gray-600 mb-1">
                                  Màu sắc: {item.color}
                                </div>
                              )}
                              <div className="text-sm text-gray-600">
                                Số lượng: <span className="font-medium">{item.quantity}</span> × {formatPrice(item.unitPrice)}
                              </div>
                              {item.discount && item.discount > 0 && (
                                <div className="text-sm text-green-600 font-medium">
                                  Giảm giá: {item.discount}%
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-blue-600 text-lg">
                                {formatPrice(item.finalPrice || (item.quantity * item.unitPrice))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600 mb-4 text-center py-4">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        Không có thông tin sản phẩm
                      </div>
                    )}

                    {/* Order Summary & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        {order.downPayment && order.downPayment > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Đã cọc:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              {formatPrice(order.downPayment)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-gray-600">Tổng giá trị đơn hàng:</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </div>
                        {order.downPayment && order.downPayment > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Còn lại:</span>
                            <span className="ml-2 font-semibold text-orange-600">
                              {formatPrice(order.totalAmount - order.downPayment)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => navigate(`/orders/${order.orderId}`)}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Xem chi tiết
                        </button>
                        {(order.orderStatusB2C === 'PENDING' || order.orderStatusB2C === 'EDITED') && (
                          <button
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={cancelOrderMutation.isLoading}
                            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:shadow-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {cancelOrderMutation.isLoading ? 'Đang hủy...' : 'Hủy đơn'}
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
