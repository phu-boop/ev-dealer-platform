import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import {
  Menu,
  X,
  ChevronDown,
  User,
  ShoppingBag,
  MessageSquare,
  Calculator,
  MapPin,
  Settings,
  LogOut,
  Car,
  GitCompare,
  Zap,
} from "lucide-react";

export default function Header() {
  const { isAuthenticated, logout, name } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">VinPhust</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Trang chủ
            </Link>

            {/* Features Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFeaturesMenuOpen(!isFeaturesMenuOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isFeaturesMenuOpen
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Tính năng
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isFeaturesMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isFeaturesMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFeaturesMenuOpen(false)}
                  ></div>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <Link
                      to="/test-drive"
                      onClick={() => setIsFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Car className="w-4 h-4" />
                      Đặt Lái Thử
                    </Link>
                    <Link
                      to="/configure"
                      onClick={() => setIsFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Cấu Hình Xe
                    </Link>
                    <Link
                      to="/compare"
                      onClick={() => setIsFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <GitCompare className="w-4 h-4" />
                      So Sánh Xe
                    </Link>
                    <Link
                      to="/charging-stations"
                      onClick={() => setIsFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Trạm Sạc
                    </Link>
                    <Link
                      to="/chatbot"
                      onClick={() => setIsFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Tư Vấn AI
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      to="/financing"
                      onClick={() => setIsFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Tính Trả Góp
                    </Link>
                    <Link
                      to="/tco-calculator"
                      onClick={() => setIsFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Tính Chi Phí
                    </Link>
                  </div>
                </>
              )}
            </div>

            {isAuthenticated() ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/orders")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Đơn hàng
                  </div>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{name || "Tài khoản"}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Thông tin tài khoản
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Đơn hàng của tôi
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/test-drive"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Car className="w-4 h-4" />
                Đặt Lái Thử
              </Link>
              <Link
                to="/configure"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Cấu Hình Xe
              </Link>
              <Link
                to="/compare"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                So Sánh Xe
              </Link>
              <Link
                to="/charging-stations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Trạm Sạc
              </Link>
              <Link
                to="/chatbot"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Tư Vấn AI
              </Link>
              <Link
                to="/financing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Tính Trả Góp
              </Link>
              <Link
                to="/tco-calculator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Tính Chi Phí
              </Link>
              {isAuthenticated() ? (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Đơn hàng
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Tài khoản
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium text-center hover:bg-blue-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium text-center hover:bg-blue-700"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
