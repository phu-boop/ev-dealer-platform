import { useState, useEffect } from "react";
import { getAllStations, findNearbyStations } from "../services/chargingStationService";
import toast from "react-hot-toast";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

/**
 * ChargingStationsPage - Map view of EV charging stations
 * Uses Google Maps API to display charging station locations
 */
function ChargingStationsPage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(50);
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lng: 105.8542 }); // Default: Hanoi

  // Google Maps API key - Replace with your actual API key
  const GOOGLE_MAPS_API_KEY = "AIzaSyBPz9vB4BdQtMlzJ-YOUR-API-KEY-HERE";

  const mapContainerStyle = {
    width: "100%",
    height: "600px",
  };

  useEffect(() => {
    loadStations();
    getUserLocation();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await getAllStations();
      if (response.success) {
        setStations(response.data);
      }
    } catch (error) {
      console.error("Error loading stations:", error);
      toast.error("Không thể tải danh sách trạm sạc");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
          loadNearbyStations(location.lat, location.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Use default location if geolocation fails
        }
      );
    }
  };

  const loadNearbyStations = async (lat, lng) => {
    try {
      const response = await findNearbyStations(lat, lng, searchRadius);
      if (response.success) {
        setStations(response.data);
        toast.success(`Tìm thấy ${response.data.length} trạm sạc gần bạn`);
      }
    } catch (error) {
      console.error("Error loading nearby stations:", error);
    }
  };

  const handleMarkerClick = (station) => {
    setSelectedStation(station);
  };

  const handleDirections = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bản đồ trạm sạc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bản đồ trạm sạc xe điện</h1>
          <p className="text-gray-600">
            Tìm kiếm và định vị trạm sạc xe điện gần bạn
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Radius */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Bán kính tìm kiếm:</label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            {/* Find Nearby Button */}
            <button
              onClick={() => {
                if (userLocation) {
                  loadNearbyStations(userLocation.lat, userLocation.lng);
                } else {
                  getUserLocation();
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tìm trạm gần tôi
            </button>

            {/* Show All Button */}
            <button
              onClick={loadStations}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Hiển thị tất cả
            </button>

            {/* Station Count */}
            <div className="ml-auto text-sm text-gray-600">
              Tìm thấy <span className="font-bold">{stations.length}</span> trạm sạc
            </div>
          </div>
        </div>

        {/* Map and Station List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={userLocation ? 12 : 10}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  {/* User Location Marker */}
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      icon={{
                        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                      }}
                      title="Vị trí của bạn"
                    />
                  )}

                  {/* Station Markers */}
                  {stations.map((station) => (
                    <Marker
                      key={station.stationId}
                      position={{
                        lat: parseFloat(station.latitude),
                        lng: parseFloat(station.longitude),
                      }}
                      onClick={() => handleMarkerClick(station)}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                      }}
                    />
                  ))}

                  {/* Info Window */}
                  {selectedStation && (
                    <InfoWindow
                      position={{
                        lat: parseFloat(selectedStation.latitude),
                        lng: parseFloat(selectedStation.longitude),
                      }}
                      onCloseClick={() => setSelectedStation(null)}
                    >
                      <div className="p-2 max-w-xs">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {selectedStation.stationName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{selectedStation.address}</p>
                        {selectedStation.distanceKm && (
                          <p className="text-sm text-blue-600 mb-2">
                            Cách bạn: {selectedStation.distanceKm} km
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDirections(selectedStation)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Chỉ đường
                          </button>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>

          {/* Station List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-bold text-gray-900">Danh sách trạm sạc</h2>
              </div>
              <div className="overflow-y-auto max-h-[600px]">
                {stations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Không tìm thấy trạm sạc nào
                  </div>
                ) : (
                  stations.map((station) => (
                    <div
                      key={station.stationId}
                      className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedStation(station);
                        setMapCenter({
                          lat: parseFloat(station.latitude),
                          lng: parseFloat(station.longitude),
                        });
                      }}
                    >
                      <h3 className="font-bold text-gray-900 mb-1">
                        {station.stationName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{station.address}</p>
                      
                      {station.distanceKm && (
                        <p className="text-xs text-blue-600 mb-2">
                          📍 Cách bạn: {station.distanceKm} km
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-2">
                        {station.totalChargers && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {station.availableChargers}/{station.totalChargers} sạc khả dụng
                          </span>
                        )}
                        {station.maxPowerKw && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {station.maxPowerKw} kW
                          </span>
                        )}
                      </div>

                      {station.chargerTypes && (
                        <p className="text-xs text-gray-500 mb-2">
                          {station.chargerTypes}
                        </p>
                      )}

                      {station.operatingHours && (
                        <p className="text-xs text-gray-500">
                          ⏰ {station.operatingHours}
                        </p>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirections(station);
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Chỉ đường →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin hữu ích</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Loại sạc</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CCS: Sạc nhanh DC</li>
                <li>• Type 2: Sạc AC tiêu chuẩn</li>
                <li>• CHAdeMO: Sạc nhanh châu Á</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Công suất sạc</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 7-22 kW: Sạc AC chậm</li>
                <li>• 50 kW: Sạc DC cơ bản</li>
                <li>• 150+ kW: Sạc siêu nhanh</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Lưu ý</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Kiểm tra khả dụng trước khi đến</li>
                <li>• Mang theo cáp sạc riêng</li>
                <li>• Tôn trọng thời gian sạc</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChargingStationsPage;
