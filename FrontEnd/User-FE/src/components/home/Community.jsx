import { Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
const Community = () => {
  return (
    <div>
      <div className="card-3d p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-100">
        <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
          <Leaf size={18} className="mr-2 text-green-600" />
          Cộng đồng nông nghiệp
        </h3>
        <div className="overflow-hidden rounded-xl">
          <div className="relative">
            <img
              src="/assets/community-banner.jpg"
              alt="Cộng đồng nông nghiệp"
              className="w-full h-36 object-cover rounded-t-xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-xl"></div>
            <div className="absolute bottom-3 left-3 text-white">
              <p className="text-sm font-medium">
                Cộng đồng nông nghiệp Việt Nam
              </p>
              <p className="text-xs opacity-80">5,000+ thành viên</p>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-b-xl border-t border-green-100">
            <p className="text-sm text-gray-700 mb-3">
              Kết nối với hơn 5,000 nông dân và chuyên gia nông nghiệp!
            </p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md flex items-center justify-center gap-2">
              <Users size={16} />
              <span>Tham gia ngay</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
