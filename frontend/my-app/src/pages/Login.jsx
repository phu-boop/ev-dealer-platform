import {useState} from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import {loginUser, registerFCMToken, getIddealerByIdMember} from "../features/auth/services/authService.js";
import Alert from "../components/ui/Alert.jsx";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../features/auth/AuthProvider.jsx";
import ReCAPTCHA from "react-google-recaptcha";
import { getMessaging, getToken } from "firebase/messaging";
import { messaging } from "../services/firebase/firebaseConfig.js";


export default function Login() {
    const navigate = useNavigate();
    const {login} = useAuthContext();
    const [form, setForm] = useState({email: "", password: "", captchaToken: ""});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };
    const handleCaptchaChange = (token) => {
        setForm((prev) => ({...prev, captchaToken: token}));
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

      Swal.fire({
    title: "Chúc mừng!",
    text: "Bạn đã đăng nhập thành công!",
    icon: "success",
    confirmButtonText: "OK",
    }).then(async (result) => {
    if (result.isConfirmed) {
        try {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const fcmToken = await getToken(messaging, { vapidKey });
            if (fcmToken) {
            await registerFCMToken(userData.id, fcmToken);
            console.log("✅ FCM token đã gửi lên backend:", fcmToken);
            } else {
            console.warn("⚠️ Không lấy được FCM token (có thể user từ chối thông báo).");
            }

        // ✅ Nếu thành công thì điều hướng
        if (rolesArray.includes("ADMIN") || rolesArray.includes("EVM_STAFF")) {
            navigate("/evm");
        } else if (rolesArray.includes("DEALER_MANAGER") || rolesArray.includes("DEALER_STAFF")) {
            navigate("/dealer");
        } else {
            window.location.href = "/";
        }

        } catch (error) {
        // ❌ Gửi token thất bại, vẫn điều hướng bình thường
        console.error("❌ Lỗi khi gửi FCM token:", error);

        // ✅ Vẫn cho điều hướng (đảm bảo UX tốt)
        if (rolesArray.includes("ADMIN") || rolesArray.includes("EVM_STAFF")) {
            navigate("/evm");
        } else if (rolesArray.includes("DEALER_MANAGER") || rolesArray.includes("DEALER_STAFF")) {
            navigate("/dealer");
        } else {
            window.location.href = "/";
        }
        }
    }
    });
    } else {
      setError(response.message || "Đăng nhập thất bại");
    }
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Đăng nhập thất bại");
  } finally {
    setLoading(false);
  }
};


    return (
        <>
                <thead>
                    <tr>
                    <th>Email</th>
                    <th>                                  Password</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>ManagerDealer@gmail.com</td>
                    <td>123123123</td>
                    </tr>
                    <tr>
                    <td>StafffDealer@gmail.com</td>
                    <td>123123123</td>
                    </tr>
                    <tr>
                    <td>StafffEVM@gmail.com</td>
                    <td>123123123</td>
                    </tr>
                    <tr>
                    <td>admin@gmail.com</td>
                    <td>123123123</td>
                    </tr>
                </tbody>

       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 transform hover:shadow-sky-300/50 transition duration-300 ease-in-out border-t-4 border-sky-600"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Đăng nhập
                    </h2>
                    <p className="text-sm text-gray-500">
                        Chào mừng bạn trở lại!
                    </p>
                </div>
                
                {/* Email Input */}
                <Input
                    type="email"
                    name="email"
                    placeholder="Email của bạn"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                
                {/* Password Input với icon con mắt */}
                <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? (
                    // Mắt mở
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ) : (
                    // Mắt đóng
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.142-3.478m3.052-2.383A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.958 9.958 0 01-4.183 5.255M15 12a3 3 0 00-3-3M3 3l18 18" />
                    </svg>
                    )}
                </button>
                </div>

                
                {/* ReCAPTCHA */}
                <div className="flex justify-center mt-2 mb-4 w-100%">
                    <ReCAPTCHA
                        style={{ display: "inline-block", transform: "scale(1.22)", transformOrigin: "center" }}
                        sitekey="6LddMtArAAAAACt_Fw82js63yEEUFnRGUpSkBn4Q"
                        onChange={handleCaptchaChange}
                    />
                </div>

                {error && (
                    <div className="space-y-4">
                        <Alert 
                            type="error" 
                            message={error} 
                            onClose={() => setError(null)}
                        />

                        <p className="text-sm text-center text-gray-600">
                            Bạn quên mật khẩu?{" "}
                            <a 
                                href="/reset-password" 
                                className="text-sky-600 font-medium hover:text-sky-700 hover:underline transition duration-150"
                            >
                                Lấy lại mật khẩu
                            </a>
                        </p>
                    </div>
                )}
                
                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="md" // Đổi size thành 'md' để nút lớn hơn, đẹp hơn
                    className="w-full shadow-lg hover:shadow-sky-500/50 transition duration-300"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang đăng nhập...
                        </>
                    ) : (
                        "Đăng nhập"
                    )}
                </Button>
            </form>
        </div>
        </>
    );
}
