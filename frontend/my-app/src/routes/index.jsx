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

// customer pages
import CustomerList from "../features/customers/pages/CustomerList.jsx";
import CreateCustomer from "../features/customers/pages/CreateCustomer.jsx";
import EditCustomer from "../features/customers/pages/EditCustomer.jsx";
import CustomerDetail from "../features/customers/pages/CustomerDetail.jsx";
import MainPromotion from "../features/evm/promotions/pages/MainPromotion.jsx";
import AdminPromotionManager from "../features/admin/promotions/pages/AdminPromotionManager.jsx";
import CustomerPromotionView from "../features/dealer/promotions/CustomerPromotionView.jsx"


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
                            <Route path="admin/notifications" element={<UserManagement />} />
                        </Route>

                {/* Admin routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]}/>}>
                    <Route path="/admin" element={<EvmLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path="system/users" element={<UserManagement/>}/>
                        {/* Thêm các route admin khác ở đây */}
                    </Route>
                </Route>

                        {/* Staff only */}
                        <Route element={<ProtectedRoute allowedRoles={["EVM_STAFF"]} />}>
                            <Route path="staff" element={<Dashboard />} />
                            <Route path="staff/products/promotions" element={<MainPromotion />} />
                        </Route>
                {/* Dealer Manager routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["DEALER_MANAGER"]}/>}>
                    <Route path="/dealer" element={<DealerLayout/>}>
                        <Route index element={<DashboardForDealer/>}/>
                        <Route path="system/users" element={<UserManagement/>}/>
                        {/* Customer routes */}
                        <Route path="customers/create" element={<CreateCustomer/>}/>
                            <Route path="customers/list" element={<CustomerList/>}/>
                            <Route path="customers/:id" element={<CustomerDetail/>}/>
                            <Route path="customers/:id/edit" element={<EditCustomer/>}/>
                        {/* Thêm các route dealer manager khác ở đây */}
                    </Route>
                </Route>

                {/* Dealer Staff routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["DEALER_STAFF"]}/>}>
                    <Route path="/staff" element={<DealerLayout/>}>
                        <Route index element={<DashboardForDealer/>}/>
                        {/* Customer routes */}
                        <Route path="customers/create" element={<CreateCustomer/>}/>
                        <Route path="customers/list" element={<CustomerList/>}/>
                        <Route path="customers/:id" element={<CustomerDetail/>}/>
                        <Route path="customers/:id/edit" element={<EditCustomer/>}/>
                        {/* Thêm các route dealer staff khác ở đây */}
                    </Route>
                </Route>

                {/* Not found */}
                <Route path="*" element={<NotFound/>}/>


                {/* User routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={["USER"]}/>}>
                    <Route path="/user" element={<UserLayout/>}>
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
                            <Route path="staff/promotions" element={<CustomerPromotionView />} />
                        </Route>
                    </Route>
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
                </Routes>


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