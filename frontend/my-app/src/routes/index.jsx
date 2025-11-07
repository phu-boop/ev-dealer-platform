//  import { Routes, Route } from "react-router-dom";
// import { AuthProvider } from "../features/auth/AuthProvider";

// // layouts
// import EvmLayout from "../layouts/evmLayout/EvmLayout.jsx";
// import UserLayout from "../layouts/UserLayout";
// import DealerLayout from "../layouts/dealerLayout/DealerLayout.jsx";

// // pages
// import Home from "../pages/Home";
// import Login from "../pages/Login.jsx";
// import Dashboard from "../features/dashboard/pages/Dashboard";
// import NotFound from "../pages/NotFound";
// import ProtectedRoute from "./ProtectedRoute";
// import UserManagement from "../features/dashboard/users/pages/UserManagement.jsx";
// import ProfileForm from "../features/profile/components/ProfileForm.jsx";
// import SecuritySettings from "../features/profile/components/SecuritySettings.jsx";
// import OAuthSuccess from "../pages/OAuthSuccess";
// import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
// import DashboardForDealer from "../features/dashboard/pages/DashboardForDealer.jsx";
// import AdminPromotionManager from "../features/admin/promotions/pages/AdminPromotionManager.jsx";
// import CustomerPromotionView from "../features/dealer/promotions/CustomerPromotionView.jsx";
// import NotificationManagement from "../features/admin/notifications/NotificationManagement.jsx";
// import QuotationManagement from "../features/dealer/sales/pages/QuotationManagement.jsx";

// // customer pages
// import CustomerList from "../features/customers/pages/CustomerList.jsx";
// import CreateCustomer from "../features/customers/pages/CreateCustomer.jsx";
// import EditCustomer from "../features/customers/pages/EditCustomer.jsx";
// import CustomerDetail from "../features/customers/pages/CustomerDetail.jsx";

// // EVM
// import VehicleCatalogManager from "../features/evm/catalog/pages/VehicleCatalogPage.jsx";
// import VariantManager from "../features/evm/catalog/pages/VariantManagementPage.jsx";
// import MainPromotion from "../features/evm/promotions/pages/MainPromotion.jsx";
// import InventoryCentral from "../features/evm/inventory/pages/InventoryPage.jsx";
// import AllocationPage from "../features/evm/inventory/pages/AllocationPage.jsx";

// // Dealer
// import B2BOrderPage from "../features/dealer/ordervariants/pages/DealerOrdersPage.jsx";
// import B2BOrderForm from "../features/dealer/ordervariants/pages/B2BOrderForm.jsx";
// import DealerInventoryStockPage from "../features/dealer/ordervariants/pages/DealerInventoryStockPage.jsx";
// import DealerProductCatalogPage from "../features/dealer/ordervariants/pages/DealerProductCatalogPage.jsx";

// //Manage Dealer
// import DealersPage from "../features/admin/manageDealer/dealers/DealersPage.jsx";

// export default function AppRoutes() {
//   return (
//     <AuthProvider>
//       {/* 
//         /                               ================= (Public)
//         ├── /login
//         ├── /oauth-success
//         ├── /reset-password

//         /evm                            ================= (ADMIN + EVM_STAFF)
//         ├── /evm/profile
//         │
//         ├── /evm/admin                  ================= (ADMIN)
//         │   ├── /evm/admin/products/promotions/*
//         │
//         └── /evm/staff                  ================= (EVM_STAFF)
//             └── /evm/staff/products/promotions

//         /dealer                         ================= (DEALER_MANAGER + DEALER_STAFF)
//         ├── /dealer/profile
//         │
//         ├── /dealer/manager             ================= (DEALER_MANAGER)
//         │   ├── /dealer/manager/promotions/*
//         │
//         └── /dealer/staff               ================= (DEALER_STAFF)
//             └── /dealer/staff/promotions
//         */}

//       <Routes>
//         {/* ================================================================== */}
//         {/* ======================= PUBLIC ROUTES ============================ */}
//         {/* ================================================================== */}
//         <Route path="/" element={<UserLayout />}>
//           <Route index element={<Home />} />
//           <Route path="login" element={<Login />} />
//           <Route path="oauth-success" element={<OAuthSuccess />} />
//           <Route path="reset-password" element={<ResetPassword />} />
//         </Route>

//         {/* ================================================================== */}
//         {/* ================== EVM ROUTES (ADMIN & STAFF) ==================== */}
//         {/* ================================================================== */}
//         <Route
//           element={<ProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]} />}
//         >
//           <Route path="evm" element={<EvmLayout />}>
//             <Route index element={<Dashboard />} />
//             <Route path="profile" element={<ProfileForm />} />
//             <Route path="settings" element={<SecuritySettings />} />
//             <Route path="promotions/*" element={<MainPromotion />} />
//             <Route path="promotions/*" element={<MainPromotion />} />

//             {/* Admin only */}
//             <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
//               <Route
//                 path="admin/products/promotions/*"
//                 element={<AdminPromotionManager />}
//               />
//               <Route path="admin/system/users" element={<UserManagement />} />
//               <Route path="admin/notifications" element={<UserManagement />} />
//             </Route>

//             {/* Admin only */}
//             <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
//               <Route
//                 element={<AdminPromotionManager />}
//               />
//               <Route path="admin/system/users" element={<UserManagement />} />
//               <Route path="admin/notifications" element={<UserManagement />} />
//               <Route
//                 path="admin/reports/notifications"
//                 element={<NotificationManagement />}
//               />
//               <Route
//                 path="admin/distribution/allocation"
//                 element={<AllocationPage />}
//               />
//               <Route
//                 path="admin/dealers/list"
//                 element={<DealersPage />}
//               />
//             </Route>
//             {/* Staff only */}
//             <Route element={<ProtectedRoute allowedRoles={["EVM_STAFF"]} />}>
//               <Route path="staff" element={<Dashboard />} />
//               {/* --------------------------------QUẢN LÝ SẢN PHẨM-------------------------------------------------- */}
//               {/* Quản lý danh mục xe */}
//               <Route
//                 path="staff/products/catalog"
//                 element={<VehicleCatalogManager />}
//               />
//               {/* Quản lý phiên bản, màu sắc xe (thiếu tiềm kiếm (lọc theo màu, phiên bản)) */}
//               <Route
//                 path="staff/products/variants"
//                 element={<VariantManager />}
//               />
//               {/* Giá Sỉ & Chiết Khấu */}
//               <Route
//                 path="staff/products/promotions"
//                 element={<MainPromotion />}
//               />
//               {/* --------------------------------PHÂN PHỐI & KHO-------------------------------------------------- */}
//               <Route
//                 path="staff/distribution/inventory/central"
//                 element={<InventoryCentral />}
//               />
//               <Route
//                 path="staff/distribution/allocation"
//                 element={<AllocationPage />}
//               />
//               {/* --------------------------------MANAGE DEALER-------------------------------------------------- */}
//               <Route
//                 path="staff/dealers/list"
//                 element = {<DealersPage />}
//               />
//               <Route
//                 path="staff/dealers/dealer-accounts"
//                 element={<UserManagement />}
//               />
//             </Route>
//           </Route>
//         </Route>

//         {/* ================================================================== */}
//         {/* ================== DEALER ROUTES (MANAGER & STAFF) =============== */}
//         {/* ================================================================== */}
//         <Route
//           element={
//             <ProtectedRoute allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]} />
//           }
//         >
//           <Route path="dealer" element={<DealerLayout />}>
//             <Route index element={<DashboardForDealer />} />
//             <Route path="profile" element={<ProfileForm />} />
//             <Route path="settings" element={<SecuritySettings />} />

//             {/* --- DEALER MANAGER ONLY ROUTES --- */}
//             <Route
//               element={<ProtectedRoute allowedRoles={["DEALER_MANAGER"]} />}
//             >
//               {/* Customer Management */}
//               <Route
//                 path="manager/customers/create"
//                 element={<CreateCustomer />}
//               />
//               <Route path="manager/customers/list" element={<CustomerList />} />
//               <Route
//                 path="manager/customers/:id"
//                 element={<CustomerDetail />}
//               />
//               <Route
//                 path="manager/customers/:id/edit"
//                 element={<EditCustomer />}
//               />
//               <Route
//                 path="manager/quotations/*"
//                 element={<QuotationManagement />}
//               />
//                           {/* Xem tồn kho đại lí */}
//               <Route
//                 path="manager/inventory/stock"
//                 element={<DealerInventoryStockPage />}
//               />
//               <Route
//                 path="manager/vehicles/all"
//                 element={<DealerProductCatalogPage />}
//               />


//               <Route
//                   path="manager/quotations/*"
//                   element={<QuotationManagement />}
//               />
//               {/* --------------------------------Cai dar dai ly-------------------------------------------------- */}

//               <Route
//                   path="manager/settings/staff*"
//                   element={<UserManagement />}
//               />

//               {/* Promotions */}
//               <Route path="manager/promotions/*" element={<MainPromotion />} />

//               {/* System */}
//               <Route path="manager/system/users" element={<UserManagement />} />

//               <Route
//                 path="manager/inventory/order"
//                 element={<B2BOrderForm />}
//               />
//               <Route path="manager/inventory/info" element={<B2BOrderPage />} />
//             </Route>

//             {/* Dealer Staff Routes */}
//             <Route element={<ProtectedRoute allowedRoles={["DEALER_STAFF"]} />}>
//               {/* Customer Management */}
//               <Route
//                 path="staff/customers/create"
//                 element={<CreateCustomer />}
//               />
//               <Route path="staff/customers/list" element={<CustomerList />} />
//               <Route path="staff/customers/:id" element={<CustomerDetail />} />
//               <Route
//                 path="staff/customers/:id/edit"
//                 element={<EditCustomer />}
//               />

//               <Route
//                 path="staff/quotations/*"
//                 element={<QuotationManagement />}
//               />

//               {/* Danh mục xe & báo cáo */}
//               {/* Xe có sẵn trong kho đại lí */}
//               <Route
//                   path="staff/quotations/*"
//                   element={<QuotationManagement />}
//               />

//               {/* Promotions */}
//               <Route
//                 path="staff/promotions"
//                 element={<CustomerPromotionView />}
//               />
//             </Route>
//           </Route>
//         </Route>

//         {/* 404 Not Found */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </AuthProvider>
//   );
// }



import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthProvider";

// layouts
import EvmLayout from "../layouts/evmLayout/EvmLayout.jsx";
import UserLayout from "../layouts/UserLayout";
import DealerLayout from "../layouts/dealerLayout/DealerLayout.jsx";

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
import DashboardForDealer from "../features/dashboard/pages/DashboardForDealer.jsx";
import AdminPromotionManager from "../features/admin/promotions/pages/AdminPromotionManager.jsx";
import CustomerPromotionView from "../features/dealer/promotions/CustomerPromotionView.jsx";
import NotificationManagement from "../features/admin/notifications/NotificationManagement.jsx";

// customer pages
import CustomerList from "../features/customers/pages/CustomerList.jsx";
import CreateCustomer from "../features/customers/pages/CreateCustomer.jsx";
import EditCustomer from "../features/customers/pages/EditCustomer.jsx";
import CustomerDetail from "../features/customers/pages/CustomerDetail.jsx";

// EVM
import VehicleCatalogManager from "../features/evm/catalog/pages/VehicleCatalogPage.jsx";
import VariantManager from "../features/evm/catalog/pages/VariantManagementPage.jsx";
import MainPromotion from "../features/evm/promotions/pages/MainPromotion.jsx";
import InventoryCentral from "../features/evm/inventory/pages/InventoryPage.jsx";
import AllocationPage from "../features/evm/inventory/pages/AllocationPage.jsx";

// Dealer
import B2BOrderPage from "../features/dealer/ordervariants/pages/DealerOrdersPage.jsx";
import B2BOrderForm from "../features/dealer/ordervariants/pages/B2BOrderForm.jsx";
import DealerInventoryStockPage from "../features/dealer/ordervariants/pages/DealerInventoryStockPage.jsx";
import DealerProductCatalogPage from "../features/dealer/ordervariants/pages/DealerProductCatalogPage.jsx";

// Manage Dealer
import DealersPage from "../features/admin/manageDealer/dealers/DealersPage.jsx";


// Staff Dealer
import QuotationCreatePage from "../features/dealer/sales/quotation/pages/QuotationCreatePage.jsx";
import QuotationListPage from "../features/dealer/sales/quotations/pages/QuotationListPage.jsx";

//feature sale
import SalesRoutes from "../features/dealer/sales/SalesRoutes.jsx";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* ================================================================== */}
        {/* ======================= PUBLIC ROUTES ============================ */}
        {/* ================================================================== */}

        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="oauth-success" element={<OAuthSuccess />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* ================================================================== */}
        {/* ================== EVM ROUTES (ADMIN & STAFF) ==================== */}
        {/* ================================================================== */}
        <Route
          element={<ProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]} />}
        >
          <Route path="evm" element={<EvmLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfileForm />} />
            <Route path="settings" element={<SecuritySettings />} />
            <Route path="promotions/*" element={<MainPromotion />} />

            {/* Admin only */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route
                path="admin/products/promotions/*"
                element={<AdminPromotionManager />}
              />
              <Route path="admin/system/users" element={<UserManagement />} />
              <Route path="admin/notifications" element={<UserManagement />} />
              <Route
                path="admin/reports/notifications"
                element={<NotificationManagement />}
              />
              <Route
                path="admin/distribution/allocation"
                element={<AllocationPage />}
              />
              <Route
                path="admin/dealers/list"
                element={<DealersPage />}
              />
            </Route>

            {/* Staff only */}
            <Route element={<ProtectedRoute allowedRoles={["EVM_STAFF"]} />}>
              <Route path="staff" element={<Dashboard />} />
              {/* --------------------------------QUẢN LÝ SẢN PHẨM-------------------------------------------------- */}
              {/* Quản lý danh mục xe */}
              <Route
                path="staff/products/catalog"
                element={<VehicleCatalogManager />}
              />
              {/* Quản lý phiên bản, màu sắc xe */}
              <Route
                path="staff/products/variants"
                element={<VariantManager />}
              />
              {/* Giá Sỉ & Chiết Khấu */}
              <Route
                path="staff/products/promotions"
                element={<MainPromotion />}
              />
              {/* --------------------------------PHÂN PHỐI & KHO-------------------------------------------------- */}
              <Route
                path="staff/distribution/inventory/central"
                element={<InventoryCentral />}
              />
              <Route
                path="staff/distribution/allocation"
                element={<AllocationPage />}
              />
              {/* --------------------------------MANAGE DEALER-------------------------------------------------- */}
              <Route
                path="staff/dealers/list"
                element={<DealersPage />}
              />
              <Route
                path="staff/dealers/dealer-accounts"
                element={<UserManagement />}
              />
            </Route>
          </Route>
        </Route>

        {/* ================================================================== */}
        {/* ================== DEALER ROUTES (MANAGER & STAFF) =============== */}
        {/* ================================================================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]} />
          }
        >
          <Route path="dealer" element={<DealerLayout />}>
            <Route index element={<DashboardForDealer />} />
            <Route path="profile" element={<ProfileForm />} />
            <Route path="settings" element={<SecuritySettings />} />

            {/* --- DEALER MANAGER ONLY ROUTES --- */}
            <Route
              element={<ProtectedRoute allowedRoles={["DEALER_MANAGER"]} />}
            >
              {/* Customer Management */}
              <Route
                path="manager/customers/create"
                element={<CreateCustomer />}
              />
              <Route path="manager/customers/list" element={<CustomerList />} />
              <Route
                path="manager/customers/:id"
                element={<CustomerDetail />}
              />
              <Route
                path="manager/customers/:id/edit"
                element={<EditCustomer />}
              />

              {/* Quotation Management */}

              <Route path="manager/quotes/create" element={<QuotationCreatePage />} />

              <Route path="manager/list/quotations" element={<QuotationListPage />} />

              {/* Inventory Management */}
              <Route
                path="manager/inventory/stock"
                element={<DealerInventoryStockPage />}
              />
              <Route
                path="manager/vehicles/all"
                element={<DealerProductCatalogPage />}
              />

              {/* Order Management */}
              <Route
                path="manager/inventory/order"
                element={<B2BOrderForm />}
              />
              <Route path="manager/inventory/info" element={<B2BOrderPage />} />

              {/* Promotions */}
              <Route path="manager/promotions/*" element={<MainPromotion />} />

              {/* System Management */}
              <Route 
                path="manager/settings/staff*" 
                element={<UserManagement />} 
              />
              <Route path="manager/system/users" element={<UserManagement />} />
            </Route>

            {/* --- DEALER STAFF ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={["DEALER_STAFF"]} />}>
              {/* Customer Management */}
              <Route path="staff/customers/create" element={<CreateCustomer />} />
              <Route path="staff/customers/list" element={<CustomerList />} />
              <Route path="staff/customers/:id" element={<CustomerDetail />} />
              <Route path="staff/customers/:id/edit" element={<EditCustomer />} />

              {/* Quotation Management */}
              <Route path="staff/quotations" element={<QuotationCreatePage />} />
              <Route path="staff/list/quotations" element={<QuotationListPage />} />

              {/* Inventory Management */}
              <Route path="staff/inventory/stock" element={<DealerInventoryStockPage />} />
              <Route path="staff/vehicles/all" element={<DealerProductCatalogPage />} />

              {/* Promotions */}
              <Route path="staff/promotions" element={<CustomerPromotionView />} />

              {/* Sales Module */}
              <Route path="staff/*" element={<SalesRoutes />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}