import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSettings,
  FiEye,
  FiSearch,
} from "react-icons/fi";
import {
  getModels,
  getModelDetails,
  deactivateVariant,
} from "../services/vehicleCatalogService";
import VariantForm from "../components/VariantForm";
import ConfirmationModal from "../components/ConfirmationModal";
import FeatureAssignmentModal from "../components/FeatureAssignmentModal";
import VariantDetailsModal from "../components/VariantDetailsModal";

const STATUS_OPTIONS = {
  IN_PRODUCTION: "Đang sản xuất",
  COMING_SOON: "Sắp ra mắt",
  DISCONTINUED: "Ngừng sản xuất",
};

const VariantManagementPage = () => {
  const [models, setModels] = useState([]); // Danh sách các model cho dropdown
  const [selectedModelId, setSelectedModelId] = useState(""); // Model ID đang được chọn
  const [selectedModelDetails, setSelectedModelDetails] = useState(null); // Chi tiết của model được chọn

  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [variantToEdit, setVariantToEdit] = useState(null); // Variant đang được sửa
  const [variantToDeactivate, setVariantToDeactivate] = useState(null); // Variant sắp bị xóa

  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [variantForFeatures, setVariantForFeatures] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [variantForDetails, setVariantForDetails] = useState(null);

  const [variantSearchQuery, setVariantSearchQuery] = useState("");

  // Tải danh sách các mẫu xe (chỉ 1 lần khi component mount)
  useEffect(() => {
    const fetchAllModels = async () => {
      try {
        setIsLoadingModels(true);
        const response = await getModels();
        setModels(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch models", error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchAllModels();
  }, []);

  // Hàm tải chi tiết các phiên bản, được gọi mỗi khi selectedModelId thay đổi
  const fetchVariantsForModel = useCallback(async () => {
    if (!selectedModelId) {
      setSelectedModelDetails(null);
      return;
    }
    try {
      setIsLoadingVariants(true);
      const response = await getModelDetails(selectedModelId);
      setSelectedModelDetails(response.data.data);
    } catch (error) {
      console.error("Failed to fetch model details", error);
      setSelectedModelDetails(null);
    } finally {
      setIsLoadingVariants(false);
    }
  }, [selectedModelId]);

  useEffect(() => {
    fetchVariantsForModel();
  }, [fetchVariantsForModel]);

  // --- Các hàm xử lý modal ---
  const handleOpenAddForm = () => {
    setVariantToEdit(null); // Đảm bảo không có dữ liệu cũ
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (variant) => {
    setVariantToEdit(variant);
    setIsFormOpen(true);
  };

  const handleOpenConfirmModal = (variant) => {
    setVariantToDeactivate(variant);
    setIsConfirmOpen(true);
  };

  const handleOpenFeatureModal = (variant) => {
    setVariantForFeatures(variant);
    setIsFeatureModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormOpen(false);
    setIsConfirmOpen(false);
    setIsFeatureModalOpen(false);
    setIsDetailsOpen(false);
    setVariantToEdit(null);
    setVariantToDeactivate(null);
    setVariantForFeatures(null);
    setVariantForDetails(null);
  };

  const handleOpenDetailsModal = (variant) => {
    setVariantForDetails(variant);
    setIsDetailsOpen(true);
  };

  // --- Hàm xử lý ngừng sản xuất ---
  const handleDeactivateConfirm = async () => {
    if (!variantToDeactivate) return;
    try {
      await deactivateVariant(variantToDeactivate.variantId);
      fetchVariantsForModel(); // Tải lại danh sách sau khi xóa thành công
    } catch (error) {
      alert("Lỗi: Không thể ngừng sản xuất phiên bản này.");
      console.error(error);
    } finally {
      handleCloseModals();
    }
  };

  const filteredVariants = selectedModelDetails
    ? selectedModelDetails.variants.filter((variant) => {
        // Chuẩn hóa từ khóa tìm kiếm (xóa hết dấu cách)
        const query = variantSearchQuery.toLowerCase().replace(/\s+/g, "");

        // Chuẩn hóa dữ liệu (gộp các trường, xóa hết dấu cách)
        const versionName = variant.versionName || "";
        const color = variant.color || "";
        const skuCode = variant.skuCode || "";

        const combinedData = (versionName + color + skuCode)
          .toLowerCase()
          .replace(/\s+/g, "");

        // So sánh các chuỗi đã được chuẩn hóa
        return combinedData.includes(query);
      })
    : [];

  return (
    <div className="animate-in fade-in-0 duration-500">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Quản Lý Phiên Bản & Màu Sắc
      </h1>

      {/* Dropdown chọn mẫu xe */}
      <div className="mb-6 max-w-md">
        <label
          htmlFor="model-select"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Chọn Mẫu Xe
        </label>
        <select
          id="model-select"
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          disabled={isLoadingModels}
          className="p-3 border rounded-lg w-full bg-white shadow-sm"
        >
          <option value="">
            -- {isLoadingModels ? "Đang tải..." : "Vui lòng chọn một mẫu xe"} --
          </option>
          {models.map((model) => (
            <option key={model.modelId} value={model.modelId}>
              {model.brand} {model.modelName}
            </option>
          ))}
        </select>
      </div>

      {/* Bảng hiển thị các phiên bản */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700">
            {selectedModelDetails
              ? `Các phiên bản của ${selectedModelDetails.brand} ${selectedModelDetails.modelName}`
              : "Chưa chọn mẫu xe"}
          </h2>
          <button
            onClick={handleOpenAddForm}
            disabled={!selectedModelId}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FiPlus className="mr-2" /> Thêm Phiên Bản
          </button>
        </div>

        {selectedModelId && !isLoadingVariants && (
          <div className="mb-4">
            <div className="relative max-w-lg">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                value={variantSearchQuery}
                onChange={(e) => setVariantSearchQuery(e.target.value)}
                placeholder="Tìm phiên bản theo tên, màu, hoặc SKU..."
                className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {isLoadingVariants ? (
          <p className="text-gray-500 py-4 text-center">
            Đang tải danh sách phiên bản...
          </p>
        ) : selectedModelDetails && selectedModelDetails.variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                  <th className="p-3">Tên Phiên Bản</th>
                  <th className="p-3">Màu Sắc</th>
                  <th className="p-3">Giá (VNĐ)</th>
                  <th className="p-3">Mã SKU</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.map((variant) => (
                  <tr
                    key={variant.variantId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium text-gray-900">
                      {variant.versionName}
                    </td>
                    <td className="p-3 text-gray-700">{variant.color}</td>
                    <td className="p-3 text-gray-700">
                      {Number(variant.price).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3 text-gray-700">{variant.skuCode}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          variant.status === "IN_PRODUCTION"
                            ? "bg-green-100 text-green-800"
                            : variant.status === "COMING_SOON"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_OPTIONS[variant.status]}
                      </span>
                    </td>
                    <td className="p-3 flex justify-end space-x-2">
                      <button
                        onClick={() => handleOpenDetailsModal(variant)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleOpenFeatureModal(variant)}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                        title="Quản lý tính năng"
                      >
                        <FiSettings />
                      </button>
                      <button
                        onClick={() => handleOpenEditForm(variant)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"
                        title="Chỉnh sửa"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmModal(variant)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        title="Ngừng sản xuất"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVariants.length === 0 && variantSearchQuery && (
              <p className="text-gray-500 py-4 text-center">
                Không tìm thấy phiên bản nào khớp với tìm kiếm của bạn.
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 py-4 text-center">
            {selectedModelId
              ? "Mẫu xe này chưa có phiên bản nào."
              : "Hãy chọn một mẫu xe để xem các phiên bản."}
          </p>
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <VariantForm
          isOpen={isFormOpen}
          onClose={handleCloseModals}
          onSuccess={() => {
            fetchVariantsForModel();
            handleCloseModals();
          }}
          modelId={selectedModelId}
          variant={variantToEdit}
        />
      )}
      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={handleCloseModals}
          onConfirm={handleDeactivateConfirm}
          title="Xác nhận Ngừng sản xuất"
          message={`Bạn có chắc chắn muốn ngừng sản xuất phiên bản "${variantToDeactivate?.versionName} - ${variantToDeactivate?.color}" không?`}
        />
      )}
      {isFeatureModalOpen && (
        <FeatureAssignmentModal
          isOpen={isFeatureModalOpen}
          onClose={handleCloseModals}
          variant={variantForFeatures}
          onSuccess={fetchVariantsForModel} // Tải lại dữ liệu sau khi hoàn tất
        />
      )}
      {isDetailsOpen && (
        <VariantDetailsModal
          isOpen={isDetailsOpen}
          onClose={handleCloseModals}
          variant={variantForDetails}
        />
      )}
    </div>
  );
};

export default VariantManagementPage;
