import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  Star
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingTestDrives: 0,
    lowStockVehicles: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    // TODO: Fetch actual stats from API
    setStats({
      totalVehicles: 45,
      totalOrders: 128,
      totalCustomers: 356,
      totalRevenue: 15750000000,
      pendingOrders: 12,
      pendingTestDrives: 8,
      lowStockVehicles: 5,
      pendingReviews: 15
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statCards = [
    {
      icon: Car,
      label: 'Tổng số xe',
      value: stats.totalVehicles,
      color: 'blue',
      link: '/admin/vehicles'
    },
    {
      icon: ShoppingCart,
      label: 'Đơn hàng',
      value: stats.totalOrders,
      color: 'green',
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} chờ xử lý` : null,
      link: '/admin/orders'
    },
    {
      icon: Users,
      label: 'Khách hàng',
      value: stats.totalCustomers,
      color: 'purple',
      link: '/admin/customers'
    },
    {
      icon: DollarSign,
      label: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      color: 'yellow',
      link: '/admin/reports'
    },
    {
      icon: Calendar,
      label: 'Lịch lái thử',
      value: stats.pendingTestDrives,
      color: 'indigo',
      badge: 'chờ xác nhận',
      link: '/admin/test-drives'
    },
    {
      icon: Package,
      label: 'Xe sắp hết',
      value: stats.lowStockVehicles,
      color: 'red',
      badge: 'cần nhập thêm',
      link: '/admin/vehicles'
    },
    {
      icon: Star,
      label: 'Đánh giá',
      value: stats.pendingReviews,
      color: 'orange',
      badge: 'chờ duyệt',
      link: '/admin/reviews'
    },
    {
      icon: TrendingUp,
      label: 'Tăng trưởng',
      value: '+23%',
      color: 'teal',
      badge: 'so với tháng trước',
      link: '/admin/reports'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600'
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600">Chào mừng đến với trang quản trị VinPhust</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {card.value}
                  </p>
                  {card.badge && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/vehicles/new"
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition text-center"
          >
            <Car className="mx-auto mb-2 text-blue-600" size={32} />
            <p className="font-medium">Thêm xe mới</p>
          </Link>
          <Link
            to="/admin/orders"
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition text-center"
          >
            <ShoppingCart className="mx-auto mb-2 text-green-600" size={32} />
            <p className="font-medium">Xử lý đơn hàng</p>
          </Link>
          <Link
            to="/admin/promotions/new"
            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition text-center"
          >
            <DollarSign className="mx-auto mb-2 text-purple-600" size={32} />
            <p className="font-medium">Tạo khuyến mãi</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
