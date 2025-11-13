import {
  FiHome,
  FiPackage,
  FiTag,
  FiList,
  FiFileText,
  FiShoppingCart,
  FiClipboard,
  FiTruck,
  FiUsers,
  FiCalendar,
  FiMessageCircle,
  FiArchive,
  FiNavigation,
  FiCreditCard,
  FiPieChart,
  FiTrendingUp,
  FiBarChart2,
  FiSettings,
  FiUserPlus,
  FiSliders,
  FiGift,
  FiChevronDown,
  FiLogOut,
  FiX,
  FiMenu,
  FiBell,
  FiMessageSquare,
  FiHelpCircle,
  FiChevronRight,
  FiUser,
  FiShield,
  FiDollarSign,
} from "react-icons/fi";

export const dealerManagerMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Bảng Điều Khiển", path: "/dealer/dashboard" },

  // Danh mục xe & báo giá
  {
    icon: FiPackage,
    label: "Danh Mục Xe & Báo Giá",
    path: "/dealer/manager/vehicles",
    submenu: [
      {
        icon: FiList,
        label: "Xe Có Sẵn",
        path: "/dealer/manager/inventory/stock",
      },
      {
        icon: FiTag,
        label: "Toàn Bộ Mẫu Xe",
        path: "/dealer/manager/vehicles/all",
      },
      // {
      //   icon: FiSliders,
      //   label: "So Sánh Mẫu Xe",
      //   path: "/dealer/manager/vehicles/compare",
      // },
      {
        icon: FiFileText,
        label: "Tạo Báo Giá",
        path: "/dealer/manager/quotes/create",
      },
      {
        icon: FiCreditCard,
        label: "In Báo Giá",
        path: "/dealer/manager/quotes/print",
      },
      {
        icon: FiCreditCard,
        label: "(DONE)Giá & Khuyến Mãi",
        path: "/dealer/manager/promotions",
      },
    ],
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Quy Trình Bán Hàng",
    path: "/dealer/manager/sales",
    submenu: [
      {
        icon: FiFileText,
        label: "Quản Lý Báo Giá",
        path: "/dealer/manager/quotations",
      },
      {
        icon: FiClipboard,
        label: "Đơn Hàng Mới",
        path: "/dealer/manager/orders/create",
      },
      {
        icon: FiList,
        label: "Danh Sách Đơn Hàng",
        path: "/dealer/manager/orders",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng Mua Bán",
        path: "/dealer/manager/contracts",
      },
      {
        icon: FiTruck,
        label: "Theo Dõi Giao Xe",
        path: "/dealer/manager/delivery",
      },
    ],
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Quản Lý Khách Hàng",
    path: "/dealer/manager/customers",
    submenu: [
      {
        icon: FiUserPlus,
        label: "Thêm Khách Hàng",
        path: "/dealer/manager/customers/create",
      },
      {
        icon: FiList,
        label: "Hồ Sơ Khách Hàng",
        path: "/dealer/manager/customers/list",
      },
      {
        icon: FiCalendar,
        label: "Lịch Hẹn Lái Thử",
        path: "/dealer/manager/testdrives",
      },
      {
        icon: FiMessageCircle,
        label: "Khiếu Nại & Phản Hồi",
        path: "/dealer/manager/feedback",
      },
    ],
  },

  // Kho đại lý
  {
    icon: FiArchive,
    label: "Kho Đại Lý",
    path: "/dealer/manager/inventory",
    submenu: [
      {
        icon: FiList,
        label: "Xe Trong Kho",
        path: "/dealer/manager/inventory/stock",
      },
      {
        icon: FiClipboard,
        label: "Kiểm Kê",
        path: "/dealer/manager/inventory/audit",
      },
      {
        icon: FiNavigation,
        label: "Đặt Xe Từ Hãng",
        path: "/dealer/manager/inventory/order",
      },
      {
        icon: FiNavigation,
        label: "Thông tin đơn hàng",
        path: "/dealer/manager/inventory/info",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Quản Lý Thanh Toán",
    path: "/dealer/manager/payments",
    submenu: [
      {
        icon: FiFileText,
        label: "Hóa Đơn Của Tôi",
        path: "/dealer/manager/payments/invoices",
      },
      {
        icon: FiCreditCard,
        label: "Thanh Toán & Trả Góp",
        path: "/dealer/manager/payments/methods",
      },
      {
        icon: FiDollarSign,
        label: "Yêu Cầu Thanh Toán Tiền Mặt (B2C)",
        path: "/dealer/manager/payments/b2c-cash-payments",
      },
    ],
  },

  // Báo cáo đại lý
  {
    icon: FiPieChart,
    label: "Báo Cáo Đại Lý",
    path: "/dealer/manager/reports",
    submenu: [
      {
        icon: FiTrendingUp,
        label: "Doanh Số Theo Nhân Viên",
        path: "/dealer/manager/reports/staff",
      },
      {
        icon: FiBarChart2,
        label: "Doanh Số Theo Mẫu Xe",
        path: "/dealer/manager/reports/model",
      },
      {
        icon: FiGift,
        label: "Hiệu Suất & Tỷ Lệ Chốt Đơn",
        path: "/dealer/manager/reports/performance",
      },
    ],
  },

  // Cài đặt đại lý
  {
    icon: FiSettings,
    label: "Cài Đặt Đại Lý",
    path: "/dealer/manager/settings",
    submenu: [
      {
        icon: FiUsers,
        label: "Quản Lý Nhân Viên",
        path: "/dealer/manager/settings/staff",
      },
      {
        icon: FiSliders,
        label: "Cấu Hình Nội Bộ",
        path: "/dealer/manager/settings/config",
      },
    ],
  },
];

export const dealerStaffMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Bảng Điều Khiển", path: "/staff/dashboard" },

  // Danh mục xe & báo giá
  {
    icon: FiPackage,
    label: "Danh Mục Xe & Báo Giá",
    path: "/dealer/staff/vehicles",
    submenu: [
      {
        icon: FiList,
        label: "Xe Có Sẵn",
        path: "/dealer/staff/vehicles/available",
      },
      {
        icon: FiTag,
        label: "Toàn Bộ Mẫu Xe",
        path: "/dealer/staff/vehicles/all",
      },
      {
        icon: FiFileText,
        label: "Tạo Báo Giá",
        path: "/dealer/staff/quotes/create",
      },
      {
        icon: FiFileText,
        label: "(DONE)Xem khuyến mãi",
        path: "/dealer/staff/promotions",
      },
    ],
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Quy Trình Bán Hàng",
    path: "/dealer/staff/sales",
    submenu: [
      {
        icon: FiFileText,
        label: "Quản Lý Báo Giá",
        path: "/dealer/staff/quotations",
      },
      {
        icon: FiFileText,
        label: "Đanh sách báo giá",
        path: "/dealer/staff/list/quotations",
      },
      {
        icon: FiClipboard,
        label: "Đơn Hàng Mới",
        path: "/dealer/staff/orders",
      },
      {
        icon: FiList,
        label: "Danh Sách Đơn Hàng",
        path: "/dealer/staff/orders",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng Mua Bán",
        path: "/dealer/staff/contracts",
      },
      {
        icon: FiTruck,
        label: "Theo Dõi Giao Xe",
        path: "/dealer/staff/delivery",
      },
    ],
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Quản Lý Khách Hàng",
    path: "/dealer/staff/customers",
    submenu: [
      {
        icon: FiUserPlus,
        label: "Thêm Khách Hàng",
        path: "/dealer/staff/customers/create",
      },
      {
        icon: FiList,
        label: "Hồ Sơ Khách Hàng",
        path: "/dealer/staff/customers/list",
      },
      {
        icon: FiCalendar,
        label: "Lịch Hẹn Lái Thử",
        path: "/dealer/staff/testdrives",
      },
      {
        icon: FiMessageCircle,
        label: "Khiếu Nại & Phản Hồi",
        path: "/dealer/staff/feedback",
      },
    ],
  },

  // Kho đại lý
  {
    icon: FiArchive,
    label: "Kho Đại Lý",
    path: "/dealer/staff/inventory",
    submenu: [
      {
        icon: FiList,
        label: "Xe Trong Kho",
        path: "/dealer/staff/inventory/stock",
      },
      {
        icon: FiNavigation,
        label: "Đặt Xe Từ Hãng",
        path: "/dealer/staff/inventory/order",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Quản Lý Thanh Toán",
    path: "/dealer/staff/payments",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Danh Sách Đơn Hàng B2C",
        path: "/dealer/staff/payments/b2c-orders",
      },
    ],
  },

  // Tài chính & báo cáo
  {
    icon: FiCreditCard,
    label: "Tài Chính & Báo Cáo",
    path: "/dealer/staff/finance",
    submenu: [
      {
        icon: FiBarChart2,
        label: "Doanh Số Cá Nhân",
        path: "/dealer/staff/reports/personal",
      },
      {
        icon: FiGift,
        label: "Tỷ Lệ Chốt Đơn",
        path: "/dealer/staff/reports/performance",
      },
    ],
  },
];
