import { Zap, Battery, ArrowRight } from "lucide-react";

const VehicleGrid = ({ vehicles, onVehicleSelect }) => {
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 1000000);
  };

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000";
    e.target.onerror = null;
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có xe nào trong danh mục</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 px-4">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id || vehicle.modelId} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 border border-gray-100 flex flex-col">
          <div className="relative h-64 overflow-hidden bg-gray-100">
            <img
              src={vehicle.imageUrl || vehicle.image || "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000"}
              alt={vehicle.modelName || vehicle.name || "Xe điện"}
              onError={handleImageError}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Có sẵn
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {vehicle.modelName || vehicle.name || "Xe điện"}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{vehicle.variantName || vehicle.version || ""}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500"/> 
                {vehicle.range || "N/A"}km
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <Battery className="w-4 h-4 text-green-500"/> 
                {vehicle.chargingTime || "N/A"}
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase block">Giá khởi điểm</span>
                <span className="text-xl font-black text-gray-900">
                  {formatPrice(vehicle.basePrice || vehicle.price)}
                </span>
              </div>
              <button 
                onClick={() => onVehicleSelect(vehicle)}
                className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-lg group-hover:shadow-blue-500/30 hover:scale-110"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleGrid;

