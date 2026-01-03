import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Header() {
  const { isAuthenticated, logout, name } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            VinPhust
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
            <Link to="/vehicles" className="hover:text-blue-600">Xe điện</Link>
            {isAuthenticated() ? (
              <>
                <Link to="/profile" className="hover:text-blue-600">
                  Xin chào, {name}
                </Link>
                <Link to="/orders" className="hover:text-blue-600">Đơn hàng</Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

