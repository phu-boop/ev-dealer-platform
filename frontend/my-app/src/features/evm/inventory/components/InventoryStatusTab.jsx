import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiSliders,
  FiPlusCircle, // Dùng cho Nhập kho
  FiEdit, // Dùng cho Sửa ngưỡng
  FiChevronDown,
  FiNavigation, // Dùng cho Điều chuyển
  FiFilter,
  FiLoader,
} from "react-icons/fi";

import {
  getInventoryStatusByIds,
  getAvailableVins,
} from "../services/inventoryService";
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

  // Map<variantId, string[]>
  const [vinsMap, setVinsMap] = useState(new Map());
  // variantId đang được tải
  const [loadingVins, setLoadingVins] = useState(null);

  // State cho Modals (giữ nguyên)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setMergedData({ content: [], totalPages: 0 }); // Xóa dữ liệu cũ

    try {
      // Lấy "Danh Sách Chủ" (Master List) từ Vehicle Service
      const params = {
        search: filters.search,
        status: filters.status,
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

      // Lấy danh sách ID từ Bước 1
      const variantIds = vehicleData.content.map(
        (variant) => variant.variantId
      );

      // Lấy "Dữ Liệu Phụ" (Inventory) từ Inventory Service
      const inventoryResponse = await getInventoryStatusByIds(variantIds);
      const inventoryList = inventoryResponse.data.data || [];

      // Tạo một Map để tra cứu tồn kho nhanh (key: variantId, value: {availableQuantity, ...})
      const inventoryMap = new Map(
        inventoryList.map((inv) => [inv.variantId, inv])
      );

      // Gộp (Merge) hai danh sách
      const finalMergedContent = vehicleData.content.map((variant) => {
        const inventoryInfo = inventoryMap.get(variant.variantId);

        if (inventoryInfo) {
          // Lấy thông tin xe (có skuCode, name, specs...)
          const vehicleDetails = { ...variant };

          // Lấy thông tin kho (chỉ lấy các trường cần thiết)
          const {
            availableQuantity,
            allocatedQuantity,
            totalQuantity,
            reorderLevel,
            status, // Đây là status: "IN_STOCK"
          } = inventoryInfo;

          // Gộp lại
          return {
            ...vehicleDetails, // Lấy mọi thứ từ 'variant' (bao gồm skuCode)

            // Ghi đè CÁC TRƯỜNG KHO CỤ THỂ từ 'inventoryInfo'
            availableQuantity,
            allocatedQuantity,
            totalQuantity,
            reorderLevel,
            status, // status: "IN_STOCK" sẽ ghi đè status: "IN_PRODUCTION"

            dealerStock: [],
          };
        } else {
          // KHÔNG TÌM THẤY (Xe mới)
          return {
            ...variant,
            availableQuantity: 0,
            allocatedQuantity: 0,
            totalQuantity: 0,
            reorderLevel: 0,
            status: "OUT_OF_STOCK",
            dealerStock: [],
          };
        }
      });

      // Cập nhật State
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

  const fetchVinsForVariant = async (variantId) => {
    setLoadingVins(variantId);
    try {
      const response = await getAvailableVins(variantId);
      const vins = response.data.data || [];
      setVinsMap((prevMap) => new Map(prevMap).set(variantId, vins));
    } catch (error) {
      console.error("Failed to fetch VINs", error);
      setVinsMap((prevMap) => new Map(prevMap).set(variantId, [])); // Lưu mảng rỗng nếu lỗi
    } finally {
      setLoadingVins(null);
    }
  };

  const toggleRow = (variantId) => {
    const newSet = new Set(expandedRows);

    if (newSet.has(variantId)) {
      newSet.delete(variantId); // Chỉ đóng lại
    } else {
      newSet.add(variantId); // Mở ra
      // Nếu chưa có data VINs VÀ không đang tải, thì gọi API
      if (!vinsMap.has(variantId) && loadingVins !== variantId) {
        fetchVinsForVariant(variantId);
      }
    }
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
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="search"
            onChange={handleFilterChange}
            placeholder="Tìm theo tên xe, SKU..."
            className="p-2 pl-10 border rounded-lg w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="IN_STOCK">Còn hàng</option>
            <option value="LOW_STOCK">Tồn kho thấp</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
          </select>
        </div>
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
                <th className="p-3 text-center">Đang chờ xuất</th>
                <th className="p-3 text-center">Tổng số lượng</th>
                <th className="p-3 text-center">Ngưỡng (TT)</th>
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
                      <td className="p-3 text-center text-yellow-700 font-medium">
                        {item.reorderLevel}
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
                      <tr className="bg-gray-50 border-b">
                        <td colSpan="8" className="p-4">
                          <div className="p-4 bg-white rounded shadow-inner border">
                            <h4 className="font-semibold mb-2 text-gray-800">
                              Các số VIN khả dụng (Kho Trung tâm):
                            </h4>

                            {/* 1. Trạng thái đang tải VINs */}
                            {loadingVins === item.variantId && (
                              <div className="flex items-center text-gray-500">
                                <FiLoader className="animate-spin mr-2" />
                                Đang tải VINs...
                              </div>
                            )}

                            {/* 2. Trạng thái đã tải xong (hoặc chưa tải) */}
                            {loadingVins !== item.variantId &&
                              (() => {
                                const vins = vinsMap.get(item.variantId);

                                // 2a. Chưa có dữ liệu (chưa kịp tải)
                                if (!vins) {
                                  return (
                                    <p className="text-sm text-gray-500">
                                      Đang chờ tải...
                                    </p>
                                  );
                                }

                                // 2b. Không tìm thấy VIN
                                if (vins.length === 0) {
                                  return (
                                    <p className="text-sm text-gray-500">
                                      Không tìm thấy VIN nào khả dụng.
                                    </p>
                                  );
                                }

                                // 2c. Hiển thị danh sách VINs
                                return (
                                  <div className="flex flex-wrap gap-2">
                                    {vins.map((vin) => (
                                      <span
                                        key={vin}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded-full border border-blue-200"
                                      >
                                        {vin}
                                      </span>
                                    ))}
                                  </div>
                                );
                              })()}
                          </div>
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
