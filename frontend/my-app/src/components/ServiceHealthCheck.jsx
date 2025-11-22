import { useState } from "react";
import { FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";

const ServiceHealthCheck = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const [services, setServices] = useState({
    gateway: { status: "checking", url: API_BASE_URL },
    customerService: { status: "checking", url: `${API_BASE_URL}/customers` },
    frontend: { status: "running", url: FRONTEND_URL },
  });

  const [checking, setChecking] = useState(false);

  const checkServices = async () => {
    setChecking(true);

    // Check Gateway
    try {
      const response = await fetch(`${API_BASE_URL}/auth/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      setServices((prev) => ({
        ...prev,
        gateway: { ...prev.gateway, status: response.ok ? "running" : "error" },
      }));
    } catch (error) {
      setServices((prev) => ({
        ...prev,
        gateway: { ...prev.gateway, status: "offline" },
      }));
    }

    // Check Customer Service (through gateway)
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setServices((prev) => ({
        ...prev,
        customerService: {
          ...prev.customerService,
          status: response.ok ? "running" : "error",
        },
      }));
    } catch (error) {
      setServices((prev) => ({
        ...prev,
        customerService: { ...prev.customerService, status: "offline" },
      }));
    }

    setChecking(false);
  };

  useState(() => {
    checkServices();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "running":
        return <FiCheckCircle className="w-6 h-6 text-green-500" />;
      case "offline":
      case "error":
        return <FiXCircle className="w-6 h-6 text-red-500" />;
      default:
        return <FiRefreshCw className="w-6 h-6 text-gray-400 animate-spin" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "running":
        return "Running";
      case "offline":
        return "Offline";
      case "error":
        return "Error";
      default:
        return "Checking...";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🔍 Services Status</h2>
        <button
          onClick={checkServices}
          disabled={checking}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-4 h-4 mr-2 ${checking ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(services).map(([key, service]) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(service.status)}
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </h3>
                <p className="text-sm text-gray-500">{service.url}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                service.status === "running"
                  ? "bg-green-100 text-green-800"
                  : service.status === "offline"
                  ? "bg-red-100 text-red-800"
                  : service.status === "error"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {getStatusText(service.status)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 Hướng dẫn khắc phục:
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            • <strong>Gateway Offline:</strong> Chạy{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              cd gateway && mvn spring-boot:run
            </code>
          </li>
          <li>
            • <strong>Customer Service Offline:</strong> Chạy{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              cd services/customer-service && mvn spring-boot:run
            </code>
          </li>
          <li>
            • <strong>Error 401:</strong> Kiểm tra token trong sessionStorage
            hoặc đăng nhập lại
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceHealthCheck;
