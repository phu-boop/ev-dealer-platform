import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { executeTransaction } from "../services/inventoryService";
import { useAuthContext } from "../../../../features/auth/AuthProvider";

const TransactionModal = ({ isOpen, onClose, onSuccess, variantId }) => {
  const { email } = useAuthContext();
  // Khởi tạo state cho form
  const initialFormState = {
    transactionType: "RESTOCK",
    variantId: variantId, // Lấy từ props
    quantity: "",
    fromDealerId: null,
    toDealerId: null,
    notes: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Chuẩn bị payload, chuyển đổi các giá trị số
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        fromDealerId: formData.fromDealerId
          ? Number(formData.fromDealerId)
          : null,
        toDealerId: formData.toDealerId ? Number(formData.toDealerId) : null,
        staffId: email, // email của người thực hiện giao dịch này (có thể là id, name,... trong AuthProvide)
      };

      await executeTransaction(payload);
      alert("Thực hiện giao dịch thành công!");
      onSuccess(); // Gọi hàm để tải lại dữ liệu ở trang chính
      onClose(); // Đóng modal
    } catch (err) {
      setError(
        err.response?.data?.message || "Giao dịch thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Thực Hiện Giao Dịch Kho</h3>
              <p className="text-sm text-gray-500">
                Cho sản phẩm có Variant ID: {variantId}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại giao dịch
              </label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={(e) =>
                  setFormData({ ...formData, transactionType: e.target.value })
                }
                className="p-2 border rounded-lg w-full"
              >
                <option value="RESTOCK">Nhập hàng vào kho trung tâm</option>
                <option value="TRANSFER_TO_DEALER">
                  Điều chuyển đến đại lý
                </option>
              </select>
            </div>

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="Số lượng*"
              required
              className="p-2 border rounded-lg w-full"
            />

            {/* Hiển thị ô nhập ID Đại lý tùy theo loại giao dịch */}
            {formData.transactionType === "TRANSFER_TO_DEALER" && (
              <input
                type="number"
                name="toDealerId"
                value={formData.toDealerId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, toDealerId: e.target.value })
                }
                placeholder="ID Đại lý nhận*"
                required
                className="p-2 border rounded-lg w-full"
              />
            )}

            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Ghi chú (tùy chọn)"
              className="p-2 border rounded-lg w-full h-24"
            ></textarea>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
