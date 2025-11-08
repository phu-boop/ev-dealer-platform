import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../auth/AuthProvider";
import {
  getQuotationsByDealer,
  updateQuotationStatus,
  getMyQuotations,
} from "../services/salesService";
import { FiEye, FiCheck, FiX, FiEdit, FiUserPlus } from "react-icons/fi"; // Thêm FiUserPlus
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "../../../../components/ui/Loading";
import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { formatDate } from "../../../../utils/formatDate"; // import các ui và utils

const QuotationList = () => {
  const { roles, memberId, dealerId } = useAuthContext();
  const navigate = useNavigate();

  const isManager = roles.includes("DEALER_MANAGER");

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("PENDING"); // Mặc định lọc PENDING

  // Hàm fetch dữ liệu
  const fetchQuotations = async () => {
    // Cần memberId (cho Staff) hoặc dealerId (cho Manager)
    if (!memberId || !dealerId) {
      setError("Không tìm thấy thông tin người dùng/đại lý.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (isManager) {
        // Manager gọi API xem tất cả của đại lý
        response = await getQuotationsByDealer(dealerId, filterStatus);
      } else {
        // Staff gọi API chỉ xem của mình
        response = await getMyQuotations(memberId, filterStatus);
      }
      setQuotations(response.data);
    } catch (err) {
      console.error("Lỗi khi tải báo giá:", err);
      setError(
        "Không thể tải danh sách báo giá. " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc filter thay đổi
  useEffect(() => {
    fetchQuotations();
  }, [dealerId, memberId, filterStatus, isManager]);

  // Hàm xử lý duyệt/từ chối
  const handleUpdateStatus = async (id, newStatus) => {
    const actionText = newStatus === "APPROVED" ? "Duyệt" : "Từ chối";

    const result = await Swal.fire({
      title: `Xác nhận ${actionText}`,
      text: `Bạn có chắc muốn ${actionText.toLowerCase()} báo giá này?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Đồng ý ${actionText}`,
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    try {
      // Gọi API cập nhật
      await updateQuotationStatus(id, newStatus, roles[0]);
      Swal.fire("Thành công!", "Trạng thái đã được cập nhật.", "success");
      fetchQuotations();
    } catch (err) {
      Swal.fire(
        "Thất bại!",
        `Lỗi: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  };

  // Hàm xử lý sửa
  const handleEdit = (id) => {
    const basePath = roles.includes("DEALER_MANAGER")
      ? "/dealer/manager"
      : "/dealer/staff";
    navigate(`${basePath}/quotations/${id}/edit`); // <-- Sửa
  };

  // Hàm xử lý tạo mới
  const handleCreate = () => {
    const basePath = roles.includes("DEALER_MANAGER")
      ? "/dealer/manager"
      : "/dealer/staff";
    navigate(`${basePath}/quotations/new`); // <-- Sửa
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Báo giá</h1>

      {/* Bộ lọc Tab */}
      <div className="flex space-x-2 border-b border-gray-200 mb-4">
        {["PENDING", "APPROVED", "REJECTED", "DRAFT", "EXPIRED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`py-2 px-4 font-medium text-sm ${
                filterStatus === status
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Nút Tạo mới */}
      <div className="mb-4">
        <Button onClick={handleCreate} variant="primary">
          <FiUserPlus className="inline mr-2" /> Tạo Báo giá mới
        </Button>
      </div>

      {/* Hiển thị Loading hoặc Lỗi */}
      {loading && <Loading />}
      {error && <Alert message={error} type="error" />}

      {/* Bảng dữ liệu */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng (ID)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe (Variant ID)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotations.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy báo giá nào.
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.quotationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(quote.quotationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {quote.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {quote.variantId} (Model: {quote.modelId})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                      {formatCurrency(quote.finalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => navigate(quote.quotationId)} // <-- Sửa
                          title="Xem chi tiết"
                        >
                          <FiEye />
                        </Button>

                        {/* Nút Sửa */}
                        {((isManager &&
                          (quote.status === "PENDING" ||
                            quote.status === "DRAFT")) ||
                          (!isManager &&
                            quote.status === "DRAFT" &&
                            quote.staffId === memberId)) && (
                          <Button
                            variant="primary"
                            onClick={() => handleEdit(quote.quotationId)}
                            title="Chỉnh sửa"
                          >
                            <FiEdit />
                          </Button>
                        )}

                        {/* Nút Duyệt/Từ chối (CHỈ MANAGER & KHI PENDING) */}
                        {isManager && quote.status === "PENDING" && (
                          <>
                            <Button
                              variant="success"
                              onClick={() =>
                                handleUpdateStatus(
                                  quote.quotationId,
                                  "APPROVED"
                                )
                              }
                              title="Duyệt"
                            >
                              <FiCheck />
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() =>
                                handleUpdateStatus(
                                  quote.quotationId,
                                  "REJECTED"
                                )
                              }
                              title="Từ chối"
                            >
                              <FiX />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuotationList;
