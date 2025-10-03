import profileService from '../services/profileService.js';
import React, {useState, useEffect} from 'react';
import {useAuthContext} from '../../auth/AuthProvider.jsx';
import {
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Upload,
    Camera
} from 'lucide-react';

const ProfileForm = () => {
    const {id_user} = useAuthContext();
    const [formData, setFormData] = useState({
        name: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        birthday: '',
        gender: 'MALE'
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await profileService.getProfile();
            if (response.data.code === "1000") {
                setFormData(response.data.data.userRespond);
                console.log(response.data.data);
            } else {
                setMessage('Lỗi khi tải thông tin');
            }
        } catch (error) {
            console.log(error);
            setMessage('Lỗi khi tải thông tin: ' + (error.response.data.message || 'Vui lòng thử lại'));
        } finally {
            setLoading(false);
        }
    };
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);

            // Upload avatar nếu có (nếu service của bạn hỗ trợ)
            if (avatar) {
                // await userApi.uploadAvatar(avatar);
            }

            // Update profile - sử dụng hàm từ service của bạn
            const response = await profileService.update(id_user, formData);
            if (response.data.code === "1000") {
                setMessage('Cập nhật thông tin thành công!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Lỗi khi cập nhật: ' + (response.data.message || 'Vui lòng thử lại'));
            }
        } catch (error) {
            setMessage('Lỗi khi cập nhật: ' + (error.message || 'Vui lòng thử lại'));
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Tên là bắt buộc';
        if (!formData.fullName) newErrors.fullName = 'Họ và tên là bắt buộc';
        if (!formData.email) newErrors.email = 'Email là bắt buộc';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.phone) newErrors.phone = 'Số điện thoại là bắt buộc';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
                    <p className="text-gray-500 mt-1">Quản lý thông tin tài khoản của bạn</p>
                </div>
                <button
                    type="submit"
                    form="profile-form"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Save size={18} className="mr-2"/>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.includes('thành công')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-8">
                    <div className="relative">
                        <div
                            className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                formData.name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                        </div>
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50"
                        >
                            <Camera size={16} className="text-gray-600"/>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-800">Ảnh đại diện</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            JPG, PNG hoặc GIF. Kích thước tối đa 5MB.
                        </p>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên *
                        </label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.fullName && (
                            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại *
                        </label>
                        <div className="relative">
                            <Phone
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới tính
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>
                </div>

                {/* Address Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ
                        </label>
                        <div className="relative">
                            <MapPin
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thành phố
                            </label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quốc gia
                            </label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;