import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../auth/AuthProvider";
import ProtectedRoute from "./ProtectedRoute";
import CustomerLayout from "../layouts/CustomerLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminRoute from "../components/admin/AdminRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import OAuthCallback from "../pages/OAuthCallback";
import ProductDetail from "../pages/ProductDetail";
import BookingPage from "../pages/BookingPage";
import TestDriveBooking from "../pages/TestDriveBooking";
import CarConfigurator from "../pages/CarConfigurator";
import TCOCalculator from "../pages/TCOCalculator";
import FinancingCalculator from "../pages/FinancingCalculator";
import ProductComparison from "../pages/ProductComparison";
import ChargingStationMap from "../pages/ChargingStationMap";
import Payment from "../pages/Payment";
import VehiclesPage from "../pages/VehiclesPage";
import VehicleDetailPage from "../pages/VehicleDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import PaymentReturnPage from "../pages/PaymentReturnPage";
import TestDriveBookingPage from "../pages/TestDriveBookingPage";
import MyTestDrivesPage from "../pages/MyTestDrivesPage";
import TestDriveDetailPage from "../pages/TestDriveDetailPage";
import MyReviewsPage from "../pages/MyReviewsPage";
import CompareVehiclesPage from "../pages/CompareVehiclesPage";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminVehiclesPage from "../pages/admin/VehiclesPage";
import AdminCategoriesPage from "../pages/admin/CategoriesPage";
import AdminOrdersPage from "../pages/admin/OrdersPage";
import AdminCustomersPage from "../pages/admin/CustomersPage";
import AdminTestDrivesPage from "../pages/admin/TestDrivesPage";
import AdminPaymentsPage from "../pages/admin/PaymentsPage";
import AdminPromotionsPage from "../pages/admin/PromotionsPage";
import AdminReviewsPage from "../pages/admin/ReviewsPage";
import AdminReportsPage from "../pages/admin/ReportsPage";
import VehicleFormPage from "../pages/admin/VehicleFormPage";
import AdminOrderDetailPage from "../pages/admin/OrderDetailPage";
import AdminVehicleDetailPage from "../pages/admin/VehicleDetailPage";
import AdminBookingDepositsPage from "../pages/admin/BookingDepositsPage";
import PaymentResultPage from "../pages/PaymentResultPage";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="booking/:id" element={<BookingPage />} />
          <Route path="test-drive" element={<TestDriveBooking />} />
          <Route path="configure" element={<CarConfigurator />} />
          <Route path="tco-calculator" element={<TCOCalculator />} />
          <Route path="financing" element={<FinancingCalculator />} />
          <Route path="compare" element={<ProductComparison />} />
          <Route path="charging-stations" element={<ChargingStationMap />} />
          <Route path="payment" element={<Payment />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:variantId" element={<VehicleDetailPage />} />
          <Route path="compare" element={<CompareVehiclesPage />} />
          <Route path="payment/return" element={<PaymentReturnPage />} />
          <Route path="payment/result" element={<PaymentResultPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="oauth-success" element={<OAuthCallback />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="test-drive/book" element={<TestDriveBookingPage />} />
          <Route path="my-test-drives" element={<MyTestDrivesPage />} />
          <Route path="test-drives/:appointmentId" element={<TestDriveDetailPage />} />
          <Route path="my-reviews" element={<MyReviewsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="vehicles" element={<AdminVehiclesPage />} />
          <Route path="vehicles/new" element={<VehicleFormPage />} />
          <Route path="vehicles/view/:variantId" element={<AdminVehicleDetailPage />} />
          <Route path="vehicles/edit/:variantId" element={<VehicleFormPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="booking-deposits" element={<AdminBookingDepositsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="test-drives" element={<AdminTestDrivesPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

