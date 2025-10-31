import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuotationById } from '../services/salesService';
import Loading from '../../../../components/ui/Loading';
import Alert from '../../../../components/ui/Alert';
import Button from '../../../../components/ui/Button';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';

const QuotationDetail = () => {
    const { id } = useParams(); // Lấy ID báo giá từ URL
    const navigate = useNavigate();

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        // Gọi API từ service để lấy chi tiết
        getQuotationById(id)
            .then(response => setQuote(response.data))
            .catch(err => {
                console.error("Lỗi khi tải chi tiết báo giá:", err);
                setError("Không thể tải chi tiết báo giá.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loading />;
    if (error) return <Alert message={error} type="error" />;
    if (!quote) return <Alert message="Không tìm thấy báo giá." type="error" />;

    // Hàm render 1 dòng chi tiết
    const DetailRow = ({ label, value, className = '' }) => (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className={`mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 ${className}`}>
                {value}
            </dd>
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Chi tiết Báo giá
                    <span className="ml-3 text-lg font-normal text-gray-500">#{quote.quotationId.substring(0, 8)}</span>
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    quote.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        quote.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                }`}>
          {quote.status}
        </span>
            </div>

            <dl className="divide-y divide-gray-200">
                <DetailRow label="Ngày tạo" value={formatDate(quote.quotationDate)} />
                <DetailRow label="Hiệu lực đến" value={formatDate(quote.validUntil)} />
                <DetailRow label="ID Khách hàng" value={quote.customerId} />
                <DetailRow label="ID Nhân viên" value={quote.staffId} />
                <DetailRow label="ID Xe (Variant)" value={quote.variantId} />
                <DetailRow label="Dòng xe (Model)" value={quote.modelId} />

                <DetailRow
                    label="Giá gốc (Base)"
                    value={formatCurrency(quote.basePrice)}
                />
                <DetailRow
                    label="Giảm giá (Discount)"
                    value={`- ${formatCurrency(quote.discountAmount)}`}
                    className="text-red-600"
                />
                <DetailRow
                    label="Giá cuối (Final)"
                    value={formatCurrency(quote.finalPrice)}
                    className="text-2xl font-bold text-blue-700"
                />

                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Điều khoản</dt>
                    <dd className="mt-1 text-sm text-gray-900">
            <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-lg">
              {quote.termsConditions || "(Không có điều khoản)"}
            </pre>
                    </dd>
                </div>

                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Khuyến mãi đã áp dụng</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                        {quote.appliedPromotions.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                                {quote.appliedPromotions.map(promo => (
                                    <li key={promo.id}>
                                        {promo.promotionName} ({promo.discountRate * 100}%)
                                    </li>
                                ))}
                            </ul>
                        ) : "(Không có)"}
                    </dd>
                </div>
            </dl>

            <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
            </div>
        </div>
    );
};

export default QuotationDetail;