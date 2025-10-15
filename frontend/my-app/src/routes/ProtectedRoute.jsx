import {useEffect, useState} from "react";
import {Navigate, Outlet, useNavigate} from "react-router-dom";
import {useAuthContext} from "../features/auth/AuthProvider.jsx";
import Swal from "sweetalert2";

export default function ProtectedRoute({allowedRoles}) {
    const navigate = useNavigate();
        const {roles} = useAuthContext();
    const [alertShown, setAlertShown] = useState(false);
    const [redirect, setRedirect] = useState(null);

    useEffect(() => {
        if (!Array.isArray(roles) || roles.length === 0) {
            if (!alertShown) {
                Swal.fire({
                    title: "Chưa đăng nhập",
                    text: "Vui lòng đăng nhập",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Đăng nhập",
                    cancelButtonText: "Quay lại",
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate("/login");
                    }else if (result.isDenied === false) {
                        window.history.back();
                    }
                });
                setAlertShown(true);
            }
        } else if (!roles.some(role => allowedRoles.includes(role))) {
            if (!alertShown) {
                Swal.fire({
                    title: "Không có quyền",
                    text: "Bạn không có quyền truy cập trang này!",
                    icon: "error",
                    confirmButtonText: "OK",
                }).then(() => {
                    setRedirect("/");
                });
                setAlertShown(true);
            }
        }
    }, [roles, allowedRoles, alertShown]);

    if (redirect) return <Navigate to={redirect} replace/>;

    if (!Array.isArray(roles) || roles.length === 0 || !roles.some(role => allowedRoles.includes(role))) {
        return null;
    }

    return <Outlet/>;
}