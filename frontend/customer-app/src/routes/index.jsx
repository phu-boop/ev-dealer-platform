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
import ProductDetail from "../pages/ProductDetail";
import TestDriveBooking from "../pages/TestDriveBooking";
import CarConfigurator from "../pages/CarConfigurator";
import TCOCalculator from "../pages/TCOCalculator";
import FinancingCalculator from "../pages/FinancingCalculator";
import ProductComparison from "../pages/ProductComparison";
import ChargingStationMap from "../pages/ChargingStationMap";
import AIChatbot from "../pages/AIChatbot";
import Payment from "../pages/Payment";
import OrderTracking from "../pages/OrderTracking";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="test-drive" element={<TestDriveBooking />} />
          <Route path="configure" element={<CarConfigurator />} />
          <Route path="tco-calculator" element={<TCOCalculator />} />
          <Route path="financing" element={<FinancingCalculator />} />
          <Route path="compare" element={<ProductComparison />} />
          <Route path="charging-stations" element={<ChargingStationMap />} />
          <Route path="chatbot" element={<AIChatbot />} />
          <Route path="payment" element={<Payment />} />
          <Route path="orders/:orderId" element={<OrderTracking />} />
          <Route path="orders" element={<OrderTracking />} />
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
          {/* Customer features will be added here */}
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

