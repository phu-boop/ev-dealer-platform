import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthProvider";

// layouts
import EvmLayout from "../layouts/EvmLayout.jsx";
import UserLayout from "../layouts/UserLayout";

// pages
import Home from "../pages/Home";
import Login from "../pages/Login.jsx";
import Dashboard from "../features/dashboard/pages/Dashboard";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import UserManagement from "../features/dashboard/users/pages/UserManagement.jsx";
import ProfileForm from "../features/profile/components/ProfileForm.jsx";
import SecuritySettings from "../features/profile/components/SecuritySettings.jsx";
import OAuthSuccess from "../pages/OAuthSuccess";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import DealerLayout from "../layouts/DealerLayout.jsx";
import DashboardForDealer from "../features/dashboard/pages/DashboardForDealer.jsx";
import MainPromotion from "../features/evm/promotions/pages/MainPromotion.jsx";
import AdminPromotionManager from "../features/admin/promotions/pages/AdminPromotionManager.jsx";
import CustomerPromotionView from "../features/dealer/promotions/CustomerPromotionView.jsx";
import VehicleCatalogManager from "../features/evm/catalog/pages/VehicleCatalogPage.jsx";
import VariantManager from "../features/evm/catalog/pages/VariantManagementPage.jsx";

export default function AppRoutes() {
  return (
    <AuthProvider>
      {/* 
        /                               ================= (Public)
        ├── /login
        ├── /oauth-success
        ├── /reset-password

        /evm                            ================= (ADMIN + EVM_STAFF)
        ├── /evm/profile
        │
        ├── /evm/admin                  ================= (ADMIN)
        │   ├── /evm/admin/products/promotions/*
        │
        └── /evm/staff                  ================= (EVM_STAFF)
            └── /evm/staff/products/promotions

        /dealer                         ================= (DEALER_MANAGER + DEALER_STAFF)
        ├── /dealer/profile
        │
        ├── /dealer/manager             ================= (DEALER_MANAGER)
        │   ├── /dealer/manager/promotions/*
        │
        └── /dealer/staff               ================= (DEALER_STAFF)
            └── /dealer/staff/promotions
        */}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="oauth-success" element={<OAuthSuccess />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* EVM Routes (Admin + Staff) */}
        <Route
          element={<ProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]} />}
        >
          <Route path="evm" element={<EvmLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfileForm />} />
            <Route path="settings" element={<SecuritySettings />} />
            <Route path="promotions/*" element={<MainPromotion />} />
            <Route path="promotions/*" element={<MainPromotion />} />

            {/* Admin only */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route
                path="admin/products/promotions/*"
                element={<AdminPromotionManager />}
              />
              <Route path="admin/system/users" element={<UserManagement />} />
              <Route path="admin/notifications" element={<UserManagement />} />
            </Route>

            {/* Staff only */}
            <Route element={<ProtectedRoute allowedRoles={["EVM_STAFF"]} />}>
              <Route path="staff" element={<Dashboard />} />
              <Route
                path="staff/products/promotions"
                element={<MainPromotion />}
              />
              {/* Quản lý Sản phẩm */}
              <Route
                path="staff/products/catalog"
                element={<VehicleCatalogManager />}
              />
              <Route
                path="staff/products/variants"
                element={<VariantManager />}
              />
              {/* <Route
                path="staff/distribution/allocation"
                element={<StockTransferForm />}
              /> */}
            </Route>
          </Route>
        </Route>

        {/* Dealer Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]} />
          }
        >
          <Route path="dealer" element={<DealerLayout />}>
            <Route index element={<DashboardForDealer />} />
            <Route path="profile" element={<ProfileForm />} />
            <Route path="settings" element={<SecuritySettings />} />

            {/* Dealer Manager only */}
            <Route
              element={<ProtectedRoute allowedRoles={["DEALER_MANAGER"]} />}
            >
              <Route path="manager/promotions/*" element={<MainPromotion />} />
              <Route path="manager/system/users" element={<UserManagement />} />
            </Route>

            {/* Dealer Staff only */}
            <Route element={<ProtectedRoute allowedRoles={["DEALER_STAFF"]} />}>
              <Route path="staff" element={<DashboardForDealer />} />
              <Route
                path="staff/promotions"
                element={<CustomerPromotionView />}
              />
            </Route>
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
