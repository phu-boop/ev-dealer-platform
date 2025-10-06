import {useState} from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import {loginUser} from "../services/authService.js";
import Alert from "../../../components/ui/Alert.jsx";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../AuthProvider.jsx";
import {FcGoogle} from "react-icons/fc";
import {FaFacebook, FaGithub} from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";


export default function Login() {
    const navigate = useNavigate();
    const {login} = useAuthContext();
    const [form, setForm] = useState({email: "", password: "", captchaToken: ""});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
            return;
        }
        try {
            const response = await loginUser({
                ...form,
            });

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
                    userData
                );

                Swal.fire({
                    title: "Chúc mừng!",
                    text: "Bạn đã đăng nhập thành công!",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then((result) => {
                    if (result.isConfirmed) {
                        if (rolesArray.includes("ADMIN")) {
                            navigate("/admin");
                        } else {
                            window.location.href = "/";
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


    const handleSocialLogin = (provider) => {
        let authUrl = '';

        switch (provider) {
            case 'google':
                authUrl = `http://localhost:8080/oauth2/authorization/google`;
                break;
            case 'facebook':
                authUrl = `http://localhost:8080/oauth2/authorization/facebook`;
                break;
            case 'github':
                authUrl = `http://localhost:8080/oauth2/authorization/github`;
                break;
            default:
                console.error('Provider không được hỗ trợ');
                return;
        }

        window.location.href = authUrl;
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4"
            >
                <h2 className="text-2xl font-bold text-center text-sky-600">Đăng nhập</h2>

                <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <ReCAPTCHA
                    sitekey="6LddMtArAAAAACt_Fw82js63yEEUFnRGUpSkBn4Q"
                    onChange={handleCaptchaChange}
                />

                {error && (
                    <>
                        <Alert type="error" message={error} onClose={() => setError(null)}/>

                        <p className="text-sm text-center text-slate-500">
                            Bạn quên mật khẩu?{" "}
                            <a href="/reset-password" className="text-sky-600 hover:underline">
                                lấy lại mật khẩu
                            </a>
                        </p>
                    </>

                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>

                {/* Phần đăng nhập bằng mạng xã hội */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {/* Nút Google */}
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                    >
                        <FcGoogle className="h-5 w-5"/>
                    </button>

                    {/* Nút Facebook */}
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                    >
                        <FaFacebook className="h-5 w-5 text-blue-600"/>
                    </button>

                    {/* Nút Apple */}
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('github')}
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                    >
                        <FaGithub className="h-5 w-5 text-gray-900"/>
                    </button>
                </div>
            </form>
        </div>
    );
}