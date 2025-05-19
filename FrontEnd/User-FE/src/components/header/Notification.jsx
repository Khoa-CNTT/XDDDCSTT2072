import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Notification = () => {
  return (
    <div>
      <div className="header-icon relative hover:scale-110 transition-transform cursor-pointer ml-2">
        <Bell size={20} className="text-white" />
        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
          3
        </Badge>
      </div>
    </div>
  );
};

export default Notification;
