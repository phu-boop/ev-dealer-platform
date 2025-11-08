import React, { useState, useEffect } from "react";

/**
 * Form thêm/chỉnh sửa Order Item với đầy đủ trường từ backend
 */
const OrderItemForm = ({
  item,
  onSubmit,
  onCancel,
  loading = false,
  validationErrors = {},
  onChange,
  mode = "create", // 'create' | 'edit'
}) => {
  const [formData, setFormData] = useState({
    variantId: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    itemNotes: "",
    color: "",
    specifications: "",
  });

  // Tính toán giá cuối cùng
  const calculateFinalPrice = () => {
    const subtotal = formData.unitPrice * formData.quantity;
    const discountAmount = subtotal * (formData.discount / 100);
    return Math.max(0, subtotal - discountAmount);
  };

  const finalPrice = calculateFinalPrice();

  // Khởi tạo form khi có item (chỉnh sửa)
  useEffect(() => {
    if (item) {
      setFormData({
        variantId: item.variantId || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        itemNotes: item.itemNotes || "",
        color: item.color || "",
        specifications: item.specifications || "",
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      finalPrice: finalPrice,
    });
  };

  const handleChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Notify parent component if onChange prop is provided
    if (onChange) {
      onChange(field, value);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mã biến thể */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã biến thể sản phẩm *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.variantId}
            onChange={(e) =>
              handleChange("variantId", parseInt(e.target.value) || "")
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.variantId ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Nhập mã biến thể..."
          />
          {validationErrors.variantId && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.variantId}
            </p>
          )}
        </div>

        {/* Số lượng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) =>
              handleChange("quantity", parseInt(e.target.value) || 1)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.quantity ? "border-red-300" : "border-gray-300"
            }`}
          />
          {validationErrors.quantity && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.quantity}
            </p>
          )}
        </div>

        {/* Đơn giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đơn giá (VND) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="1000"
            value={formData.unitPrice}
            onChange={(e) =>
              handleChange("unitPrice", parseFloat(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.unitPrice ? "border-red-300" : "border-gray-300"
            }`}
          />
          {validationErrors.unitPrice && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.unitPrice}
            </p>
          )}
        </div>

        {/* Giảm giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giảm giá (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.discount}
            onChange={(e) =>
              handleChange("discount", parseFloat(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.discount ? "border-red-300" : "border-gray-300"
            }`}
          />
          {validationErrors.discount && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.discount}
            </p>
          )}
        </div>
      </div>

      {/* Thông tin bổ sung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Màu sắc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màu sắc
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập màu sắc..."
          />
        </div>

        {/* Ghi chú */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú sản phẩm
          </label>
          <textarea
            value={formData.itemNotes}
            onChange={(e) => handleChange("itemNotes", e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập ghi chú về sản phẩm..."
          />
        </div>

        {/* Thông số kỹ thuật */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thông số kỹ thuật
          </label>
          <textarea
            value={formData.specifications}
            onChange={(e) => handleChange("specifications", e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập thông số kỹ thuật..."
          />
        </div>
      </div>

      {/* Thông tin tổng */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-900">
            Thành tiền tạm tính:
          </span>
          <span className="text-xl font-bold text-blue-700">
            {formatCurrency(finalPrice)}
          </span>
        </div>
        {formData.discount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-800">Giá gốc:</span>
            <span className="text-blue-600 line-through">
              {formatCurrency(formData.unitPrice * formData.quantity)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-blue-800">Tiết kiệm:</span>
          <span className="text-green-600">
            {formatCurrency(
              formData.unitPrice * formData.quantity * (formData.discount / 100)
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={loading || !formData.variantId || finalPrice < 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {mode === "edit" ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        </button>
      </div>
    </form>
  );
};

export default OrderItemForm;
