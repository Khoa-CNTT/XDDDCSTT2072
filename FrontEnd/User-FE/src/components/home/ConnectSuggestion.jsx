import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSuggestedConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "@/services/userService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Users, Badge } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Button } from "../ui/button";
import UserConnectionItem from "@/components/user/UserConnectionItem";
import { toast } from "react-toastify";

const ConnectSuggestion = () => {
  const auth = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { data: suggestedUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: () => getSuggestedConnections(axiosPrivate),
    retry: 1,
    refetchOnWindowFocus: false,
  });

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

  const handleConnect = (userId) => {
    // Optimistic update - cập nhật UI ngay lập tức
    const currentData = queryClient.getQueryData(["suggestedUsers"]);
    if (currentData) {
      const updatedUsers = currentData.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            connectionStatus: "PENDING_SENT",
          };
        }
        return user;
      });
      queryClient.setQueryData(["suggestedUsers"], updatedUsers);
    }

    // Gọi API gửi yêu cầu kết nối
    sendConnectionRequest(axiosPrivate, userId)
      .then(() => {
        // Hiển thị thông báo thành công
        toast.success("Đã gửi lời mời kết bạn thành công!");
        // Làm mới danh sách gợi ý kết nối
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      })
      .catch((error) => {
        // Nếu lỗi, khôi phục lại UI
        if (currentData) {
          queryClient.setQueryData(["suggestedUsers"], currentData);
        }
        console.error(
          `Lỗi khi gửi lời mời kết nối đến user ID: ${userId}`,
          error
        );
        toast.error(
          "Có lỗi xảy ra khi gửi lời mời kết nối. Vui lòng thử lại sau."
        );
      });
  };

  const handleAcceptConnection = (userId) => {
    acceptConnectionRequest(axiosPrivate, userId)
      .then(() => {
        toast.success("Đã chấp nhận lời mời kết bạn!");
        // Làm mới danh sách gợi ý và kết nối
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
        queryClient.invalidateQueries({ queryKey: ["connections"] });
      })
      .catch((error) => {
        console.error(
          `Lỗi khi chấp nhận lời mời kết nối từ user ID: ${userId}`,
          error
        );
        toast.error(
          "Có lỗi xảy ra khi chấp nhận lời mời kết nối. Vui lòng thử lại sau."
        );
      });
  };

  const handleDeclineConnection = (userId) => {
    rejectConnectionRequest(axiosPrivate, userId)
      .then(() => {
        toast.success("Đã từ chối lời mời kết bạn");
        // Làm mới danh sách gợi ý kết nối
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      })
      .catch((error) => {
        console.error(
          `Lỗi khi từ chối lời mời kết nối từ user ID: ${userId}`,
          error
        );
        toast.error(
          "Có lỗi xảy ra khi từ chối lời mời kết nối. Vui lòng thử lại sau."
        );
      });
  };

  return (
    <div className="card-3d p-5">
      <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
        <Users size={18} className="mr-2 text-blue-600" />
        Có thể bạn biết
      </h3>

      <div className="space-y-4">
        {isLoadingUsers ? (
          // Loading state
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 skeleton-loader h-16"
              ></div>
            ))}
          </div>
        ) : // Render actual users
        Array.isArray(suggestedUsers) && suggestedUsers.length > 0 ? (
          suggestedUsers
            .filter((user) => user.id !== auth?.user?.id) // Exclude current user
            .slice(0, 5) // Limit to 5 users
            .map((user) => {
              const userRole = user.role
                ? getRoleLabel(user.role).toLowerCase()
                : "user";

              return (
                <div key={user.id} className="connection-card">
                  <UserConnectionItem
                    user={{
                      ...user,
                      role: user.role ? getRoleLabel(user.role) : "Người dùng",
                    }}
                    onConnect={handleConnect}
                    onAccept={handleAcceptConnection}
                    onDecline={handleDeclineConnection}
                    isConnected={user.connectionStatus === "ACCEPTED"}
                    isPending={user.connectionStatus === "PENDING_SENT"}
                    isReceived={user.connectionStatus === "PENDING_RECEIVED"}
                  />
                  {user.mutualConnections > 0 && (
                    <p className="text-xs text-gray-500 mt-2 ml-12">
                      <span className="font-medium text-blue-600">
                        {user.mutualConnections}
                      </span>{" "}
                      kết nối chung
                    </p>
                  )}
                  {user.bio && (
                    <p className="text-xs text-gray-600 mt-2 ml-12 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  {user.specialty && (
                    <Badge
                      variant="outline"
                      className="ml-12 mt-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-200"
                    >
                      {user.specialty}
                    </Badge>
                  )}
                  <span
                    className={`connection-role-badge ${userRole} absolute top-2 right-2`}
                  >
                    {user.role ? getRoleLabel(user.role) : "Người dùng"}
                  </span>
                </div>
              );
            })
        ) : (
          // Fallback when no users found
          <div className="text-center text-sm text-gray-500 py-4 bg-gray-50 rounded-lg">
            <Users size={24} className="text-gray-300 mx-auto mb-2" />
            Hiện chưa có gợi ý kết nối
          </div>
        )}
      </div>

      {Array.isArray(suggestedUsers) && suggestedUsers.length > 5 && (
        <Button
          variant="link"
          className="w-full text-blue-600 hover:text-blue-700 mt-3 font-medium transition-colors btn-interactive"
        >
          Xem thêm
        </Button>
      )}
    </div>
  );
};

export default ConnectSuggestion;
