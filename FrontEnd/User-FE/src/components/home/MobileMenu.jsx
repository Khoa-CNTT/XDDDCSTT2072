import { Bell, Users, PenTool, Home as HomeIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
const MobileMenu = () => {
  const auth = useAuth();
  return (
    <div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 mobile-menu">
        <div className="mobile-menu-item active">
          <HomeIcon size={20} className="mobile-menu-icon" />
          <span>Trang chủ</span>
        </div>
        <div className="mobile-menu-item">
          <Users size={20} className="mobile-menu-icon" />
          <span>Kết nối</span>
        </div>
        <div className="mobile-menu-item">
          <PenTool size={20} className="mobile-menu-icon" />
          <span>Viết bài</span>
        </div>
        <div className="mobile-menu-item">
          <Bell size={20} className="mobile-menu-icon" />
          <span>Thông báo</span>
        </div>
        <div className="mobile-menu-item">
          <Avatar className="mobile-menu-icon h-6 w-6">
            <AvatarImage
              src={auth?.user?.imageUrl}
              alt={auth?.user?.userName || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-400 text-white text-xs">
              {auth?.user?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
