import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Calendar, Clock, MapPin, User, Phone, MessageSquare, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import apiPublic from "../services/apiPublic";

const TestDriveBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelId = searchParams.get('modelId');
  const variantId = searchParams.get('variantId');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      email: '',
      dealerId: '',
      appointmentDate: '',
      appointmentTime: '',
      durationMinutes: 60,
      notes: '',
    }
  });

  const [dealers, setDealers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock dealers data (fallback when API fails or requires auth)
  const mockDealers = [
    { dealerId: '1', id: '1', dealerName: 'VinFast Hà Nội', address: '123 Đường ABC, Quận XYZ, Hà Nội', city: 'Hà Nội' },
    { dealerId: '2', id: '2', dealerName: 'VinFast TP.HCM', address: '456 Đường DEF, Quận 1, TP.HCM', city: 'TP.HCM' },
    { dealerId: '3', id: '3', dealerName: 'VinFast Đà Nẵng', address: '789 Đường GHI, Quận Hải Châu, Đà Nẵng', city: 'Đà Nẵng' },
  ];

  // Fetch dealers
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await apiPublic.get('/dealers/api/dealers');
        // Handle different response structures
        let dealersList = [];
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            dealersList = response.data.data;
          } else if (Array.isArray(response.data)) {
            dealersList = response.data;
          } else if (response.data.success && response.data.data) {
            dealersList = response.data.data;
          }
        }
        
        // Normalize dealer data to have both id and dealerId
        const normalizedDealers = dealersList.map(dealer => ({
          ...dealer,
          id: dealer.id || dealer.dealerId || dealer.dealerId?.toString(),
          dealerId: dealer.dealerId || dealer.id || dealer.id?.toString(),
          dealerName: dealer.dealerName || dealer.name || 'Đại lý',
          address: dealer.address || dealer.location || dealer.city || 'Chưa cập nhật',
        }));
        
        if (normalizedDealers.length > 0) {
          setDealers(normalizedDealers);
        } else {
          setDealers(mockDealers);
        }
      } catch (error) {
        console.error("Error fetching dealers:", error);
        // Use mock data as fallback
        setDealers(mockDealers);
        // Only show error if not 401 (unauthorized is expected for public endpoint)
        if (error.response?.status !== 401) {
          toast.warning("Không thể tải danh sách đại lý từ server. Đang sử dụng danh sách mặc định.");
        }
      }
    };
    fetchDealers();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Combine date and time
      const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
      
      // Get customer ID from auth (if logged in) or create guest booking
      const payload = {
        customerId: null, // Will be set by backend if user is logged in
        dealerId: data.dealerId,
        modelId: modelId ? parseInt(modelId) : null,
        variantId: variantId ? parseInt(variantId) : null,
        appointmentDate: appointmentDateTime.toISOString(),
        durationMinutes: parseInt(data.durationMinutes),
        testDriveLocation: dealers.find(d => (d.id === data.dealerId || d.dealerId === data.dealerId))?.address || '',
        customerNotes: data.notes,
        customerName: data.customerName,
        customerPhone: data.phoneNumber,
        customerEmail: data.email,
      };

      // Call customer service to create test drive
      const response = await apiPublic.post('/customers/api/test-drives/public', payload);
      
      toast.success("Đặt lịch lái thử thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      navigate('/');
    } catch (error) {
      console.error("Error booking test drive:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available time slots (business hours: 8 AM - 6 PM)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const selectedDate = watch('appointmentDate');
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt Lịch Lái Thử</h1>
          <p className="text-gray-600 mb-8">Điền thông tin để đặt lịch lái thử xe điện của chúng tôi</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông Tin Khách Hàng
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('customerName', { 
                    required: 'Vui lòng nhập họ và tên',
                    minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                  })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('phoneNumber', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Số điện thoại không hợp lệ'
                    }
                  })}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0901234567"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Thông Tin Lịch Hẹn
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Showroom <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('dealerId', { required: 'Vui lòng chọn showroom' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn showroom gần nhất --</option>
                  {dealers.map((dealer) => {
                    const dealerId = dealer.id || dealer.dealerId;
                    const dealerName = dealer.dealerName || dealer.name || 'Đại lý';
                    const address = dealer.address || dealer.location || dealer.city || '';
                    return (
                      <option key={dealerId} value={dealerId}>
                        {dealerName} - {address}
                      </option>
                    );
                  })}
                </select>
                {errors.dealerId && (
                  <p className="text-red-500 text-sm mt-1">{errors.dealerId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày hẹn <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('appointmentDate', {
                      required: 'Vui lòng chọn ngày',
                      validate: (value) => {
                        const selected = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return selected >= today || 'Ngày hẹn phải là hôm nay hoặc sau đó';
                      }
                    })}
                    type="date"
                    min={minDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.appointmentDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.appointmentDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ hẹn <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('appointmentTime', { required: 'Vui lòng chọn giờ' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!selectedDate}
                  >
                    <option value="">-- Chọn giờ --</option>
                    {getTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.appointmentTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.appointmentTime.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời lượng (phút) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('durationMinutes', { required: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="30">30 phút</option>
                  <option value="60">60 phút</option>
                  <option value="90">90 phút</option>
                  <option value="120">120 phút</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bất kỳ yêu cầu đặc biệt nào..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Xác Nhận Đặt Lịch
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestDriveBooking;
