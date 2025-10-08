import { Eye, Heart, ArrowLeftRight } from "lucide-react";
import Button from "../ui/Button";

const VehicleGrid = ({ vehicles, onVehicleSelect, onCompare }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price * 1000000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold_out': return 'bg-red-100 text-red-800';
      case 'pre_order': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Còn hàng';
      case 'sold_out': return 'Hết hàng';
      case 'pre_order': return 'Đặt trước';
      default: return 'Liên hệ';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              <button className="bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => onCompare(vehicle)}
                className="bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
              >
                <ArrowLeftRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                {getStatusText(vehicle.status)}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{vehicle.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{vehicle.version}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-blue-600">{formatPrice(vehicle.price)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
              <div>Quãng đường: {vehicle.range}km</div>
              <div>Sạc: {vehicle.chargingTime}</div>
              <div>Công suất: {vehicle.power}</div>
              <div>Màu sắc: {vehicle.colors.length}</div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => onVehicleSelect(vehicle)}
                className="flex-1 flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                Chi tiết
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleGrid;