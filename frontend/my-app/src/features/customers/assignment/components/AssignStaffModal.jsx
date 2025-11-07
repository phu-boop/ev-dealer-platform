import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX, FiUser, FiUsers, FiFileText, FiAlertCircle, FiCheck } from "react-icons/fi";
import PropTypes from "prop-types";
import staffService from "../services/staffService";
import customerService from "../../management/services/customerService";

const AssignStaffModal = ({ isOpen, onClose, customer, onAssignSuccess }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [formData, setFormData] = useState({
    staffId: "",
    notes: ""
  });

  // Lấy dealerId từ session hoặc user context
  const dealerId = sessionStorage.getItem('dealerId') || sessionStorage.getItem('profileId');

  useEffect(() => {
    if (isOpen && dealerId) {
      fetchStaffList();
    }
    // Reset form khi mở modal
    if (isOpen) {
      setFormData({
        staffId: customer?.assignedStaffId || "",
        notes: ""
      });
    }
  }, [isOpen, dealerId, customer]);

  const fetchStaffList = async () => {
    setLoadingStaff(true);
    try {
      console.log("=== DEBUG: Fetching staff for dealerId:", dealerId);
      const data = await staffService.getStaffByDealerId(dealerId);
      console.log("=== DEBUG: Received staff list:", data);
      console.log("=== DEBUG: First staff object:", data[0]);
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Không thể tải danh sách nhân viên: " + (error.response?.data?.message || error.message));
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staffId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    setLoading(true);
    try {
      await customerService.assignStaffToCustomer(customer.customerId, {
        staffId: formData.staffId,
        notes: formData.notes || ""
      });

      toast.success("Phân công nhân viên thành công!");
      
      // Gọi callback để refresh data
      if (onAssignSuccess) {
        onAssignSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error assigning staff:", error);
      const errorMessage = error.response?.data?.message || "Không thể phân công nhân viên. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy phân công nhân viên này?")) {
      return;
    }

    setLoading(true);
    try {
      await customerService.unassignStaffFromCustomer(customer.customerId);
      toast.success("Đã hủy phân công nhân viên!");
      
      if (onAssignSuccess) {
        onAssignSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error unassigning staff:", error);
      toast.error("Không thể hủy phân công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Phân Công Nhân Viên</h2>
              <p className="text-blue-100 text-sm">
                {customer?.firstName} {customer?.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            disabled={loading}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Customer Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center text-sm text-blue-800">
              <FiUser className="w-4 h-4 mr-2" />
              <span className="font-semibold">Khách hàng:</span>
              <span className="ml-2">
                {customer?.firstName} {customer?.lastName} ({customer?.email})
              </span>
            </div>
            {customer?.assignedStaffId && (
              <div className="flex items-center text-sm text-blue-700 mt-2">
                <FiAlertCircle className="w-4 h-4 mr-2" />
                <span>Nhân viên hiện tại đã được phân công. Chọn nhân viên mới để thay đổi.</span>
              </div>
            )}
          </div>

          {/* Staff Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn Nhân Viên <span className="text-red-500">*</span>
            </label>
            {loadingStaff ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải danh sách nhân viên...</span>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                <FiAlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800">Không tìm thấy nhân viên nào</p>
              </div>
            ) : (
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={formData.staffId}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    console.log("=== DEBUG: Selected staff ID (UUID):", selectedValue);
                    setFormData({ ...formData, staffId: selectedValue });
                  }}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map((staff) => (
                    <option key={staff.staffId} value={staff.staffId}>
                      {staff.fullName || staff.name || 'N/A'} ({staff.email})
                      {staff.position ? ` - ${staff.position}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi Chú (Tùy chọn)
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                placeholder="Thêm ghi chú về phân công này..."
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
            <FiCheck className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">Thông báo tự động</p>
              <p>Nhân viên được chọn sẽ nhận thông báo qua Firebase Notification về khách hàng được phân công.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {customer?.assignedStaffId && (
              <button
                type="button"
                onClick={handleUnassign}
                className="flex-1 px-6 py-3.5 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-300 flex items-center justify-center font-semibold disabled:opacity-50"
                disabled={loading}
              >
                <FiX className="w-5 h-5 mr-2" />
                Hủy Phân Công
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center font-semibold disabled:opacity-50"
              disabled={loading}
            >
              <FiX className="w-5 h-5 mr-2" />
              Đóng
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              disabled={loading || loadingStaff || staffList.length === 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5 mr-2" />
                  {customer?.assignedStaffId ? "Cập Nhật" : "Phân Công"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AssignStaffModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.object,
  onAssignSuccess: PropTypes.func
};

export default AssignStaffModal;
