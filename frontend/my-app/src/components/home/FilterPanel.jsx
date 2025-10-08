import { useState } from "react";
import { Filter, X } from "lucide-react";
import Button from "../ui/Button";

const FilterPanel = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: "",
    vehicleType: "",
    batteryRange: "",
    version: ""
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: "",
      vehicleType: "",
      batteryRange: "",
      version: ""
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Bộ Lọc & Sắp Xếp</h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-gray-600"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isOpen ? 'block' : 'hidden lg:grid'}`}>
        <select
          value={filters.priceRange}
          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Mức giá</option>
          <option value="0-500">Dưới 500 triệu</option>
          <option value="500-1000">500 - 1 tỷ</option>
          <option value="1000-2000">1 - 2 tỷ</option>
          <option value="2000+">Trên 2 tỷ</option>
        </select>

        <select
          value={filters.vehicleType}
          onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Loại xe</option>
          <option value="suv">SUV</option>
          <option value="sedan">Sedan</option>
          <option value="hatchback">Hatchback</option>
          <option value="pickup">Pickup</option>
        </select>

        <select
          value={filters.batteryRange}
          onChange={(e) => handleFilterChange('batteryRange', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tầm hoạt động</option>
          <option value="0-300">Dưới 300km</option>
          <option value="300-500">300 - 500km</option>
          <option value="500+">Trên 500km</option>
        </select>

        <select
          value={filters.version}
          onChange={(e) => handleFilterChange('version', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Phiên bản</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <div className={`mt-4 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex justify-between items-center">
          <select className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="popular">Bán chạy nhất</option>
          </select>
          <Button variant="outline" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;