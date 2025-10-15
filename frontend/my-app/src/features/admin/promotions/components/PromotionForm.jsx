// features/admin/promotions/components/PromotionForm.js
import React, { useState, useEffect } from "react";
import { 
  CalendarIcon, 
  TagIcon, 
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function PromotionForm({ onSubmit, onCancel, initialData, isEdit = false }) {
  const [formData, setFormData] = useState({
    promotionName: "",
    description: "",
    discountRate: "",
    startDate: "",
    endDate: "",
    applicableModelsJson: "[]",
    status: "UPCOMING",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          const date = parseISO(dateString);
          return format(date, "yyyy-MM-dd'T'HH:mm");
        } catch (error) {
          return dateString;
        }
      };

      setFormData({
        promotionName: initialData.promotionName || "",
        description: initialData.description || "",
        discountRate: initialData.discountRate ? (initialData.discountRate * 100).toString() : "",
        startDate: formatDateForInput(initialData.startDate),
        endDate: formatDateForInput(initialData.endDate),
        applicableModelsJson: initialData.applicableModelsJson || "[]",
        status: initialData.status || "UPCOMING",
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.promotionName.trim()) {
      newErrors.promotionName = "Tên chương trình là bắt buộc";
    } else if (formData.promotionName.length < 3) {
      newErrors.promotionName = "Tên chương trình phải có ít nhất 3 ký tự";
    }
    
    if (!formData.discountRate || parseFloat(formData.discountRate) <= 0) {
      newErrors.discountRate = "Tỷ lệ giảm phải lớn hơn 0";
    } else if (parseFloat(formData.discountRate) > 100) {
      newErrors.discountRate = "Tỷ lệ giảm không được vượt quá 100%";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }
    
    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (newStatus) => {
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const submitData = {
          ...formData,
          discountRate: parseFloat(formData.discountRate) / 100
        };
        
        await onSubmit(submitData);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      UPCOMING: {
        label: "Chờ xác thực",
        description: "Chương trình đang chờ được xác thực và kích hoạt",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: ClockIcon,
      },
      ACTIVE: {
        label: "Đang hoạt động",
        description: "Chương trình đang được áp dụng và hiển thị",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: PlayIcon,
      },
      EXPIRED: {
        label: "Đã hết hạn",
        description: "Chương trình đã kết thúc thời gian áp dụng",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: XCircleIcon,
      },
      INACTIVE: {
        label: "Không hoạt động",
        description: "Chương trình đã bị vô hiệu hóa tạm thời",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        icon: StopIcon,
      }
    };
    
    return configs[status] || configs.UPCOMING;
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return null;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const durationMs = end - start;
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours };
  };

  const duration = calculateDuration();
  const statusConfig = getStatusConfig(formData.status);
  const StatusIcon = statusConfig.icon;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <TagIcon className="h-6 w-6 text-indigo-600 mr-3" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h2>
            <p className="text-sm text-gray-500">Thông tin chính về chương trình khuyến mãi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên chương trình <span className="text-red-500">*</span>
            </label>
            <input
              name="promotionName"
              value={formData.promotionName}
              onChange={handleChange}
              className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.promotionName 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500'
              }`}
              placeholder="Ví dụ: Khuyến mãi Black Friday 2024"
            />
            {errors.promotionName && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.promotionName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Mô tả chi tiết về chương trình khuyến mãi, điều kiện áp dụng..."
            />
          </div>
        </div>
      </div>

      {/* Discount & Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <TagIcon className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">Thiết lập Giảm giá & Trạng thái</h2>
            <p className="text-sm text-gray-500">Cấu hình tỷ lệ giảm giá và trạng thái khuyến mãi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỷ lệ giảm giá (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                name="discountRate"
                value={formData.discountRate}
                onChange={handleChange}
                className={`block w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.discountRate 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 font-medium">%</span>
              </div>
            </div>
            {errors.discountRate && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.discountRate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="UPCOMING">Chờ xác thực</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="EXPIRED">Đã hết hạn</option>
            </select>
            
            <div className={`mt-3 p-3 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
              <div className="flex items-start">
                <StatusIcon className={`h-5 w-5 mt-0.5 mr-2 ${statusConfig.color}`} />
                <div>
                  <p className={`text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">Thời gian Áp dụng</h2>
            <p className="text-sm text-gray-500">Thiết lập thời gian bắt đầu và kết thúc khuyến mãi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.startDate 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500'
              }`}
            />
            {errors.startDate && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.endDate 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500'
              }`}
            />
            {errors.endDate && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        {duration && !errors.startDate && !errors.endDate && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Tóm tắt Thời gian</h3>
            <div className="text-sm text-blue-800">
              Thời lượng: {duration.days} ngày {duration.hours} giờ
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang xử lý...
            </div>
          ) : (
            <div className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {isEdit ? "Cập nhật Khuyến mãi" : "Tạo Khuyến mãi"}
            </div>
          )}
        </button>
      </div>
    </form>
  );
}