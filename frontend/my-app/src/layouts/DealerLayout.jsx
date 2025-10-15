import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../features/auth/AuthProvider";
import Swal from "sweetalert2";

import {
  FiHome, FiPackage, FiTag, FiList, FiFileText, FiShoppingCart, FiClipboard,
  FiTruck, FiUsers, FiCalendar, FiMessageCircle, FiArchive, FiNavigation,
  FiCreditCard, FiPieChart, FiTrendingUp, FiBarChart2, FiSettings, FiUserPlus,
  FiSliders, FiGift, FiChevronDown, FiLogOut, FiX, FiMenu, FiBell,
  FiMessageSquare, FiHelpCircle, FiChevronRight, FiUser, FiShield
} from "react-icons/fi";

export const dealerManagerMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Bảng Điều Khiển", path: "/dealer/dashboard" },

  // Danh mục xe & báo giá
  {
    icon: FiPackage,
    label: "Danh Mục Xe & Báo Giá",
    path: "/dealer/vehicles",
    submenu: [
      { icon: FiList, label: "Xe Có Sẵn", path: "/dealer/vehicles/available" },
      { icon: FiTag, label: "Toàn Bộ Mẫu Xe", path: "/dealer/vehicles/all" },
      { icon: FiSliders, label: "So Sánh Mẫu Xe", path: "/dealer/vehicles/compare" },
      { icon: FiFileText, label: "Tạo Báo Giá", path: "/dealer/quotes/create" },
      { icon: FiCreditCard, label: "In Báo Giá", path: "/dealer/quotes/print" }
    ]
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Quy Trình Bán Hàng",
    path: "/dealer/sales",
    submenu: [
      { icon: FiClipboard, label: "Đơn Hàng Mới", path: "/dealer/orders/create" },
      { icon: FiList, label: "Danh Sách Đơn Hàng", path: "/dealer/orders" },
      { icon: FiFileText, label: "Hợp Đồng Mua Bán", path: "/dealer/contracts" },
      { icon: FiTruck, label: "Theo Dõi Giao Xe", path: "/dealer/delivery" }
    ]
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Quản Lý Khách Hàng",
    path: "/dealer/customers",
    submenu: [
      { icon: FiUserPlus, label: "Thêm Khách Hàng", path: "/dealer/customers/create" },
      { icon: FiList, label: "Hồ Sơ Khách Hàng", path: "/dealer/customers/list" },
      { icon: FiCalendar, label: "Lịch Hẹn Lái Thử", path: "/dealer/testdrives" },
      { icon: FiMessageCircle, label: "Khiếu Nại & Phản Hồi", path: "/dealer/feedback" }
    ]
  },

  // Kho đại lý
  {
    icon: FiArchive,
    label: "Kho Đại Lý",
    path: "/dealer/inventory",
    submenu: [
      { icon: FiList, label: "Xe Trong Kho", path: "/dealer/inventory/stock" },
      { icon: FiClipboard, label: "Kiểm Kê", path: "/dealer/inventory/audit" },
      { icon: FiNavigation, label: "Đặt Xe Từ Hãng", path: "/dealer/inventory/order" }
    ]
  },

  // Tài chính & thanh toán
  {
    icon: FiCreditCard,
    label: "Tài Chính & Thanh Toán",
    path: "/dealer/finance",
    submenu: [
      { icon: FiCreditCard, label: "Thanh Toán & Trả Góp", path: "/dealer/payments" },
      { icon: FiBarChart2, label: "Công Nợ Khách Hàng", path: "/dealer/debts" }
    ]
  },

  // Báo cáo đại lý
  {
    icon: FiPieChart,
    label: "Báo Cáo Đại Lý",
    path: "/dealer/reports",
    submenu: [
      { icon: FiTrendingUp, label: "Doanh Số Theo Nhân Viên", path: "/dealer/reports/staff" },
      { icon: FiBarChart2, label: "Doanh Số Theo Mẫu Xe", path: "/dealer/reports/model" },
      { icon: FiGift, label: "Hiệu Suất & Tỷ Lệ Chốt Đơn", path: "/dealer/reports/performance" }
    ]
  },

  // Cài đặt đại lý
  {
    icon: FiSettings,
    label: "Cài Đặt Đại Lý",
    path: "/dealer/settings",
    submenu: [
      { icon: FiUsers, label: "Quản Lý Nhân Viên", path: "/dealer/settings/staff" },
      { icon: FiSliders, label: "Cấu Hình Nội Bộ", path: "/dealer/settings/config" }
    ]
  }
];

export const dealerStaffMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Bảng Điều Khiển", path: "/staff/dashboard" },

  // Danh mục xe & báo giá
  {
    icon: FiPackage,
    label: "Danh Mục Xe & Báo Giá",
    path: "/staff/vehicles",
    submenu: [
      { icon: FiList, label: "Xe Có Sẵn", path: "/staff/vehicles/available" },
      { icon: FiTag, label: "Toàn Bộ Mẫu Xe", path: "/staff/vehicles/all" },
      { icon: FiFileText, label: "Tạo Báo Giá", path: "/staff/quotes/create" }
    ]
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Quy Trình Bán Hàng",
    path: "/staff/sales",
    submenu: [
      { icon: FiClipboard, label: "Đơn Hàng Mới", path: "/staff/orders/create" },
      { icon: FiList, label: "Danh Sách Đơn Hàng", path: "/staff/orders" },
      { icon: FiFileText, label: "Hợp Đồng Mua Bán", path: "/staff/contracts" },
      { icon: FiTruck, label: "Theo Dõi Giao Xe", path: "/staff/delivery" }
    ]
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Quản Lý Khách Hàng",
    path: "/staff/customers",
    submenu: [
      { icon: FiUserPlus, label: "Thêm Khách Hàng", path: "/staff/customers/create" },
      { icon: FiList, label: "Hồ Sơ Khách Hàng", path: "/staff/customers/list" },
      { icon: FiCalendar, label: "Lịch Hẹn Lái Thử", path: "/staff/testdrives" },
      { icon: FiMessageCircle, label: "Khiếu Nại & Phản Hồi", path: "/staff/feedback" }
    ]
  },

  // Kho đại lý
  {
    icon: FiArchive,
    label: "Kho Đại Lý",
    path: "/staff/inventory",
    submenu: [
      { icon: FiList, label: "Xe Trong Kho", path: "/staff/inventory/stock" },
      { icon: FiNavigation, label: "Đặt Xe Từ Hãng", path: "/staff/inventory/order" }
    ]
  },

  // Tài chính & báo cáo
  {
    icon: FiCreditCard,
    label: "Tài Chính & Báo Cáo",
    path: "/staff/finance",
    submenu: [
      { icon: FiCreditCard, label: "Thanh Toán", path: "/staff/payments" },
      { icon: FiBarChart2, label: "Doanh Số Cá Nhân", path: "/staff/reports/personal" },
      { icon: FiGift, label: "Tỷ Lệ Chốt Đơn", path: "/staff/reports/performance" }
    ]
  }
];


const EvmLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [activePath, setActivePath] = useState("");
    const [openSubmenus, setOpenSubmenus] = useState(new Set());
    const {logout, email, name, fullName, roles} = useAuthContext();
    
    // Xác định menuItems dựa trên roles từ AuthContext
    const menuItems = roles?.includes("DEALER_MANAGER")
      ? dealerManagerMenuItems
      : dealerStaffMenuItems;
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
                    className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                        isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/25"
                            : "text-slate-700 hover:bg-white/10 hover:text-white hover:shadow-lg border border-transparent hover:border-white/20"
                    }`}
                >
                    {/* Active indicator */}
                    {isActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
                    )}

                    <div className="flex items-center z-10">
                        <item.icon
                            className={`w-5 h-5 mr-3.5 transition-all duration-300 ${
                                isActive 
                                    ? "text-white scale-110" 
                                    : "text-slate-300 group-hover:text-white group-hover:scale-110"
                            }`}
                        />
                        <span className={`font-medium transition-all duration-300 ${
                            isActive ? "text-white" : "text-slate-200 group-hover:text-white"
                        }`}>
                            {item.label}
                        </span>
                    </div>
                    {hasSubmenu && (
                        <FiChevronDown
                            className={`w-4 h-4 transition-all duration-300 z-10 ${
                                isSubmenuOpen ? 'rotate-180 transform' : ''
                            } ${
                                isActive 
                                    ? 'text-white' 
                                    : 'text-slate-300 group-hover:text-white'
                            }`}
                        />
                    )}
                </button>

                {/* Submenu với animation */}
                {hasSubmenu && (
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isSubmenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <ul className="ml-6 mt-2 space-y-1.5 pb-2 border-l border-blue-400/20">
                            {item.submenu.map((subItem, subIndex) => (
                                <li key={subIndex}>
                                    <button
                                        onClick={() => {
                                            handleNavigation(subItem.path);
                                            if (window.innerWidth < 1024) {
                                                setIsSidebarOpen(false);
                                            }
                                        }}
                                        className={`flex items-center w-full px-4 py-2.5 rounded-xl transition-all duration-300 group relative transform hover:translate-x-1 ${
                                            activePath === subItem.path
                                                ? "bg-white/15 text-white border-l-2 border-white shadow-md"
                                                : "text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-sm"
                                        }`}
                                    >
                                        {/* Submenu active indicator */}
                                        {activePath === subItem.path && (
                                            <div className="absolute left-0 w-0.5 h-6 bg-white rounded-full"></div>
                                        )}
                                        <subItem.icon
                                            className={`w-4 h-4 mr-3 transition-all duration-300 ${
                                                activePath === subItem.path 
                                                    ? "text-white scale-110" 
                                                    : "text-slate-400 group-hover:text-white group-hover:scale-110"
                                            }`}
                                        />
                                        <span className="text-sm font-medium transition-all duration-300">
                                            {subItem.label}
                                        </span>
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
        Swal.fire({
            title: 'Xác nhận đăng xuất',
            text: "Bạn có chắc muốn đăng xuất khỏi hệ thống?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy',
            background: '#ffffff',
            color: '#1f2937',
            customClass: {
                popup: 'rounded-2xl shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-2.5',
                cancelButton: 'rounded-xl px-6 py-2.5'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate("/login");
            }
        });
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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans overflow-hidden">
            {/* Sidebar Overlay với animation */}
            <div
                className={`fixed inset-0 z-20 transition-all duration-300 lg:hidden ${
                    isSidebarOpen 
                        ? 'bg-black/40 backdrop-blur-sm' 
                        : 'bg-opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar với gradient đẹp */}
            <aside
                ref={sidebarRef}
                className={`fixed lg:static top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-30 transition-all duration-500 ease-in-out ${
                    isSidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-20"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="h-24 flex items-center justify-between px-7 border-b border-slate-700/60 bg-slate-900/50 backdrop-blur-lg">
                        <div className={`flex items-center transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl border border-blue-400/30">
                                <span className="text-white font-bold text-xl">EV</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white whitespace-nowrap bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                    EV Dealer
                                </h1>
                                <p className="text-xs text-slate-400 mt-0.5">Management System</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2.5 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                            <FiX className="w-5 h-5 text-slate-300"/>
                        </button>
                    </div>

                    {/* User Profile Summary */}
                    <div className={`px-6 py-6 border-b border-slate-700/50 transition-all duration-300 bg-slate-800/30 backdrop-blur-sm ${
                        isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
                    }`}>
                        <div className="flex items-center">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl mr-4 shadow-2xl border-2 border-white/20">
                                    {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800"></div>
                            </div>
                            <div className="truncate flex-1">
                                <p className="font-semibold text-white truncate text-lg leading-tight">
                                    {fullName || name || email}
                                </p>
                                <p className="text-slate-300 text-sm truncate mt-1.5">{email}</p>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {roles?.map((role, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-slate-700/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-600/50 text-slate-200 font-medium"
                                        >
                                            {role.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-5 py-6 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-2.5">
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
                    <div className={`p-5 border-t border-slate-700/50 transition-all duration-300 ${
                        isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
                    }`}>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3.5 text-red-300 hover:bg-red-500/20 hover:text-white rounded-2xl transition-all duration-300 group border border-red-400/30 hover:border-red-400/50 bg-slate-800/30 backdrop-blur-sm hover:shadow-lg"
                        >
                            <FiLogOut className="w-5 h-5 mr-3.5 group-hover:scale-110 transition-transform duration-300"/>
                            <span className="font-medium">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                {/* Header */}
                <header className="h-20 mx-6 my-4 rounded-2xl bg-white/90 backdrop-blur-xl shadow-sm border border-gray-200/80 px-7 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md lg:hidden mr-4"
                        >
                            <FiMenu className="w-5 h-5 text-gray-600"/>
                        </button>

                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-500 font-medium flex items-center">
                                <FiHome className="w-4 h-4 mr-2" />
                                Trang chủ
                            </span>
                            <FiChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                                {menuItems.find(item => item.path === activePath)?.label || "Dashboard"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-3 hover:bg-gray-100 rounded-xl relative transition-all duration-300 group hover:shadow-md">
                            <FiBell className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform duration-300"/>
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                        </button>

                        {/* Messages */}
                        <button className="p-3 hover:bg-gray-100 rounded-xl relative transition-all duration-300 group hover:shadow-md">
                            <FiMessageSquare className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform duration-300"/>
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative profile-dropdown" ref={profileDropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 group border border-transparent hover:border-gray-200 hover:shadow-md"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/30">
                                        <span className="text-white font-semibold text-lg">
                                            {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-800 truncate max-w-xs">
                                        {fullName || name || email}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{email}</p>
                                </div>
                                <FiChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                                        isProfileDropdownOpen ? 'rotate-180 transform' : ''
                                    }`}/>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div
                                    className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 py-4 z-40 animate-in fade-in-0 zoom-in-95">
                                    {/* User Info */}
                                    <div className="px-5 py-4 border-b border-gray-100/80">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                <span className="text-white font-semibold text-xl">
                                                    {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-lg font-semibold text-gray-800 truncate">
                                                    {fullName || name || email}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate mt-0.5">{email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Roles Section */}
                                    <div className="px-5 py-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">
                                            Vai trò hệ thống
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {roles?.map((role, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-xl shadow-sm font-medium border border-blue-400/30"
                                                >
                                                    {role.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="px-5 py-3 border-t border-gray-100/80">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="flex items-center justify-center p-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
                                                <FiUser className="w-4 h-4 mr-2 group-hover:scale-110" />
                                                <span className="text-sm font-medium">Hồ sơ</span>
                                            </button>
                                            <button className="flex items-center justify-center p-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
                                                <FiSettings className="w-4 h-4 mr-2 group-hover:scale-110" />
                                                <span className="text-sm font-medium">Cài đặt</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100/80 pt-3">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 rounded-xl group font-medium"
                                        >
                                            <FiLogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300"/>
                                            Đăng xuất khỏi hệ thống
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-transparent">
                    <div className="max-w-8xl mx-auto space-y-6 h-full">
                        {/* Content Container với glassmorphism effect */}
                        <div className="bg-white/90 backdrop-blur-xl h-full rounded-2xl shadow-sm border border-gray-200/80 p-8 transition-all duration-300 hover:shadow-md">
                            <Outlet/>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white/90 backdrop-blur-xl border-t border-gray-200/80 py-6 px-8 mx-6 my-4 rounded-2xl">
                    <div className="max-w-8xl mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                            {/* Left Section */}
                            <div className="flex items-center space-x-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">EV</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        © 2024 EV Dealer System. All rights reserved.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-5">
                                    <a
                                        href="#"
                                        className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2.5 hover:bg-blue-50 rounded-xl group"
                                    >
                                        <FiMessageSquare className="w-4 h-4 group-hover:scale-110"/>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2.5 hover:bg-blue-50 rounded-xl group"
                                    >
                                        <FiHelpCircle className="w-4 h-4 group-hover:scale-110"/>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2.5 hover:bg-blue-50 rounded-xl group"
                                    >
                                        <FiShield className="w-4 h-4 group-hover:scale-110"/>
                                    </a>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center space-x-8">
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
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
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