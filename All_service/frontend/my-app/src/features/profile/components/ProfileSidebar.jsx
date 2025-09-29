import React from 'react';
import {
  User,
  Settings,
  Shield,
  CreditCard,
  Bell,
  ChevronRight
} from 'lucide-react';

const ProfileSidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    {
      id: 'profile',
      label: 'Thông tin cá nhân',
      icon: User,
      description: 'Quản lý thông tin cá nhân của bạn'
    },
    {
      id: 'security',
      label: 'Bảo mật',
      icon: Shield,
      description: 'Đổi mật khẩu và cài đặt bảo mật'
    },
    {
      id: 'billing',
      label: 'Thanh toán',
      icon: CreditCard,
      description: 'Quản lý phương thức thanh toán'
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      icon: Bell,
      description: 'Cài đặt thông báo'
    },
    {
      id: 'settings',
      label: 'Cài đặt chung',
      icon: Settings,
      description: 'Cài đặt hệ thống'
    }
  ];

  return (
    <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
          U
        </div>
        <h2 className="text-xl font-semibold text-gray-800">User Name</h2>
        <p className="text-gray-500 text-sm">user@example.com</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === item.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Icon size={20} />
              </div>
              <div className="ml-4 text-left flex-1">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRight
                size={16}
                className={`transition-transform ${
                  activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileSidebar;