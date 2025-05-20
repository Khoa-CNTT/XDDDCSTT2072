import {
  Users,
  PenTool,
  Newspaper,
  Leaf,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div>
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500 pt-20 pb-10 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6 py-6">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium mb-2">
                <span className="flex items-center gap-1">
                  <Sparkles size={14} className="text-yellow-200" />
                  Cộng đồng nông nghiệp Việt Nam
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Kết nối, chia sẻ & phát triển <br />
                <span className="text-yellow-200">
                  cùng cộng đồng nông nghiệp
                </span>
              </h1>
              <p className="text-white/90 text-lg max-w-lg">
                Chia sẻ kinh nghiệm, tìm kiếm giải pháp và kết nối với những nhà
                nông, chuyên gia hàng đầu trong lĩnh vực nông nghiệp.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button className="bg-white text-green-600 hover:bg-green-100 font-medium rounded-full px-6 h-11 shadow-lg transition-all">
                  <PenTool size={18} className="mr-2" />
                  Đăng bài viết
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full px-6 h-11"
                >
                  <Users size={18} className="mr-2" />
                  Tìm kiếm kết nối
                </Button>
              </div>
            </div>
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-yellow-400/20 backdrop-blur-sm rounded-2xl"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-400/20 backdrop-blur-sm rounded-2xl"></div>
                <img
                  src="/assets/hero-image.jpg"
                  alt="Nông nghiệp thông minh"
                  className="w-full h-auto object-cover rounded-2xl shadow-2xl relative z-10"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Thành viên</p>
                  <p className="text-xl font-bold">24,500+</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Newspaper size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Bài viết</p>
                  <p className="text-xl font-bold">8,200+</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Leaf size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Nhà nông</p>
                  <p className="text-xl font-bold">15,300+</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Chuyên gia</p>
                  <p className="text-xl font-bold">1,200+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
