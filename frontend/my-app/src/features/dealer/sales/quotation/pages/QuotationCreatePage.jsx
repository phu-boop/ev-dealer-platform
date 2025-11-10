// sales/quotation/pages/QuotationCreatePage.js
import React, {useState, useEffect} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    createQuotationDraft,
    calculateQuotation,
    sendQuotation
} from '../services/quotationService';
import {
    getCustomers,
    getVehicleModels,
    getVehicleVariantsByModelId,
    getCurrentDealerId,
    getCurrentStaffId,
    getActivePromotions
} from '../../services/optionService';
import Step1BasicInfo from '../components/Step1BasicInfo';
import Step2Calculation from '../components/Step2Calculation';
import Step3Send from '../components/Step3Send';
import Step4Complete from '../components/Step4Complete';

const QuotationCreatePage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [quotationId, setQuotationId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // Thêm state để lưu message lỗi

    const [customers, setCustomers] = useState([]);
    const [models, setModels] = useState([]);
    const [variants, setVariants] = useState([]);
    const [promotions, setPromotions] = useState([]);

    const [formData, setFormData] = useState({
        dealerId: getCurrentDealerId(),
        customerId: '',
        modelId: '',
        variantId: '',
        staffId: getCurrentStaffId(),
        basePrice: '',
        termsConditions: 'Standard terms and conditions apply'
    });

    const [calculationData, setCalculationData] = useState({
        promotionIds: [],
        additionalDiscountRate: 0
    });

    const [sendData, setSendData] = useState({
        validUntil: '',
        termsConditions: ''
    });

    const [calculationResult, setCalculationResult] = useState(null);
    const [quotationDetail, setQuotationDetail] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (formData.modelId) {
            loadVariants(formData.modelId);
            loadPromotions(formData.modelId);
        }
    }, [formData.modelId]);

    useEffect(() => {
        if (formData.variantId && variants.length > 0) {
            const selectedVariant = variants.find(v => v.variantId == formData.variantId);
            if (selectedVariant) {
                setFormData(prev => ({
                    ...prev,
                    basePrice: selectedVariant.price
                }));
            }
        }
    }, [formData.variantId, variants]);

    // Hàm xử lý lỗi từ API
    const handleApiError = (error, defaultMessage) => {
        console.error('API Error:', error);
        
        // Reset error message trước
        setErrorMessage('');
        
        // Kiểm tra các cấu trúc response error khác nhau
        let errorMessage = defaultMessage;
        
        if (error.response) {
            // Server trả về response với status code ngoài 2xx
            const responseData = error.response.data;
            
            if (responseData && responseData.message) {
                errorMessage = responseData.message;
            } else if (responseData && responseData.error) {
                errorMessage = responseData.error;
            } else if (typeof responseData === 'string') {
                errorMessage = responseData;
            }
        } else if (error.request) {
            // Request được gửi nhưng không nhận được response
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else {
            // Có lỗi khi thiết lập request
            errorMessage = error.message || defaultMessage;
        }
        
        // Hiển thị thông báo lỗi
        toast.error(errorMessage);
        // Lưu message vào state để có thể sử dụng ở nơi khác nếu cần
        setErrorMessage(errorMessage);
        
        return errorMessage;
    };

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setErrorMessage(''); // Reset error message
            const [customersRes, modelsRes] = await Promise.all([
                getCustomers(),
                getVehicleModels()
            ]);

            setCustomers(customersRes.data?.data || customersRes.data || []);
            setModels(modelsRes.data?.data || modelsRes.data || []);
        } catch (error) {
            handleApiError(error, 'Lỗi khi tải dữ liệu ban đầu');
        } finally {
            setLoading(false);
        }
    };

    const loadVariants = async (modelId) => {
        try {
            setErrorMessage(''); // Reset error message
            const variantsRes = await getVehicleVariantsByModelId(modelId);
            setVariants(variantsRes.data?.data || variantsRes.data || []);
        } catch (error) {
            handleApiError(error, 'Lỗi khi tải danh sách phiên bản');
        }
    };

    const loadPromotions = async (modelId) => {
        try {
            setErrorMessage(''); // Reset error message
            const dealerId = getCurrentDealerId();
            const promotionsRes = await getActivePromotions(dealerId, modelId);
            setPromotions(Array.isArray(promotionsRes) ? promotionsRes : []);
        } catch (error) {
            handleApiError(error, 'Lỗi khi tải danh sách khuyến mãi');
        }
    };

    const handleCreateDraft = async () => {
        try {
            setLoading(true);
            setErrorMessage(''); // Reset error message
            const response = await createQuotationDraft({
                ...formData,
                customerId: parseInt(formData.customerId),
                modelId: parseInt(formData.modelId),
                variantId: parseInt(formData.variantId),
                basePrice: parseFloat(formData.basePrice)
            });

            setQuotationId(response.data.quotationId);
            setQuotationDetail(response.data);
            setCurrentStep(2);
            toast.success('Tạo báo giá nháp thành công!');
        } catch (error) {
            handleApiError(error, 'Lỗi khi tạo báo giá nháp');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        try {
            setLoading(true);
            setErrorMessage(''); // Reset error message
            const response = await calculateQuotation(quotationId, {
                ...calculationData,
                additionalDiscountRate: parseFloat(calculationData.additionalDiscountRate) || 0
            });

            setCalculationResult(response.data);
            setQuotationDetail(response.data);
            setCurrentStep(3);
            toast.success('Tính toán giá thành công!');
        } catch (error) {
            // Đặc biệt xử lý lỗi từ API calculate
            const errorMsg = handleApiError(error, 'Lỗi khi tính toán giá');
            
            // Nếu có lỗi cụ thể từ API, có thể xử lý thêm ở đây
            if (errorMsg.includes('Promotion is not applicable')) {
                // Có thể thực hiện các hành động bổ sung khi promotion không áp dụng được
                console.log('Khuyến mãi không áp dụng được, vui lòng chọn khuyến mãi khác');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendQuotation = async () => {
        try {
            setLoading(true);
            setErrorMessage(''); // Reset error message
            const response = await sendQuotation(quotationId, {
                ...sendData,
                customerId: formData.customerId,
                validUntil: sendData.validUntil ? new Date(sendData.validUntil).toISOString() : null
            });

            setQuotationDetail(response.data);
            setCurrentStep(4);
            toast.success('Gửi báo giá cho khách hàng thành công!');
        } catch (error) {
            handleApiError(error, 'Lỗi khi gửi báo giá');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCalculationChange = (e) => {
        const {name, value, type, checked} = e.target;

        if (type === 'checkbox') {
            setCalculationData(prev => ({
                ...prev,
                promotionIds: checked
                    ? [...prev.promotionIds, value]
                    : prev.promotionIds.filter(id => id !== value)
            }));
        } else {
            setCalculationData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSendDataChange = (e) => {
        const {name, value} = e.target;
        setSendData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={3000}/>

            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="px-20 py-8">
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
                            Tạo Báo Giá Mới
                        </h1>

                        {/* Progress Steps Cải Tiến */}
                        <div className="mb-12">
                            <div
                                className="flex items-center justify-between w-full">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step}
                                         className="flex items-center flex-1 last:flex-none">
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${
                                                currentStep >= step
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-gray-300 text-gray-500'
                                            }`}>
                                            {step}
                                        </div>
                                        {step < 4 && (
                                            <div className={`h-1 flex-1 mx-4 ${
                                                currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}/>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-2 text-sm text-gray-600 w-full">
                                <span className="text-center w-1/4">Thông tin cơ bản</span>
                                <span className="text-center w-1/4">Tính toán giá</span>
                                <span className="text-center w-1/4">Gửi báo giá</span>
                                <span className="text-center w-1/4">Hoàn thành</span>
                            </div>
                        </div>

                        {/* Hiển thị error message chi tiết nếu cần */}
                        {errorMessage && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Có lỗi xảy ra
                                        </h3>
                                        <div className="mt-1 text-sm text-red-700">
                                            {errorMessage}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step Content */}
                        <div className="mt-8">
                            {currentStep === 1 && (
                                <Step1BasicInfo
                                    formData={formData}
                                    customers={customers}
                                    models={models}
                                    variants={variants}
                                    onChange={handleInputChange}
                                    onSubmit={handleCreateDraft}
                                    errorMessage={errorMessage} // Truyền error message xuống component con nếu cần
                                />
                            )}

                            {currentStep === 2 && (
                                <Step2Calculation
                                    quotationDetail={quotationDetail}
                                    calculationData={calculationData}
                                    promotions={promotions}
                                    onChange={handleCalculationChange}
                                    onSubmit={handleCalculate}
                                    onBack={() => setCurrentStep(1)}
                                    errorMessage={errorMessage} // Truyền error message xuống component con
                                />
                            )}

                            {currentStep === 3 && (
                                <Step3Send
                                    quotationDetail={calculationResult || quotationDetail}
                                    sendData={sendData}
                                    onChange={handleSendDataChange}
                                    onSubmit={handleSendQuotation}
                                    onBack={() => setCurrentStep(2)}
                                    errorMessage={errorMessage} // Truyền error message xuống component con
                                />
                            )}

                            {currentStep === 4 && (
                                <Step4Complete
                                    quotationDetail={quotationDetail}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationCreatePage;