import React, { useState } from "react";
import { FiX, FiPackage, FiChevronsRight } from "react-icons/fi";
import { shipB2BOrder } from "../services/evmSalesService"; // Import API

/**
 * Modal để EVM Staff nhập số VIN và thực hiện giao hàng.
 * @param {object} order - Toàn bộ đối tượng đơn hàng (SalesOrder)
 */
const ShipmentModal = ({ isOpen, onClose, order }) => {
  // State để lưu trữ các số VIN được nhập,
  // ví dụ: { 4: "VIN1\nVIN2", 5: "VIN3\nVIN4" }
  const [vinInputs, setVinInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Xử lý khi nội dung textarea (danh sách VIN) thay đổi
  const handleVinChange = (variantId, textValue) => {
    setVinInputs((prev) => ({
      ...prev,
      [variantId]: textValue,
    }));
  };

  // Hàm xử lý gửi đi
  const handleSubmitShipment = async () => {
    setIsLoading(true);
    setError("");

    // 1. Phân tích và xác thực dữ liệu VIN
    const items = [];
    for (const item of order.orderItems) {
      const variantId = item.variantId; // Lấy ID từ OrderItem
      const requiredQuantity = item.quantity;

      const vinText = vinInputs[variantId] || "";
      // Tách các VIN bằng cách xuống dòng, xóa các dòng trống
      const vins = vinText
        .split("\n")
        .map((vin) => vin.trim())
        .filter((vin) => vin);

      // 2. So sánh số lượng
      if (vins.length !== requiredQuantity) {
        setError(
          `Lỗi: Sản phẩm (ID: ${variantId}) yêu cầu ${requiredQuantity} VIN, nhưng bạn đã nhập ${vins.length}.`
        );
        setIsLoading(false);
        return;
      }

      items.push({ variantId, vins });
    }

    // 3. Tạo payload (ShipmentRequestDto) để gửi lên backend
    const shipmentData = {
      orderId: order.orderId,
      dealerId: order.dealerId,
      items: items,
    };

    // 4. Gọi API
    try {
      await shipB2BOrder(order.orderId, shipmentData);
      alert("Giao hàng thành công!");
      onClose(true); // Đóng modal và báo hiệu đã giao hàng (true)
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi giao hàng");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Xác Nhận Xuất Kho & Giao Hàng</h3>
            <p className="text-sm text-gray-500">Đơn hàng: {order.orderId}</p>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        {/* Danh sách các xe cần nhập VIN */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {order.orderItems.map((item) => (
            <div key={item.variantId} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">
                    {item.versionName} - {item.color} (Tên sẽ lấy từ API gộp)
                  </p>
                  <p className="text-sm text-gray-500">
                    SKU: {item.skuCode} (Tên sẽ lấy từ API gộp)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">{item.quantity}</p>
                  <p className="text-sm text-gray-500">Chiếc</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập {item.quantity} số VIN (mỗi VIN một dòng):
                </label>
                <textarea
                  value={vinInputs[item.variantId] || ""}
                  onChange={(e) =>
                    handleVinChange(item.variantId, e.target.value)
                  }
                  rows={item.quantity > 5 ? 5 : item.quantity}
                  placeholder="Quét hoặc dán số VIN vào đây..."
                  className="w-full p-2 border rounded-lg font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Đã nhập:{" "}
                  {vinInputs[item.variantId]?.split("\n").filter(Boolean)
                    .length || 0}{" "}
                  / {item.quantity}
                </p>
              </div>
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmitShipment}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
          >
            {isLoading ? "Đang xử lý..." : "Xác Nhận Giao Hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentModal;
