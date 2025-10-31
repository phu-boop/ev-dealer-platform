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
  // --- THAY ĐỔI 2: Đổi tên state cho rõ nghĩa ---
  // Tên cũ: inventoryWithDetails
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

  // --- THAY ĐỔI 3: VIẾT LẠI HOÀN TOÀN HÀM FETCH DỮ LIỆU ---
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setMergedData({ content: [], totalPages: 0 }); // Xóa dữ liệu cũ

    try {
      // BƯỚC 1: Lấy "Danh Sách Chủ" (Master List) từ Vehicle Service
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

      // BƯỚC 3: Lấy "Dữ Liệu Phụ" (Inventory) từ Inventory Service
      const inventoryResponse = await getInventoryStatusByIds(variantIds);
      const inventoryList = inventoryResponse.data.data || [];

      // Tạo một Map để tra cứu tồn kho nhanh (key: variantId, value: {availableQuantity, ...})
      const inventoryMap = new Map(
        inventoryList.map((inv) => [inv.variantId, inv])
      );

      // BƯỚC 4: Gộp (Merge) hai danh sách
      const finalMergedContent = vehicleData.content.map((variant) => {
        const inventoryInfo = inventoryMap.get(variant.variantId);

        if (inventoryInfo) {
          // TÌM THẤY: Gộp thông tin xe (master) và thông tin kho (supplementary)
          return {
            ...variant, // (id, versionName, skuCode, color, brand, modelName...)
            ...inventoryInfo, // (availableQuantity, allocatedQuantity, status, reorderLevel...)
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

  // useEffect gọi fetch (giữ nguyên)
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
                        <td colSpan="7" className="p-4">
                          <h4 className="font-semibold mb-2">
                            Chi tiết tồn kho đại lý:
                          </h4>
                          {item.dealerStock && item.dealerStock.length > 0 ? (
                            <ul className="list-disc list-inside text-sm">
                              {item.dealerStock.map((dealer) => (
                                <li key={dealer.dealerId}>
                                  Đại lý #{dealer.dealerId}:{" "}
                                  <span className="font-semibold">
                                    {dealer.availableQuantity}
                                  </span>{" "}
                                  khả dụng /{" "}
                                  <span className="text-gray-600">
                                    {dealer.allocatedQuantity}
                                  </span>{" "}
                                  đã phân bổ
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">
                              Chưa có dữ liệu tồn kho ở đại lý.
                            </p>
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
