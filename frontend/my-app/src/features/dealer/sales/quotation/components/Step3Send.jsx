// sales/quotation/components/Step3Send.js
import React from 'react';

const Step3Send = ({ quotationDetail, sendData, onChange, onSubmit, onBack }) => {
  console.log('Quotation detail for sending:', quotationDetail);
  console.log('Send data:', sendData);

  const isFormValid = () => {
    return sendData.validUntil;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi báo giá cho khách hàng</h2>

      {/* Quotation Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin báo giá</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã báo giá:</span>
              <span className="font-medium text-gray-800">{quotationDetail?.quotationId || 'Chưa có'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày tạo:</span>
              <span className="font-medium text-gray-800">{formatDate(quotationDetail?.quotationDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="font-medium text-gray-800 capitalize">
                {quotationDetail?.status?.toLowerCase() || 'PENDING'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Khuyến mãi áp dụng:</span>
              <span className="font-medium text-gray-800">
                {quotationDetail?.appliedPromotions?.length > 0 
                  ? `${quotationDetail.appliedPromotions.length} khuyến mãi`
                  : 'Không có'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chiết khấu bổ sung:</span>
              <span className="font-medium text-gray-800">
                {sendData?.additionalDiscountRate > 0 
                  ? `${sendData.additionalDiscountRate}%` 
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 mb-8 border border-teal-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tổng quan giá</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Giá cơ sở:</span>
            <span className="font-medium text-gray-800">
              {new Intl.NumberFormat('vi-VN').format(quotationDetail?.basePrice || 0)} VND
            </span>
          </div>
          
          {/* Discount Details */}
          {quotationDetail?.discountAmount > 0 && (
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-rose-700">Chiết khấu:</span>
                <span className="font-medium text-rose-700">
                  -{new Intl.NumberFormat('vi-VN').format(quotationDetail?.discountAmount || 0)} VND
                </span>
              </div>
              {sendData?.additionalDiscountRate > 0 && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-rose-600">Trong đó chiết khấu bổ sung:</span>
                  <span className="text-rose-600">
                    {sendData.additionalDiscountRate}% (-
                    {new Intl.NumberFormat('vi-VN').format(
                      (quotationDetail?.basePrice * sendData.additionalDiscountRate) / 100
                    )} VND)
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-teal-200">
            <span className="text-gray-800">Giá cuối cùng:</span>
            <span className="text-teal-600">
              {new Intl.NumberFormat('vi-VN').format(quotationDetail?.finalPrice || 0)} VND
            </span>
          </div>
        </div>
      </div>

      {/* Send Form */}
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Valid Until */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày hết hạn *
            </label>
            <input
              type="datetime-local"
              name="validUntil"
              value={sendData.validUntil}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
            />
            <p className="text-sm text-gray-500 mt-1">
              Thời hạn hiệu lực của báo giá này
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điều khoản và điều kiện gửi cho khách hàng
            </label>
            <textarea
              name="termsConditions"
              value={sendData.termsConditions}
              onChange={onChange}
              rows="6"
              placeholder="Nhập điều khoản và điều kiện sẽ gửi cho khách hàng..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-vertical bg-white"
            />
            <p className="text-sm text-gray-500 mt-1">
              {sendData.termsConditions?.length || 0} ký tự
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors bg-white"
          >
            Quay lại
          </button>
          <button
            type="submit"
            disabled={!isFormValid()}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            Gửi báo giá
          </button>
        </div>
      </form>

    </div>
  );
};

export default Step3Send;