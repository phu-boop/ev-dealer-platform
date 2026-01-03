import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroBanner from "../components/home/HeroBanner";
import FilterPanel from "../components/home/FilterPanel";
import VehicleGrid from "../components/home/VehicleGrid";
import VehicleDetailModal from "../components/home/VehicleDetailModal";
import PromotionSection from "../components/home/PromotionSection";
import RecommendedSection from "../components/home/RecommendedSection";
import TestDriveSection from "../components/home/TestDriveSection";
import CustomerFeedback from "../components/home/CustomerFeedback";
import { getVehicles } from "../services/vehicleService";
import { getActivePromotions } from "../services/promotionService";
import { toast } from "react-toastify";

const Home = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [filters, setFilters] = useState({});

  // Fetch vehicles from API
  const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      try {
        const response = await getVehicles();
        return response.data || [];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Không thể tải danh sách xe");
        return [];
      }
    },
  });

  // Fetch promotions from API
  const { data: promotionsData } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      try {
        const response = await getActivePromotions();
        return response.data || [];
      } catch (error) {
        console.error("Error fetching promotions:", error);
        return [];
      }
    },
  });

  const vehicles = vehiclesData || [];

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // TODO: Implement filtering logic
  };

  const handleTestDrive = () => {
    setShowVehicleModal(false);
    document
      .getElementById("test-drive-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (vehiclesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-grow">
        <HeroBanner />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <FilterPanel onFilterChange={handleFilterChange} />
          {vehicles.length > 0 ? (
            <VehicleGrid
              vehicles={vehicles}
              onVehicleSelect={handleVehicleSelect}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có xe nào trong danh mục</p>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <PromotionSection promotions={promotionsData || []} />
        </div>

        <div id="test-drive-section">
          <TestDriveSection />
        </div>

        {vehicles.length > 0 && (
          <div className="max-w-7xl mx-auto px-6">
            <RecommendedSection
              vehicles={vehicles}
              onVehicleSelect={handleVehicleSelect}
            />
          </div>
        )}

        <CustomerFeedback />
      </main>

      {/* Modals */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        onTestDrive={handleTestDrive}
      />
    </div>
  );
};

export default Home;
