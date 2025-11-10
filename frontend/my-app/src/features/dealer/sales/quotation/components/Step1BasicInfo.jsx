// sales/quotation/components/Step1BasicInfo.js
import React from 'react';

const Step1BasicInfo = ({ formData, customers, models, variants, onChange, onSubmit }) => {
  console.log('Rendering Step1BasicInfo with formData:', formData);
  console.log('Available customers:', customers);
  console.log('Available models:', models);
  console.log('Available variants:', variants);

  const isFormValid = () => {
    return formData.customerId && formData.modelId && formData.variantId && formData.basePrice;
  };

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      'COMING_SOON': { color: 'bg-sky-50 text-sky-700 border border-sky-200', text: 'Sắp ra mắt' },
      'IN_PRODUCTION': { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', text: 'Đang sản xuất' },
      'DISCONTINUED': { color: 'bg-rose-50 text-rose-700 border border-rose-200', text: 'Ngừng sản xuất' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-50 text-gray-700 border border-gray-200', text: status };
    return <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${config.color}`}>{config.text}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-8 py-8 border-b border-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800">Thông tin cơ bản</h2>
        <p className="text-gray-500 mt-2">Nhập thông tin khách hàng và lựa chọn xe</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Customer Selection */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Khách hàng *
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={onChange}
              required
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700"
            >
              <option value="" className="text-gray-400">Chọn khách hàng</option>
              {customers.map(customer => (
                <option key={customer.customerId} value={customer.customerId} className="text-gray-700">
                  {customer.customerCode} - {customer.firstName} {customer.lastName} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dòng xe *
            </label>
            <select
              name="modelId"
              value={formData.modelId}
              onChange={onChange}
              required
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700"
            >
              <option value="" className="text-gray-400">Chọn dòng xe</option>
              {models.map(model => (
                <option key={model.modelId} value={model.modelId} className="text-gray-700">
                  {model.modelName} - {model.brand}
                </option>
              ))}
            </select>
          </div>

          {/* Variant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Phiên bản *
            </label>
            <select
              name="variantId"
              value={formData.variantId}
              onChange={onChange}
              required
              disabled={!formData.modelId}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="" className="text-gray-400">
                {formData.modelId ? 'Chọn phiên bản' : 'Vui lòng chọn dòng xe trước'}
              </option>
              {variants.map(variant => (
                <option key={variant.variantId} value={variant.variantId} className="text-gray-700">
                  {variant.versionName} - {variant.color} - {formatPrice(variant.price)} VND
                </option>
              ))}
            </select>
          </div>

          {/* Base Price */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Giá cơ sở *
            </label>
            <div className="relative">
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={onChange}
                required
                step="0.01"
                placeholder="Nhập giá cơ sở"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700 pr-32 placeholder-gray-400"
              />
              {formData.basePrice && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-emerald-600 font-semibold text-lg">
                    {formatPrice(formData.basePrice)} VND
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Giá cơ sở sẽ được sử dụng để tính toán các khoản phí khác</p>
          </div>

          {/* Variant Details Card */}
          {formData.variantId && (
            <div className="lg:col-span-2">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                  <h3 className="font-medium text-sky-900 text-lg">Thông tin phiên bản đã chọn</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  {variants.filter(v => v.variantId === formData.variantId).map(variant => (
                    <React.Fragment key={variant.variantId}>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Phiên bản</p>
                        <p className="font-semibold text-gray-800">{variant.versionName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Màu sắc</p>
                        <p className="font-semibold text-gray-800">{variant.color}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Giá niêm yết</p>
                        <p className="font-semibold text-emerald-600 text-lg">{formatPrice(variant.price)} VND</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Trạng thái</p>
                        {getStatusBadge(variant.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Tầm hoạt động</p>
                        <p className="font-semibold text-gray-800">{variant.rangeKm} km</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Công suất</p>
                        <p className="font-semibold text-gray-800">{variant.motorPower} kW</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Dung lượng pin</p>
                        <p className="font-semibold text-gray-800">{variant.batteryCapacity} kWh</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Thời gian sạc</p>
                        <p className="font-semibold text-gray-800">{variant.chargingTime} giờ</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Điều khoản và điều kiện
            </label>
            <textarea
              name="termsConditions"
              value={formData.termsConditions}
              onChange={onChange}
              rows="4"
              placeholder="Nhập điều khoản và điều kiện áp dụng..."
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700 resize-vertical placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-8 mt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={!isFormValid()}
            className="px-10 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-medium rounded-xl hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow"
          >
            Tạo báo giá nháp
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1BasicInfo;