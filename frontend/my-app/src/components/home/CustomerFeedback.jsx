import { Star, Quote } from "lucide-react";

const CustomerFeedback = () => {
  const feedbacks = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, nhân viên tư vấn nhiệt tình. Xe EVM X5 vận hành êm ái, tiết kiệm điện năng đúng như quảng cáo.",
      vehicle: "EVM X5 Premium",
      date: "2024-10-15"
    },
    {
      id: 2,
      name: "Trần Thị B",
      rating: 4,
      comment: "Rất hài lòng với trải nghiệm lái thử. Chất lượng xe tốt, thiết kế đẹp. Sẽ quay lại đặt mua trong tháng tới.",
      vehicle: "EVM S3 Standard",
      date: "2024-10-10"
    },
    {
      id: 3,
      name: "Lê Văn C",
      rating: 5,
      comment: "Đại lý chuyên nghiệp, hỗ trợ tốt về thủ tục trả góp. Xe sử dụng 2 tháng rất ổn định, phí sạc rẻ hơn xăng nhiều.",
      vehicle: "EVM T7 Luxury",
      date: "2024-10-05"
    }
  ];

  const averageRating = 4.7;
  const totalReviews = 128;

  return (
    <section className="bg-gray-50 py-12 px-6 rounded-lg my-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Đánh giá từ khách hàng</h2>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-4xl font-bold text-blue-600">{averageRating}</div>
            <div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(averageRating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">Dựa trên {totalReviews} đánh giá</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-md p-6 relative">
              <Quote className="w-8 h-8 text-blue-100 absolute top-4 right-4" />
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= feedback.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mb-4 italic">"{feedback.comment}"</p>
              
              <div className="border-t pt-4">
                <div className="font-semibold">{feedback.name}</div>
                <div className="text-sm text-gray-600">{feedback.vehicle}</div>
                <div className="text-sm text-gray-500">
                  {new Date(feedback.date).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Gửi đánh giá của bạn
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomerFeedback;