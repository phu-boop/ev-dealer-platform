import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../../auth/AuthProvider';
import { createQuotation, getQuotationById, updateQuotation } from '../services/salesService';
import Swal from 'sweetalert2';

// Import UI thật của bạn
import Loading from '../../../../components/ui/Loading';
import Alert from '../../../../components/ui/Alert';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';

const QuotationForm = () => {
    const { id } = useParams(); // Lấy id từ URL (ví dụ: /dealer/manager/quotations/abc-123/edit)
    const isEditMode = Boolean(id);

    const navigate = useNavigate();
    const { memberId, dealerId, roles } = useAuthContext(); // Lấy ID nhân viên và đại lý

    const [formData, setFormData] = useState({
        variantId: '',
        customerId: '',
        promotionIds: '', // Sẽ là chuỗi UUIDs cách nhau bằng dấu phẩy
        termsConditions: '',
        saveAsDraft: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bước 1: Lấy dữ liệu nếu là chế độ Sửa (Edit)
    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            getQuotationById(id)
                .then(response => {
                    const quote = response.data;
                    setFormData({
                        variantId: quote.variantId.toString(),
                        customerId: quote.customerId.toString(),
                        // Chuyển mảng promotions thành chuỗi ID cách nhau bằng dấu phẩy
                        promotionIds: quote.appliedPromotions.map(p => p.id).join(', '),
                        termsConditions: quote.termsConditions || '',
                        saveAsDraft: quote.status === 'DRAFT',
                    });
                })
                .catch(err => {
                    console.error("Lỗi khi tải báo giá:", err);
                    setError("Không thể tải thông tin báo giá để chỉnh sửa.");
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    // Bước 2: Xử lý thay đổi trên form
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Bước 3: Xử lý khi nhấn "Lưu"
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!memberId || !dealerId) {
            Swal.fire('Lỗi', 'Không thể xác định thông tin nhân viên hoặc đại lý.', 'error');
            return;
        }

        setLoading(true);
        setError(null);

        // Chuẩn bị DTO cho backend
        const dto = {
            variantId: parseInt(formData.variantId, 10),
            customerId: parseInt(formData.customerId, 10),
            // Chuyển chuỗi UUID (cách nhau bằng dấu phẩy) thành mảng
            promotionIds: formData.promotionIds.split(',').map(id => id.trim()).filter(Boolean),
            termsConditions: formData.termsConditions,
            saveAsDraft: formData.saveAsDraft,
        };

        try {
            const basePath = roles.includes('DEALER_MANAGER') ? '/dealer/manager' : '/dealer/staff';
            const role = roles.includes('DEALER_MANAGER') ? 'DEALER_MANAGER' : 'DEALER_STAFF'; // <-- Thêm dòng này

            if (isEditMode) {
                // SỬA: Truyền đầy đủ 5 tham số
                await updateQuotation(id, dto, memberId, dealerId, role);
            } else {
                // SỬA: Truyền đầy đủ 3 tham số
                await createQuotation(dto, memberId, dealerId);
            }

            // SỬA DÒNG NÀY:
            navigate(`${basePath}/quotations`); // <-- Dùng basePath động

        } catch (err) {
            console.error("Lỗi khi lưu báo giá:", err);
            setError("Không thể lưu báo giá. " + (err.response?.data?.message || err.message));
            Swal.fire('Thất bại!', `Đã xảy ra lỗi: ${err.response?.data?.message || err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <Loading />;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Chỉnh sửa Báo giá' : 'Tạo Báo giá mới'}
            </h1>

            {error && <Alert message={error} type="error" className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* TODO: Thay thế Input bằng component Select/Search (động) sau này */}
                <Input
                    label="ID Khách hàng (customerId)"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    placeholder="Nhập ID khách hàng (ví dụ: 1)"
                    required
                />

                <Input
                    label="ID Phiên bản xe (variantId)"
                    name="variantId"
                    value={formData.variantId}
                    onChange={handleChange}
                    placeholder="Nhập ID phiên bản (ví dụ: 4)"
                    required
                />

                <Input
                    label="ID Khuyến mãi (cách nhau bằng dấu phẩy)"
                    name="promotionIds"
                    value={formData.promotionIds}
                    onChange={handleChange}
                    placeholder="Ví dụ: uuid-1, uuid-2"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điều khoản
                    </label>
                    <textarea
                        name="termsConditions"
                        value={formData.termsConditions}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập các điều khoản, điều kiện..."
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="saveAsDraft"
                        id="saveAsDraft"
                        checked={formData.saveAsDraft}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="saveAsDraft" className="ml-2 block text-sm text-gray-900">
                        Lưu làm bản nháp
                    </label>
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/dealer/manager/quotations')} // (Cần điều chỉnh nếu role là staff)
                    >
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? <Loading /> : (isEditMode ? 'Cập nhật' : 'Tạo Báo giá')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default QuotationForm;