import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../features/auth/AuthProvider.jsx";
import { useSidebar } from './hooks/useSidebar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { MainContent } from './components/MainContent/MainContent';
import { dealerManagerMenuItems, dealerStaffMenuItems } from './data/menuItems';
import Swal from "sweetalert2";

const DealerLayout = () => {
  const { logout, email, name, fullName, roles } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Custom hooks
  const sidebar = useSidebar();
  
  // Local state
  const [menuItems, setMenuItems] = useState([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState(new Set());
  const profileDropdownRef = useRef(null);

  // User data
  const user = { email, name, fullName, roles };
  const role = roles?.includes("DEALER_MANAGER") ? 'DEALER_MANAGER' : 'DEALER_STAFF';

  // Set menu items based on role
  useEffect(() => {
    if (!roles || roles.length === 0) return;

    if (roles.includes("DEALER_MANAGER")) {
      setMenuItems(dealerManagerMenuItems);
    } else {
      setMenuItems(dealerStaffMenuItems);
    }
  }, [roles]);

  // Update active path when location changes
  useEffect(() => {
    sidebar.setActivePath(location.pathname);

    // Auto open submenus for active path
    const newOpenSubmenus = new Set();
    menuItems.forEach((item) => {
      if (item.submenu) {
        const isActiveSubmenu = item.submenu.some((sub) => sub.path === location.pathname);
        if (isActiveSubmenu) {
          newOpenSubmenus.add(item.path);
        }
      }
    });
    setOpenSubmenus(newOpenSubmenus);
  }, [location, menuItems]);

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      sidebar.setIsSidebarOpen(false);
    }
  };

  // Handle logout
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
      }
    });
  };

  // Toggle submenu function
  const toggleSubmenu = (path) => {
    const newOpenSubmenus = new Set(openSubmenus);
    if (newOpenSubmenus.has(path)) {
      newOpenSubmenus.delete(path);
    } else {
      newOpenSubmenus.add(path);
    }
    setOpenSubmenus(newOpenSubmenus);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && profileDropdownRef.current && 
          !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans overflow-hidden">
      <Sidebar
        isSidebarOpen={sidebar.isSidebarOpen}
        setIsSidebarOpen={sidebar.setIsSidebarOpen}
        menuItems={menuItems}
        activePath={sidebar.activePath}
        openSubmenus={openSubmenus}
        toggleSubmenu={toggleSubmenu}
        handleNavigation={handleNavigation}
        handleLogout={handleLogout}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
        <Header
          setIsSidebarOpen={sidebar.setIsSidebarOpen}
          menuItems={menuItems}
          activePath={sidebar.activePath}
          role={role}
          user={user}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
          handleLogout={handleLogout}
          navigate={navigate}
        />

        <MainContent>
          <Outlet />
        </MainContent>

        <Footer />
      </div>
    </div>
  );
};

export default DealerLayout;