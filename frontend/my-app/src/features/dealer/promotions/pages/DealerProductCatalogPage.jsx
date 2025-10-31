import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../auth/AuthProvider";
import {
  getAllVariantsPaginated,
  getComparisonDetails,
  getVariantDetails,
} from "../services/vehicleCatalogService";
import VariantDetailsModal from "../../../../components/common/detail/VariantDetailsModal";
import ProductCard from "../../../../components/common/ProductCard";
import CompareTray from "../../../../components/common/CompareTray";
import CompareModal from "../../../../components/common/CompareModal";

// (Đây là dữ liệu giả, bạn sẽ thay bằng API call thật)
const fetchVariantsFromAPI = async (page) => {
  const response = await getAllVariantsPaginated({ page: page, size: 10 });
  return response.data.data.content;
};

const DealerProductCatalogPage = () => {
  const [variants, setVariants] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuthContext(); // Lấy thông tin user (để lấy dealerId)

  // State cho chức năng so sánh
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState([]);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  // State cho phiên bản chi tiết
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Load danh sách xe
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchVariantsFromAPI(page); // Gọi API thật ở đây
        setVariants(data);
      } catch (error) {
        console.error("Failed to fetch variants:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [page]);

  // Xử lý thêm/bớt xe khỏi khay so sánh
  const handleToggleCompare = (variant) => {
    setCompareItems((prevItems) => {
      const isSelected = prevItems.some(
        (item) => item.variantId === variant.variantId
      );

      if (isSelected) {
        return prevItems.filter((item) => item.variantId !== variant.variantId);
      } else {
        if (prevItems.length >= 3) {
          // Giới hạn 3 xe
          alert("Chỉ có thể so sánh tối đa 3 sản phẩm.");
          return prevItems;
        }
        return [...prevItems, variant];
      }
    });
  };

  // Xử lý gọi API khi bấm nút "So sánh"
  const handleCompareSubmit = async () => {
    if (compareItems.length < 2) {
      alert("Cần chọn ít nhất 2 sản phẩm để so sánh.");
      return;
    }

    if (!userData || !userData.memberId) {
      console.error(
        "Lỗi: Không tìm thấy thông tin user hoặc profileId.",
        userData
      );
      alert("Lỗi thông tin người dùng. Vui lòng thử đăng nhập lại.");
      setIsLoadingCompare(false);
      return;
    }

    setIsLoadingCompare(true);
    try {
      const variantIds = compareItems.map((item) => item.variantId);
      const dealerId = userData.memberId; // Dòng này bây giờ đã an toàn

      const response = await getComparisonDetails(variantIds, dealerId);

      setCompareData(response.data.data);
      setIsCompareModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu so sánh:", error);
      alert("Không thể tải dữ liệu so sánh. Vui lòng thử lại.");
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const handleViewDetails = async (variantId) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true); // Mở modal ngay (để hiện loading)
    try {
      const response = await getVariantDetails(variantId);
      setSelectedVariant(response.data.data); // Tải dữ liệu chi tiết
    } catch (error) {
      console.error("Lỗi khi tải chi tiết xe:", error);
      alert("Không thể tải chi tiết sản phẩm.");
      setIsDetailModalOpen(false); // Đóng modal nếu lỗi
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVariant(null); // Xóa dữ liệu cũ khi đóng
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Danh mục Sản phẩm</h1>
      {isLoading ? (
        <p>Đang tải danh sách xe...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {variants.map((variant) => (
            <ProductCard
              key={variant.variantId}
              variant={variant}
              onCompareToggle={handleToggleCompare}
              onViewDetails={() => handleViewDetails(variant.variantId)}
              isSelected={compareItems.some(
                (item) => item.variantId === variant.variantId
              )}
            />
          ))}
        </div>
      )}

      <VariantDetailsModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        variant={selectedVariant} // Dữ liệu chi tiết
        isLoading={isLoadingDetail}
      />

      <CompareTray
        items={compareItems}
        onSubmit={handleCompareSubmit}
        onRemove={handleToggleCompare} // Dùng lại hàm toggle để remove
        isLoading={isLoadingCompare}
      />

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        data={compareData}
      />

      <div className="h-24"></div>
    </div>
  );
};

export default DealerProductCatalogPage;
