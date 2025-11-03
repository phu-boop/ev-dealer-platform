import { useState, useEffect } from 'react';
import { X, Users, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import staffService from '../../features/customers/services/staffService';
import { getModelDetails } from '../../services/vehicleService';
import CustomerSelect from './CustomerSelect';

const TestDriveFormModal = ({ isOpen, onClose, onSubmit, initialData = null, vehicles = [] }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    dealerId: 1, // TODO: Get from context/auth
    modelId: '',
    variantId: '',
    staffId: '',
    appointmentDate: '',
    durationMinutes: 60,
    testDriveLocation: '',
    customerNotes: '',
    createdBy: '', // TODO: Get from auth
  });

  const [errors, setErrors] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Dealer UUID để load staff
  const dealerUUID = sessionStorage.getItem('dealerId') || sessionStorage.getItem('profileId') || '6c8c229d-c8f6-43d8-b2f6-01261b46baa3';

  // Load staff list when modal opens
  useEffect(() => {
    if (isOpen && dealerUUID) {
      fetchStaffList();
    }
  }, [isOpen, dealerUUID]);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        customerId: initialData.customerId || '',
        dealerId: initialData.dealerId || 1,
        modelId: initialData.modelId || '',
        variantId: initialData.variantId || '',
        staffId: initialData.staffId || '',
        appointmentDate: initialData.appointmentDate ? initialData.appointmentDate.slice(0, 16) : '',
        durationMinutes: initialData.durationMinutes || 60,
        testDriveLocation: initialData.testDriveLocation || '',
        customerNotes: initialData.customerNotes || '',
      });
    }
  }, [initialData]);

  const fetchStaffList = async () => {
    setLoadingStaff(true);
    try {
      const data = await staffService.getStaffByDealerId(dealerUUID);
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      toast.error("Không thể tải danh sách nhân viên");
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Load variants when model is selected
  useEffect(() => {
    if (formData.modelId) {
      loadVariants(formData.modelId);
    } else {
      setVariants([]);
      setFormData(prev => ({ ...prev, variantId: '' }));
    }
  }, [formData.modelId]);

  const loadVariants = async (modelId) => {
    setLoadingVariants(true);
    try {
      const response = await getModelDetails(modelId);
      setVariants(response.data?.variants || []);
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error("Không thể tải danh sách phiên bản");
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.customerId) newErrors.customerId = 'Vui lòng chọn khách hàng';
    if (!formData.modelId) newErrors.modelId = 'Vui lòng chọn mẫu xe';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Vui lòng chọn thời gian';
    if (!formData.testDriveLocation) newErrors.testDriveLocation = 'Vui lòng nhập địa điểm';
    if (formData.durationMinutes < 15) newErrors.durationMinutes = 'Thời lượng tối thiểu 15 phút';

    // Kiểm tra thời gian phải trong tương lai
    const selectedDate = new Date(formData.appointmentDate);
    const now = new Date();
    if (selectedDate <= now) {
      newErrors.appointmentDate = 'Thời gian phải trong tương lai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Không convert sang ISO để giữ nguyên timezone local
      // Backend sẽ parse theo định dạng yyyy-MM-ddTHH:mm
      const submitData = {
        ...formData,
        appointmentDate: formData.appointmentDate, // Giữ nguyên format yyyy-MM-ddTHH:mm
      };
      
      console.log('📅 Submitting datetime:', submitData.appointmentDate);
      
      // Xóa staffId nếu không chọn (empty string không parse được thành Long)
      if (!submitData.staffId) {
        delete submitData.staffId;
      }
      
      // Xóa createdBy nếu empty
      if (!submitData.createdBy) {
        delete submitData.createdBy;
      }
      
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? '📝 Cập Nhật Lịch Hẹn' : '📝 Tạo Lịch Hẹn Lái Thử'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Select */}
          <CustomerSelect
            value={formData.customerId}
            onChange={(customerId) => {
              setFormData(prev => ({ ...prev, customerId }));
              if (errors.customerId) {
                setErrors(prev => ({ ...prev, customerId: '' }));
              }
            }}
            error={errors.customerId}
            disabled={!!initialData}
          />

          {/* Vehicle Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🚗 Mẫu xe *
              </label>
              <select
                name="modelId"
                value={formData.modelId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.modelId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn mẫu xe --</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.modelId} value={vehicle.modelId}>
                    {vehicle.modelName}
                  </option>
                ))}
              </select>
              {errors.modelId && <p className="text-red-500 text-sm mt-1">{errors.modelId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎨 Phiên bản
              </label>
              <select
                name="variantId"
                value={formData.variantId}
                onChange={handleChange}
                disabled={!formData.modelId || loadingVariants}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn phiên bản --</option>
                {variants.map(variant => (
                  <option key={variant.variantId} value={variant.variantId}>
                    {variant.versionName} - {variant.color}
                  </option>
                ))}
              </select>
              {loadingVariants && (
                <p className="text-sm text-gray-500 mt-1">Đang tải phiên bản...</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Ngày/Giờ *
              </label>
              <input
                type="datetime-local"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.appointmentDate && <p className="text-red-500 text-sm mt-1">{errors.appointmentDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ⏱️ Thời lượng (phút)
              </label>
              <select
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="30">30 phút</option>
                <option value="60">60 phút</option>
                <option value="90">90 phút</option>
                <option value="120">120 phút</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📍 Địa điểm lái thử *
            </label>
            <textarea
              name="testDriveLocation"
              value={formData.testDriveLocation}
              onChange={handleChange}
              rows="2"
              placeholder="VD: Showroom VinFast Hà Nội, 458 Minh Khai"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.testDriveLocation ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.testDriveLocation && <p className="text-red-500 text-sm mt-1">{errors.testDriveLocation}</p>}
          </div>

          {/* Staff Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              👔 Nhân viên phụ trách
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                disabled={loadingStaff}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">-- Chọn nhân viên --</option>
                {staffList.map((staff) => (
                  <option key={staff.staffId} value={staff.staffId}>
                    {staff.fullName || staff.name || 'N/A'} ({staff.email})
                    {staff.position ? ` - ${staff.position}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            {loadingStaff && (
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Đang tải danh sách nhân viên...
              </p>
            )}
            {!loadingStaff && staffList.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                ⚠️ Không có nhân viên nào trong đại lý
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💬 Ghi chú từ khách hàng
            </label>
            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleChange}
              rows="3"
              placeholder="Ghi chú đặc biệt từ khách hàng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {initialData ? '✓ Cập nhật' : '✓ Tạo lịch hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestDriveFormModal;
