import React, { useState, useEffect, useCallback } from "react";
import { getTransactionHistory } from "../services/inventoryService";
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
// import Pagination from '../../../../components/Pagination';

const TransactionHistoryTab = () => {
  const [history, setHistory] = useState({ content: [], totalPages: 0 });
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      // Lấy lịch sử giao dịch (chỉ có variantId)
      const params = { ...filters, page, size: 10 };
      const historyResponse = await getTransactionHistory(params);
      const historyData = historyResponse.data.data;

      if (historyData && historyData.content.length > 0) {
        // Thu thập tất cả các variantId
        const variantIds = historyData.content.map((tx) => tx.variantId);

        // Gọi API vehicle-service để lấy chi tiết tên, sku...
        const detailsResponse = await getVariantDetailsByIds(variantIds);
        const vehicleDetails = detailsResponse.data.data || [];
        const detailsMap = new Map(vehicleDetails.map((v) => [v.variantId, v]));

        // Gộp hai luồng dữ liệu lại
        const mergedContent = historyData.content.map((tx) => {
          const details = detailsMap.get(tx.variantId);
          return {
            ...tx, // Dữ liệu giao dịch (quantity, type, staffId...)
            versionName: details ? details.versionName : "Không tìm thấy",
            color: details ? details.color : `(ID: ${tx.variantId})`,
            skuCode: details ? details.skuCode : "N/A",
          };
        });

        setHistory({
          content: mergedContent,
          totalPages: historyData.totalPages,
        });
      } else {
        setHistory({ content: [], totalPages: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch transaction history", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="p-2 border rounded-lg"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="p-2 border rounded-lg"
        />
      </div>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            {/* Header của bảng */}
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase">
                <th className="p-3">Thời gian</th>
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Loại Giao Dịch</th>
                <th className="p-3 text-center">Số Lượng</th>
                <th className="p-3">Từ Kho</th>
                <th className="p-3">Đến Kho</th>
                <th className="p-3">Người thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {history.content.map((tx) => (
                <tr
                  key={tx.transactionId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    {new Date(tx.transactionDate).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">
                      {tx.versionName} - {tx.color}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {tx.skuCode}</p>
                  </td>
                  <td className="p-3">{tx.transactionType}</td>{" "}
                  <td className="p-3 text-center">{tx.quantity}</td>
                  <td className="p-3">
                    {tx.fromDealerId
                      ? `Đại lý #${tx.fromDealerId}`
                      : "Kho Trung Tâm"}
                  </td>
                  <td className="p-3">
                    {tx.toDealerId
                      ? `Đại lý #${tx.toDealerId}`
                      : "Kho Trung Tâm"}
                  </td>
                  <td className="p-3">{tx.staffId}</td>{" "}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* <Pagination currentPage={page} totalPages={history.totalPages} onPageChange={setPage} /> */}
    </div>
  );
};

export default TransactionHistoryTab;
