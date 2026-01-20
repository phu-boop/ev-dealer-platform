import { useState } from "react";

export default function VehicleFilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const [rangeKm, setRangeKm] = useState({
    min: filters.minRange || '',
    max: filters.maxRange || ''
  });

  const colors = ["Đen", "Trắng", "Xám", "Đỏ", "Xanh", "Bạc", "Nâu"];

  const handleColorToggle = (color) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    onFilterChange({ colors: newColors });
  };

  const handlePriceChange = () => {
    onFilterChange({
      minPrice: priceRange.min ? parseInt(priceRange.min) : null,
      maxPrice: priceRange.max ? parseInt(priceRange.max) : null
    });
  };

  const handleRangeChange = () => {
    onFilterChange({
      minRange: rangeKm.min ? parseInt(rangeKm.min) : null,
      maxRange: rangeKm.max ? parseInt(rangeKm.max) : null
    });
  };

  const handleStatusChange = (status) => {
    onFilterChange({ status: status === filters.status ? null : status });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Khoảng giá</h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Giá thấp nhất"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              onBlur={handlePriceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Giá cao nhất"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              onBlur={handlePriceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            VNĐ
          </div>
        </div>

        {/* Range (km) Filter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Phạm vi hoạt động (km)</h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Tối thiểu"
              value={rangeKm.min}
              onChange={(e) => setRangeKm(prev => ({ ...prev, min: e.target.value }))}
              onBlur={handleRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Tối đa"
              value={rangeKm.max}
              onChange={(e) => setRangeKm(prev => ({ ...prev, max: e.target.value }))}
              onBlur={handleRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Color Filter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Màu sắc</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`px-3 py-1 text-sm rounded-full border-2 transition-all ${
                  filters.colors.includes(color)
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Trạng thái</h3>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="status"
                checked={filters.status === 'AVAILABLE'}
                onChange={() => handleStatusChange('AVAILABLE')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Còn hàng</span>
            </label>
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="status"
                checked={filters.status === 'DISCONTINUED'}
                onChange={() => handleStatusChange('DISCONTINUED')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ngừng sản xuất</span>
            </label>
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="status"
                checked={filters.status === null}
                onChange={() => handleStatusChange(null)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Tất cả</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
