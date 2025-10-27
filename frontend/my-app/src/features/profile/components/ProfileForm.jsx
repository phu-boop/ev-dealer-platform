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
    Camera,
    Building,
    Briefcase,
    DollarSign,
    Target,
    Shield,
    Eye,
    EyeOff,
    Lock
} from 'lucide-react';

const ProfileForm = () => {
    const {id_user} = useAuthContext();
    const [formData, setFormData] = useState({
        // Basic info (editable)
        name: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        birthday: '',
        gender: 'MALE',
        url: ''
    });

    const [userProfile, setUserProfile] = useState({
        // Full user data for display
        dealerStaffProfile: null,
        dealerManagerProfile: null,
        evmStaffProfile: null,
        adminProfile: null,
        roleToString: '',
        createdAt: '',
        lastLogin: '',
        status: ''
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
                const userData = response.data.data.user;
                
                // Set editable fields
                setFormData({
                    name: userData.name || '',
                    fullName: userData.fullName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    city: userData.city || '',
                    country: userData.country || '',
                    birthday: userData.birthday || '',
                    gender: userData.gender || 'MALE',
                    url: userData.url || ''
                });

                // Set display-only fields
                setUserProfile({
                    dealerStaffProfile: userData.dealerStaffProfile,
                    dealerManagerProfile: userData.dealerManagerProfile,
                    evmStaffProfile: userData.evmStaffProfile,
                    adminProfile: userData.adminProfile,
                    roleToString: userData.roleToString,
                    createdAt: userData.createdAt,
                    lastLogin: userData.lastLogin,
                    status: userData.status
                });

            } else {
                setMessage('Lỗi khi tải thông tin');
            }
        } catch (error) {
            console.log(error);
            setMessage('Lỗi khi tải thông tin: ' + (error.response?.data?.data?.message || 'Vui lòng thử lại'));
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage('Kích thước file tối đa là 5MB');
                return;
            }
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        console,log("Submitting form with data:", formData);
        if (!validateForm()) return;

        console,log("Submitting form with dataaaaaaaaa:", formData);
        try {
            setLoading(true);
            setMessage('');

            const updateData = {
                userId: id_user,
                name: formData.name,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                birthday: formData.birthday,
                gender: formData.gender,
                url: formData.url
            };

            const response = await profileService.updateProfile(updateData);
            // if (response.data.code === "1000") {
            //     setMessage('Cập nhật thông tin thành công!');
            //     setTimeout(() => setMessage(''), 3000);
            //     // Refresh data after update
            //     //fetchProfile();
            // } else {
            //     setMessage('Lỗi khi cập nhật: ' + (response.data.message || 'Vui lòng thử lại'));
            // }
        } catch (error) {
            setMessage('Lỗi khi cập nhật: ' + (error.message || 'Vui lòng thử lại'));}
        // } finally {
        //     setLoading(false);
        // }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name?.trim()) newErrors.name = 'Tên là bắt buộc';
        if (!formData.fullName?.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
        if (!formData.email?.trim()) newErrors.email = 'Email là bắt buộc';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.phone?.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };

    const getRoleDisplayName = () => {
        const roleMap = {
            'DEALER_STAFF': 'Nhân viên Đại lý',
            'DEALER_MANAGER': 'Quản lý Đại lý',
            'EVM_STAFF': 'Nhân viên EVM',
            'ADMIN': 'Quản trị viên'
        };
        return roleMap[userProfile.roleToString] || userProfile.roleToString;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Chưa cập nhật';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const renderReadOnlyRoleInfo = () => {
        const role = userProfile.roleToString;
        
        switch (role) {
            case 'DEALER_STAFF':
                return userProfile.dealerStaffProfile && (
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Building className="h-5 w-5 text-blue-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-blue-800">Thông tin Nhân viên Đại lý</h3>
                            </div>
                            <Lock className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoField label="Mã nhân viên" value={userProfile.dealerStaffProfile.staffId} />
                            <InfoField label="Mã đại lý" value={userProfile.dealerStaffProfile.dealerId} />
                            <InfoField label="Chức vụ" value={userProfile.dealerStaffProfile.position} />
                            <InfoField label="Phòng ban" value={userProfile.dealerStaffProfile.department} />
                            <InfoField label="Ngày vào làm" value={formatDate(userProfile.dealerStaffProfile.hireDate)} />
                            <InfoField label="Lương" value={formatCurrency(userProfile.dealerStaffProfile.salary)} />
                            <InfoField label="Tỷ lệ hoa hồng" value={userProfile.dealerStaffProfile.commissionRate ? `${userProfile.dealerStaffProfile.commissionRate}%` : 'Chưa cập nhật'} />
                        </div>
                    </div>
                );

            case 'DEALER_MANAGER':
                return userProfile.dealerManagerProfile && (
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Briefcase className="h-5 w-5 text-green-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-green-800">Thông tin Quản lý Đại lý</h3>
                            </div>
                            <Lock className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoField label="Mã quản lý" value={userProfile.dealerManagerProfile.managerId} />
                            <InfoField label="Mã đại lý" value={userProfile.dealerManagerProfile.dealerId} />
                            <InfoField label="Cấp quản lý" value={userProfile.dealerManagerProfile.managementLevel} />
                            <InfoField label="Hạn mức phê duyệt" value={formatCurrency(userProfile.dealerManagerProfile.approvalLimit)} />
                            <InfoField label="Phòng ban" value={userProfile.dealerManagerProfile.department} />
                        </div>
                    </div>
                );

            case 'EVM_STAFF':
                return userProfile.evmStaffProfile && (
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Target className="h-5 w-5 text-purple-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-purple-800">Thông tin Nhân viên EVM</h3>
                            </div>
                            <Lock className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Mã nhân viên" value={userProfile.evmStaffProfile.evmStaffId} />
                            <InfoField label="Phòng ban" value={userProfile.evmStaffProfile.department} />
                            <InfoField label="Chuyên môn" value={userProfile.evmStaffProfile.specialization} />
                        </div>
                    </div>
                );

            case 'ADMIN':
                return userProfile.adminProfile && (
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-red-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-red-800">Thông tin Quản trị viên</h3>
                            </div>
                            <Lock className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoField label="Mã quản trị" value={userProfile.adminProfile.admin_id} />
                            <InfoField label="Cấp quản trị" value={userProfile.adminProfile.adminLevel} />
                            <InfoField label="Quyền hệ thống" value={userProfile.adminProfile.systemPermissions} />
                            <InfoField label="Phạm vi truy cập" value={userProfile.adminProfile.accessScope} />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const InfoField = ({ label, value }) => (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg text-gray-800">
                {value || 'Chưa cập nhật'}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-8xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
                                <p className="text-blue-100 mt-1">Quản lý thông tin tài khoản của bạn</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                                    {getRoleDisplayName()}
                                </div>
                                <p className="text-blue-100 text-sm mt-1">{formData.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg ${
                                message.includes('thành công')
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                                {message}
                            </div>
                        )}

                        <form className="space-y-8">
                            {/* Avatar Section */}
                            <div className="flex items-center space-x-8">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            formData.name?.charAt(0)?.toUpperCase() || 
                                            formData.fullName?.charAt(0)?.toUpperCase() || 
                                            formData.email?.charAt(0)?.toUpperCase() || 
                                            'U'
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200 transition-all hover:scale-105"
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
                                    <h3 className="font-semibold text-gray-800 text-lg">Ảnh đại diện</h3>
                                    <p className="text-gray-500 mt-1">
                                        JPG, PNG hoặc GIF. Kích thước tối đa 5MB.
                                    </p>
                                </div>
                            </div>

                            {/* Basic Information - EDITABLE */}
                            <div className="border-b border-gray-200 pb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <User className="h-5 w-5 text-gray-600 mr-2"/>
                                    Thông tin cơ bản 
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên hiển thị *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Nhập tên hiển thị"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên đầy đủ *
                                        </label>
                                        <input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.fullName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nhập họ và tên đầy đủ"
                                        />
                                        {errors.fullName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information - EDITABLE */}
                            <div className="border-b border-gray-200 pb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <Mail className="h-5 w-5 text-gray-600 mr-2"/>
                                    Thông tin liên hệ 
                                </h3>
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
                                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="your@email.com"
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
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information - EDITABLE */}
                            <div className="border-b border-gray-200 pb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <Calendar className="h-5 w-5 text-gray-600 mr-2"/>
                                    Thông tin cá nhân 
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày sinh
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                            <input
                                                name="birthday"
                                                type="date"
                                                value={formData.birthday}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information - EDITABLE */}
                            <div className="border-b border-gray-200 pb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <MapPin className="h-5 w-5 text-gray-600 mr-2"/>
                                    Địa chỉ 
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5"/>
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="Nhập địa chỉ"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Thành phố
                                        </label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="Nhập thành phố"
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
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="Nhập quốc gia"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* URL Field - EDITABLE */}
                            <div className="border-b border-gray-200 pb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                                    URL Avata
                                </h3>
                                <div>
                                    <input
                                        name="url"
                                        value={formData.url}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            {/* System Information - READ ONLY */}
                            <div className="border-b border-gray-200 pb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <Shield className="h-5 w-5 text-gray-600 mr-2"/>
                                    Thông tin hệ thống
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InfoField label="Trạng thái" value={userProfile.status} />
                                    <InfoField label="Ngày tạo" value={formatDate(userProfile.createdAt)} />
                                    <InfoField label="Đăng nhập cuối" value={formatDate(userProfile.lastLogin)} />
                                </div>
                            </div>

                            {/* Role Specific Information - READ ONLY */}
                            {renderReadOnlyRoleInfo()}

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={()=>{handleSubmit()}}
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
                                >
                                    <Save size={18} className="mr-2"/>
                                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileForm;