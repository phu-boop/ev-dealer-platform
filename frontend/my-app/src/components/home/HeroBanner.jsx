import { PlayCircle } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-900 to-purple-800 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">Khám Phá Thế Giới Xe Điện</h1>
        <p className="text-xl mb-8 opacity-90">
          Trải nghiệm công nghệ tiên tiến, bảo vệ môi trường với dòng xe điện thế hệ mới
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Khám Phá Ngay
          </button>
          <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors flex items-center">
            <PlayCircle className="w-5 h-5 mr-2" />
            Xem Video
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;