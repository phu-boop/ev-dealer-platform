import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import testDriveService from '../services/testDriveService';
import { getVehicles } from '../services/vehicleService';

const TestDriveBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdFromUrl = searchParams.get('vehicleId');

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: vehicleIdFromUrl || '',
    appointmentDate: '',
    appointmentTime: '',
    durationMinutes: 60,
    testDriveLocation: '',
    customerNotes: ''
  });

  // Get customer info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const customerId = user.customerId;

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await getVehicles({ page: 0, size: 100 });
      if (response.code === 200) {
        setVehicles(response.result?.content || []);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerId) {
      toast.error('Vui lòng đăng nhập để đặt lịch lái thử');
      navigate('/auth/login');
      return;
    }

    // Validate form
    if (!formData.vehicleId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);

    try {
      // Get selected vehicle info
      const selectedVehicle = vehicles.find(v => v.modelId.toString() === formData.vehicleId);
      if (!selectedVehicle) {
        toast.error('Không tìm thấy thông tin xe');
        return;
      }

      // Combine date and time
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

      const appointmentData = {
        customerId,
        dealerId: 1, // TODO: Get from selected location
        modelId: selectedVehicle.modelId,
        variantId: null,
        vehicleModelName: selectedVehicle.modelName,
        vehicleVariantName: null,
        appointmentDate: appointmentDateTime.toISOString(),
        durationMinutes: parseInt(formData.durationMinutes),
        testDriveLocation: formData.testDriveLocation,
        customerNotes: formData.customerNotes
      };

      const response = await testDriveService.createAppointment(appointmentData);
      
      if (response.code === 200) {
        toast.success('Đặt lịch lái thử thành công!');
        navigate('/my-test-drives');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error booking test drive:', error);
      toast.error('Không thể đặt lịch. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Đặt lịch lái thử</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn xe <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn xe --</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.modelId} value={vehicle.modelId}>
                  {vehicle.modelName} - {vehicle.manufacturer}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                min={today}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian lái thử
            </label>
            <select
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">30 phút</option>
              <option value="60">60 phút</option>
              <option value="90">90 phút</option>
              <option value="120">120 phút</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <select
              name="testDriveLocation"
              value={formData.testDriveLocation}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn địa điểm --</option>
              <option value="Showroom Hà Nội">Showroom Hà Nội</option>
              <option value="Showroom TP.HCM">Showroom TP.HCM</option>
              <option value="Showroom Đà Nẵng">Showroom Đà Nẵng</option>
              <option value="Showroom Hải Phòng">Showroom Hải Phòng</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Ghi chú thêm về yêu cầu của bạn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đặt lịch'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Lưu ý</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Vui lòng đến đúng giờ đã đặt</li>
          <li>• Mang theo CMND/CCCD và giấy phép lái xe</li>
          <li>• Chúng tôi sẽ liên hệ xác nhận lịch hẹn trong vòng 24h</li>
          <li>• Có thể hủy lịch trước 24h để tránh bị tính phí</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDriveBookingPage;
