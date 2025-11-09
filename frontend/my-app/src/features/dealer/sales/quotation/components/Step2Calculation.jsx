// sales/quotation/components/Step2Calculation.js
import React, { useMemo } from 'react';

const Step2Calculation = ({ quotationDetail, calculationData, promotions, onChange, onSubmit, onBack }) => {
  const calculationResult = useMemo(() => {
    const basePrice = quotationDetail?.basePrice || 0;
    
    const promotionDiscount = promotions
      .filter(promo => calculationData.promotionIds.includes(promo.promotionId))
      .reduce((total, promo) => total + (basePrice * promo.discountRate), 0);

    const additionalDiscount = basePrice * (calculationData.additionalDiscountRate / 100);
    
    const totalDiscount = promotionDiscount + additionalDiscount;
    const finalPrice = basePrice - totalDiscount;

    return {
      promotionDiscount,
      additionalDiscount,
      totalDiscount,
      finalPrice,
      basePrice
    };
  }, [calculationData, promotions, quotationDetail]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tính Toán Giá Báo Giá</h2>
        <p className="text-gray-500">Chọn khuyến mãi và nhập chiết khấu bổ sung</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Thông Tin Báo Giá
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-500">Mã</div>
                <div className="font-mono font-semibold text-gray-900">{quotationDetail?.quotationId}</div>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-500">Giá Cơ Sở</div>
                <div className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('vi-VN').format(quotationDetail?.basePrice || 0)} ₫
                </div>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-500">Trạng Thái</div>
                <div className="text-sm font-medium text-orange-600">DRAFT</div>
              </div>
            </div>
          </div>

          {/* Promotions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Khuyến Mãi Khả Dụng
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {promotions.length} chương trình
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
              {promotions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm">Không có khuyến mãi</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {promotions.map(promotion => (
                    <label
                      key={promotion.promotionId}
                      className={`flex items-start p-4 cursor-pointer transition-colors ${
                        calculationData.promotionIds.includes(promotion.promotionId)
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="promotionIds"
                        value={promotion.promotionId}
                        checked={calculationData.promotionIds.includes(promotion.promotionId)}
                        onChange={onChange}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{promotion.promotionName}</span>
                          <span className="text-sm font-semibold text-red-600">
                            -{(promotion.discountRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{promotion.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>
                            {new Date(promotion.startDate).toLocaleDateString('vi-VN')} → {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            promotion.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {promotion.status === 'ACTIVE' ? 'Hoạt động' : 'Hết hạn'}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Discount */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Chiết Khấu Bổ Sung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ (%)</label>
                <input
                  type="number"
                  name="additionalDiscountRate"
                  value={calculationData.additionalDiscountRate}
                  onChange={onChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="0.0"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-right">
                <div className="text-xs text-gray-600">Giá trị</div>
                <div className="font-semibold text-red-600">
                  -{new Intl.NumberFormat('vi-VN').format(calculationResult.additionalDiscount)} ₫
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center border-b pb-3">Tổng Hợp</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Giá cơ sở</span>
                <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(calculationResult.basePrice)} ₫</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Khuyến mãi</span>
                <span>-{new Intl.NumberFormat('vi-VN').format(calculationResult.promotionDiscount)} ₫</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Bổ sung</span>
                <span>-{new Intl.NumberFormat('vi-VN').format(calculationResult.additionalDiscount)} ₫</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Tổng CK</span>
                <span className="text-red-600">-{new Intl.NumberFormat('vi-VN').format(calculationResult.totalDiscount)} ₫</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-medium text-gray-900">Giá cuối</span>
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN').format(calculationResult.finalPrice)} ₫
                </span>
              </div>
            </div>

            {calculationResult.totalDiscount > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Tiết kiệm</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(calculationResult.totalDiscount)} ₫</span>
                </div>
                <div className="text-xs text-green-600 mt-1 text-right">
                  {(calculationResult.totalDiscount / calculationResult.basePrice * 100).toFixed(1)}%
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={(e) => { e.preventDefault(); onSubmit(); }}
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition"
              >
                Xác Nhận Tính Toán
              </button>
              <button
                onClick={onBack}
                className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition"
              >
                Quay Lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Calculation;