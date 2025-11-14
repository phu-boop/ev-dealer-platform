import React from "react";
import { FiAward, FiTrendingUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * Congratulations Card Component
 * Hiển thị lời chào mừng và thống kê tăng trưởng
 */
const CongratulationsCard = ({ 
  userName, 
  growthPercentage,
  salesToday 
}) => {
  const navigate = useNavigate();

  // Lấy tên đầu tiên nếu có fullName, hoặc dùng name
  const displayName = userName?.split(' ')[0] || userName || "Quản lý";

  // Tính toán thông điệp chào mừng
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Chào buổi sáng";
    } else if (hour < 18) {
      return "Chào buổi chiều";
    } else {
      return "Chào buổi tối";
    }
  };

  const handleViewBadges = () => {
    // Navigate to profile or badges page
    navigate("/dealer/settings");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-24 -mb-24 opacity-30"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
        {/* Left content */}
        <div className="flex-1 mb-4 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <h2 className="text-2xl font-bold text-gray-900">
              {getGreetingMessage()}, {displayName}!
            </h2>
          </div>
          
          <p className="text-lg text-gray-700 mb-1">
            Bạn đã đạt được <span className="font-bold text-purple-600">{growthPercentage}%</span> doanh số hôm nay.
          </p>
          
          <p className="text-sm text-gray-600 mb-4">
            Kiểm tra huy hiệu mới của bạn trong hồ sơ.
          </p>
          
          <button
            onClick={handleViewBadges}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FiAward className="w-4 h-4" />
            Xem Huy Hiệu
          </button>
        </div>

        {/* Right illustration */}
        <div className="relative w-full md:w-64 h-48 md:h-48 flex items-center justify-center">
          <div className="relative">
            {/* Illustration placeholder - có thể thay bằng SVG hoặc image */}
            <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="text-center text-white">
                <FiTrendingUp className="w-16 h-16 mx-auto mb-2" />
                <div className="text-3xl font-bold">{growthPercentage}%</div>
                <div className="text-sm opacity-90">Tăng trưởng</div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full opacity-80 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-pink-400 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsCard;

