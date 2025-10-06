import {Routes, Route} from "react-router-dom";
import {AuthProvider} from "../features/auth/AuthProvider";

// layouts
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

// pages
import Home from "../pages/Home";
import Login from "../features/auth/pages/Login.jsx";
import Dashboard from "../features/dashboard/pages/Dashboard";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import LearnerHome from "../pages/forLearner/LearnerHome.jsx";
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






                <Route path="/dealer" element={<DealerLayout/>}>
                    <Route index element={<DashboardForDealer/>}/>
                </Route>










                {/* User routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["USER"]}/>}>
                    <Route path="/user" element={<UserLayout/>}>
                        <Route path="home" element={<LearnerHome/>}/>
                    </Route>
                </Route>


                {/* User-Admin routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]}/>}>
                    <Route path="/" element={<UserLayout/>}>
                        {/* Thêm các route user protected ở đây */}
                        <Route path="profile" element={<ProfilePage/>}/>
                    </Route>
                </Route>


                {/* Admin routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]}/>}>
                    <Route path="/admin" element={<AdminLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path="users" element={<UserManagement/>}/>
                        {/* Thêm các route admin khác ở đây */}
                    </Route>
                </Route>

                {/* Not found */}
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </AuthProvider>
    );
}