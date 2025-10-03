import React, {useState, useEffect} from "react";
import {X, Save, User, Mail, Phone, MapPin, Calendar, Eye, EyeOff, Edit} from "lucide-react";

export default function UserForm({isOpen, onClose, onSubmit, initialData, mode = "add"}) {
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        name: "",
        fullName: "",
        password: "",
        address: "",
        city: "",
        country: "",
        birthday: "",
        gender: "MALE",
        roles: [],
    });

    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Chuyển đổi roles từ object sang string
            const roles = initialData.roles.map(role => role.name);
            setFormData({...initialData, roles, password: ""});
        } else {
            setFormData({
                email: "",
                phone: "",
                name: "",
                fullName: "",
                password: "",
                address: "",
                city: "",
                country: "",
                birthday: "",
                gender: "MALE",
                roles: [],
            });
        }
        setErrors({});
        setIsEditing(mode === "edit");
    }, [initialData, isOpen, mode]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) newErrors.email = "Email là bắt buộc";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";

        if (!formData.phone) newErrors.phone = "Số điện thoại là bắt buộc";

        if (!formData.name) newErrors.name = "Tên là bắt buộc";

        if (!formData.fullName) newErrors.fullName = "Họ và tên là bắt buộc";

        if (!initialData && !formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (formData.roles.length === 0) newErrors.roles = "Phải chọn ít nhất một role";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        if (mode === "view" && !isEditing) return; // Không cho phép chỉnh sửa ở chế độ xem khi không bật chỉnh sửa

        const {name, value, type, checked} = e.target;

        if (type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                roles: checked
                    ? [...prev.roles, value]
                    : prev.roles.filter((role) => role !== value),
            }));
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ""}));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "view") {
            if (isEditing) {
                // Nếu đang ở chế độ chỉnh sửa trong view mode
                if (validateForm()) {
                    onSubmit(formData);
                }
            } else {
                // Nếu chỉ đang xem, cho phép đóng form
                onClose();
            }
            return;
        }

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const isViewMode = mode === "view";
    const isReadOnly = isViewMode && !isEditing;

    return (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full p-2 max-w-xl max-h-[100vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        {mode === "add" && "Thêm User mới"}
                        {mode === "edit" && "Cập nhật User"}
                        {mode === "view" && "Chi tiết User"}
                    </h2>
                    <div className="flex items-center gap-2">
                        {isViewMode && (
                            <button
                                onClick={handleToggleEdit}
                                className={`p-2 rounded-full ${
                                    isEditing
                                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                } transition-colors`}
                                title={isEditing ? "Tắt chỉnh sửa" : "Chỉnh sửa"}
                            >
                                {isEditing ? <EyeOff size={18}/> : <Edit size={18}/>}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <X size={24}/>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="email"
                                type="email"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại *
                        </label>
                        <div className="relative">
                            <Phone
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="phone"
                                placeholder="0912345678"
                                value={formData.phone}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.phone ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên *
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                <input
                                    name="name"
                                    placeholder="Tên"
                                    value={formData.name}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.name ? "border-red-500" : "border-gray-300"
                                    } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên *
                            </label>
                            <input
                                name="fullName"
                                placeholder="Họ và tên đầy đủ"
                                value={formData.fullName}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.fullName ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                            )}
                        </div>
                    </div>

                    {(!initialData || (isViewMode && isEditing)) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu {!initialData && "*"}
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••"
                                value={formData.password}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                            {isViewMode && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Để trống nếu không muốn thay đổi mật khẩu
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                        </label>
                        <div className="relative">
                            <MapPin
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="address"
                                placeholder="Địa chỉ"
                                value={formData.address}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thành phố
                            </label>
                            <input
                                name="city"
                                placeholder="Thành phố"
                                value={formData.city}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quốc gia
                            </label>
                            <input
                                name="country"
                                placeholder="Quốc gia"
                                value={formData.country}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày sinh
                            </label>
                            <div className="relative">
                                <Calendar
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                <input
                                    name="birthday"
                                    type="date"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                    }`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giới tính
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roles *
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    value="USER"
                                    checked={formData.roles.includes("USER")}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                    className={`rounded text-blue-600 focus:ring-blue-500 ${
                                        isReadOnly ? "cursor-not-allowed opacity-60" : ""
                                    }`}
                                />
                                <span className="ml-2 text-gray-700">USER</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    value="ADMIN"
                                    checked={formData.roles.includes("ADMIN")}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                    className={`rounded text-blue-600 focus:ring-blue-500 ${
                                        isReadOnly ? "cursor-not-allowed opacity-60" : ""
                                    }`}
                                />
                                <span className="ml-2 text-gray-700">ADMIN</span>
                            </label>
                        </div>
                        {errors.roles && (
                            <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            {isViewMode && !isEditing ? "Đóng" : "Hủy"}
                        </button>

                        {(!isViewMode || isEditing) && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save size={18} className="mr-2"/>
                                {mode === "add" ? "Thêm mới" : "Cập nhật"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}