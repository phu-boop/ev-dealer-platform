import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiClock, FiUser } from "react-icons/fi";
import customerService from "../../../services/customerService";
import { useAuthContext } from "../../../features/auth/AuthProvider";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles } = useAuthContext();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const data = await customerService.getCustomerById(id);
        setCustomer(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const loadAuditHistory = async () => {
    try {
      setLoadingAudit(true);
      const audits = await customerService.getCustomerAuditHistory(id);
      setAuditHistory(audits);
      setShowAudit(true);
    } catch (err) {
      console.error("Error loading audit history:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const parseChanges = (changesJson) => {
    try {
      const parsed = JSON.parse(changesJson);
      console.log("Parsed changes:", parsed);
      console.log("Number of fields changed:", Object.keys(parsed).length);
      return parsed;
    } catch (e) {
      console.error("Error parsing changes JSON:", e);
      return {};
    }
  };

  const formatFieldName = (field) => {
    const fieldNames = {
      firstName: "Họ",
      lastName: "Tên",
      email: "Email",
      phone: "Số điện thoại",
      address: "Địa chỉ",
      idNumber: "CMND/CCCD",
      customerType: "Loại khách hàng",
      status: "Trạng thái"
    };
    return fieldNames[field] || field;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "null") return "Trống";
    
    // Format status enum
    const statusMap = {
      NEW: "Khách hàng mới",
      POTENTIAL: "Tiềm năng",
      PURCHASED: "Đã mua xe",
      INACTIVE: "Không hoạt động"
    };
    
    // Format customer type enum
    const typeMap = {
      INDIVIDUAL: "Cá nhân",
      CORPORATE: "Doanh nghiệp"
    };
    
    if (statusMap[value]) return statusMap[value];
    if (typeMap[value]) return typeMap[value];
    
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!customer) return <div className="p-6">Không tìm thấy khách hàng</div>;

  const base = roles?.includes("DEALER_MANAGER") ? '/dealer' : '/staff';

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h2>
            <p className="text-sm text-gray-500">{customer.customerCode}</p>
          </div>
          <div>
            <button onClick={() => navigate(`${base}/customers/${id}/edit`)} className="px-4 py-2 bg-green-600 text-white rounded-xl">Chỉnh sửa</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Liên hệ</h3>
            <p className="mt-2"><FiMail className="inline mr-2"/>{customer.email}</p>
            <p className="mt-2"><FiPhone className="inline mr-2"/>{customer.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Địa chỉ</h3>
            <p className="mt-2"><FiMapPin className="inline mr-2"/>{customer.address}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">CMND/CCCD</h3>
            <p className="mt-2"><FiUser className="inline mr-2"/>{customer.idNumber || 'Chưa cập nhật'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Ngày đăng ký</h3>
            <p className="mt-2"><FiCalendar className="inline mr-2"/>{customer.registrationDate ? new Date(customer.registrationDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Loại khách hàng</h3>
            <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full ${
              customer.customerType === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' :
              customer.customerType === 'CORPORATE' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {customer.customerType === 'INDIVIDUAL' ? 'Cá nhân' :
               customer.customerType === 'CORPORATE' ? 'Doanh nghiệp' :
               customer.customerType}
            </span>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Trạng thái</h3>
            <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full ${
              customer.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
              customer.status === 'POTENTIAL' ? 'bg-yellow-100 text-yellow-800' :
              customer.status === 'PURCHASED' ? 'bg-green-100 text-green-800' :
              customer.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
              customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {customer.status === 'NEW' ? 'Khách hàng mới' :
               customer.status === 'POTENTIAL' ? 'Khách hàng tiềm năng' :
               customer.status === 'PURCHASED' ? 'Đã mua xe' :
               customer.status === 'INACTIVE' ? 'Không hoạt động' :
               customer.status === 'ACTIVE' ? 'Hoạt động' :
               customer.status === 'BLOCKED' ? 'Bị khóa' :
               customer.status}
            </span>
          </div>
        </div>

        {/* Audit History Section */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiClock className="w-5 h-5 mr-2" />
              Lịch sử chỉnh sửa
            </h3>
            <button
              onClick={loadAuditHistory}
              disabled={loadingAudit}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loadingAudit ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tải...
                </>
              ) : (
                <>
                  <FiClock className="w-4 h-4 mr-2" />
                  {showAudit ? 'Tải lại' : 'Xem lịch sử'}
                </>
              )}
            </button>
          </div>

          {showAudit && (
            <div className="space-y-3">
              {auditHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiClock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có lịch sử chỉnh sửa</p>
                </div>
              ) : (
                auditHistory.map((audit) => {
                  const changes = parseChanges(audit.changesJson);
                  return (
                    <div key={audit.auditId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUser className="w-4 h-4 mr-2" />
                          <span className="font-semibold">{audit.changedBy || 'Hệ thống'}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          {new Date(audit.changedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        {Object.entries(changes).map(([field, change]) => (
                          <div key={field} className="flex items-start text-sm">
                            <span className="font-semibold text-gray-700 min-w-[120px]">
                              {formatFieldName(field)}:
                            </span>
                            <div className="flex-1">
                              <span className="text-red-600 line-through mr-2">
                                {formatValue(change.old)}
                              </span>
                              <span className="text-gray-400 mr-2">→</span>
                              <span className="text-green-600 font-semibold">
                                {formatValue(change.new)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
