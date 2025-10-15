import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, User } from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';
import profileService from '../services/profileService.js';
import { useAuthContext } from '../../../features/auth/AuthProvider.jsx';

const SecuritySettings = () => {
  const { logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('password');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, feedback: '' };
    let score = 0;
    let feedback = [];
    if (password.length >= 8) score++;
    else feedback.push('Ít nhất 8 ký tự');
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Có chữ in hoa');
    if (/[0-9]/.test(password)) score++;
    else feedback.push('Có chữ số');
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('Có ký tự đặc biệt');
    const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
    return { score, strength: strengthLabels[score], feedback: feedback.length ? `Cần: ${feedback.join(', ')}` : 'Mật khẩu mạnh' };
  };

  const passwordStrength = checkPasswordStrength(passwordData.newPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    if (!passwordData.newPassword) newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    else if (passwordData.newPassword.length < 8) newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      await profileService.changePassword(sessionStorage.getItem("email"),passwordData.newPassword, passwordData.currentPassword);
      setMessage('Đổi mật khẩu thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {setMessage('')
        logout();
      }, 3000);
    } catch (error) {
      setMessage('Lỗi khi đổi mật khẩu: ' + (error.response?.data?.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex items-center space-x-3 p-8 pb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bảo mật</h2>
            <p className="text-gray-500 mt-1">Bảo vệ tài khoản của bạn</p>
          </div>
        </div>

        <div className="px-8 flex space-x-6">
          <button
            className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'password' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Đổi mật khẩu
          </button>
          {/* Tab khác nếu có */}
        </div>
      </div>

      <div className="p-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.includes('thành công') ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
            {message}
          </div>
        )}

        {activeTab === 'password' && (
          <PasswordChangeForm
            passwordData={passwordData}
            errors={errors}
            showPasswords={showPasswords}
            handleChange={handleChange}
            togglePasswordVisibility={togglePasswordVisibility}
            handleSubmit={handleSubmit}
            loading={loading}
            passwordStrength={passwordStrength}
          />
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;
