import { Tag, Clock, Gift } from "lucide-react";
import Button from "../ui/Button";

const PromotionSection = () => {
  const promotions = [
    {
      id: 1,
      title: "Ưu đãi đặc biệt cuối năm",
      description: "Giảm ngay 50 triệu VND cho khách hàng đặt xe EVM X5 Premium Edition",
      type: "discount",
      expiry: "2024-12-31",
      badge: "Giảm giá"
    },
    {
      id: 2,
      title: "Hỗ trợ lãi suất 0%",
      description: "Trả góp 0% lãi suất trong 24 tháng qua ngân hàng đối tác",
      type: "finance",
      expiry: "2024-11-30",
      badge: "Trả góp"
    },
    {
      id: 3,
      title: "Tặng phụ kiện cao cấp",
      description: "Nhận bộ phụ kiện trị giá 20 triệu khi mua xe EVM S3",
      type: "gift",
      expiry: "2024-12-15",
      badge: "Quà tặng"
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'discount': return <Tag className="w-5 h-5" />;
      case 'finance': return <Clock className="w-5 h-5" />;
      case 'gift': return <Gift className="w-5 h-5" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'discount': return 'bg-red-100 text-red-800';
      case 'finance': return 'bg-blue-100 text-blue-800';
      case 'gift': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="my-12">
      <h2 className="text-3xl font-bold text-center mb-2">Khuyến Mãi & Ưu Đãi</h2>
      <p className="text-gray-600 text-center mb-8">Các chương trình ưu đãi hấp dẫn đang diễn ra</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(promo.type)}`}>
                  {getTypeIcon(promo.type)}
                  <span className="ml-1">{promo.badge}</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Đến {new Date(promo.expiry).toLocaleDateString('vi-VN')}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{promo.title}</h3>
              <p className="text-gray-600 mb-4">{promo.description}</p>
              
              <Button variant="primary" className="w-full">
                Áp dụng ngay
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromotionSection;