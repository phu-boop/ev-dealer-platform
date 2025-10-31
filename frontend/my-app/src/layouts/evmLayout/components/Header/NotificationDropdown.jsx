import React, { useRef } from 'react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { useClickOutside } from '../../hooks/useClickOutside';

export const NotificationDropdown = ({
  notifications,
  unreadCount,
  isOpen,
  setIsOpen,
  markAsRead,
  markAllAsRead,
  role,
  navigate
}) => {
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="p-2.5 hover:bg-gray-100 rounded-xl relative transition-all duration-300 group hover:scale-105 active:scale-95"
      >
        <FiBell className="w-7 h-7 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-xs text-white flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/60 z-40 animate-scaleIn">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100/60 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:scale-105"
              >
                <FiCheckCircle className="w-4 h-4 mr-1" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`px-4 py-3 border-b border-gray-100/60 last:border-b-0 transition-all duration-200 cursor-pointer group animate-fadeIn ${
                      !notification.read ? 'bg-red-50/50 hover:bg-blue-100/50' : 'hover:bg-gray-50/50'
                    }`}
                    onClick={() => markAsRead(notification.id, notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.read ? 'bg-red-500' : 'bg-transparent'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm mb-1 ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100/60">
            {role === 'ADMIN' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/evm/admin/reports/notifications');
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:scale-105"
              >
                Xem tất cả thông báo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};