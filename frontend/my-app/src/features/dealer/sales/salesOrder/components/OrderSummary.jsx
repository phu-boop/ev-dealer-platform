import React from 'react';
import OrderStatus from './OrderStatus';

/**
 * Component hiển thị tổng quan thông tin đơn hàng
 * @param {Object} order - Đơn hàng từ API response
 */
const OrderSummary = ({ order }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa xác định';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.orderId.slice(-8)}</h1>
          <p className="text-gray-500 mt-1">Tạo ngày {formatDate(order.orderDate)}</p>
        </div>
        <OrderStatus status={order.orderStatusB2C} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Thông tin đơn hàng</h3>
          <InfoItem label="Mã đơn hàng" value={order.orderId} />
          <InfoItem label="Loại đơn hàng" value={order.typeOder} />
          <InfoItem label="Ngày đặt hàng" value={formatDate(order.orderDate)} />
          <InfoItem label="Ngày giao dự kiến" value={formatDate(order.deliveryDate)} />
        </div>

        {/* Thông tin khách hàng & nhân viên */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Thông tin liên hệ</h3>
          <InfoItem label="Mã khách hàng" value={order.customerId} />
          <InfoItem label="Mã nhân viên" value={order.staffId} />
          <InfoItem label="Mã đại lý" value={order.dealerId} />
        </div>

        {/* Thông tin tài chính */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Thông tin tài chính</h3>
          <InfoItem label="Tổng tiền" value={formatCurrency(order.totalAmount)} />
          <InfoItem label="Đặt cọc" value={formatCurrency(order.downPayment)} />
          <InfoItem label="Còn lại" value={formatCurrency((order.totalAmount || 0) - (order.downPayment || 0))} />
        </div>
      </div>

      {/* Thông tin báo giá (nếu có) */}
      {order.quotation && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Thông tin báo giá</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <InfoItem label="Mã báo giá" value={order.quotation.quotationId} />
            <InfoItem label="Giá trị báo giá" value={formatCurrency(order.quotation.finalPrice)} />
            <InfoItem label="Trạng thái báo giá" value={order.quotation.status} />
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component cho từng thông tin
const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600 text-sm">{label}:</span>
    <span className="text-gray-900 font-medium text-sm">{value || 'N/A'}</span>
  </div>
);

export default OrderSummary;