import {Routes, Route} from "react-router-dom";
import {AuthProvider} from "../features/auth/AuthProvider";

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

export default function AppRoutes() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<UserLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="oauth-success" element={<OAuthSuccess />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                </Route>

                {/* EVM Routes (Admin + Staff) */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]} />}>
                    <Route path="evm" element={<EvmLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<ProfileForm />} />
                    <Route path="settings" element={<SecuritySettings />} />
                    <Route path="promotions/*" element={<MainPromotion />} />

                    {/* Admin only */}
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                        <Route path="admin/products/promotions/*" element={<AdminPromotionManager />} />
                        <Route path="admin/system/users" element={<UserManagement />} />
                    </Route>

                    {/* Staff only */}
                    <Route element={<ProtectedRoute allowedRoles={["EVM_STAFF"]} />}>
                        <Route path="staff" element={<Dashboard />} />
                        <Route path="staff/products/promotions" element={<MainPromotion />} />
                    </Route>
                    </Route>
                </Route>

                {/* Dealer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]} />}>
                    <Route path="dealer" element={<DealerLayout />}>
                    <Route index element={<DashboardForDealer />} />
                    <Route path="profile" element={<ProfileForm />} />
                    <Route path="settings" element={<SecuritySettings />} />

                    {/* Dealer Manager only */}
                    <Route element={<ProtectedRoute allowedRoles={["DEALER_MANAGER"]} />}>
                        <Route path="manager/promotions/*" element={<MainPromotion />} />
                        <Route path="manager/system/users" element={<UserManagement />} />
                    </Route>

                    {/* Dealer Staff only */}
                    <Route element={<ProtectedRoute allowedRoles={["DEALER_STAFF"]} />}>
                        <Route path="staff" element={<DashboardForDealer />} />
                    </Route>
                    </Route>
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
                </Routes>

        </AuthProvider>
    );
}