import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { Breadcrumb } from './Breadcrumb';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';

export const Header = ({ 
  setIsSidebarOpen, 
  menuItems, 
  activePath, 
  role, 
  user,
  notifications,
  unreadCount,
  isNotificationDropdownOpen,
  setIsNotificationDropdownOpen,
  markAsRead,
  markAllAsRead,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  handleLogout,
  navigate 
}) => {
  return (
    <header className="h-20 mx-6 my-3 rounded-3xl bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md lg:hidden"
        >
          <FiMenu className="w-5 h-5 text-gray-600" />
        </button>

        <Breadcrumb menuItems={menuItems} activePath={activePath} />
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{role}</span>
      </div>

      <div className="flex items-center space-x-3">
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isOpen={isNotificationDropdownOpen}
          setIsOpen={setIsNotificationDropdownOpen}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          role={role}
          navigate={navigate}
        />

        <ProfileDropdown
          user={user}
          role={role}
          isOpen={isProfileDropdownOpen}
          setIsOpen={setIsProfileDropdownOpen}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </div>
    </header>
  );
};