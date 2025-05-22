import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Bookmark } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { getUserPosts } from "@/services/forumService";

const UserProfileCard = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  // Query để lấy số lượng bài viết của người dùng
  const {
    data: userPosts = [],
    isLoading: isLoadingPosts,
    isError: isPostError,
  } = useQuery({
    queryKey: ["userPosts", auth?.user?.id],
    queryFn: () => getUserPosts(axiosPrivate, auth?.user?.id),
    enabled: !!auth?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 phút
    onSuccess: (data) => {
      console.log("Dữ liệu bài viết đã đăng:", data);
      const postCount = data?.content?.length || 0;
      console.log(`Đã tìm thấy ${postCount} bài viết`);
    },
    onError: (error) => {
      console.error("Lỗi khi tải bài viết:", error);
    },
  });

  // Lấy số lượng từ dữ liệu
  const postCount =
    userPosts?.content?.length ||
    userPosts?.totalElements ||
    (Array.isArray(userPosts) ? userPosts.length : 0);

  return (
    <div className="card-3d overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-100">
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400"></div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
            <AvatarImage
              src={auth?.user?.imageUrl || "/placeholder-user.jpg"}
              alt={auth?.user?.username || auth?.user?.userName || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-400 text-white text-xl font-bold">
              {auth?.user?.username?.charAt(0) ||
                auth?.user?.userName?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="pt-12 pb-4 px-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {auth?.user?.username || auth?.user?.userName || "Người dùng"}
        </h3>
        <p className="text-gray-500 text-sm">{auth?.user?.email || ""}</p>
        <Badge className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-100">
          {auth?.user?.role === "FARMER"
            ? "Nhà nông"
            : auth?.user?.role === "EXPERT"
            ? "Chuyên gia"
            : auth?.user?.role === "SUPPLIER"
            ? "Nhà cung cấp"
            : "Người dùng"}
        </Badge>
      </div>
      <div className="border-t border-b border-gray-100 px-4 py-3 bg-gray-50">
        <div className="flex justify-between items-center">
          <Link
            to={`/profile/${auth?.user?.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Xem hồ sơ của bạn
          </Link>
        </div>
      </div>
      <div className="px-4 py-3">
        <Link
          to={`/profile/${auth?.user?.id}/posts`}
          className="flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
        >
          <Bookmark size={18} className="text-teal-500" />
          <span>Bài viết đã đăng</span>
          <Badge className="ml-auto bg-green-100 text-green-700 font-normal">
            {postCount}
            {isLoadingPosts && <span className="ml-1 animate-spin">⟳</span>}
            {isPostError && <span className="ml-1 text-red-500">!</span>}
          </Badge>
        </Link>
        <div className="flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
          <BarChart3 size={18} className="text-purple-500" />
          <span>Hoạt động</span>
          {auth?.user?.isOnline && (
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full ml-1.5 flex-shrink-0 animate-pulse"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
