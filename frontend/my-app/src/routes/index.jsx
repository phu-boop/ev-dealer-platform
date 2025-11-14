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
import DealerDashboardPage from "../features/dealer/dashboard/pages/DashboardPage.jsx";
import StaffDashboardPage from "../features/dealer/staff/dashboard/pages/StaffDashboardPage.jsx";
import AdminDashboardPage from "../features/admin/dashboard/pages/AdminDashboardPage.jsx";
import AdminPromotionManager from "../features/admin/promotions/pages/AdminPromotionManager.jsx";
import CustomerPromotionView from "../features/dealer/promotions/CustomerPromotionView.jsx";
import NotificationManagement from "../features/admin/notifications/NotificationManagement.jsx";

// customer pages
import CustomerList from "../features/customers/management/pages/CustomerList.jsx";
import CreateCustomer from "../features/customers/management/pages/CreateCustomer.jsx";
import CustomerDetail from "../features/customers/management/pages/CustomerDetail.jsx";

// test drive pages
import TestDriveManagement from "../features/customers/testdrive/pages/TestDriveManagement.jsx";
import CreateTestDrive from "../features/customers/testdrive/pages/CreateTestDrive.jsx";
import EditTestDrive from "../features/customers/testdrive/pages/EditTestDrive.jsx";

// feedback pages
import FeedbackManagement from "../features/customers/feedback/pages/FeedbackManagement.jsx";
import CreateFeedback from "../features/customers/feedback/pages/CreateFeedback.jsx";
import FeedbackDetail from "../features/customers/feedback/pages/FeedbackDetail.jsx";
import FeedbackStatistics from "../features/customers/feedback/pages/FeedbackStatistics.jsx";

// EVM
import VehicleCatalogManager from "../features/evm/catalog/pages/VehicleCatalogPage.jsx";
import VariantManager from "../features/evm/catalog/pages/VariantManagementPage.jsx";
import MainPromotion from "../features/evm/promotions/pages/MainPromotion.jsx";
import InventoryCentral from "../features/evm/inventory/pages/InventoryPage.jsx";
import AllocationPage from "../features/evm/inventory/pages/AllocationPage.jsx";

// Thông báo (Socket)
import StaffNotificationPage from "../features/evm/notification/pages/StaffNotificationPage.jsx";
import B2BOrderDetailsPage from "../features/evm/notification/pages/B2BOrderDetailsPage.jsx";

// EVM Orders & Invoices Management
import B2BOrdersManagementPage from "../features/evm/orders/pages/B2BOrdersManagementPage.jsx";
import CashPaymentsManagementPage from "../features/evm/orders/pages/CashPaymentsManagementPage.jsx";
import CreateInvoiceFromOrderPage from "../features/evm/orders/pages/CreateInvoiceFromOrderPage.jsx";
import DealerDebtManagementPage from "../features/evm/orders/pages/DealerDebtManagementPage.jsx";
import DealerInvoicesListPage from "../features/evm/orders/pages/DealerInvoicesListPage.jsx";
import DealerInvoiceDetailsPage from "../features/evm/orders/pages/DealerInvoiceDetailsPage.jsx";

// Dealer
import B2BOrderPage from "../features/dealer/ordervariants/pages/DealerOrdersPage.jsx";
import B2BOrderForm from "../features/dealer/ordervariants/pages/B2BOrderForm.jsx";
import DealerInventoryStockPage from "../features/dealer/ordervariants/pages/DealerInventoryStockPage.jsx";
import DealerProductCatalogPage from "../features/dealer/ordervariants/pages/DealerProductCatalogPage.jsx";

// Manage Dealer
import DealersPage from "../features/admin/manageDealer/dealers/DealersPage.jsx";
// Reporting
import SalesReportPage from "../features/admin/reporting/pages/SalesReportPage.jsx";
import InventoryReportPage from "../features/admin/reporting/pages/InventoryReportPage.jsx";

// SYSTEM (ADMIN)
import BackfillPage from "../features/admin/system/pages/BackfillPage.jsx";

// Staff Dealer
import QuotationCreatePage from "../features/dealer/sales/quotation/pages/QuotationCreatePage.jsx";
import QuotationListPage from "../features/dealer/sales/quotations/pages/QuotationListPage.jsx";

//feature sale
import SalesRoutes from "../features/dealer/sales/SalesRoutes.jsx";

// Payment features
import PaymentMethodsManagement from "../features/payments/pages/PaymentMethodsManagement.jsx";
import CustomerPaymentPage from "../features/payments/pages/CustomerPaymentPage.jsx";
import DealerInvoiceManagement from "../features/payments/pages/DealerInvoiceManagement.jsx";
import DealerInvoicesPage from "../features/payments/pages/DealerInvoicesPage.jsx";
import DealerPaymentPage from "../features/payments/pages/DealerPaymentPage.jsx";
import PayInvoicePage from "../features/payments/pages/PayInvoicePage.jsx";
import B2COrdersListPage from "../features/payments/pages/B2COrdersListPage.jsx";
import B2COrderDetailPage from "../features/payments/pages/B2COrderDetailPage.jsx";
import PayB2COrderPage from "../features/payments/pages/PayB2COrderPage.jsx";
import B2CCashPaymentsManagementPage from "../features/payments/pages/B2CCashPaymentsManagementPage.jsx";
import B2CDebtManagementPage from "../features/payments/pages/B2CDebtManagementPage.jsx";
import VnpayReturnPage from "../pages/VnpayReturnPage.jsx";

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
          {/* Public Payment Routes */}
          <Route path="payment/vnpay-return" element={<VnpayReturnPage />} />
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

            <Route path="notifications" element={<StaffNotificationPage />} />
            {/* (Route chi tiết đơn hàng) */}
            <Route
              path="b2b-orders/:orderId"
              element={<B2BOrderDetailsPage />}
            />

            {/* Admin only */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route
                path="admin/products/promotions/*"
                element={<AdminPromotionManager />}
              />
              <Route path="admin/system/users" element={<UserManagement />} />
              <Route
                path="admin/reports/notifications"
                element={<NotificationManagement />}
              />
              <Route
                path="admin/distribution/allocation"
                element={<AllocationPage />}
              />
              <Route path="admin/dealers/list" element={<DealersPage />} />

              {/* Quản lý danh mục xe */}
              <Route
                path="admin/products/catalog"
                element={<VehicleCatalogManager />}
              />

              {/* Quản lý phiên bản, màu sắc xe (thiếu tiềm kiếm (lọc theo màu, phiên bản)) */}
              <Route
                path="admin/products/variants"
                element={<VariantManager />}
              />

              {/* Giá Sỉ & Chiết Khấu */}
              <Route
                path="admin/products/promotions"
                element={<MainPromotion />}
              />

              {/* Quản lý phân phối & kho */}
              <Route
                path="admin/distribution/inventory/central"
                element={<InventoryCentral />}
              />

              {/* Báo cáo */}
              <Route path="admin/reports/sales" element={<SalesReportPage />} />
              <Route
                path="admin/reports/inventory"
                element={<InventoryReportPage />}
              />

              {/* Khôi phục dữ liệu cho báo cáo */}
              <Route
                path="admin/system/data-backfill"
                element={<BackfillPage />}
              />

              {/* Payment Methods Management (Admin) */}
              <Route
                path="admin/payments/methods"
                element={<PaymentMethodsManagement />}
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
              <Route path="staff/dealers/list" element={<DealersPage />} />
              <Route
                path="staff/dealers/dealer-accounts"
                element={<UserManagement />}
              />

              {/* Payment Management (EVM Staff) */}
              <Route
                path="staff/payments/dealer-invoices"
                element={<DealerInvoiceManagement />}
              />

              {/* Orders & Invoices Management (EVM Staff) */}
              <Route
                path="staff/orders"
                element={<B2BOrdersManagementPage />}
              />
              <Route
                path="staff/orders/:orderId/create-invoice"
                element={<CreateInvoiceFromOrderPage />}
              />

              {/* Debt Management (EVM Staff) */}
              <Route path="staff/debt" element={<DealerDebtManagementPage />} />
              <Route
                path="staff/debt/:dealerId/invoices"
                element={<DealerInvoicesListPage />}
              />
              <Route
                path="staff/debt/invoices/:invoiceId"
                element={<DealerInvoiceDetailsPage />}
              />

              {/* Cash Payments Management (EVM Staff) */}
              <Route
                path="staff/payments/cash-payments"
                element={<CashPaymentsManagementPage />}
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
            {/* Sales Module */}
            <Route path="*" element={<SalesRoutes />} />
            <Route index element={<DashboardForDealer />} />
            <Route path="dashboard" element={<DealerDashboardPage />} />
            <Route path="profile" element={<ProfileForm />} />
            <Route path="settings" element={<SecuritySettings />} />
            
            {/* Staff Dashboard */}
            <Route path="staff/dashboard" element={<StaffDashboardPage />} />

            {/* --- DEALER MANAGER ONLY ROUTES --- */}
            <Route
              element={<ProtectedRoute allowedRoles={["DEALER_MANAGER"]} />}
            >
              {/* Customer Management */}
              <Route
                path="manager/customers/create"
                element={<CreateCustomer />}
              />
              <Route
                path="manager/customers/:id/edit"
                element={<CreateCustomer />}
              />
              <Route path="manager/customers/list" element={<CustomerList />} />
              <Route
                path="manager/customers/:id"
                element={<CustomerDetail />}
              />

              {/* Test Drive Management */}
              <Route
                path="manager/testdrives"
                element={<TestDriveManagement />}
              />
              <Route
                path="manager/testdrives/create"
                element={<CreateTestDrive />}
              />
              <Route
                path="manager/testdrives/edit/:id"
                element={<EditTestDrive />}
              />

              {/* Feedback Management */}
              <Route path="manager/feedback" element={<FeedbackManagement />} />
              <Route path="manager/feedback/new" element={<CreateFeedback />} />
              <Route
                path="manager/feedback/statistics"
                element={<FeedbackStatistics />}
              />
              <Route path="manager/feedback/:id" element={<FeedbackDetail />} />

              {/* Quotation Management */}

              <Route
                path="manager/quotes/create"
                element={<QuotationCreatePage />}
              />

              <Route
                path="manager/list/quotations"
                element={<QuotationListPage />}
              />

              {/* Inventory Management */}
              <Route
                path="manager/inventory/stock"
                element={<DealerInventoryStockPage />}
              />
              <Route
                path="manager/vehicles/all"
                element={<DealerProductCatalogPage />}
              />

              {/* --------------------------------Cai dar dai ly-------------------------------------------------- */}

              <Route
                path="manager/settings/staff/*"
                element={<UserManagement />}
              />

              <Route
                path="manager/vehicles/all"
                element={<DealerProductCatalogPage />}
              />

              {/* Promotions */}
              <Route path="manager/promotions/*" element={<MainPromotion />} />

              {/* System */}
              <Route path="manager/system/users" element={<UserManagement />} />

              {/* Đặt xe từ hãng và xem trạng thái đơn hàng */}
              <Route
                path="manager/inventory/order"
                element={<B2BOrderForm />}
              />
              <Route path="manager/inventory/info" element={<B2BOrderPage />} />

              {/* Promotions */}
              <Route path="manager/promotions/*" element={<MainPromotion />} />

              {/* Quotation Management */}
              <Route
                path="manager/quotations"
                element={<QuotationCreatePage />}
              />
              <Route
                path="manager/list/quotations"
                element={<QuotationListPage />}
              />

              {/* System Management */}
              <Route
                path="manager/settings/staff/*"
                element={<UserManagement />}
              />
              <Route path="manager/system/users" element={<UserManagement />} />

              {/* Payment Management (Dealer Manager) */}
              <Route
                path="manager/payments/invoices"
                element={<DealerInvoicesPage />}
              />
              <Route
                path="manager/payments/invoices/:invoiceId/pay"
                element={<PayInvoicePage />}
              />
              <Route
                path="manager/payments/invoices/:invoiceId"
                element={<DealerPaymentPage />}
              />
              <Route
                path="manager/payments/b2c-cash-payments"
                element={<B2CCashPaymentsManagementPage />}
              />
              <Route
                path="manager/payments/b2c-debt"
                element={<B2CDebtManagementPage />}
              />
              <Route
                path="manager/payments/b2c-orders/:orderId"
                element={<B2COrderDetailPage />}
              />
              <Route
                path="manager/payments/orders/:orderId"
                element={<CustomerPaymentPage />}
              />
            </Route>

            {/* --- DEALER STAFF ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={["DEALER_STAFF"]} />}>
              {/* Customer Management */}
              <Route
                path="staff/customers/create"
                element={<CreateCustomer />}
              />
              <Route
                path="staff/customers/:id/edit"
                element={<CreateCustomer />}
              />
              <Route path="staff/customers/list" element={<CustomerList />} />
              <Route path="staff/customers/:id" element={<CustomerDetail />} />

              {/* Test Drive Management */}
              <Route
                path="staff/testdrives"
                element={<TestDriveManagement />}
              />
              <Route
                path="staff/testdrives/create"
                element={<CreateTestDrive />}
              />
              <Route
                path="staff/testdrives/edit/:id"
                element={<EditTestDrive />}
              />

              {/* Feedback Management */}
              <Route path="staff/feedback" element={<FeedbackManagement />} />
              <Route path="staff/feedback/new" element={<CreateFeedback />} />
              <Route
                path="staff/feedback/statistics"
                element={<FeedbackStatistics />}
              />
              <Route path="staff/feedback/:id" element={<FeedbackDetail />} />

              {/* Quotation Management */}
              <Route
                path="staff/quotations"
                element={<QuotationCreatePage />}
              />

              <Route
                path="staff/list/quotations"
                element={<QuotationListPage />}
              />

              {/* Danh mục xe & báo cáo */}
              {/* Xe có sẵn trong kho đại lí */}
              <Route
                path="staff/inventory/stock"
                element={<DealerInventoryStockPage />}
              />
              {/* Tất cả phiên bảng (hãng) */}
              <Route
                path="staff/vehicles/all"
                element={<DealerProductCatalogPage />}
              />

              {/* Promotions */}
              <Route
                path="staff/promotions"
                element={<CustomerPromotionView />}
              />

              {/* Payment Management (Dealer Staff) */}
              <Route
                path="staff/payments/b2c-orders"
                element={<B2COrdersListPage />}
              />
              <Route
                path="staff/payments/b2c-orders/:orderId"
                element={<B2COrderDetailPage />}
              />
              <Route
                path="staff/payments/b2c-orders/:orderId/pay"
                element={<PayB2COrderPage />}
              />
              <Route
                path="staff/payments/orders/:orderId"
                element={<CustomerPaymentPage />}
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
