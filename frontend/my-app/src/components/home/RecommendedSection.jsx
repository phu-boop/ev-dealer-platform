import { useState } from "react";
import { Eye } from "lucide-react";
import Button from "../ui/Button";

const RecommendedSection = ({ vehicles, onVehicleSelect }) => {
  const [activeTab, setActiveTab] = useState('similar');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price * 1000000);
  };

  return (
    <section className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gợi ý cho bạn</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('similar')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'similar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Xe cùng phân khúc
          </button>
          <button
            onClick={() => setActiveTab('price')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'price' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Xe giá tương tự
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.slice(0, 4).map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Đề xuất
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{vehicle.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{vehicle.version}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-blue-600">{formatPrice(vehicle.price)}</span>
              </div>
              
              <Button 
                onClick={() => onVehicleSelect(vehicle)}
                className="w-full flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                Xem chi tiết
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedSection;