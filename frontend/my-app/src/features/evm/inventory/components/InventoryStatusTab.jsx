import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiSliders,
  FiPlusCircle, // Dùng cho Nhập kho
  FiEdit, // Dùng cho Sửa ngưỡng
  FiChevronDown,
  FiNavigation, // Dùng cho Điều chuyển
} from "react-icons/fi";

import { getInventoryStatusByIds } from "../services/inventoryService";
import { getAllVariantsPaginated } from "../../catalog/services/vehicleCatalogService";

import TransactionModal from "./TransactionModal"; // Modal Nhập kho (RESTOCK)
import TransferRequestModal from "./TransferRequestModal"; // Modal Tạo Yêu Cầu Điều Chuyển
import ReorderLevelModal from "./ReorderLevelModal"; // Modal Sửa Ngưỡng

// Component để hiển thị badge trạng thái
const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = "Không xác định";
  switch (status) {
    case "IN_STOCK":
      colorClasses = "bg-green-100 text-green-800";
      text = "Còn hàng";
      break;
    case "LOW_STOCK":
      colorClasses = "bg-yellow-100 text-yellow-800";
      text = "Tồn kho thấp";
      break;
    case "OUT_OF_STOCK":
      colorClasses = "bg-red-100 text-red-800";
      text = "Hết hàng";
      break;
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const InventoryStatusTab = () => {
  const [mergedData, setMergedData] = useState({
    content: [],
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    dealerId: "", // (Lọc dealerId sẽ cần logic khác ở backend)
    status: "",
  });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // State cho Modals (giữ nguyên)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setMergedData({ content: [], totalPages: 0 }); // Xóa dữ liệu cũ

    try {
      const params = {
        search: filters.search,
        // status: filters.status, // Cần backend vehicle-service hỗ trợ filter status
        page: page,
        size: 10,
      };

      const vehicleResponse = await getAllVariantsPaginated(params);
      const vehicleData = vehicleResponse.data.data; // { content: [], totalPages: ... }

      if (!vehicleData || vehicleData.content.length === 0) {
        // Không tìm thấy xe nào trong danh mục
        setIsLoading(false);
        return;
      }

      // BƯỚC 2: Lấy danh sách ID từ Bước 1
      const variantIds = vehicleData.content.map(
        (variant) => variant.variantId
      );

      const inventoryResponse = await getInventoryStatusByIds(variantIds);
      const inventoryList = inventoryResponse.data.data || [];

      // Tạo một Map để tra cứu tồn kho nhanh (key: variantId, value: {availableQuantity, ...})
      const inventoryMap = new Map(
        inventoryList.map((inv) => [inv.variantId, inv])
      );

      const finalMergedContent = vehicleData.content.map((variant) => {
        const inventoryInfo = inventoryMap.get(variant.variantId);

        if (inventoryInfo) {
          return {
            variantId: variant.variantId,
            versionName: variant.versionName,
            modelName: variant.modelName,
            color: variant.color,
            skuCode: variant.skuCode,
            price: variant.price,
            status: inventoryInfo.status,

            imageUrl: variant.imageUrl,
            wholesalePrice: variant.wholesalePrice,
            batteryCapacity: variant.batteryCapacity,
            chargingTime: variant.chargingTime,
            rangeKm: variant.rangeKm,
            motorPower: variant.motorPower,
            features: variant.features,
            brand: variant.brand,

            // Chỉ lấy các thông tin về số lượng/tồn kho từ 'inventoryInfo'
            totalQuantity: inventoryInfo.totalQuantity,
            allocatedQuantity: inventoryInfo.allocatedQuantity,
            availableQuantity: inventoryInfo.availableQuantity,
            reorderLevel: inventoryInfo.reorderLevel,
            inventoryStatus: inventoryInfo.status, // Đổi tên để tránh trùng với variant.status
          };
        } else {
          // KHÔNG TÌM THẤY (Xe mới, chưa nhập kho):
          // Trả về thông tin xe + tồn kho mặc định là 0
          return {
            ...variant,
            availableQuantity: 0,
            allocatedQuantity: 0,
            totalQuantity: 0,
            reorderLevel: 0,
            status: "OUT_OF_STOCK", // Mặc định là hết hàng
            dealerStock: [], // (Nếu DTO của bạn có trường này)
          };
        }
      });

      // BƯỚC 5: Cập nhật State
      setMergedData({
        content: finalMergedContent,
        totalPages: vehicleData.totalPages,
      });
    } catch (error) {
      console.error("Failed to fetch merged inventory data", error);
      setMergedData({ content: [], totalPages: 0 }); // Đặt lại về rỗng nếu lỗi
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]); // Phụ thuộc vào filters và page

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleFilterChange = (e) => {
    setPage(0);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const toggleRow = (variantId) => {
    const newSet = new Set(expandedRows);
    newSet.has(variantId) ? newSet.delete(variantId) : newSet.add(variantId);
    setExpandedRows(newSet);
  };

  const openRestockModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsRestockModalOpen(true);
  };

  const openTransferModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsTransferModalOpen(true);
  };

  const openReorderModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsReorderModalOpen(true);
  };

  // Hàm đóng chung cho tất cả
  const closeModal = () => {
    setIsRestockModalOpen(false);
    setIsTransferModalOpen(false);
    setIsReorderModalOpen(false);
    setSelectedVariantId(null);
  };

  return (
    <div>
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          name="search"
          onChange={handleFilterChange}
          placeholder="Tìm theo tên xe, SKU..."
          className="p-2 border rounded-lg md:col-span-2"
        />
        <select
          name="dealerId"
          onChange={handleFilterChange}
          className="p-2 border rounded-lg"
        >
          <option value="">Tất cả đại lý</option>
          {/* TODO: Cần API để lấy danh sách đại lý */}
        </select>
        <select
          name="status"
          onChange={handleFilterChange}
          className="p-2 border rounded-lg"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="IN_STOCK">Còn hàng</option>
          <option value="LOW_STOCK">Tồn kho thấp</option>
          <option value="OUT_OF_STOCK">Hết hàng</option>
        </select>
      </div>

      {/* Bảng dữ liệu */}
      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase">
                <th className="p-3 w-12"></th>
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-center">Kho TT khả dụng</th>
                <th className="p-3 text-center">Đã phân bổ</th>
                <th className="p-3 text-center">Tổng số lượng</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.content.map(
                (
                  item // <-- Tự động dùng dữ liệu đã gộp
                ) => (
                  <React.Fragment key={item.variantId}>
                    <tr className="border-b hover:bg-gray-50">
                      <td
                        className="p-3 text-center cursor-pointer"
                        onClick={() => toggleRow(item.variantId)}
                      >
                        <FiChevronDown
                          className={`transition-transform ${
                            expandedRows.has(item.variantId) ? "rotate-180" : ""
                          }`}
                        />
                      </td>

                      {/* Các cột này giờ sẽ CÓ thông tin từ vehicle-service */}
                      <td className="p-3">
                        <p className="font-semibold text-gray-800">
                          {item.modelName} - {item.versionName} - {item.color}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {item.skuCode} | Brand: {item.brand}
                        </p>
                      </td>

                      {/* Các cột này CÓ thông tin từ inventory-service (kể cả khi là 0) */}
                      <td className="p-3 text-center text-lg font-bold text-green-600">
                        {item.availableQuantity}
                      </td>
                      <td className="p-3 text-center text-gray-600">
                        {item.allocatedQuantity}
                      </td>
                      <td className="p-3 text-center font-semibold text-blue-600">
                        {item.totalQuantity}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openRestockModal(item.variantId)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                          title="Nhập kho (Restock)"
                        >
                          <FiPlusCircle />
                        </button>
                        <button
                          onClick={() => openTransferModal(item.variantId)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-full"
                          title="Tạo Yêu Cầu Điều Chuyển"
                        >
                          <FiNavigation />
                        </button>
                        <button
                          onClick={() => openReorderModal(item.variantId)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"
                          title="Cập nhật ngưỡng"
                        >
                          <FiEdit />
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(item.variantId) && (
                      <tr className="bg-gray-100">
                        <td colSpan="7" className="p-4 text-sm">
                          {" "}
                          {/* Tăng colspan lên 7 */}
                          <h4 className="font-semibold mb-2 text-gray-700">
                            Thông số kỹ thuật chi tiết:
                          </h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {/* Hiển thị các thông số */}
                            {item.rangeKm != null && ( // Kiểm tra null trước khi hiển thị
                              <div>
                                <span className="text-gray-500">
                                  Quãng đường:
                                </span>
                                <span className="font-medium ml-1">
                                  {item.rangeKm} km
                                </span>
                              </div>
                            )}
                            {item.motorPower != null && (
                              <div>
                                <span className="text-gray-500">
                                  Công suất:
                                </span>
                                <span className="font-medium ml-1">
                                  {item.motorPower} W
                                </span>{" "}
                                {/* Hoặc đơn vị phù hợp */}
                              </div>
                            )}
                            {item.batteryCapacity != null && (
                              <div>
                                <span className="text-gray-500">
                                  Dung lượng pin:
                                </span>
                                <span className="font-medium ml-1">
                                  {item.batteryCapacity} kWh
                                </span>{" "}
                                {/* Hoặc đơn vị phù hợp */}
                              </div>
                            )}
                            {item.chargingTime != null && (
                              <div>
                                <span className="text-gray-500">
                                  Thời gian sạc:
                                </span>
                                <span className="font-medium ml-1">
                                  {item.chargingTime} giờ
                                </span>{" "}
                                {/* Hoặc đơn vị phù hợp */}
                              </div>
                            )}
                            {item.price != null && (
                              <div>
                                <span className="text-gray-500">
                                  Giá bán lẻ:
                                </span>
                                <span className="font-medium ml-1">
                                  {item.price.toLocaleString("vi-VN")} VNĐ
                                </span>
                              </div>
                            )}
                            {item.wholesalePrice != null && (
                              <div>
                                <span className="text-gray-500">
                                  Giá bán sỉ:
                                </span>
                                <span className="font-medium ml-1">
                                  {item.wholesalePrice.toLocaleString("vi-VN")}{" "}
                                  VNĐ
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Hiển thị danh sách tính năng (features) nếu có */}
                          {item.features && item.features.length > 0 && (
                            <div className="mt-2">
                              <h5 className="font-semibold text-gray-600 mb-1">
                                Tính năng:
                              </h5>
                              <ul className="list-disc list-inside text-gray-600">
                                {item.features.map((feature) => (
                                  <li key={feature.featureId}>
                                    {feature.featureName}
                                    {feature.additionalCost > 0 &&
                                      ` (+${feature.additionalCost.toLocaleString(
                                        "vi-VN"
                                      )} VNĐ)`}
                                    {!feature.standard && " (Tùy chọn)"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {isRestockModalOpen && (
        <TransactionModal
          isOpen={isRestockModalOpen}
          onClose={closeModal}
          onSuccess={fetchInventory}
          variantId={selectedVariantId}
        />
      )}
      {isTransferModalOpen && (
        <TransferRequestModal
          isOpen={isTransferModalOpen}
          onClose={closeModal}
          onSuccess={fetchInventory} // Tải lại kho sau khi tạo yêu cầu
          variantId={selectedVariantId}
        />
      )}
      {isReorderModalOpen && (
        <ReorderLevelModal
          isOpen={isReorderModalOpen}
          onClose={closeModal}
          onSuccess={fetchInventory}
          variantId={selectedVariantId}
        />
      )}

      {/* <Pagination currentPage={page} totalPages={inventoryWithDetails.totalPages} onPageChange={setPage} /> */}
    </div>
  );
};

export default InventoryStatusTab;
