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
import ProfilePage from "../features/profile/pages/ProfilePage.jsx";
import OAuthSuccess from "../pages/OAuthSuccess";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import DealerLayout from "../layouts/DealerLayout.jsx";
import DashboardForDealer from "../features/dashboard/pages/DashboardForDealer.jsx";

export default function AppRoutes() {
    return (
        <AuthProvider>
            <Routes>


                {/* Public */}
                <Route path={"/"} element={<UserLayout/>}>
                    <Route path="" element={<Home/>}/>
                    <Route path="login" element={<Login/>}/>
                    <Route path="oauth-success" element={<OAuthSuccess/>}/>
                    <Route path="reset-password" element={<ResetPassword/>}/>
                </Route>


                {/* Admin routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]}/>}>
                    <Route path="/admin" element={<EvmLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path="system/users" element={<UserManagement/>}/>
                        {/* Thêm các route admin khác ở đây */}
                    </Route>
                </Route>

                {/* Dealer routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]}/>}>
                    <Route path="/dealer" element={<DealerLayout/>}>
                        <Route index element={<DashboardForDealer/>}/>
                        <Route path="system/users" element={<UserManagement/>}/>
                        {/* Thêm các route admin khác ở đây */}
                    </Route>
                </Route>

                {/* Not found */}
                <Route path="*" element={<NotFound/>}/>






















































                {/* User routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["USER"]}/>}>
                    <Route path="/user" element={<UserLayout/>}>
                    </Route>
                </Route>


                {/* User-Admin routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]}/>}>
                    <Route path="/" element={<UserLayout/>}>
                        {/* Thêm các route user protected ở đây */}
                        <Route path="profile" element={<ProfilePage/>}/>
                    </Route>
                </Route>
            </Routes>
        </AuthProvider>
    );
}