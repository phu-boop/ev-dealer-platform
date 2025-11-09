import React from 'react';
import {convertToSalesOrder} from '../services/quotationService.js';
import Swal from 'sweetalert2';
const QuotationModal = ({ quotation, isOpen, onClose }) => {
  if (!isOpen || !quotation) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const handleConvertOder = async (quotationId) => {
    // Hiển thị confirm trước khi convert
    const result = await Swal.fire({
      title: 'Xác nhận chuyển đơn hàng',
      text: 'Bạn có chắc muốn chuyển quotation này thành Sales Order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        // Gọi API convert
        const response = await convertToSalesOrder(quotationId);

        // Hiển thị thông báo thành công
        Swal.fire({
          title: 'Thành công!',
          text: 'Quotation đã được chuyển thành Sales Order.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        // Nếu muốn điều hướng sang trang Sales Order mới
        window.location.href = `/dealer/staff/orders/${response.data.orderId}`;

      } catch (error) {
        // Hiển thị lỗi nếu API fail
        Swal.fire({
          title: 'Lỗi!',
          text: 'Không thể chuyển đơn hàng. Vui lòng thử lại.',
          icon: 'error',
        });
        console.error(error);
      }
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      COMPLETE : 'Hoàn thành',
      PENDING: 'Chờ duyệt',
      ACCEPTED: 'Đã chấp nhận',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      EXPIRED: 'Hết hạn',
      DRAFT: 'Bản nháp'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Chi tiết báo giá #{quotation.quotationId?.slice(-8)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-[#c150d8] mb-4">Thông tin báo giá</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                  <dd className="text-sm text-gray-900">{formatDate(quotation.quotationDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hiệu lực đến</dt>
                  <dd className="text-sm text-gray-900">{formatDate(quotation.validUntil)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-red-500">Trạng thái</dt>
                  <dd className="text-sm font-medium text-gray-900">{getStatusText(quotation.status)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mã báo giá</dt>
                  <dd className="text-sm text-gray-900">{quotation.quotationId}</dd>
                </div>
              </dl>
            </div>

            {/* Customer Information */}
            {quotation.customerInfo && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mã khách hàng</dt>
                    <dd className="text-sm text-gray-900">{quotation.customerInfo.customerCode}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                    <dd className="text-sm text-gray-900">{quotation.customerInfo.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                    <dd className="text-sm text-gray-900">{quotation.customerInfo.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{quotation.customerInfo.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CMND/CCCD</dt>
                    <dd className="text-sm text-gray-900">{quotation.customerInfo.idNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Loại khách hàng</dt>
                    <dd className="text-sm text-gray-900">{quotation.customerInfo.customerType}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          {(quotation.modelInfo || quotation.variantInfo) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin xe</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quotation.modelInfo && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Hãng xe</h4>
                        <p className="text-sm text-gray-900">{quotation.modelInfo.brand}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Model</h4>
                        <p className="text-sm text-gray-900">{quotation.modelInfo.modelName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Trạng thái model</h4>
                        <p className="text-sm text-gray-900">{quotation.modelInfo.status}</p>
                      </div>
                    </>
                  )}
                  {quotation.variantInfo && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Phiên bản</h4>
                        <p className="text-sm text-gray-900">{quotation.variantInfo.versionName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Màu sắc</h4>
                        <p className="text-sm text-gray-900">{quotation.variantInfo.color}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Tầm hoạt động</h4>
                        <p className="text-sm text-gray-900">{quotation.variantInfo.rangeKm} km</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Công suất động cơ</h4>
                        <p className="text-sm text-gray-900">{quotation.variantInfo.motorPower} kW</p>
                      </div>
                      {quotation.variantInfo.imageUrl && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh</h4>
                          <img
                            src={quotation.variantInfo.imageUrl}
                            alt={quotation.variantInfo.versionName}
                            className="w-48 h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giá</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Giá gốc</h4>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(quotation.basePrice)}</p>
                </div>
                {quotation.discountAmount > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Giảm giá</h4>
                    <p className="text-lg font-semibold text-red-600">-{formatCurrency(quotation.discountAmount)}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Giá cuối cùng</h4>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(quotation.finalPrice)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applied Promotions */}
          {quotation.appliedPromotions && quotation.appliedPromotions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Khuyến mãi áp dụng</h3>
              <div className="space-y-2">
                {quotation.appliedPromotions.map((promo, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="font-medium text-purple-900">{promo.promotionName}</h4>
                    <p className="text-sm text-purple-700">{promo.description}</p>
                    <p className="text-sm text-purple-600">Giảm: {(promo.discountRate * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {quotation.termsConditions && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Điều khoản và điều kiện</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quotation.termsConditions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-between">
            {quotation.status==="ACCEPTED"?
            <button
              onClick={()=>{handleConvertOder(quotation.quotationId)}}
              className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Chuyển thành đơn hàng
            </button>
            : <> </>
          }
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;