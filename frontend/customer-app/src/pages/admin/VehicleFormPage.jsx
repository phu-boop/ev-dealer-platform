import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import {
  createVehicle,
  updateVehicle,
  getVehicleDetailAdmin,
  getAllModels,
  uploadVehicleImage
} from '../../services/adminVehicleService';
import toast from 'react-hot-toast';

export default function VehicleFormPage() {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!variantId;

  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    modelId: '',
    variantName: '',
    price: '',
    color: '',
    batteryCapacity: '',
    range: '',
    motorPower: '',
    seatingCapacity: '',
    torque: '',
    acceleration: '',
    topSpeed: '',
    chargingTime: '',
    dimensions: '',
    weight: '',
    warrantyYears: '',
    stockQuantity: '',
    imageUrl: '',
    description: ''
  });

  useEffect(() => {
    loadModels();
    if (isEditMode) {
      loadVehicleData();
    }
  }, [variantId]);

  const loadModels = async () => {
    try {
      const response = await getAllModels();
      if (response.code === 200) {
        setModels(response.result || []);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách model');
    }
  };

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const response = await getVehicleDetailAdmin(variantId);
      if (response.code === 200) {
        const vehicle = response.result;
        setFormData({
          modelId: vehicle.modelId || '',
          variantName: vehicle.variantName || '',
          price: vehicle.price || '',
          color: vehicle.color || '',
          batteryCapacity: vehicle.batteryCapacity || '',
          range: vehicle.range || '',
          motorPower: vehicle.motorPower || '',
          seatingCapacity: vehicle.seatingCapacity || '',
          torque: vehicle.torque || '',
          acceleration: vehicle.acceleration || '',
          topSpeed: vehicle.topSpeed || '',
          chargingTime: vehicle.chargingTime || '',
          dimensions: vehicle.dimensions || '',
          weight: vehicle.weight || '',
          warrantyYears: vehicle.warrantyYears || '',
          stockQuantity: vehicle.stockQuantity || '',
          imageUrl: vehicle.imageUrl || '',
          description: vehicle.description || ''
        });
      }
    } catch (error) {
      toast.error('Không thể tải thông tin xe');
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await uploadVehicleImage(file);
      if (response.code === 200) {
        setFormData(prev => ({
          ...prev,
          imageUrl: response.result.url
        }));
        toast.success('Upload hình ảnh thành công');
      }
    } catch (error) {
      toast.error('Không thể upload hình ảnh');
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.modelId) {
      toast.error('Vui lòng chọn model xe');
      return;
    }
    if (!formData.variantName.trim()) {
      toast.error('Vui lòng nhập tên biến thể');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        batteryCapacity: parseFloat(formData.batteryCapacity) || null,
        range: parseFloat(formData.range) || null,
        motorPower: parseFloat(formData.motorPower) || null,
        seatingCapacity: parseInt(formData.seatingCapacity) || null,
        torque: parseFloat(formData.torque) || null,
        acceleration: parseFloat(formData.acceleration) || null,
        topSpeed: parseFloat(formData.topSpeed) || null,
        weight: parseFloat(formData.weight) || null,
        warrantyYears: parseInt(formData.warrantyYears) || null,
        stockQuantity: parseInt(formData.stockQuantity) || 0
      };

      let response;
      if (isEditMode) {
        response = await updateVehicle(variantId, payload);
      } else {
        response = await createVehicle(payload);
      }

      if (response.code === 200 || response.code === 201) {
        toast.success(isEditMode ? 'Cập nhật xe thành công' : 'Thêm xe mới thành công');
        navigate('/admin/vehicles');
      }
    } catch (error) {
      toast.error(isEditMode ? 'Không thể cập nhật xe' : 'Không thể thêm xe');
      console.error('Error saving vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/vehicles')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Cập nhật thông tin xe điện' : 'Nhập thông tin xe điện mới'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model xe <span className="text-red-500">*</span>
              </label>
              <select
                name="modelId"
                value={formData.modelId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn model</option>
                {models.map(model => (
                  <option key={model.modelId} value={model.modelId}>
                    {model.modelName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên biến thể <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="variantName"
                value={formData.variantName}
                onChange={handleInputChange}
                placeholder="VD: VF 8 Plus Extended Range"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="1200000000"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu sắc
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Đen, Trắng, Xanh..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số chỗ ngồi
              </label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleInputChange}
                placeholder="5"
                min="2"
                max="9"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tồn kho
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Thông số kỹ thuật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dung lượng pin (kWh)
              </label>
              <input
                type="number"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleInputChange}
                placeholder="87.7"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phạm vi hoạt động (km)
              </label>
              <input
                type="number"
                name="range"
                value={formData.range}
                onChange={handleInputChange}
                placeholder="471"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Công suất động cơ (kW)
              </label>
              <input
                type="number"
                name="motorPower"
                value={formData.motorPower}
                onChange={handleInputChange}
                placeholder="300"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô-men xoắn (Nm)
              </label>
              <input
                type="number"
                name="torque"
                value={formData.torque}
                onChange={handleInputChange}
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tăng tốc 0-100km/h (giây)
              </label>
              <input
                type="number"
                name="acceleration"
                value={formData.acceleration}
                onChange={handleInputChange}
                placeholder="5.5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tốc độ tối đa (km/h)
              </label>
              <input
                type="number"
                name="topSpeed"
                value={formData.topSpeed}
                onChange={handleInputChange}
                placeholder="200"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian sạc (giờ)
              </label>
              <input
                type="text"
                name="chargingTime"
                value={formData.chargingTime}
                onChange={handleInputChange}
                placeholder="7-8 giờ (AC), 30 phút (DC)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kích thước (mm)
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                placeholder="4750 x 1934 x 1667"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trọng lượng (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="2158"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bảo hành (năm)
              </label>
              <input
                type="number"
                name="warrantyYears"
                value={formData.warrantyYears}
                onChange={handleInputChange}
                placeholder="10"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Image & Description */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Hình ảnh & Mô tả</h2>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh chính
            </label>
            {formData.imageUrl ? (
              <div className="relative inline-block">
                <img
                  src={formData.imageUrl}
                  alt="Vehicle"
                  className="h-48 w-auto rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={48} />
                <p className="text-sm text-gray-600 mb-4">
                  {uploadingImage ? 'Đang upload...' : 'Kéo thả hoặc click để chọn hình ảnh'}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Chọn hình ảnh
                </label>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Hoặc nhập URL hình ảnh:
            </p>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              placeholder="Nhập mô tả chi tiết về xe..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/vehicles')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
}
