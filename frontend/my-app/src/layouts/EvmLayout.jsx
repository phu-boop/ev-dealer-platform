import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useState, useEffect, useRef} from "react";

import {useAuthContext} from "../features/auth/AuthProvider";
import {
    FiMenu,
    FiX,
    FiHome,
    FiUsers,
    FiSettings,
    FiBell,
    FiLogOut,
    FiMessageSquare,
    FiHelpCircle,
    FiChevronDown,
    FiPackage,
    FiList,
    FiCreditCard,
    FiTag,
    FiTruck,
    FiArchive,
    FiNavigation,
    FiBriefcase,
    FiFileText,
    FiUserPlus,
    FiBarChart2,
    FiTrendingUp,
    FiPieChart,
    FiCpu,
    FiMap,
    FiShield,
    FiDatabase,
    FiActivity,
    FiChevronRight,
    FiHome as FiHomeAlt,
    FiCreditCard as FiCreditCardAlt
} from 'react-icons/fi';

export const adminMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Dashboard", path: "/admin" },

  // Quản lý sản phẩm
  {
    icon: FiPackage,
    label: "Quản Lý Sản Phẩm",
    path: "/admin/products",
    submenu: [
      { icon: FiList, label: "Danh Mục Xe", path: "/admin/products/catalog" },
      { icon: FiCreditCard, label: "Giá & Khuyến Mãi", path: "/admin/products/pricing" },
      { icon: FiTag, label: "Phiên Bản & Màu Sắc", path: "/admin/products/variants" }
    ]
  },

  // Quản lý phân phối & kho
  {
    icon: FiTruck,
    label: "Phân Phối & Kho",
    path: "/admin/distribution",
    submenu: [
      { icon: FiArchive, label: "Kho Trung Tâm", path: "/admin/distribution/warehouse" },
      { icon: FiNavigation, label: "Điều Phối Xe", path: "/admin/distribution/allocation" },
      { icon: FiTruck, label: "Lịch Sử Phân Phối", path: "/admin/distribution/history" }
    ]
  },

  // Quản lý đại lý
  {
    icon: FiBriefcase,
    label: "Quản Lý Đại Lý",
    path: "/admin/dealers",
    submenu: [
      { icon: FiHomeAlt, label: "Danh Sách Đại Lý", path: "/admin/dealers/list" },
      { icon: FiFileText, label: "Hợp Đồng & Chỉ Tiêu", path: "/admin/dealers/contracts" },
      { icon: FiCreditCardAlt, label: "Công Nợ & Thanh Toán", path: "/admin/dealers/debts" },
      { icon: FiUserPlus, label: "Tài Khoản Đại Lý", path: "/admin/dealers/accounts" }
    ]
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo & Phân Tích",
    path: "/admin/reports",
    submenu: [
      { icon: FiTrendingUp, label: "Doanh Số", path: "/admin/reports/sales" },
      { icon: FiPieChart, label: "Tồn Kho", path: "/admin/reports/inventory" },
      { icon: FiCpu, label: "Dự Báo AI", path: "/admin/reports/forecast" },
      { icon: FiMap, label: "Theo Khu Vực", path: "/admin/reports/regional" }
    ]
  },

  // Quản trị hệ thống (chỉ dành cho Admin)
  {
    icon: FiSettings,
    label: "Quản Trị Hệ Thống",
    path: "/admin/system",
    submenu: [
      { icon: FiUsers, label: "Quản Lý Người Dùng", path: "/admin/system/users" },
      { icon: FiShield, label: "Phân Quyền Truy Cập", path: "/admin/system/permissions" },
      { icon: FiDatabase, label: "Cấu Hình Hệ Thống", path: "/admin/system/config" },
      { icon: FiActivity, label: "Nhật Ký Hoạt Động", path: "/admin/system/audit" }
    ]
  }
];


export const evmStaffMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Dashboard", path: "/evm" },

  // Quản lý sản phẩm
  {
    icon: FiPackage,
    label: "Quản Lý Sản Phẩm",
    path: "/evm/products",
    submenu: [
      { icon: FiList, label: "Danh Mục Xe", path: "/evm/products/catalog" },
      { icon: FiTag, label: "Phiên Bản & Màu Sắc", path: "/evm/products/variants" },
      { icon: FiCreditCard, label: "Giá Sỉ & Chiết Khấu", path: "/evm/products/pricing" }
    ]
  },

  // Quản lý phân phối & kho
  {
    icon: FiTruck,
    label: "Phân Phối & Kho",
    path: "/evm/distribution",
    submenu: [
      { icon: FiArchive, label: "Kho Trung Tâm", path: "/evm/distribution/warehouse" },
      { icon: FiNavigation, label: "Điều Phối Xe", path: "/evm/distribution/allocation" }
    ]
  },

  // Quản lý đại lý
  {
    icon: FiBriefcase,
    label: "Quản Lý Đại Lý",
    path: "/evm/dealers",
    submenu: [
      { icon: FiHomeAlt, label: "Danh Sách Đại Lý", path: "/evm/dealers/list" },
      { icon: FiFileText, label: "Hợp Đồng & Chỉ Tiêu", path: "/evm/dealers/contracts" },
      { icon: FiCreditCardAlt, label: "Công Nợ & Thanh Toán", path: "/evm/dealers/debts" }
    ]
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo & Phân Tích",
    path: "/evm/reports",
    submenu: [
      { icon: FiTrendingUp, label: "Doanh Số Theo Đại Lý", path: "/evm/reports/sales" },
      { icon: FiPieChart, label: "Tồn Kho & Tốc Độ Tiêu Thụ", path: "/evm/reports/inventory" },
      { icon: FiCpu, label: "Dự Báo Nhu Cầu (AI)", path: "/evm/reports/forecast" }
    ]
  }
];


const rolesString = sessionStorage.getItem("roles");
let roles = [];

try {
  roles = rolesString ? JSON.parse(rolesString) : [];
} catch (error) {
  console.error("Failed to parse roles:", error);
  roles = []; // fallback
}

console.log("Roles parsed:", roles);

const menuItems = roles.includes("ADMIN")
  ? adminMenuItems
  : evmStaffMenuItems;



const EvmLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [activePath, setActivePath] = useState("");
    const [openSubmenus, setOpenSubmenus] = useState(new Set());
    const {logout, email, name, fullName, roles} = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const profileDropdownRef = useRef(null);

    // Xác định đường dẫn hiện tại và mở submenu tương ứng
    useEffect(() => {
        const path = location.pathname;
        setActivePath(path);

        // Tự động mở submenu khi trang được load
        const newOpenSubmenus = new Set();
        menuItems.forEach(item => {
            if (item.submenu) {
                const isActiveSubmenu = item.submenu.some(sub => sub.path === path);
                if (isActiveSubmenu) {
                    newOpenSubmenus.add(item.path);
                }
            }
        });
        setOpenSubmenus(newOpenSubmenus);
    }, [location]);

    const MenuItem = ({item, activePath, handleNavigation}) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isActive = activePath === item.path || (hasSubmenu && item.submenu.some(sub => sub.path === activePath));
        const isSubmenuOpen = openSubmenus.has(item.path);

        const handleItemClick = () => {
            if (hasSubmenu) {
                const newOpenSubmenus = new Set(openSubmenus);
                if (newOpenSubmenus.has(item.path)) {
                    newOpenSubmenus.delete(item.path);
                } else {
                    newOpenSubmenus.add(item.path);
                }
                setOpenSubmenus(newOpenSubmenus);
            } else {
                handleNavigation(item.path);
                // Đóng sidebar trên mobile sau khi chọn menu item
                if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                }
            }
        };

        return (
            <li>
                <button
                    onClick={handleItemClick}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                            ? "bg-white text-blue-700 shadow-lg shadow-blue-200/50"
                            : "text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md"
                    }`}
                >
                    <div className="flex items-center">
                        <item.icon
                            className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                                isActive ? "text-blue-700 scale-110" : "group-hover:text-white group-hover:scale-110"
                            }`}
                        />
                        <span className="font-medium transition-all duration-300">{item.label}</span>
                    </div>
                    {hasSubmenu && (
                        <FiChevronDown
                            className={`w-4 h-4 transition-all duration-300 ${
                                isSubmenuOpen ? 'rotate-180 transform' : ''
                            } ${isActive ? 'text-blue-700' : 'group-hover:text-white'}`}
                        />
                    )}
                </button>

                {/* Submenu với animation */}
                {hasSubmenu && (
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isSubmenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <ul className="ml-4 mt-1 space-y-1 pb-2">
                            {item.submenu.map((subItem, subIndex) => (
                                <li key={subIndex}>
                                    <button
                                        onClick={() => {
                                            handleNavigation(subItem.path);
                                            if (window.innerWidth < 1024) {
                                                setIsSidebarOpen(false);
                                            }
                                        }}
                                        className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-300 group transform hover:translate-x-1 ${
                                            activePath === subItem.path
                                                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm"
                                                : "text-blue-200 hover:bg-blue-600 hover:text-white hover:shadow-sm"
                                        }`}
                                    >
                                        <subItem.icon
                                            className={`w-4 h-4 mr-3 transition-transform duration-300 ${
                                                activePath === subItem.path ? "text-blue-700 scale-110" : "group-hover:text-white group-hover:scale-110"
                                            }`}
                                        />
                                        <span className="text-sm font-medium transition-all duration-300">{subItem.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </li>
        );
    };

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
            if (isProfileDropdownOpen && profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    // Đóng sidebar khi resize trên desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans overflow-hidden">
            {/* Sidebar Overlay với animation */}
            <div
                className={`fixed inset-0 z-20 transition-all duration-300 lg:hidden ${
                    isSidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar với shadow và border */}
            <aside
                ref={sidebarRef}
                className={`fixed lg:static top-0 left-0 h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl z-30 transition-all duration-500 ease-in-out ${
                    isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-20"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-blue-700/50">
                        <div className={`flex items-center transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg">
                                <span className="text-blue-800 font-bold text-xl">EV</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white whitespace-nowrap">EV Dealer</h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 hover:bg-blue-700/50 rounded-xl transition-all duration-300 hover:scale-110"
                        >
                            <FiX className="w-5 h-5 text-white"/>
                        </button>
                    </div>

                    {/* User Profile Summary */}
                    <div className={`px-6 py-5 border-b border-blue-700/50 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`}>
                        <div className="flex items-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl mr-4 shadow-lg border-2 border-white/20">
                                {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate flex-1">
                                <p className="font-semibold text-white truncate text-lg">{fullName || name || email}</p>
                                <p className="text-blue-200 text-sm truncate mt-1">{email}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {roles?.map((role, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-blue-600/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-blue-400/30"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => (
                                <MenuItem
                                    key={index}
                                    item={item}
                                    activePath={activePath}
                                    handleNavigation={handleNavigation}
                                />
                            ))}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className={`p-4 border-t border-blue-700/50 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`}>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-white rounded-xl transition-all duration-300 group border border-red-400/20 hover:border-red-400/40"
                        >
                            <FiLogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300"/>
                            <span className="font-medium">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                {/* Header */}
                <header className="h-20 mx-6 my-3 rounded-3xl bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60 px-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md lg:hidden"
                        >
                            <FiMenu className="w-5 h-5 text-gray-600"/>
                        </button>

                        {/* Breadcrumb */}
                        <div className="ml-4 flex items-center space-x-3 text-sm">
                            <span className="text-gray-500">Trang chủ</span>
                            <FiChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg">
                                {menuItems.find(item => item.path === activePath)?.label || "Dashboard"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Notifications */}
                        <button className="p-2.5 hover:bg-gray-100 rounded-xl relative transition-all duration-300 group">
                            <FiBell className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform duration-300"/>
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative profile-dropdown" ref={profileDropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 group border border-transparent hover:border-gray-200"
                            >
                                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-semibold text-lg">
                                        {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-800 truncate max-w-xs">
                                        {fullName || name || email}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{email}</p>
                                </div>
                                <FiChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-all duration-300 ${isProfileDropdownOpen ? 'rotate-180 transform' : ''}`}/>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div
                                    className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/60 py-3 z-40 animate-in fade-in-0 zoom-in-95">
                                    <div className="px-4 py-3 border-b border-gray-100/60">
                                        <p className="text-sm font-semibold text-gray-800">Đăng nhập với tư cách</p>
                                        <p className="text-sm text-gray-600 truncate mt-1">{email}</p>
                                    </div>

                                    <div className="px-4 py-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Vai trò</p>
                                        <div className="flex flex-wrap gap-2">
                                            {roles?.map((role, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full shadow-sm"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100/60 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 rounded-lg group"
                                        >
                                            <FiLogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300"/>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area với khoảng cách và bo tròn */}
                <main className="flex-1 overflow-y-auto p-6 bg-transparent">
                    <div className="max-w-8xl mx-auto space-y-6 w-full min-h-0">
                        {/* Content Container với glassmorphism effect */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-gray-200/60 p-8 transition-all duration-300 hover:shadow-md w-full min-h-0">
                            <Outlet/>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200/60 py-5 px-6 mt-auto mx-6 my-3 rounded-3xl">
                    <div className="max-w-8xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                            {/* Left Section */}
                            <div className="flex items-center space-x-6">
                                <p className="text-sm text-gray-600 font-medium">
                                    © 2024 EV Dealer System. All rights reserved.
                                </p>
                                <div className="flex items-center space-x-4">
                                    <a
                                        href="#"
                                        className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2 hover:bg-blue-50 rounded-lg"
                                    >
                                        <FiMessageSquare className="w-4 h-4"/>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2 hover:bg-blue-50 rounded-lg"
                                    >
                                        <FiHelpCircle className="w-4 h-4"/>
                                    </a>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center space-x-6">
                                <a
                                    href="#"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:underline"
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="#"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:underline"
                                >
                                    Terms of Service
                                </a>
                                <a
                                    href="#"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:underline"
                                >
                                    Contact
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
};

export default EvmLayout;