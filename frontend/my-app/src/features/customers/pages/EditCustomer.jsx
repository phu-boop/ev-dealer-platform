import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiSave, FiX, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import customerService from "../../../services/customerService";
import { useAuthContext } from "../../../features/auth/AuthProvider";

const EditCustomer = () => {
  const { id } = useParams();
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
    status: "ACTIVE",
    preferredDealerId: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoadingCustomer(true);
        const data = await customerService.getCustomerById(id);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          idNumber: data.idNumber || "",
          customerType: data.customerType || "INDIVIDUAL",
          registrationDate: data.registrationDate ? data.registrationDate.split('T')[0] : "",
          status: data.status || "ACTIVE",
          preferredDealerId: data.preferredDealerId || null
        });
      } catch (err) {
        console.error("Error loading customer:", err);
        toast.error("Không thể tải thông tin khách hàng");
      } finally {
        setLoadingCustomer(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Họ là bắt buộc";
    if (!formData.lastName.trim()) newErrors.lastName = "Tên là bắt buộc";
    if (!formData.email.trim()) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Vui lòng kiểm tra lại thông tin"); return; }
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
        status: formData.status,
        preferredDealerId: formData.preferredDealerId || null
      };
      await customerService.updateCustomer(id, customerData);
      toast.success("Cập nhật khách hàng thành công");
      const base = roles?.includes("DEALER_MANAGER") ? '/dealer' : '/staff';
      navigate(`${base}/customers/list`);
    } catch (err) {
      console.error("Error updating customer:", err);
      const msg = err.response?.data?.message || "Không thể cập nhật khách hàng";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const base = roles?.includes("DEALER_MANAGER") ? '/dealer' : '/staff';
    navigate(`${base}/customers/list`);
  };

  if (loadingCustomer) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Chỉnh sửa Khách Hàng</h1>
              <p className="text-gray-600 flex items-center"><FiUser className="w-4 h-4 mr-2"/>Cập nhật hồ sơ khách hàng</p>
            </div>
            <button onClick={handleCancel} className="flex items-center px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300">
              <FiX className="w-5 h-5 mr-2"/>Hủy
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg"><FiUser className="w-5 h-5 text-white"/></div>
                Thông Tin Cơ Bản
              </h2>
              <p className="text-sm text-gray-500 mt-2 ml-13">Thông tin cá nhân của khách hàng</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-3.5 border rounded-xl ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} placeholder="Nguyễn" />
                </div>
                {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-3.5 border rounded-xl ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} placeholder="An" />
                </div>
                {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-3.5 border rounded-xl ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} placeholder="example@email.com" />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl" placeholder="0123 456 789" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số CMND/CCCD</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl" placeholder="001234567890" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại khách hàng</label>
                <div className="relative">
                  <select name="customerType" value={formData.customerType} onChange={handleInputChange} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl appearance-none">
                    <option value="INDIVIDUAL">Cá nhân</option>
                    <option value="CORPORATE">Doanh nghiệp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày đăng ký</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                <div className="relative">
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl appearance-none">
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                    <option value="BLOCKED">Bị khóa</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ đầy đủ</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea name="address" value={formData.address} onChange={handleInputChange} rows={4} className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl resize-none" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."></textarea>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6 flex justify-end gap-4">
            <button type="button" onClick={handleCancel} className="px-6 py-3 border-2 border-gray-300 rounded-xl">Hủy</button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl" disabled={loading}>
              {loading ? 'Đang lưu...' : (<><FiSave className="inline-block mr-2"/>Lưu thay đổi</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;
