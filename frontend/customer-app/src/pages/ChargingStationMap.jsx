import { useState, useEffect } from "react";
import { MapPin, Battery, Zap, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../services/vehicleService";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different markers
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const userIcon = createCustomIcon('#4285F4');
const fastChargingIcon = createCustomIcon('#FF6B35');
const standardChargingIcon = createCustomIcon('#4CAF50');

// Component to handle map view changes
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const ChargingStationMap = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [userLocation, setUserLocation] = useState(null);
  const [range, setRange] = useState(null);

  // Fetch vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles-charging'],
    queryFn: async () => {
      try {
        const response = await getVehicles(0, 100);
        const pageData = response.data || response;
        return pageData.content || pageData || [];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        return [];
      }
    },
  });

  // Mock charging stations data
  const chargingStations = [
    { id: 1, name: 'Trạm Sạc VinFast Hà Nội', lat: 21.0285, lng: 105.8542, type: 'FAST', available: 4 },
    { id: 2, name: 'Trạm Sạc VinFast TP.HCM', lat: 10.8231, lng: 106.6297, type: 'FAST', available: 6 },
    { id: 3, name: 'Trạm Sạc VinFast Đà Nẵng', lat: 16.0544, lng: 108.2022, type: 'FAST', available: 2 },
    { id: 4, name: 'Trạm Sạc VinFast Hải Phòng', lat: 20.8449, lng: 106.6881, type: 'STANDARD', available: 3 },
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation({ lat: 10.8231, lng: 106.6297 }); // Default to Ho Chi Minh City
        }
      );
    } else {
      setUserLocation({ lat: 10.8231, lng: 106.6297 });
    }
  }, []);

  // Calculate range based on vehicle and battery level
  useEffect(() => {
    if (selectedVehicle && batteryLevel) {
      const baseRange = selectedVehicle.baseRangeKm || selectedVehicle.rangeKm || 0;
      const currentRange = (baseRange * batteryLevel) / 100;
      setRange(currentRange);
    }
  }, [selectedVehicle, batteryLevel]);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <MapPin className="w-10 h-10 text-blue-600" />
            Bản Đồ Trạm Sạc & Ước Tính Quãng Đường
          </h1>
          <p className="text-gray-600">
            Xem các trạm sạc gần bạn và quãng đường có thể di chuyển với mức pin hiện tại
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="space-y-6">
            {/* Vehicle Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Battery className="w-5 h-5 text-blue-600" />
                Chọn Xe
              </h2>
              <select
                value={selectedVehicle?.modelId || ''}
                onChange={(e) => {
                  const vehicle = vehiclesData?.find(v => v.modelId === parseInt(e.target.value));
                  setSelectedVehicle(vehicle);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn mẫu xe --</option>
                {(Array.isArray(vehiclesData) ? vehiclesData : []).map((vehicle) => (
                  <option key={vehicle.modelId} value={vehicle.modelId}>
                    {vehicle.modelName} - {vehicle.baseRangeKm || 'N/A'} km
                  </option>
                ))}
              </select>
            </div>

            {/* Battery Level */}
            {selectedVehicle && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Mức Pin
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pin hiện tại: {batteryLevel}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {range && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Quãng đường ước tính:</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(range)} km
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Dựa trên {selectedVehicle.modelName} với {batteryLevel}% pin
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Charging Stations List */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Trạm Sạc Gần Bạn</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chargingStations.map((station) => (
                  <div
                    key={station.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <div className="font-semibold text-sm">{station.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {station.type === 'FAST' ? '⚡ Sạc Nhanh' : '🔌 Sạc Thường'} • 
                      Còn {station.available} trạm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
              {userLocation ? (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={10}
                  style={{ height: '600px', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapController center={[userLocation.lat, userLocation.lng]} />

                  {/* User location marker */}
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>
                      <div className="text-sm font-semibold">Vị trí của bạn</div>
                    </Popup>
                  </Marker>

                  {/* Range circle */}
                  {range && selectedVehicle && (
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={range * 1000} // Convert km to meters
                      pathOptions={{
                        color: '#4285F4',
                        fillColor: '#4285F4',
                        fillOpacity: 0.15,
                        weight: 2,
                      }}
                    />
                  )}

                  {/* Charging stations */}
                  {chargingStations.map((station) => (
                    <Marker
                      key={station.id}
                      position={[station.lat, station.lng]}
                      icon={station.type === 'FAST' ? fastChargingIcon : standardChargingIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-sm">{station.name}</h3>
                          <p className="text-xs mt-1">
                            Loại: {station.type === 'FAST' ? 'Sạc Nhanh' : 'Sạc Thường'}
                          </p>
                          <p className="text-xs">Còn trống: {station.available} trạm</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-[600px] bg-gray-100">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-600">Đang lấy vị trí của bạn...</p>
                  </div>
                </div>
              )}

              {!selectedVehicle && userLocation && (
                <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-xs z-[1000]">
                  <p className="text-sm text-yellow-800">
                    Chọn mẫu xe và mức pin để xem quãng đường có thể di chuyển
                  </p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Vị trí của bạn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Trạm sạc nhanh</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Trạm sạc thường</span>
                </div>
                {range && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-200"></div>
                    <span>Vùng có thể di chuyển ({Math.round(range)} km)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingStationMap;
