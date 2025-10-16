import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit } from "react-icons/fi";
import customerService from "../../../services/customerService";
import { useAuthContext } from "../../../features/auth/AuthProvider";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles } = useAuthContext();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

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
            <h3 className="text-sm font-semibold text-gray-500">Trạng thái</h3>
            <p className="mt-2">{customer.status}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Ngày đăng ký</h3>
            <p className="mt-2">{customer.registrationDate ? new Date(customer.registrationDate).toLocaleDateString('vi-VN') : ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
