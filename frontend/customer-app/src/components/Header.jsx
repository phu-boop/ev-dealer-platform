import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { getCartItemCount } from "../services/cartService";
import { useComparison } from "../utils/useComparison";

export default function Header() {
  const { isAuthenticated, logout, name, user } = useAuth();
  const navigate = useNavigate();
  const { count: compareCount } = useComparison();

  // Fetch cart item count
  const { data: cartCount } = useQuery({
    queryKey: ['cart-count', user?.memberId],
    queryFn: async () => {
      if (!user?.memberId) return 0;
      try {
        const response = await getCartItemCount(user.memberId);
        return response.data || 0;
      } catch (error) {
        console.error("Error fetching cart count:", error);
        return 0;
      }
    },
    enabled: !!user?.memberId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            VinPhust
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-6">
            {/* Public Pages */}
            <Link to="/" className="hover:text-blue-600 transition">
              Trang chủ
            </Link>
            <Link to="/vehicles" className="hover:text-blue-600 transition">
              Xe điện
            </Link>
            <Link to="/test-drive/book" className="hover:text-blue-600 transition">
              Đặt lái thử
            </Link>
            <Link to="/charging-stations" className="hover:text-blue-600 transition">
              Trạm sạc
            </Link>

            {isAuthenticated() ? (
              <>
                {/* Divider */}
                <div className="h-6 w-px bg-gray-300"></div>

                {/* User Menu */}
                <Link to="/orders" className="hover:text-blue-600 transition">
                  Đơn hàng
                </Link>
                <Link to="/my-test-drives" className="hover:text-blue-600 transition">
                  Lịch lái thử
                </Link>
                <Link to="/my-reviews" className="hover:text-blue-600 transition">
                  Đánh giá
                </Link>

                {/* Action Icons */}
                <Link 
                  to="/compare" 
                  className="relative hover:text-blue-600 transition"
                  title="So sánh xe"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {compareCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {compareCount}
                    </span>
                  )}
                </Link>

                <Link 
                  to="/cart" 
                  className="relative hover:text-blue-600 transition"
                  title="Giỏ hàng"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-300"></div>

                <Link to="/profile" className="text-blue-600 font-medium hover:text-blue-700 transition">
                  {name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                {/* Divider */}
                <div className="h-6 w-px bg-gray-300"></div>

                <Link
                  to="/login"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

