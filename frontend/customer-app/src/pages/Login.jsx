import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { loginUser } from "../services/authService";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", captchaToken: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setForm((prev) => ({ ...prev, captchaToken: token }));
  };

  const handleGoogleLogin = () => {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const redirectUri = window.location.origin;
    window.location.href = `${baseUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.captchaToken) {
      setError("Vui lòng xác nhận reCAPTCHA");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({ ...form });

      if (response.code === "1000") {
        const userData = response.data.userRespond;
        const jwtToken = response.data.token;
        const rolesArray = userData.roles.map((role) => role.name);

        // Check if user is CUSTOMER
        if (!rolesArray.includes("CUSTOMER")) {
          setError("Tài khoản này không phải là khách hàng. Vui lòng đăng nhập tại cổng quản lý.");
          setLoading(false);
          return;
        }

        login(
          jwtToken,
          rolesArray,
          userData.id,
          userData.email,
          userData.name,
          userData.fullName,
          userData.memberId,
          userData,
          userData.url
        );

        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={handleCaptchaChange}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">HOẶC</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">
            Đăng nhập với Google
          </span>
        </button>
        <div className="text-center text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <div className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  );
}

