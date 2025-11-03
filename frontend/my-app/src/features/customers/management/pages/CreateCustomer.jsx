import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiSave, FiX,
  FiCheck, FiAlertCircle, FiChevronDown, FiUsers
} from "react-icons/fi";
import customerService from "../services/customerService";
import staffService from "../../assignment/services/staffService";
import { useAuthContext } from "../../../auth/AuthProvider";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const { roles } = useAuthContext();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    idNumber: "",
    customerType: "INDIVIDUAL",
    registrationDate: "",
    assignedStaffId: "", // Thêm field phân công nhân viên
    // status không cần thiết khi tạo mới - backend tự động set = NEW
    preferredDealerId: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  // Check if user is DEALER_MANAGER
  const isDealerManager = roles?.includes('DEALER_MANAGER');
  const dealerId = sessionStorage.getItem('dealerId') || sessionStorage.getItem('profileId');

  // Load staff list when component mounts
  useEffect(() => {
    if (isDealerManager && dealerId) {
      fetchStaffList();
    }
  }, [isDealerManager, dealerId]);

  const fetchStaffList = async () => {
    setLoadingStaff(true);
    try {
      console.log("=== DEBUG Frontend: Fetching staff for dealerId:", dealerId);
      const data = await staffService.getStaffByDealerId(dealerId);
      console.log("=== DEBUG Frontend: Received staff list:", data);
      console.log("=== DEBUG Frontend: First staff object:", data[0]);
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      console.error("Error details:", error.response?.data);
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Họ là bắt buộc";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Tên là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);
    try {
      const customerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        idNumber: formData.idNumber || null,
        customerType: formData.customerType,
        registrationDate: formData.registrationDate || null,
        assignedStaffId: formData.assignedStaffId || null, // Thêm assignedStaffId
        // Không truyền status - backend tự động set = NEW
        preferredDealerId: formData.preferredDealerId || null
      };

      const newCustomer = await customerService.createCustomer(customerData);
      
      // Nếu có phân công nhân viên, gọi API phân công
      if (formData.assignedStaffId && newCustomer.customerId) {
        try {
          await customerService.assignStaffToCustomer(newCustomer.customerId, {
            staffId: formData.assignedStaffId,
            notes: "Phân công khi tạo khách hàng mới"
          });
          toast.success("Thêm khách hàng và phân công nhân viên thành công!");
        } catch (assignError) {
          console.error("Error assigning staff:", assignError);
          toast.warning("Khách hàng đã được tạo nhưng không thể phân công nhân viên");
        }
      } else {
        toast.success("Thêm khách hàng thành công!");
      }
      
      // Navigate based on role
      const base = roles?.includes("DEALER_MANAGER") ? '/dealer/manager' : '/dealer/staff';
      navigate(`${base}/customers/list`);
    } catch (error) {
      console.error("Error creating customer:", error);
      const errorMessage = error.response?.data?.message || "Không thể thêm khách hàng. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dealer/customers/list");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Thêm Khách Hàng Mới
              </h1>
              <p className="text-gray-600 flex items-center">
                <FiUser className="w-4 h-4 mr-2" />
                Nhập thông tin chi tiết của khách hàng
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300"
            >
              <FiX className="w-5 h-5 mr-2" />
              Hủy
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                Thông Tin Cơ Bản
              </h2>
              <p className="text-sm text-gray-500 mt-2 ml-13">Thông tin cá nhân của khách hàng</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white ${
                      errors.firstName ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Nguyễn Văn"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg">
                    <FiAlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white ${
                      errors.lastName ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="An"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg">
                    <FiAlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white ${
                      errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg">
                    <FiAlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    placeholder="0123 456 789"
                  />
                </div>
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số CMND/CCCD
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    placeholder="001234567890"
                  />
                </div>
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại khách hàng
                </label>
                <div className="relative">
                  <select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                  >
                    <option value="INDIVIDUAL">Cá nhân</option>
                    <option value="CORPORATE">Doanh nghiệp</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Registration Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày đăng ký
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start">
              <FiAlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Lưu ý:</p>
                <p>Khách hàng mới sẽ tự động được gán trạng thái <span className="font-bold">"Khách hàng mới"</span>. Bạn có thể cập nhật trạng thái sau khi tạo.</p>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <FiMapPin className="w-5 h-5 text-white" />
                </div>
                Địa Chỉ
              </h2>
              <p className="text-sm text-gray-500 mt-2 ml-13">Địa chỉ liên lạc của khách hàng</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa chỉ đầy đủ
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                />
              </div>
            </div>
          </div>

          {/* Staff Assignment Card - Only for Dealer Manager */}
          {isDealerManager && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <FiUsers className="w-5 h-5 text-white" />
                  </div>
                  Phân Công Nhân Viên
                </h2>
                <p className="text-sm text-gray-500 mt-2 ml-13">Chọn nhân viên phụ trách khách hàng (không bắt buộc)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nhân viên được phân công
                </label>
                <div className="relative">
                  <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="assignedStaffId"
                    value={formData.assignedStaffId}
                    onChange={handleInputChange}
                    disabled={loadingStaff}
                    className="w-full pl-10 pr-10 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white appearance-none"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {staffList.map((staff) => (
                      <option key={staff.staffId} value={staff.staffId}>
                        {staff.fullName || staff.name || 'N/A'} ({staff.email})
                        {staff.position ? ` - ${staff.position}` : ''}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
                {loadingStaff && (
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Đang tải danh sách nhân viên...
                  </p>
                )}
                {!loadingStaff && staffList.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600 flex items-center bg-amber-50 px-3 py-2 rounded-lg">
                    <FiAlertCircle className="w-4 h-4 mr-1" />
                    Không có nhân viên nào trong đại lý
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center font-semibold"
                disabled={loading}
              >
                <FiX className="w-5 h-5 mr-2" />
                Hủy
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5 mr-2" />
                    Lưu Khách Hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;
