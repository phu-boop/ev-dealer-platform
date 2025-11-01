import React, { useState, useEffect } from "react";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";
import { getActiveAlerts } from "../services/inventoryService";

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await getActiveAlerts();
        setAlerts(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (isLoading || alerts.length === 0) {
    return null; // Ẩn đi nếu đang tải hoặc không có cảnh báo
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex">
        <div className="py-1">
          <FiAlertTriangle className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-bold text-yellow-800">
            Cảnh báo tồn kho ({alerts.length})
          </p>
          <ul className="text-sm text-yellow-700 list-disc list-inside mt-1">
            {alerts.slice(0, 3).map(
              (
                alert // Chỉ hiển thị 3 cảnh báo đầu tiên
              ) => (
                <li key={alert.id}>{alert.message}</li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;
