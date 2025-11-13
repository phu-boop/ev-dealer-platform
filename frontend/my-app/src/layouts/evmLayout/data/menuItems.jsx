import {
  FiHome,
  FiUsers,
  FiSettings,
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
  FiHome as FiHomeAlt,
  FiCreditCard as FiCreditCardAlt,
  FiShoppingCart,
  FiClipboard,
  FiCalendar,
  FiMessageCircle,
  FiSliders,
  FiGift,
  FiRefreshCw,
  FiBell,
  FiDollarSign,
} from "react-icons/fi";

export const adminMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Dashboard", path: "/evm/admin" },

  // Quản lý sản phẩm
  {
    icon: FiPackage,
    label: "Quản Lý Sản Phẩm",
    path: "/evm/admin/products",
    submenu: [
      {
        icon: FiList,
        label: "Danh Mục Xe",
        path: "/evm/admin/products/catalog",
      },
      {
        icon: FiCreditCard,
        label: "Giá & Khuyến Mãi",
        path: "/evm/admin/products/pricing",
      },
      {
        icon: FiTag,
        label: "Phiên Bản & Màu Sắc",
        path: "/evm/admin/products/variants",
      },
      {
        icon: FiSliders,
        label: "Quản Lý Tính Năng",
        path: "/evm/admin/products/features",
      },
      {
        icon: FiCreditCard,
        label: "(DONE)Khuyến Mãi",
        path: "/evm/admin/products/promotions",
      },
    ],
  },

  // Quản lý phân phối & kho
  {
    icon: FiTruck,
    label: "Phân Phối & Kho",
    path: "/evm/admin/distribution",
    submenu: [
      {
        icon: FiArchive,
        label: "Kho Trung Tâm",
        path: "/evm/admin/distribution/inventory/central",
      },
      {
        icon: FiNavigation,
        label: "Điều Phối Xe",
        path: "/evm/admin/distribution/allocation",
      },
      {
        icon: FiTruck,
        label: "Lịch Sử Phân Phối",
        path: "/evm/admin/distribution/history",
      },
    ],
  },

  // Quản lý đại lý
  {
    icon: FiBriefcase,
    label: "Quản Lý Đại Lý",
    path: "/evm/admin/dealers",
    submenu: [
      {
        icon: FiHomeAlt,
        label: "Danh Sách Đại Lý",
        path: "/evm/admin/dealers/list",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng & Chỉ Tiêu",
        path: "/evm/admin/dealers/contracts",
      },
      {
        icon: FiCreditCardAlt,
        label: "Công Nợ & Thanh Toán",
        path: "/evm/admin/dealers/debts",
      },
      {
        icon: FiUserPlus,
        label: "Tài Khoản Đại Lý",
        path: "/evm/admin/dealers/accounts",
      },
      {
        icon: FiBell,
        label: "Thông báo từ đại lí",
        path: "/evm/notifications",
      },
    ],
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo & Phân Tích",
    path: "/evm/admin/reports",
    submenu: [
      {
        icon: FiTrendingUp,
        label: "(DONE)Thông báo",
        path: "/evm/admin/reports/notifications",
      },
      {
        icon: FiTrendingUp,
        label: "Doanh Số",
        path: "/evm/admin/reports/sales",
      },
      {
        icon: FiPieChart,
        label: "Tồn Kho",
        path: "/evm/admin/reports/inventory",
      },
      {
        icon: FiCpu,
        label: "Dự Báo AI",
        path: "/evm/admin/reports/forecast",
      },
      {
        icon: FiMap,
        label: "Theo Khu Vực",
        path: "/evm/admin/reports/regional",
      },
    ],
  },

  // Quản trị hệ thống (chỉ dành cho evm/Admin)
  {
    icon: FiSettings,
    label: "Quản Trị Hệ Thống",
    path: "/evm/admin/system",
    submenu: [
      {
        icon: FiUsers,
        label: "(DONE)Quản Lý Người Dùng",
        path: "/evm/admin/system/users",
      },
      {
        icon: FiShield,
        label: "Phân Quyền Truy Cập",
        path: "/evm/admin/system/permissions",
      },
      {
        icon: FiDatabase,
        label: "Cấu Hình Hệ Thống",
        path: "/evm/admin/system/config",
      },
      {
        icon: FiRefreshCw,
        label: "Đồng bộ Dữ liệu (Backfill)",
        path: "/evm/admin/system/data-backfill",
      },
      {
        icon: FiActivity,
        label: "Nhật Ký Hoạt Động",
        path: "/evm/admin/system/audit",
      },
      {
        icon: FiDollarSign,
        label: "Quản Lý Phương Thức Thanh Toán",
        path: "/evm/admin/payments/methods",
      },
    ],
  },
];

export const evmStaffMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Dashboard", path: "/evm/staff" },

  // Quản lý sản phẩm
  {
    icon: FiPackage,
    label: "Quản Lý Sản Phẩm",
    path: "/evm/staff/products",
    submenu: [
      {
        icon: FiList,
        label: "(DONE)Danh Mục Xe",
        path: "/evm/staff/products/catalog",
      },
      {
        icon: FiTag,
        label: "(DONE)Phiên Bản & Màu Sắc",
        path: "/evm/staff/products/variants",
      },
      {
        icon: FiCreditCard,
        label: "Giá Sỉ & Chiết Khấu",
        path: "/evm/staff/products/pricing",
      },
      {
        icon: FiCreditCard,
        label: "(DONE)Khuyến Mãi",
        path: "/evm/staff/products/promotions",
      },
    ],
  },

  // Quản lý phân phối & kho
  {
    icon: FiTruck,
    label: "Phân Phối & Kho",
    path: "/evm/staff/distribution",
    submenu: [
      {
        icon: FiArchive,
        label: "(80%)Kho Trung Tâm",
        path: "/evm/staff/distribution/inventory/central",
      },
      {
        icon: FiNavigation,
        label: "Điều Phối Xe",
        path: "/evm/staff/distribution/allocation",
      },
    ],
  },

  // Quản lý đại lý
  {
    icon: FiBriefcase,
    label: "Quản Lý Đại Lý",
    path: "/evm/staff/dealers",
    submenu: [
      {
        icon: FiHomeAlt,
        label: "(DONE)Tai Khoản Đại Lý",
        path: "/evm/staff/dealers/dealer-accounts",
      },
      {
        icon: FiHomeAlt,
        label: "(DOONE)Danh Sách Đại Lý",
        path: "/evm/staff/dealers/list",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng & Chỉ Tiêu",
        path: "/evm/staff/dealers/contracts",
      },
      {
        icon: FiCreditCardAlt,
        label: "Công Nợ & Thanh Toán",
        path: "/evm/staff/dealers/debts",
      },
      {
        icon: FiFileText,
        label: "Hóa Đơn Đại Lý",
        path: "/evm/staff/payments/dealer-invoices",
      },
      {
        icon: FiBell,
        label: "Thông báo từ đại lí",
        path: "/evm/notifications",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Quản Lý Thanh Toán",
    path: "/evm/staff/payments",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Quản Lý Đơn Hàng B2B",
        path: "/evm/staff/orders",
      },
      {
        icon: FiCreditCard,
        label: "Công Nợ Đại Lý",
        path: "/evm/staff/debt",
      },
      {
        icon: FiDollarSign,
        label: "Đại Lý Thanh Toán Tiền Mặt",
        path: "/evm/staff/payments/cash-payments",
      },
    ],
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo & Phân Tích",
    path: "/evm/staff/reports",
    submenu: [
      {
        icon: FiTrendingUp,
        label: "Doanh Số Theo Đại Lý",
        path: "/evm/staff/reports/sales",
      },
      {
        icon: FiPieChart,
        label: "Tồn Kho & Tốc Độ Tiêu Thụ",
        path: "/evm/staff/reports/inventory",
      },
      {
        icon: FiCpu,
        label: "Dự Báo Nhu Cầu (AI)",
        path: "/evm/staff/reports/forecast",
      },
    ],
  },
];

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

  // Tài chính & thanh toán
  {
    icon: FiCreditCard,
    label: "Tài Chính & Thanh Toán",
    path: "/dealer/manager/finance",
    submenu: [
      {
        icon: FiCreditCard,
        label: "Thanh Toán & Trả Góp",
        path: "/dealer/manager/payments",
      },
      {
        icon: FiBarChart2,
        label: "Công Nợ Khách Hàng",
        path: "/dealer/manager/debts",
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
        icon: FiClipboard,
        label: "Đơn Hàng Mới",
        path: "/dealer/staff/orders/create",
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

  // Tài chính & báo cáo
  {
    icon: FiCreditCard,
    label: "Tài Chính & Báo Cáo",
    path: "/dealer/staff/finance",
    submenu: [
      {
        icon: FiCreditCard,
        label: "Thanh Toán",
        path: "/dealer/staff/payments",
      },
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
