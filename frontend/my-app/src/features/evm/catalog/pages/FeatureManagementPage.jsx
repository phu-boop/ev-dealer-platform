import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";
import {
  getAllFeatures,
  deleteFeature,
} from "../services/vehicleCatalogService";
import FeatureFormModal from "../components/FeatureFormModal"; // Import form modal mới
import ConfirmationModal from "../components/ConfirmationModal"; // Tái sử dụng modal xác nhận

const FeatureManagementPage = () => {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [featureToEdit, setFeatureToEdit] = useState(null);
  const [featureToDelete, setFeatureToDelete] = useState(null);

  // Hàm tải dữ liệu
  const fetchFeatures = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllFeatures();
      setFeatures(response.data.data || []);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách tính năng. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // --- Các hàm xử lý modal ---
  const handleOpenAddForm = () => {
    setFeatureToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (feature) => {
    setFeatureToEdit(feature);
    setIsFormOpen(true);
  };

  const handleOpenConfirmModal = (feature) => {
    setFeatureToDelete(feature);
    setIsConfirmOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormOpen(false);
    setIsConfirmOpen(false);
    setFeatureToEdit(null);
    setFeatureToDelete(null);
  };

  // --- Hàm xử lý xóa ---
  const handleDeleteConfirm = async () => {
    if (!featureToDelete) return;
    try {
      await deleteFeature(featureToDelete.featureId);
      fetchFeatures(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Lỗi: Không thể xóa tính năng này. Có thể nó đang được sử dụng."
      );
      console.error(error);
    } finally {
      handleCloseModals();
    }
  };

  // Logic lọc/tìm kiếm
  const filteredFeatures = features.filter((feature) => {
    const query = searchQuery.toLowerCase().replace(/\s+/g, "");
    const name = (feature.featureName || "").toLowerCase();
    const category = (feature.category || "").toLowerCase();
    const combinedData = name + category;
    return combinedData.includes(query);
  });

  return (
    <div className="animate-in fade-in-0 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Quản Lý Thư Viện Tính Năng
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchFeatures}
            className="flex items-center justify-center p-3 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-100"
            title="Làm mới"
            disabled={isLoading}
          >
            <FiRefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleOpenAddForm}
            className="flex items-center bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            <span className="font-semibold">Thêm Tính Năng Mới</span>
          </button>
        </div>
      </div>

      {/* Ô tìm kiếm */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tính năng, danh mục..."
            className="w-full p-3 pl-10 border rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Bảng hiển thị */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {isLoading ? (
          <p className="text-center text-gray-500 py-4">Đang tải...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-4">{error}</p>
        ) : filteredFeatures.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                  <th className="p-3">ID</th>
                  <th className="p-3">Tên Tính Năng</th>
                  <th className="p-3">Danh Mục</th>
                  <th className="p-3">Mô Tả</th>
                  <th className="p-3 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeatures.map((feature) => (
                  <tr
                    key={feature.featureId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 text-gray-700">{feature.featureId}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {feature.featureName}
                    </td>
                    <td className="p-3 text-gray-700">{feature.category}</td>
                    <td className="p-3 text-gray-700 truncate max-w-xs">
                      {feature.description || "N/A"}
                    </td>
                    <td className="p-3 flex justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditForm(feature)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"
                        title="Chỉnh sửa"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmModal(feature)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        title="Xóa"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            Không tìm thấy tính năng nào.
          </p>
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <FeatureFormModal
          isOpen={isFormOpen}
          onClose={handleCloseModals}
          onSuccess={() => {
            fetchFeatures();
            handleCloseModals();
          }}
          feature={featureToEdit}
        />
      )}
      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={handleCloseModals}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận Xóa Tính Năng"
          message={`Bạn có chắc chắn muốn xóa tính năng "${featureToDelete?.featureName}" không? Hành động này không thể hoàn tác.`}
        />
      )}
    </div>
  );
};

export default FeatureManagementPage;
