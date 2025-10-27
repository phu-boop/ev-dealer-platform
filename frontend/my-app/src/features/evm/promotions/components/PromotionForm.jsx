// components/PromotionForm.js
import React, { useState, useEffect, useMemo } from "react";
import { 
  CalendarIcon, 
  TagIcon, 
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import { format, parseISO } from 'date-fns';
import { se, vi } from 'date-fns/locale';

//services
import fetchModelVehicle from '../services/fetchModelVehicle';
import fetchDealer from '../services/fetchDealer';
import fetchProfileDealer from '../services/fetchProfileDealer';

export default function PromotionForm({ onSubmit, onCancel, initialData, isEdit = false }) {
  const [formData, setFormData] = useState({
    promotionName: "",
    description: "",
    discountRate: "",
    startDate: "",
    endDate: "",
    applicableModelsJson: "[]",
    dealerIdJson: "[]",
    status: "DRAFT",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho vehicle models
  const [vehicleModels, setVehicleModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  // State cho dealers
  const [dealers, setDealers] = useState([]);
  const [selectedDealers, setSelectedDealers] = useState([]);
  const [isDealerDropdownOpen, setIsDealerDropdownOpen] = useState(false);
  const [isLoadingDealers, setIsLoadingDealers] = useState(false);

  // Load vehicle models và dealers on component mount
  useEffect(() => {
    loadVehicleModels();
    loadDealers();
  }, []);

  // Initialize form data và selected items khi initialData changes
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
      discountRate: initialData.discountRate
        ? (initialData.discountRate * 100).toString()
        : "",
      startDate: formatDateForInput(initialData.startDate),
      endDate: formatDateForInput(initialData.endDate),

      // Parse và lấy ra danh sách ID
      applicableModelsJson: JSON.stringify(
        Array.isArray(initialData.applicableModelsJson)
          ? initialData.applicableModelsJson.map((m) => m.modelId)
          : JSON.parse(initialData.applicableModelsJson || "[]")
      ),
      dealerIdJson: JSON.stringify(
        Array.isArray(initialData.dealerIdJson)
          ? initialData.dealerIdJson.map((d) => d.dealerId)
          : JSON.parse(initialData.dealerIdJson || "[]")
      ),

      status: initialData.status || "DRAFT",
    });

        
      // Parse và set selected models từ JSON
      try {
        const models = JSON.parse(initialData.applicableModelsJson || "[]");
        setSelectedModels(models);
      } catch (error) {
        console.error("Error parsing applicableModelsJson:", error);
        setSelectedModels([]);
      }

      // Parse và set selected dealers từ JSON
      try {
        const dealersData = JSON.parse(initialData.dealerIdJson || "[]");
        setSelectedDealers(dealersData);
      } catch (error) {
        console.error("Error parsing dealerIdJson:", error);
        setSelectedDealers([]);
      }
    }
  }, [initialData]);


  const getIdDealerCurrent = async() => {
    try {
      const response = await fetchProfileDealer.getProfile();
      if(response.data && response.data.code === "1000"){
        return response.data.data.user.dealerManagerProfile.dealerId;
      }
      return null;
    }catch (error) {
      console.error("Error fetching profile dealer:", error);
    }
  }

  // Hàm load vehicle models
  const loadVehicleModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await fetchModelVehicle.getAllModelVehicle();
      if (response.data && response.data.code === "1000") {
        setVehicleModels(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading vehicle models:", error);
      setErrors(prev => ({ 
        ...prev, 
        applicableModels: "Không thể tải danh sách model xe" 
      }));
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Hàm load dealers
  const loadDealers = async () => {
    setIsLoadingDealers(true);
    try {
      const response = (await fetchDealer.getAllDealer()).data;
      if (response.success && response.data) {
        if(sessionStorage.getItem("roles").includes("DEALER_MANAGER")){
          const dealerCurrent = await getIdDealerCurrent();
          if(response.data.map(d=>d.dealerId).includes(dealerCurrent)){
            setDealers([response.data.find(d=>d.dealerId === dealerCurrent)]);
          }
        }else{
          setDealers(response.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading dealers:", error);
      setErrors(prev => ({ 
        ...prev, 
        dealers: "Không thể tải danh sách đại lý" 
      }));
    } finally {
      setIsLoadingDealers(false);
    }
  };

  // Hàm xử lý thay đổi ngày/giờ
  const handleDateTimeChange = (type, field, value) => {
    const currentDateTime = formData[`${type}Date`];
    const [currentDate, currentTime] = currentDateTime.split('T');
    
    let newDate = currentDate;
    let newTime = currentTime || '00:00';
    
    if (field === 'date') {
      newDate = value;
    } else if (field === 'time') {
      newTime = value + ':00';
    }
    
    const newDateTime = `${newDate}T${newTime}`;
    
    setFormData(prev => ({
      ...prev,
      [`${type}Date`]: newDateTime
    }));

    // Clear error when user starts typing
    if (errors[`${type}Date`]) {
      setErrors(prev => ({ ...prev, [`${type}Date`]: "" }));
    }

    // Auto-update status when dates change for new promotions
    if (!isEdit) {
      setTimeout(() => {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const now = new Date();
        
        if (start && end) {
          if (start > now) {
            setFormData(prev => ({ ...prev, status: "DRAFT" }));
          } else if (start <= now && end >= now) {
            setFormData(prev => ({ ...prev, status: "ACTIVE" }));
          } else if (end < now) {
            setFormData(prev => ({ ...prev, status: "EXPIRED" }));
          }
        }
      }, 100);
    }
  };

  // Hàm set thời gian nhanh
  const setQuickTime = (type, time) => {
    const now = new Date();
    let newDate = formData[`${type}Date`] ? new Date(formData[`${type}Date`]) : new Date();
    
    switch (time) {
      case 'now':
        newDate = new Date();
        break;
      case 'tomorrow':
        newDate = new Date();
        newDate.setDate(now.getDate() + 1);
        newDate.setHours(23, 59, 0, 0);
        break;
      case 'nextWeek':
        newDate = new Date();
        newDate.setDate(now.getDate() + 7);
        newDate.setHours(23, 59, 0, 0);
        break;
      default:
        const [hours, minutes] = time.split(':');
        newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    const dateString = newDate.toISOString().slice(0, 10);
    const timeString = newDate.toTimeString().slice(0, 8);
    
    setFormData(prev => ({
      ...prev,
      [`${type}Date`]: `${dateString}T${timeString}`
    }));
  };

  // Hàm xử lý cho model selection
  const handleModelSelect = (model) => {
    if (selectedModels.some(selected => selected.modelId === model.modelId)) {
      return;
    }

    const newSelectedModels = [...selectedModels, model];
    setSelectedModels(newSelectedModels);
    
    setFormData(prev => ({
      ...prev,
      applicableModelsJson: JSON.stringify(newSelectedModels)
    }));

    if (errors.applicableModels) {
      setErrors(prev => ({ ...prev, applicableModels: "" }));
    }
    
    setIsModelDropdownOpen(false);
  };

  const removeModel = (modelId) => {
    const newSelectedModels = selectedModels.filter(model => model.modelId !== modelId);
    setSelectedModels(newSelectedModels);
    
    setFormData(prev => ({
      ...prev,
      applicableModelsJson: JSON.stringify(newSelectedModels)
    }));
  };

  // Hàm xử lý cho dealer selection
  const handleDealerSelect = (dealer) => {
    if (selectedDealers.some(selected => selected.dealerId === dealer.dealerId)) {
      return;
    }

    const newSelectedDealers = [...selectedDealers, dealer];
    setSelectedDealers(newSelectedDealers);
    
    setFormData(prev => ({
      ...prev,
      dealerIdJson: JSON.stringify(newSelectedDealers)
    }));

    if (errors.dealers) {
      setErrors(prev => ({ ...prev, dealers: "" }));
    }
    
    setIsDealerDropdownOpen(false);
  };

  const removeDealer = (dealerId) => {
    const newSelectedDealers = selectedDealers.filter(dealer => dealer.dealerId !== dealerId);
    setSelectedDealers(newSelectedDealers);
    
    setFormData(prev => ({
      ...prev,
      dealerIdJson: JSON.stringify(newSelectedDealers)
    }));
  };

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

    // Validate selected models
    if (selectedModels.length === 0) {
      newErrors.applicableModels = "Vui lòng chọn ít nhất một model xe";
    }

    // Validate selected dealers
    if (selectedDealers.length === 0) {
      newErrors.dealers = "Vui lòng chọn ít nhất một đại lý";
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
          discountRate: parseFloat(formData.discountRate) / 100,
          applicableModelsJson: JSON.stringify(
            selectedModels.map((m) => m.modelId)
          ),
          dealerIdJson: JSON.stringify(
            selectedDealers.map((d) => d.dealerId)
          ),
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
      DRAFT: {
        label: "Đang chờ xác thực",
        description: "Chương trình đang chờ được xác thực và kích hoạt",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: ClockIcon,
        buttonColor: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-300"
      },
      ACTIVE: {
        label: "Đang hoạt động",
        description: "Chương trình đang được áp dụng",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: PlayIcon,
        buttonColor: "bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
      },
      EXPIRED: {
        label: "Đã hết hạn",
        description: "Chương trình đã kết thúc",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: XCircleIcon,
        buttonColor: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
      }
    };
    
    return configs[status] || configs.DRAFT;
  };

  // Tính thời lượng với useMemo
  const duration = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return null;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffMs = end - start;
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }, [formData.startDate, formData.endDate]);

  const getAutoSuggestedStatus = () => {
    if (!formData.startDate || !formData.endDate) return null;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();
    
    if (start > now) return "DRAFT";
    if (start <= now && end >= now) return "ACTIVE";
    if (end < now) return "EXPIRED";
    return "INACTIVE";
  };

  const availableModels = vehicleModels.filter(
    model => !selectedModels.some(selected => selected.modelId === model.modelId)
  );

  const availableDealers = dealers.filter(
    dealer => !selectedDealers.some(selected => selected.dealerId === dealer.dealerId)
  );

  const statusConfig = getStatusConfig(formData.status);
  const autoSuggestedStatus = getAutoSuggestedStatus();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Chỉnh sửa Khuyến mãi" : "Tạo Khuyến mãi Mới"}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEdit 
            ? "Cập nhật thông tin chương trình khuyến mãi của bạn"
            : "Thiết lập chương trình khuyến mãi mới để thu hút khách hàng"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <TagIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h2>
              <p className="text-sm text-gray-500">Thông tin chính về chương trình khuyến mãi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Promotion Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên chương trình <span className="text-red-500">*</span>
              </label>
              <div className="relative">
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.promotionName && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  {errors.promotionName}
                </p>
              )}
            </div>

            {/* Description */}
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
              <p className="mt-2 text-sm text-gray-500">
                {formData.description.length}/500 ký tự
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          {/* Vehicle Models Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-medium text-gray-900">Model Xe Áp dụng</h2>
                <p className="text-sm text-gray-500">Chọn các model xe được áp dụng khuyến mãi</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model xe áp dụng <span className="text-red-500">*</span>
                </label>
                
                {/* Selected Models Display */}
                {selectedModels.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedModels.map((model) => (
                        <div
                          key={model.modelId}
                          className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="text-sm text-gray-500 mt-0.5">{model.brand}-</div>
                            <div className="font-semibold text-gray-900">{model.modelName}-</div>
                            {/* Status tag */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                model.status === 'IN_PRODUCTION'
                                  ? 'bg-green-100 text-green-700'
                                  : model.status === 'DISCONTINUED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {model.status === 'IN_PRODUCTION' && '✅'}
                              {model.status === 'DISCONTINUED' && '🔴'}
                              {model.status === 'COMING_SOON' && '🟡'}
                              <span>{model.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeModel(model.modelId)}
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Selection Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className={`flex justify-between items-center w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.applicableModels 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                  >
                    <span className="text-gray-500">
                      {isLoadingModels ? "Đang tải model xe..." : "Chọn model xe..."}
                    </span>
                    {isModelDropdownOpen ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingModels ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Đang tải model xe...
                        </div>
                      ) : availableModels.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Đã chọn tất cả model xe
                        </div>
                      ) : (
                        availableModels.map((model) => (
                          <button
                            key={model.modelId}
                            type="button"
                            onClick={() => handleModelSelect(model)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between w-full">
                            <div className="font-semibold text-gray-900">{model.modelName}</div>
                            {/* Status tag */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                model.status === 'IN_PRODUCTION'
                                  ? 'bg-green-100 text-green-700'
                                  : model.status === 'DISCONTINUED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {model.status === 'IN_PRODUCTION' && '✅'}
                              {model.status === 'DISCONTINUED' && '🔴'}
                              {model.status === 'COMING_SOON' && '🟡'}
                              <span>{model.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">{model.brand}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {errors.applicableModels && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.applicableModels}
                  </p>
                )}

                <p className="mt-2 text-sm text-gray-500">
                  Đã chọn {selectedModels.length} model xe
                </p>
              </div>
            </div>
          </div>

          {/* Dealer Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-medium text-gray-900">Đại Lý Áp dụng</h2>
                <p className="text-sm text-gray-500">Chọn các đại lý được áp dụng khuyến mãi</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đại lý áp dụng <span className="text-red-500">*</span>
                </label>
                  {/* Selected Dealers Display */}
                    {selectedDealers.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedDealers.map((dealer) => (
                            <div
                              key={dealer.dealerId}
                              className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                            >
                              <span className="font-medium">{dealer.dealerName}</span>
                              <span className="mx-1">-</span>
                              <span className="text-purple-600">{dealer.city}</span>
                              <button
                                type="button"
                                onClick={() => removeDealer(dealer.dealerId)}
                                className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  

                {/* Selected Dealers Display */}
                {selectedDealers.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedDealers.map((dealer) => (
                        <div
                          key={dealer.dealerId}
                          className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span className="font-medium">{dealer.dealerName}</span>
                          <span className="mx-1">-</span>
                          <span className="text-purple-600">{dealer.city}</span>
                          <button
                            type="button"
                            onClick={() => removeDealer(dealer.dealerId)}
                            className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dealer Selection Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDealerDropdownOpen(!isDealerDropdownOpen)}
                    className={`flex justify-between items-center w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.dealers 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                  >
                    <span className="text-gray-500">
                      {isLoadingDealers ? "Đang tải danh sách đại lý..." : "Chọn đại lý..."}
                    </span>
                    {isDealerDropdownOpen ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {isDealerDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingDealers ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Đang tải danh sách đại lý...
                        </div>
                      ) : availableDealers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Đã chọn tất cả đại lý
                        </div>
                      ) : (
                        availableDealers.map((dealer) => (
                          <button
                            key={dealer.dealerId}
                            type="button"
                            onClick={() => handleDealerSelect(dealer)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{dealer.dealerName}</div>
                            <div className="text-sm text-gray-500 flex justify-between">
                              <span>{dealer.dealerCode}</span>
                              <span>{dealer.city} • {dealer.region}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {dealer.address}
                            </div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-1 ${
                              dealer.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {dealer.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {errors.dealers && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.dealers}
                  </p>
                )}

                <p className="mt-2 text-sm text-gray-500">
                  Đã chọn {selectedDealers.length} đại lý
                </p>
              </div>
            </div>
          </div>

        </div>
        

        {/* Discount & Settings Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <TagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900">Thiết lập Giảm giá</h2>
              <p className="text-sm text-gray-500">Cấu hình tỷ lệ giảm giá và trạng thái</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discount Rate */}
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
              {formData.discountRate && !errors.discountRate && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Giảm {formData.discountRate}% cho đơn hàng
                </p>
              )}
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { value: "DRAFT", label: "Chờ xác thực" }
                ].map((statusOption) => {
                  const config = getStatusConfig(statusOption.value);
                  const isSelected = formData.status === statusOption.value;
                  
                  return (
                    <button
                      key={statusOption.value}
                      type="button"
                      onClick={() => handleStatusChange(statusOption.value)}
                      className={`p-2 border rounded-lg text-sm font-medium transition-all ${
                        isSelected 
                          ? `${config.buttonColor} ring-2 ring-offset-1 ring-opacity-50` 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {statusOption.label}
                    </button>
                  );
                })}
              </div>
              
              {!isEdit && autoSuggestedStatus && autoSuggestedStatus !== formData.status && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Gợi ý: Dựa trên thời gian bạn chọn, hệ thống đề xuất trạng thái "
                    <button
                      type="button"
                      onClick={() => handleStatusChange(autoSuggestedStatus)}
                      className="underline font-medium hover:text-blue-800"
                    >
                      {getStatusConfig(autoSuggestedStatus).label}
                    </button>
                    "
                  </p>
                </div>
              )}
              
              <div className={`p-3 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
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

        {/* Date & Time Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900">Thời gian Áp dụng</h2>
              <p className="text-sm text-gray-500">Thiết lập thời gian bắt đầu và kết thúc</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Start Date & Time */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate.split('T')[0] || ''}
                      onChange={(e) => handleDateTimeChange('start', 'date', e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.startDate 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.startDate.split('T')[1]?.substring(0, 5) || '00:00'}
                      onChange={(e) => handleDateTimeChange('start', 'time', e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.startDate 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>
                {errors.startDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              {/* Quick Start Time Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 w-full">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => setQuickTime('start', '08:00')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  08:00
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('start', '09:00')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  09:00
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('start', '12:00')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  12:00
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('start', 'now')}
                  className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors font-medium"
                >
                  Bây giờ
                </button>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.endDate.split('T')[0] || ''}
                      onChange={(e) => handleDateTimeChange('end', 'date', e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.endDate 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.endDate.split('T')[1]?.substring(0, 5) || '23:59'}
                      onChange={(e) => handleDateTimeChange('end', 'time', e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.endDate 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>
                {errors.endDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.endDate}
                  </p>
                )}
              </div>

              {/* Quick End Time Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 w-full">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => setQuickTime('end', '17:00')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  17:00
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('end', '18:00')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  18:00
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('end', '23:59')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  23:59
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('end', 'tomorrow')}
                  className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors font-medium"
                >
                  Ngày mai
                </button>
              </div>
            </div>
          </div>

          {/* Duration Summary */}
          {duration && !errors.startDate && !errors.endDate && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Tóm tắt Thời gian</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Bắt đầu:</span>
                  <span className="text-blue-800 ml-2">
                    {new Date(formData.startDate).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Kết thúc:</span>
                  <span className="text-blue-800 ml-2">
                    {new Date(formData.endDate).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Thời lượng:</span>
                  <span className="text-blue-800 ml-2">
                    {duration.days} ngày {duration.hours} giờ {duration.minutes} phút
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-blue-600 font-medium">Trạng thái tự động:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  getStatusConfig(autoSuggestedStatus).bgColor
                } ${getStatusConfig(autoSuggestedStatus).color}`}>
                  {getStatusConfig(autoSuggestedStatus).label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
                {isEdit ? "Cập nhật Khuyến mãi" : "Gửi yêu cầu tạo"}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}