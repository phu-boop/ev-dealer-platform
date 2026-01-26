import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('processing'); // 'success', 'failed', 'processing'
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Lấy thông tin từ query params
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionStatus = searchParams.get('vnp_TransactionStatus');
    const amount = searchParams.get('vnp_Amount');
    const txnRef = searchParams.get('vnp_TxnRef');
    const orderInfo = searchParams.get('vnp_OrderInfo');
    const bankCode = searchParams.get('vnp_BankCode');
    const transactionNo = searchParams.get('vnp_TransactionNo');
    const payDate = searchParams.get('vnp_PayDate');

    // Parse payment data
    const data = {
      responseCode,
      transactionStatus,
      amount: amount ? parseInt(amount) / 100 : 0, // VNPay trả về số tiền x100
      txnRef,
      orderInfo,
      bankCode,
      transactionNo,
      payDate: payDate ? formatPayDate(payDate) : null
    };

    setPaymentData(data);

    // Xác định trạng thái thanh toán
    // VNPay response code: 00 = thành công, khác = thất bại
    if (responseCode === '00' && transactionStatus === '00') {
      setPaymentStatus('success');
    } else if (responseCode) {
      setPaymentStatus('failed');
    } else {
      setPaymentStatus('processing');
    }
  }, [searchParams]);

  const formatPayDate = (dateString) => {
    // Format: YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
    if (!dateString || dateString.length !== 14) return dateString;
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);
    
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getErrorMessage = (code) => {
    const errorMessages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };

    return errorMessages[code] || 'Giao dịch không thành công. Vui lòng thử lại sau.';
  };

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Icon & Message */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
          {paymentStatus === 'success' ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đặt cọc xe. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán không thành công
              </h1>
              <p className="text-gray-600 mb-2">
                Giao dịch của bạn đã thất bại.
              </p>
              {paymentData?.responseCode && (
                <p className="text-sm text-red-600 mb-6">
                  {getErrorMessage(paymentData.responseCode)}
                </p>
              )}
            </>
          )}

          {/* Payment Amount */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Số tiền</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatAmount(paymentData?.amount || 0)}
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin giao dịch
          </h2>
          <div className="space-y-3">
            {paymentData?.txnRef && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Mã đơn hàng</span>
                <span className="font-medium text-gray-900">{paymentData.txnRef}</span>
              </div>
            )}
            {paymentData?.transactionNo && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Mã giao dịch</span>
                <span className="font-medium text-gray-900">{paymentData.transactionNo}</span>
              </div>
            )}
            {paymentData?.bankCode && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Ngân hàng</span>
                <span className="font-medium text-gray-900 uppercase">{paymentData.bankCode}</span>
              </div>
            )}
            {paymentData?.payDate && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Thời gian</span>
                <span className="font-medium text-gray-900">{paymentData.payDate}</span>
              </div>
            )}
            {paymentData?.orderInfo && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Nội dung</span>
                <span className="font-medium text-gray-900 text-right">{paymentData.orderInfo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {paymentStatus === 'success' ? (
            <>
              <Button
                onClick={() => navigate('/orders')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
              >
                Xem đơn hàng của tôi
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full py-3 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Về trang chủ
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate(-1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
              >
                Thử lại
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full py-3 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Về trang chủ
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? Liên hệ hotline:{" "}
            <a href="tel:1900636677" className="text-blue-600 font-medium hover:underline">
              1900 63 66 77
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
