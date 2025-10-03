import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {
    FiMenu,
    FiX,
    FiHome,
    FiBox,
    FiUsers,
    FiSettings,
    FiBell,
    FiLogOut,
    FiMessageSquare,
    FiHelpCircle,
    FiUser,
    FiChevronDown
} from "react-icons/fi";
import {useAuthContext} from "../features/auth/AuthProvider";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [activePath, setActivePath] = useState("");
    const {logout, email, name, fullName, roles} = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();

    // Xác định đường dẫn hiện tại
    useEffect(() => {
        setActivePath(location.pathname);
    }, [location]);

    const menuItems = [
        {icon: FiHome, label: "Dashboard", path: "/admin"},
        {icon: FiBox, label: "Products", path: "/admin/products"},
        {icon: FiUsers, label: "Users", path: "/admin/users"},
        {icon: FiSettings, label: "Settings", path: "/admin/settings"},
    ];

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
            logout();
            navigate("/login");
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl z-30 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
                } lg:translate-x-0 lg:w-64`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-blue-700">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                                <span className="text-blue-800 font-bold text-lg">S</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Sneat</h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <FiX className="w-5 h-5 text-white"/>
                        </button>
                    </div>

                    {/* User Profile Summary */}
                    <div className="px-6 py-4 border-b border-blue-700">
                        <div className="flex items-center">
                            <div
                                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3 shadow-md">
                                {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                                <p className="font-medium text-white truncate">{fullName || name || email}</p>
                                <p className="text-blue-200 text-sm truncate">{email}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {roles?.map((role, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-blue-600 bg-opacity-50 px-2 py-0.5 rounded-full"
                                        >
                      {role}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                                            activePath === item.path
                                                ? "bg-white text-blue-700 shadow-lg"
                                                : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                        }`}
                                    >
                                        <item.icon
                                            className={`w-5 h-5 mr-3 ${
                                                activePath === item.path ? "text-blue-700" : "group-hover:text-white"
                                            }`}
                                        />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-blue-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-300 hover:bg-blue-700 hover:text-white rounded-xl transition-all duration-200 group"
                        >
                            <FiLogOut className="w-5 h-5 mr-3 group-hover:text-white"/>
                            <span className="font-medium">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header
                    className="h-20 bg-white shadow-sm border-b border-gray-200 px-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
                        >
                            <FiMenu className="w-5 h-5 text-gray-600"/>
                        </button>

                        {/* Breadcrumb */}
                        <div className="ml-4 flex items-center space-x-2 text-sm text-gray-500">
                            <span>Admin</span>
                            <span>/</span>
                            <span className="text-blue-600 font-medium">
                {menuItems.find(item => item.path === activePath)?.label || "Dashboard"}
              </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors">
                            <FiBell className="w-5 h-5 text-gray-600"/>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative profile-dropdown">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                  </span>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                                        {fullName || name || email}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{email}</p>
                                </div>
                                <FiChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-800">Đăng nhập với tư cách</p>
                                        <p className="text-sm text-gray-600 truncate">{email}</p>
                                    </div>

                                    <div className="px-4 py-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vai trò</p>
                                        <div className="flex flex-wrap gap-1">
                                            {roles?.map((role, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                                                >
                          {role}
                        </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <FiLogOut className="w-4 h-4 mr-2"/>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area với khoảng cách và bo tròn */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="max-w-8xl mx-auto space-y-6">
                        {/* Content Container với bo tròn và shadow */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <Outlet/>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-4 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                            {/* Left Section */}
                            <div className="flex items-center space-x-6">
                                <p className="text-sm text-gray-600">
                                    © 2024 Sneat Admin. All rights reserved.
                                </p>
                                <div className="flex items-center space-x-4">
                                    <a
                                        href="#"
                                        className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                                    >
                                        <FiMessageSquare className="w-4 h-4"/>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                                    >
                                        <FiHelpCircle className="w-4 h-4"/>
                                    </a>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center space-x-6">
                                <a
                                    href="#"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="#"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                                >
                                    Terms of Service
                                </a>
                                <a
                                    href="#"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                                >
                                    Contact
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;