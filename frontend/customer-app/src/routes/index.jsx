import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../auth/AuthProvider";
import ProtectedRoute from "./ProtectedRoute";
import CustomerLayout from "../layouts/CustomerLayout";
import AuthLayout from "../layouts/AuthLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import OAuthCallback from "../pages/OAuthCallback";
import VehiclesPage from "../pages/VehiclesPage";
import VehicleDetailPage from "../pages/VehicleDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import PaymentReturnPage from "../pages/PaymentReturnPage";
import TestDriveBookingPage from "../pages/TestDriveBookingPage";
import MyTestDrivesPage from "../pages/MyTestDrivesPage";
import MyReviewsPage from "../pages/MyReviewsPage";
import CompareVehiclesPage from "../pages/CompareVehiclesPage";
import ChargingStationsPage from "../pages/ChargingStationsPage";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:variantId" element={<VehicleDetailPage />} />
          <Route path="compare" element={<CompareVehiclesPage />} />
          <Route path="charging-stations" element={<ChargingStationsPage />} />
          <Route path="payment/return" element={<PaymentReturnPage />} />
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
          <Route path="my-reviews" element={<MyReviewsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

