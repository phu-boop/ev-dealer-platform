// import { useState } from "react";
// import Button from "../components/ui/Button.jsx";
// import Input from "../components/ui/Input.jsx";
// import {
//   loginUser,
//   registerFCMToken,
//   getIddealerByIdMember,
// } from "../features/auth/services/authService.js";
// import Alert from "../components/ui/Alert.jsx";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
// import { useAuthContext } from "../features/auth/AuthProvider.jsx";
// import ReCAPTCHA from "react-google-recaptcha";
// import { getMessaging, getToken } from "firebase/messaging";
// import { messaging } from "../services/firebase/firebaseConfig.js";

// export default function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuthContext();
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     captchaToken: "",
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };
//   const handleCaptchaChange = (token) => {
//     setForm((prev) => ({ ...prev, captchaToken: token }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     if (!form.captchaToken) {
//       setError("Vui lòng xác nhận reCAPTCHA");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await loginUser({ ...form });

//       if (response.code === "1000") {
//         const userData = response.data.userRespond;
//         const jwtToken = response.data.token;
//         const rolesArray = userData.roles.map((role) => role.name);

//         login(
//           jwtToken,
//           rolesArray,
//           userData.id,
//           userData.email,
//           userData.name,
//           userData.fullName,
//           userData.memberId,
//           userData,
//           userData.url
//         );

//         if (
//           sessionStorage.getItem("roles").includes("DEALER_MANAGER") ||
//           sessionStorage.getItem("roles").includes("DEALER_STAFF")
//         ) {
//           sessionStorage.setItem("dealerId", userData.dealerId || "");
//           sessionStorage.setItem("memberId", userData.memberId || "");
//         }
//         sessionStorage.setItem("profileId", userData.memberId || "");

//         Swal.fire({
//           title: "Chúc mừng!",
//           text: "Bạn đã đăng nhập thành công!",
//           icon: "success",
//           confirmButtonText: "OK",
//         }).then(async (result) => {
//           if (result.isConfirmed) {
//             try {
//               const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
//               const fcmToken = await getToken(messaging, { vapidKey });
//               if (fcmToken) {
//                 await registerFCMToken(userData.id, fcmToken);
//                 console.log("✅ FCM token đã gửi lên backend:", fcmToken);
//               } else {
//                 console.warn(
//                   "⚠️ Không lấy được FCM token (có thể user từ chối thông báo)."
//                 );
//               }

//               // ✅ Nếu thành công thì điều hướng
//               if (
//                 rolesArray.includes("ADMIN") ||
//                 rolesArray.includes("EVM_STAFF")
//               ) {
//                 navigate("/evm");
//               } else if (
//                 rolesArray.includes("DEALER_MANAGER") ||
//                 rolesArray.includes("DEALER_STAFF")
//               ) {
//                 navigate("/dealer");
//               } else {
//                 window.location.href = "/";
//               }
//             } catch (error) {
//               // ❌ Gửi token thất bại, vẫn điều hướng bình thường
//               console.error("❌ Lỗi khi gửi FCM token:", error);

//               // ✅ Vẫn cho điều hướng (đảm bảo UX tốt)
//               if (
//                 rolesArray.includes("ADMIN") ||
//                 rolesArray.includes("EVM_STAFF")
//               ) {
//                 navigate("/evm");
//               } else if (
//                 rolesArray.includes("DEALER_MANAGER") ||
//                 rolesArray.includes("DEALER_STAFF")
//               ) {
//                 navigate("/dealer");
//               } else {
//                 window.location.href = "/";
//               }
//             }
//           }
//         });
//       } else {
//         setError(response.message || "Đăng nhập thất bại");
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Đăng nhập thất bại");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <thead>
//         <tr>
//           <th>Email</th>
//           <th> Password</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>admin@gmail.com</td>
//           <td>123123123</td>
//         </tr>
//       </tbody>

//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 transform hover:shadow-sky-300/50 transition duration-300 ease-in-out border-t-4 border-sky-600"
//         >
//           <div className="text-center">
//             <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
//               Đăng nhập
//             </h2>
//             <p className="text-sm text-gray-500">Chào mừng bạn trở lại!</p>
//           </div>

//           {/* Email Input */}
//           <Input
//             type="email"
//             name="email"
//             placeholder="Email của bạn"
//             value={form.email}
//             onChange={handleChange}
//             required
//           />

//           {/* Password Input với icon con mắt */}
//           <div className="relative">
//             <Input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Mật khẩu"
//               value={form.password}
//               onChange={handleChange}
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
//             >
//               {showPassword ? (
//                 // Mắt mở
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                   />
//                 </svg>
//               ) : (
//                 // Mắt đóng
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.142-3.478m3.052-2.383A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.958 9.958 0 01-4.183 5.255M15 12a3 3 0 00-3-3M3 3l18 18"
//                   />
//                 </svg>
//               )}
//             </button>
//           </div>

//           {/* ReCAPTCHA */}
//           <div className="flex justify-center mt-2 mb-4 w-100%">
//             <ReCAPTCHA
//               style={{
//                 display: "inline-block",
//                 transform: "scale(1.22)",
//                 transformOrigin: "center",
//               }}
//               sitekey="6LddMtArAAAAACt_Fw82js63yEEUFnRGUpSkBn4Q"
//               onChange={handleCaptchaChange}
//             />
//           </div>

//           {error && (
//             <div className="space-y-4">
//               <Alert
//                 type="error"
//                 message={error}
//                 onClose={() => setError(null)}
//               />

//               <p className="text-sm text-center text-gray-600">
//                 Bạn quên mật khẩu?{" "}
//                 <a
//                   href="/reset-password"
//                   className="text-sky-600 font-medium hover:text-sky-700 hover:underline transition duration-150"
//                 >
//                   Lấy lại mật khẩu
//                 </a>
//               </p>
//             </div>
//           )}

//           {/* Submit Button */}
//           <Button
//             type="submit"
//             variant="primary"
//             size="md" // Đổi size thành 'md' để nút lớn hơn, đẹp hơn
//             className="w-full shadow-lg hover:shadow-sky-500/50 transition duration-300"
//           >
//             {loading ? (
//               <>
//                 <svg
//                   className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Đang đăng nhập...
//               </>
//             ) : (
//               "Đăng nhập"
//             )}
//           </Button>
//         </form>
//       </div>
//     </>
//   );
// }

import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import {
  loginUser,
  registerFCMToken,
} from "../features/auth/services/authService.js";
import Alert from "../components/ui/Alert.jsx";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../features/auth/AuthProvider.jsx";
import ReCAPTCHA from "react-google-recaptcha";
import { getToken } from "firebase/messaging";
import { messaging } from "../services/firebase/firebaseConfig.js";

// --- Icon SVG (Không thay đổi) ---
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const LogoPlaceholderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);
// --- Hết Icon SVG ---

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [form, setForm] = useState({
    email: "",
    password: "",
    captchaToken: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleCaptchaChange = (token) => {
    setForm((prev) => ({ ...prev, captchaToken: token }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (Toàn bộ logic handleSubmit của bạn , không cần thay đổi)
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

        if (
          sessionStorage.getItem("roles").includes("DEALER_MANAGER") ||
          sessionStorage.getItem("roles").includes("DEALER_STAFF")
        ) {
          sessionStorage.setItem("dealerId", userData.dealerId || "");
          sessionStorage.setItem("memberId", userData.memberId || "");
        }
        sessionStorage.setItem("profileId", userData.memberId || "");

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
                console.warn(
                  "⚠️ Không lấy được FCM token (có thể user từ chối thông báo)."
                );
              }
            } catch (error) {
              console.error("❌ Lỗi khi gửi FCM token:", error);
            } finally {
              // ✅ Vẫn điều hướng ngay cả khi FCM lỗi
              if (
                rolesArray.includes("ADMIN") ||
                rolesArray.includes("EVM_STAFF")
              ) {
                navigate("/evm");
              } else if (
                rolesArray.includes("DEALER_MANAGER") ||
                rolesArray.includes("DEALER_STAFF")
              ) {
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
      <div
        className="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center
                   font-poppins animate-hue-rotate"
        style={{
          backgroundImage: "url(/bg_login.png)",
        }}
      >
        <div className="transform translate-x-32">
          {/* BẢNG TÀI KHOẢN TEST */}
          <div
            className="w-[400px] mb-4 overflow-hidden rounded-[20px] shadow-lg
                       bg-transparent border-2 border-white/50 backdrop-blur-[15px]"
          >
            <div className="p-4">
              <h4 className="text-sm font-semibold text-white text-center">
                Tài khoản test
              </h4>
            </div>
            <table className="w-full text-sm text-left text-white">
              <thead className="text-xs text-white/80 uppercase bg-white/10">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/30">
                  <td className="px-6 py-3">admin@gmail.com</td>
                  <td className="px-6 py-3">123123123</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FORM LOGIN */}
          <form
            onSubmit={handleSubmit}
            className="w-[400px] bg-transparent border-2 border-white/50
                       rounded-[20px] backdrop-blur-[15px] p-10 space-y-4"
          >
            <h2 className="text-3xl font-bold text-white text-center">
              Đăng nhập
            </h2>

            {/* INPUT EMAIL */}
            <div className="relative my-[30px]">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-lg">
                <MailIcon />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="peer w-full h-[50px] bg-transparent border-b-2 border-white
                           font-sans text-base text-white
                           pl-8 pr-5 py-2 outline-none"
              />
              <label
                className="absolute left-8 top-1/2 -translate-y-1/2
                           text-base text-white pointer-events-none
                           transition-all duration-500
                           peer-focus:top-[-5px] peer-valid:top-[-5px]"
              >
                Email
              </label>
            </div>

            {/* INPUT PASSWORD */}
            <div className="relative my-[30px]">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-lg">
                <LockIcon />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="peer w-full h-[50px] bg-transparent border-b-2 border-white
                           font-sans text-base text-white
                           pl-8 pr-10 py-2 outline-none"
              />
              <label
                className="absolute left-8 top-1/2 -translate-y-1/2
                           text-base text-white pointer-events-none
                           transition-all duration-500
                           peer-focus:top-[-5px] peer-valid:top-[-5px]"
              >
                Mật khẩu
              </label>
              {/* Icon Mắt */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {/* (Icon mắt ) */}
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.142-3.478m3.052-2.383A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.958 9.958 0 01-4.183 5.255M15 12a3 3 0 00-3-3M3 3l18 18"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* REMEMBER / FORGET */}
            <div className="flex justify-between text-sm text-white -mt-3 mb-3">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-1" />
                Ghi nhớ tôi
              </label>
              <a href="/reset-password" className="hover:underline text-white">
                Quên mật khẩu?
              </a>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey="6LddMtArAAAAACt_Fw82js63yEEUFnRGUpSkBn4Q"
                onChange={handleCaptchaChange}
                theme="dark"
              />
            </div>

            {/* Báo lỗi */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {/* NÚT SUBMIT */}
            <button
              type="submit"
              className="w-full h-10 bg-white rounded-full text-black font-medium
                         flex items-center justify-center
                         disabled:opacity-70"
              disabled={loading}
            >
              {/* (Icon loading) */}
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            {/* LINK QUAY VỀ TRANG CHỦ */}
            <div className="text-sm text-white text-center pt-2">
              <Link to="/" className="hover:underline font-medium">
                Quay về trang chủ
              </Link>
            </div>
          </form>
        </div>{" "}
      </div>
    </>
  );
}
