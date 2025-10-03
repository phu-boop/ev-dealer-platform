import {useState} from "react"
import Button from "../../../components/ui/Button.jsx"
import Input from "../../../components/ui/Input.jsx"
import {registerUser} from "../services/authService.js"
import {FcGoogle} from "react-icons/fc";
import {FaFacebook, FaGithub} from "react-icons/fa";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        address: "",
        birthday: "",
        gender: ""
    })

    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const respond = await registerUser(form)
            console.log("phu nebe", respond);
            if (respond.code === "1000") {
                setIsError(false)
                setMessage(respond.message)
            } else {
                setIsError(true)
                setMessage(respond.message)
            }
        } catch (error) {
            console.log("phu loi",error);
            setIsError(true)
            setMessage(error.response.data.message)
        }
    }
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
                <h2 className="text-2xl font-bold text-center text-sky-600">Đăng ký</h2>

                <Input
                    type="text"
                    name="name"
                    placeholder="Tên tài khoản"
                    value={form.name}
                    onChange={handleChange}
                />
                <Input
                    type="text"
                    name="fullName"
                    placeholder="Họ và tên đầy đủ"
                    value={form.fullName}
                    onChange={handleChange}
                />
                <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                />
                <Input
                    type="text"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={form.phone}
                    onChange={handleChange}
                />
                <Input
                    type="text"
                    name="address"
                    placeholder="Địa chỉ"
                    value={form.address}
                    onChange={handleChange}
                />
                <Input
                    type="date"
                    name="birthday"
                    value={form.birthday}
                    onChange={handleChange}
                />
                <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-400"
                >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                </select>

                {/* Thông báo */}
                {message && (
                    <p className={`text-center text-sm ${isError ? "text-red-500" : "text-green-600"}`}>
                        {message}
                    </p>
                )}

                <Button variant="primary" size="sm" type="submit" className="w-full">
                    Đăng ký
                </Button>

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
    )
}
