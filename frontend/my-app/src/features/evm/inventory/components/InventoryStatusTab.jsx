import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiSliders,
  FiPlusCircle,
  FiEdit,
  FiChevronDown,
} from "react-icons/fi";
import { getAllInventory } from "../services/inventoryService";
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
import TransactionModal from "./TransactionModal";
import ReorderLevelModal from "./ReorderLevelModal";

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
  const [inventoryWithDetails, setInventoryWithDetails] = useState({
    content: [],
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    dealerId: "",
    status: "",
  });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // <<< STATE QUẢN LÝ MODAL >>>
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, page, size: 10 };
      const inventoryResponse = await getAllInventory(params);
      const inventoryData = inventoryResponse.data.data;

      if (inventoryData && inventoryData.content.length > 0) {
        const variantIds = inventoryData.content.map((item) => item.variantId);
        const detailsResponse = await getVariantDetailsByIds(variantIds);
        const vehicleDetails = detailsResponse.data.data || [];
        const detailsMap = new Map(vehicleDetails.map((v) => [v.variantId, v]));

        const mergedContent = inventoryData.content.map((item) => {
          const details = detailsMap.get(item.variantId);
          if (details) {
            return { ...item, ...details };
          }
          return {
            ...item,
            versionName: `Không tìm thấy thông tin`,
            color: `(ID: ${item.variantId})`,
            skuCode: "N/A",
          };
        });

        setInventoryWithDetails({
          content: mergedContent,
          totalPages: inventoryData.totalPages,
        });
      } else {
        setInventoryWithDetails({ content: [], totalPages: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch inventory data", error);
      setInventoryWithDetails({ content: [], totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleFilterChange = (e) => {
    setPage(0); // Reset về trang đầu khi thay đổi bộ lọc
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const toggleRow = (variantId) => {
    const newSet = new Set(expandedRows);
    newSet.has(variantId) ? newSet.delete(variantId) : newSet.add(variantId);
    setExpandedRows(newSet);
  };

  // ĐỊNH NGHĨA CÁC HÀM XỬ LÝ MODAL
  const openTransactionModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsTransactionModalOpen(true);
  };

  const openReorderModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsReorderModalOpen(true);
  };

  const closeModal = () => {
    setIsTransactionModalOpen(false);
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
              {inventoryWithDetails.content.map((item) => (
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
                    <td className="p-3">
                      <p className="font-semibold text-gray-800">
                        {item.versionName} - {item.color}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {item.skuCode}
                      </p>
                    </td>
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
                        onClick={() => openTransactionModal(item.variantId)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="Thực hiện giao dịch"
                      >
                        <FiPlusCircle />
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RENDER CÁC MODAL CÓ ĐIỀU KIỆN */}
      {isTransactionModalOpen && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={closeModal}
          onSuccess={fetchInventory}
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
