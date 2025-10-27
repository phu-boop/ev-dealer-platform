import React, { useRef } from 'react';
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiShield } from 'react-icons/fi';
import { useClickOutside } from '../../hooks/useClickOutside';

export const ProfileDropdown = ({
  user,
  role,
  isOpen,
  setIsOpen,
  handleLogout,
  navigate
}) => {
  const dropdownRef = useRef(null);
  const { email, name, fullName, roles } = user;

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
            isOpen ? 'rotate-180 transform' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 py-4 z-40 animate-scaleIn">
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
              <button
                onClick={() => {
                  navigate('/dealer/profile');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center p-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group hover:scale-105"
              >
                <FiUser className="w-4 h-4 mr-2 group-hover:scale-110" />
                <span className="text-sm font-medium">Hồ sơ</span>
              </button>

              <button
                onClick={() => {
                  navigate('/dealer/settings');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center p-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group hover:scale-105"
              >
                <FiSettings className="w-4 h-4 mr-2 group-hover:scale-110" />
                <span className="text-sm font-medium">Bảo mật</span>
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
  );
};