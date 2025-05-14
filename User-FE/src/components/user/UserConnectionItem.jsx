/* eslint-disable react/prop-types */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, User, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

/**
 * Component hiển thị thông tin người dùng trong danh sách gợi ý/kết nối
 * @param {object} user - Thông tin người dùng
 * @param {function} onConnect - Hàm xử lý khi nhấn nút kết nối
 * @param {boolean} isConnected - Trạng thái đã kết nối hay chưa
 * @param {boolean} isPending - Trạng thái đang chờ xác nhận kết nối
 */
const UserConnectionItem = ({
  user,
  onConnect,
  isConnected = false,
  isPending = false,
  showRole = true,
}) => {
  // Format user role label
  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "EXPERT":
        return "Chuyên gia nông nghiệp";
      case "FARMER":
        return "Nông dân";
      case "SUPPLIER":
        return "Nhà cung cấp";
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
      <Link to={`/profile/${user.id}`} className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.imageUrl || "/placeholder-user.jpg"} />
          <AvatarFallback>
            {user.userName?.charAt(0) || user.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.id}`} className="hover:underline">
          <p className="font-medium text-sm truncate">
            {user.userName || user.name}
          </p>
        </Link>

        <div className="flex items-center gap-2">
          {showRole && (
            <p className="text-xs text-gray-500 truncate">
              {getRoleLabel(user.role) || "Người dùng"}
            </p>
          )}

          {user.mutualConnections > 0 && (
            <Badge variant="outline" className="text-xs font-normal py-0 h-4">
              {user.mutualConnections} chung
            </Badge>
          )}
        </div>
      </div>

      {!isConnected && !isPending && (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => onConnect(user.id)}
        >
          <Plus size={14} />
          <span>Kết nối</span>
        </Button>
      )}

      {isPending && (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 bg-gray-50"
          disabled
        >
          <User size={14} />
          <span>Đã gửi</span>
        </Button>
      )}

      {isConnected && (
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 text-green-600"
          disabled
        >
          <UserCheck size={14} />
          <span>Đã kết nối</span>
        </Button>
      )}
    </div>
  );
};

export default UserConnectionItem;
