import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Battery, Zap, Clock, Users, ArrowLeft, Calendar, 
  Settings, Palette, Car, CheckCircle, Star 
} from "lucide-react";
import { getVehicleById, getVariants } from "../services/vehicleService";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  // Fetch vehicle model details
  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      try {
        const response = await getVehicleById(id);
        return response.data;
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        toast.error("Không thể tải thông tin xe");
        return null;
      }
    },
  });

  // Fetch variants
  const { data: variantsData } = useQuery({
    queryKey: ['variants', id],
    queryFn: async () => {
      try {
        const response = await getVariants(id);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching variants:", error);
        return [];
      }
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (variantsData && variantsData.length > 0) {
      const firstVariant = variantsData[0];
      setSelectedVariant(firstVariant);
      setSelectedColor(firstVariant.color);
      // Set images from variant or model
      if (firstVariant.imageUrl) {
        setSelectedImages([firstVariant.imageUrl]);
      } else if (vehicleData?.thumbnailUrl) {
        setSelectedImages([vehicleData.thumbnailUrl]);
      }
    }
  }, [variantsData, vehicleData]);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    if (variant.imageUrl) {
      setSelectedImages([variant.imageUrl]);
    }
  };

  const handleTestDrive = () => {
    navigate(`/test-drive?modelId=${id}&variantId=${selectedVariant?.variantId || ''}`);
  };

  const handleConfigure = () => {
    navigate(`/configure?modelId=${id}&variantId=${selectedVariant?.variantId || ''}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin xe...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy thông tin xe</p>
          <Button onClick={() => navigate('/')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const variant = selectedVariant || variantsData?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={selectedImages[0] || variant?.imageUrl || vehicleData.thumbnailUrl || "https://via.placeholder.com/800"}
                alt={vehicleData.modelName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnail gallery can be added here */}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {vehicleData.modelName}
              </h1>
              {variant && (
                <p className="text-xl text-gray-600">{variant.versionName}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Giá khởi điểm</div>
              <div className="text-4xl font-bold text-blue-600">
                {formatPrice(variant?.price || vehicleData.basePrice)}
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-white rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <Battery className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Dung lượng pin</div>
                  <div className="text-lg font-semibold">
                    {variant?.batteryCapacity || vehicleData.baseBatteryCapacity || "N/A"} kWh
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Quãng đường (WLTP)</div>
                  <div className="text-lg font-semibold">
                    {variant?.rangeKm || vehicleData.baseRangeKm || "N/A"} km
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Sạc nhanh (80%)</div>
                  <div className="text-lg font-semibold">
                    {variant?.chargingTime ? `${variant.chargingTime} phút` : "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Công suất</div>
                  <div className="text-lg font-semibold">
                    {variant?.motorPower || vehicleData.baseMotorPower || "N/A"} kW
                  </div>
                </div>
              </div>
            </div>

            {/* Variant Selection */}
            {variantsData && variantsData.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Chọn phiên bản</h3>
                <div className="space-y-2">
                  {variantsData.map((v) => (
                    <button
                      key={v.variantId}
                      onClick={() => handleVariantSelect(v)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedVariant?.variantId === v.variantId
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{v.versionName}</div>
                          <div className="text-sm text-gray-600">{v.color}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {formatPrice(v.price)}
                          </div>
                          {selectedVariant?.variantId === v.variantId && (
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-1 ml-auto" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleTestDrive}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Đặt Lái Thử
              </Button>
              <Button
                onClick={handleConfigure}
                variant="outline"
                className="flex-1 py-4 text-lg font-semibold"
              >
                <Settings className="w-5 h-5 inline mr-2" />
                Cấu Hình Xe
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="bg-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Thông Số Kỹ Thuật Chi Tiết</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Pin & Sạc</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dung lượng pin:</span>
                  <span className="font-semibold">
                    {variant?.batteryCapacity || vehicleData.baseBatteryCapacity || "N/A"} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quãng đường (WLTP):</span>
                  <span className="font-semibold">
                    {variant?.rangeKm || vehicleData.baseRangeKm || "N/A"} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sạc nhanh (80%):</span>
                  <span className="font-semibold">
                    {variant?.chargingTime ? `${variant.chargingTime} phút` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sạc thường (100%):</span>
                  <span className="font-semibold">
                    {variant?.chargingTime ? `${Math.round(variant.chargingTime * 1.5)} phút` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Hiệu Suất</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Công suất động cơ:</span>
                  <span className="font-semibold">
                    {variant?.motorPower || vehicleData.baseMotorPower || "N/A"} kW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mô-men xoắn:</span>
                  <span className="font-semibold">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tăng tốc 0-100km/h:</span>
                  <span className="font-semibold">N/A</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Kích Thước</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số chỗ ngồi:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dung tích khoang hành lý:</span>
                  <span className="font-semibold">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/compare')}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-600 transition-all text-left"
          >
            <Car className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">So Sánh Xe</h3>
            <p className="text-sm text-gray-600">So sánh với các mẫu khác</p>
          </button>
          <button
            onClick={() => navigate('/financing')}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-600 transition-all text-left"
          >
            <Settings className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">Tính Trả Góp</h3>
            <p className="text-sm text-gray-600">Ước tính số tiền trả hàng tháng</p>
          </button>
          <button
            onClick={() => navigate('/tco-calculator')}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-600 transition-all text-left"
          >
            <Star className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">Tính Chi Phí</h3>
            <p className="text-sm text-gray-600">So sánh chi phí Gas vs EV</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
