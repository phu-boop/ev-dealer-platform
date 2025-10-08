import { Phone, Mail, MapPin, Facebook, Youtube, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin đại lý */}
          <div>
            <h3 className="text-xl font-bold mb-4">EV Motors</h3>
            <p className="text-gray-400 mb-4">
              Đại lý ủy quyền chính thức của EV Motors tại Việt Nam
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-blue-400" />
              <Youtube className="w-5 h-5 cursor-pointer hover:text-red-400" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-pink-400" />
            </div>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-gray-400">1900 1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-gray-400">contact@evmotors.vn</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span className="text-gray-400">
                  123 Trần Duy Hưng, Hà Nội<br />
                  456 Nguyễn Văn Linh, TP.HCM
                </span>
              </div>
            </div>
          </div>

          {/* Đường dẫn nhanh */}
          <div>
            <h4 className="font-semibold mb-4">Đường dẫn nhanh</h4>
            <div className="space-y-2">
              <div><a href="#" className="text-gray-400 hover:text-white">Chính sách bảo mật</a></div>
              <div><a href="#" className="text-gray-400 hover:text-white">Điều khoản sử dụng</a></div>
              <div><a href="#" className="text-gray-400 hover:text-white">Chính sách bảo hành</a></div>
              <div><a href="#" className="text-gray-400 hover:text-white">Tuyển dụng</a></div>
            </div>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <div className="space-y-2">
              <div><a href="#" className="text-gray-400 hover:text-white">Hướng dẫn mua hàng</a></div>
              <div><a href="#" className="text-gray-400 hover:text-white">Câu hỏi thường gặp</a></div>
              <div><a href="#" className="text-gray-400 hover:text-white">Đăng ký lái thử</a></div>
              <div><a href="#" className="text-gray-400 hover:text-white">Liên hệ hỗ trợ</a></div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Electric Vehicle Dealer Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;