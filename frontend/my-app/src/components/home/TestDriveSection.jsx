import { useState } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const TestDriveSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    location: '',
    vehicle: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đặt lịch lái thử
    console.log('Đặt lịch lái thử:', formData);
  };

  return (
    <section className="bg-gray-50 py-12 px-6 rounded-lg my-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Đặt Lịch Lái Thử</h2>
        <p className="text-gray-600 text-center mb-8">Trải nghiệm thực tế với dòng xe điện mới nhất</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Họ và tên"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe quan tâm</label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn mẫu xe</option>
                <option value="evm-x5">EVM X5 Premium</option>
                <option value="evm-s3">EVM S3 Standard</option>
                <option value="evm-t7">EVM T7 Luxury</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày lái thử</label>
              <Calendar className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ</label>
              <Clock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <select
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn giờ</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>
            <div className="relative md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <MapPin className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn đại lý</option>
                <option value="hanoi">Hà Nội - 123 Trần Duy Hưng</option>
                <option value="hcm">TP.HCM - 456 Nguyễn Văn Linh</option>
                <option value="danang">Đà Nẵng - 789 Trần Phú</option>
              </select>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button type="submit" className="px-8">
              Đặt Lịch Ngay
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default TestDriveSection;