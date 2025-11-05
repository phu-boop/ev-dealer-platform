// sales/quotation/components/Step4Complete.js
import React from 'react';

const Step4Complete = ({ quotationDetail }) => {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-3">Báo giá đã được gửi thành công!</h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Báo giá đã được gửi cho khách hàng và đang chờ phản hồi.
        </p>
      </div>

      {/* Quotation Details Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-800">Chi tiết báo giá</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Mã báo giá:</span>
              <span className="font-semibold text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                {quotationDetail?.quotationId}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Trạng thái:</span>
              <span className={`font-medium px-4 py-2 rounded-full text-sm ${
                quotationDetail?.status?.toLowerCase() === 'sent' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border border-sky-200'
              }`}>
                {quotationDetail?.status}
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Ngày hết hạn:</span>
              <span className="font-semibold text-gray-800">
                {quotationDetail?.validUntil ? new Date(quotationDetail.validUntil).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Giá cuối cùng:</span>
              <span className="font-bold text-emerald-600 text-xl">
                {new Intl.NumberFormat('vi-VN').format(quotationDetail?.finalPrice || 0)} VND
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {quotationDetail?.customerName && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Khách hàng:</span>
                <span className="font-medium text-gray-800">{quotationDetail.customerName}</span>
              </div>
              {quotationDetail?.modelName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dòng xe:</span>
                  <span className="font-medium text-gray-800">{quotationDetail.modelName}</span>
                </div>
              )}
              {quotationDetail?.variantName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phiên bản:</span>
                  <span className="font-medium text-gray-800">{quotationDetail.variantName}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.print()}
          className="px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow"
        >
          <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          In báo giá
        </button>
        
        <button
          onClick={() => window.location.href = '/quotations'}
          className="px-8 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-medium rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Xem danh sách báo giá
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo báo giá mới
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          Báo giá có hiệu lực trong vòng 30 ngày. Bạn có thể theo dõi trạng thái trong mục Danh sách báo giá.
        </p>
      </div>
    </div>
  );
};

export default Step4Complete;