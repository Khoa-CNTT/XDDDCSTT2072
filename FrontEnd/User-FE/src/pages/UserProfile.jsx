import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  User,
  UserCheck,
  MessageCircle,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Award,
  Search,
  Edit,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  getUserById,
  checkConnectionStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
} from "@/services/userService";
import { getUserPosts } from "@/services/forumService";
import { toast } from "react-toastify";
import UserConnectionItem from "@/components/user/UserConnectionItem";
import { Input } from "@/components/ui/input";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isPending: false,
    isReceived: false,
  });
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [otherUserConnections, setOtherUserConnections] = useState([]);
  const [loadingOtherConnections, setLoadingOtherConnections] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(0);
  const [totalPostPages, setTotalPostPages] = useState(0);

  // Kiểm tra xem đây có phải là profile của chính người dùng hiện tại không
  const isOwnProfile = auth?.user?.id === parseInt(userId);

  // Lấy thông tin người dùng và trạng thái kết nối
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log(`Đang tải thông tin người dùng ID: ${userId}`);

        // Lấy thông tin người dùng
        const userData = await getUserById(axiosPrivate, userId);
        console.log("Thông tin người dùng:", userData);

        // Kiểm tra xem có dữ liệu người dùng không
        if (!userData.success || !userData.data) {
          console.error("Không tìm thấy dữ liệu người dùng:", userData);
          toast.error(userData.message || "Không tìm thấy người dùng");
          setProfileUser(null);
          setLoading(false);
          return;
        }

        console.log("DEBUG - Thông tin người dùng:", userData.data);
        setProfileUser(userData.data);

        // Kiểm tra trạng thái kết nối nếu không phải là profile của chính mình
        if (!isOwnProfile) {
          // Gọi API để kiểm tra trạng thái kết nối
          const connectionData = await checkConnectionStatus(
            axiosPrivate,
            userId
          );
          console.log("Trạng thái kết nối:", connectionData);

          // Cập nhật trạng thái kết nối từ dữ liệu trả về
          setConnectionStatus({
            isConnected: connectionData.isConnected || false,
            isPending: connectionData.isPendingSent || false,
            isReceived: connectionData.isPendingReceived || false,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        toast.error(
          "Không thể tải thông tin người dùng. Vui lòng thử lại sau."
        );
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, axiosPrivate, isOwnProfile]);

  // Thêm useEffect để tải danh sách kết nối
  useEffect(() => {
    const fetchConnections = async () => {
      if (!userId) return;

      try {
        setLoadingConnections(true);

        // Sử dụng endpoint /connections/all để lấy kết nối từ cả hai hướng
        const response = await axiosPrivate.get("/connections/all", {
          params: {
            status: "ACCEPTED",
          },
        });

        console.log("Dữ liệu gốc từ API kết nối:", response.data);

        // Lấy ID người dùng hiện tại từ auth
        const currentUserId = auth?.user?.id;
        console.log("ID người dùng hiện tại:", currentUserId);

        // Xử lý dữ liệu kết nối trả về
        let connectionsList = [];

        if (response.data && response.data.data) {
          // Trường hợp API trả về list bọc trong data
          connectionsList = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          // Trường hợp API trả về array trực tiếp
          connectionsList = response.data;
        }

        console.log("Danh sách kết nối trước khi xử lý:", connectionsList);

        // Lọc và map dữ liệu kết nối để lấy thông tin người dùng đã kết nối
        const processedConnections = connectionsList
          .filter((conn) => conn && (conn.userId || conn.connectedUserId))
          .map((conn) => {
            // Nếu người dùng hiện tại là người tạo kết nối, lấy thông tin người được kết nối
            if (conn.userId === currentUserId) {
              return {
                id: conn.connectedUserId,
                userName: conn.connectedUserName,
                imageUrl: conn.connectedUserAvatar,
                role: conn.connectedUserRole || "Người dùng",
                isOnline: false,
              };
            }
            // Nếu người dùng hiện tại là người được kết nối, lấy thông tin người tạo kết nối
            else if (conn.connectedUserId === currentUserId) {
              return {
                id: conn.userId,
                userName: conn.userName,
                imageUrl: conn.userAvatar,
                role: conn.userRole || "Người dùng",
                isOnline: false,
              };
            }
            // Nếu không phải cả hai, bỏ qua
            return null;
          })
          .filter((user) => user !== null);

        console.log(
          "Danh sách người dùng đã kết nối sau khi xử lý:",
          processedConnections
        );

        // Cập nhật state
        setConnections(processedConnections);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kết nối:", error);
        setConnections([]);
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchConnections();
  }, [userId, axiosPrivate, auth?.user?.id]);

  // Thêm useEffect để tải danh sách kết nối của người dùng khác
  useEffect(() => {
    const fetchOtherUserConnections = async () => {
      // Chỉ chạy khi xem profile người khác, không phải profile của mình
      if (isOwnProfile || !userId) return;

      try {
        setLoadingOtherConnections(true);

        // Sửa API để lấy kết nối hai chiều từ server
        try {
          // Thử gọi API để lấy kết nối của người dùng đang xem
          const statusResponse = await axiosPrivate.get(
            `/connections/check/${userId}`
          );
          console.log("Kiểm tra trạng thái kết nối:", statusResponse.data);

          // API trả về kết nối của cả hai phía
          const otherConnections = await axiosPrivate.get("/connections/all", {
            params: {
              status: "ACCEPTED",
            },
          });

          if (otherConnections.data && otherConnections.data.data) {
            const connections = otherConnections.data.data;

            // Lọc ra những kết nối liên quan đến người dùng đang xem
            const profileUserConnections = connections.filter(
              (conn) =>
                conn.userId === parseInt(userId) ||
                conn.connectedUserId === parseInt(userId)
            );

            console.log(
              "Danh sách kết nối của người dùng đang xem:",
              profileUserConnections
            );

            // Chuyển đổi dữ liệu kết nối thành danh sách người dùng
            const processedConnections = profileUserConnections.map((conn) => {
              // Lấy thông tin người dùng liên quan (không phải người dùng đang xem)
              if (conn.userId === parseInt(userId)) {
                return {
                  id: conn.connectedUserId,
                  userName: conn.connectedUserName,
                  imageUrl: conn.connectedUserAvatar,
                  role: "Người dùng",
                };
              } else {
                return {
                  id: conn.userId,
                  userName: conn.userName,
                  imageUrl: conn.userAvatar,
                  role: "Người dùng",
                };
              }
            });

            setOtherUserConnections(processedConnections);
          }
        } catch (error) {
          console.error("Lỗi khi lấy kết nối của người dùng:", error);
          setOtherUserConnections([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy kết nối của người dùng:", error);
        setOtherUserConnections([]);
      } finally {
        setLoadingOtherConnections(false);
      }
    };

    fetchOtherUserConnections();
  }, [userId, isOwnProfile, axiosPrivate]);

  // Thêm useEffect để tải bài viết của người dùng
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;

      try {
        setLoadingPosts(true);
        const postsData = await getUserPosts(
          axiosPrivate,
          userId,
          postsPage,
          5
        );
        console.log("Dữ liệu bài viết của người dùng:", postsData);

        if (postsData && postsData.content) {
          setUserPosts(postsData.content);
          setTotalPostPages(postsData.totalPages || 0);
        }
      } catch (error) {
        console.error("Lỗi khi lấy bài viết người dùng:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [userId, postsPage, axiosPrivate]);

  // Hàm xử lý gửi yêu cầu kết nối
  const handleConnect = async () => {
    try {
      await sendConnectionRequest(axiosPrivate, userId);
      setConnectionStatus({
        ...connectionStatus,
        isPending: true,
      });
      toast.success("Đã gửi lời mời kết nối thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết nối:", error);
      toast.error("Không thể gửi yêu cầu kết nối. Vui lòng thử lại sau.");
    }
  };

  // Hàm xử lý chấp nhận yêu cầu kết nối
  const handleAcceptConnection = async () => {
    try {
      await acceptConnectionRequest(axiosPrivate, userId);
      setConnectionStatus({
        isConnected: true,
        isPending: false,
        isReceived: false,
      });
      toast.success("Đã chấp nhận lời mời kết nối!");
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu kết nối:", error);
      toast.error("Không thể chấp nhận yêu cầu kết nối. Vui lòng thử lại sau.");
    }
  };

  // Format vai trò người dùng thành tiếng Việt
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
        return role || "Người dùng";
    }
  };

  // Filter connections based on search query - đảm bảo connections luôn là mảng
  const filteredConnections = Array.isArray(connections)
    ? connections.filter(
        (connection) =>
          (connection.userName?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (connection.name?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          )
      )
    : [];

  // Thêm hàm kiểm tra an toàn cho giá trị null/undefined
  const safeGetProperty = (obj, path, defaultValue = "") => {
    if (!obj) return defaultValue;

    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) return defaultValue;
      result = result[key];
    }

    return result !== null && result !== undefined ? result : defaultValue;
  };

  // Thêm hàm xử lý chỉnh sửa hồ sơ
  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  // Nút kết nối/trạng thái kết nối
  const renderConnectionButton = () => {
    if (isOwnProfile) {
      return (
        <Button
          onClick={handleEditProfile}
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
        >
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa hồ sơ
        </Button>
      );
    }

    if (connectionStatus.isConnected) {
      return (
        <Button
          className="flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
          size="sm"
          disabled
        >
          <UserCheck size={16} />
          <span>Đã kết nối</span>
        </Button>
      );
    }

    if (connectionStatus.isPending) {
      return (
        <Button
          className="flex items-center gap-1 bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
          size="sm"
          disabled
        >
          <User size={16} />
          <span>Đã gửi lời mời kết bạn</span>
        </Button>
      );
    }

    if (connectionStatus.isReceived) {
      return (
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
            onClick={handleAcceptConnection}
          >
            <UserCheck size={16} />
            <span>Chấp nhận</span>
          </Button>
          <Button
            className="flex items-center gap-1 bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            size="sm"
          >
            <span>Từ chối</span>
          </Button>
        </div>
      );
    }

    return (
      <Button
        className="flex items-center gap-1"
        size="sm"
        onClick={handleConnect}
      >
        <Plus size={16} />
        <span>Kết nối</span>
      </Button>
    );
  };

  const renderConnectionsTab = () => {
    // Nếu đang xem profile của người khác, hiển thị kết nối của họ
    const isViewingOwnProfile = isOwnProfile;
    const connectionList = isViewingOwnProfile
      ? connections
      : otherUserConnections;
    const isLoadingConnectionList = isViewingOwnProfile
      ? loadingConnections
      : loadingOtherConnections;

    if (isLoadingConnectionList) {
      return (
        <div className="bg-white rounded-lg shadow p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    // Hiển thị thông báo khi không có kết nối
    if (!connectionList || connectionList.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-gray-400 mb-3"
            >
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
              <path d="M15 2h6v6"></path>
              <path d="m8 19 7-7"></path>
              <path d="M21 8 7 22"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-800">
              {isViewingOwnProfile
                ? "Bạn chưa có kết nối nào"
                : `${
                    profileUser?.userName || "Người dùng này"
                  } chưa có kết nối nào`}
            </h3>
            <p className="text-gray-500 mt-2">
              {isViewingOwnProfile
                ? "Kết nối với người dùng khác để mở rộng mạng lưới của bạn"
                : "Hãy kết nối để trở thành người đầu tiên trong danh sách kết nối"}
            </p>
            {!isViewingOwnProfile &&
              !connectionStatus.isConnected &&
              !connectionStatus.isPending && (
                <Button className="mt-4" onClick={handleConnect}>
                  <Plus size={16} className="mr-2" />
                  Kết nối ngay
                </Button>
              )}
          </div>
        </div>
      );
    }

    // Hiển thị danh sách kết nối
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {isViewingOwnProfile && (
          <div className="mb-4 relative">
            <Input
              placeholder="Tìm kiếm trong danh sách kết nối..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="divide-y">
          {Array.isArray(
            isViewingOwnProfile ? filteredConnections : connectionList
          ) &&
          (isViewingOwnProfile ? filteredConnections : connectionList).length >
            0 ? (
            (isViewingOwnProfile ? filteredConnections : connectionList).map(
              (connection) => (
                <UserConnectionItem
                  key={safeGetProperty(
                    connection,
                    "id",
                    `temp-${Math.random()}`
                  )}
                  user={{
                    id: safeGetProperty(connection, "id"),
                    userName: safeGetProperty(connection, "userName"),
                    name: safeGetProperty(connection, "name"),
                    imageUrl: safeGetProperty(connection, "imageUrl"),
                    role: safeGetProperty(connection, "role"),
                    isOnline: safeGetProperty(connection, "isOnline", false),
                  }}
                  isConnected={true}
                  onConnect={() => {}}
                  showRole={true}
                />
              )
            )
          ) : (
            <div className="py-4 text-center text-gray-500">
              {isViewingOwnProfile && searchQuery
                ? `Không tìm thấy người dùng nào phù hợp với &quot;${searchQuery}&quot;`
                : "Không có kết nối nào"}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Hàm render bài viết
  const renderPost = (post) => {
    return (
      <div
        key={post.id}
        className="mb-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage
              src={
                post.authorAvatar ||
                profileUser?.imageUrl ||
                "/placeholder-user.jpg"
              }
            />
            <AvatarFallback>{post.authorName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {post.authorName || profileUser?.userName}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {post.privacyLevel && (
                <span className="ml-2">
                  •{" "}
                  {post.privacyLevel === "PUBLIC"
                    ? "Công khai"
                    : post.privacyLevel === "FRIENDS"
                    ? "Bạn bè"
                    : post.privacyLevel === "PRIVATE"
                    ? "Riêng tư"
                    : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {post.title && <h3 className="font-bold text-lg mb-2">{post.title}</h3>}
        <p className="mb-3 whitespace-pre-line">{post.content}</p>

        {post.attachmentUrl && post.attachmentType === "IMAGE" && (
          <div className="mb-3 overflow-hidden rounded-lg">
            <img
              src={post.attachmentUrl}
              alt="Post attachment"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        <div className="flex justify-between text-gray-500 pt-2 border-t text-sm">
          <div className="flex gap-2 items-center">
            <span>
              {(post.reactionCounts?.LIKE || 0) +
                (post.reactionCounts?.LOVE || 0) +
                (post.reactionCounts?.HAHA || 0) +
                (post.reactionCounts?.WOW || 0) +
                (post.reactionCounts?.SAD || 0)}{" "}
              lượt thích
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <span>{post.commentCount || 0} bình luận</span>
            <span>{post.shareCount || 0} chia sẻ</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto py-6 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Hiển thị thông báo khi không tìm thấy người dùng
  if (!profileUser) {
    return (
      <>
        <Header />
        <main className="container mx-auto py-6 px-4 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Không tìm thấy người dùng
            </h2>
            <p className="text-gray-600 mb-6">
              Người dùng ID {userId} không tồn tại hoặc đã bị xóa
            </p>
            <div className="mb-4 p-4 bg-gray-100 rounded text-left">
              <p className="font-semibold mb-1">Thông tin debug:</p>
              <p className="text-xs text-gray-600">User ID: {userId}</p>
              <p className="text-xs text-gray-600">
                Current user ID: {auth?.user?.id}
              </p>
              <p className="text-xs text-gray-600">
                isOwnProfile: {isOwnProfile ? "true" : "false"}
              </p>
            </div>
            <Button
              onClick={() => window.history.back()}
              className="bg-green-600 hover:bg-green-700"
            >
              Quay lại
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto py-6 px-4">
        {profileUser ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Cover photo & profile info */}
            <div className="relative">
              <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500"></div>
              <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col md:flex-row items-start md:items-end gap-4">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-white">
                  <AvatarImage
                    src={profileUser.imageUrl || "/placeholder-user.jpg"}
                  />
                  <AvatarFallback>
                    {profileUser.userName?.charAt(0) ||
                      profileUser.name?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
                    <div>
                      <h1 className="text-2xl font-bold text-white drop-shadow-md">
                        {profileUser.userName ||
                          profileUser.name ||
                          "Người dùng"}
                      </h1>
                      <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {getRoleLabel(profileUser.role)}
                      </Badge>
                    </div>

                    <div className="flex gap-2 mt-2 md:mt-0">
                      {renderConnectionButton()}

                      {!isOwnProfile && (
                        <Button
                          className="flex items-center gap-1"
                          size="sm"
                          variant="outline"
                        >
                          <MessageCircle size={16} />
                          <span>Nhắn tin</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile content */}
            <div className="mt-32 md:mt-20 p-4">
              <Tabs defaultValue="bài_viết">
                <TabsList className="mb-4">
                  <TabsTrigger value="bài_viết">Bài viết</TabsTrigger>
                  <TabsTrigger value="giới_thiệu">Giới thiệu</TabsTrigger>
                  <TabsTrigger value="kết_nối">Kết nối</TabsTrigger>
                  <TabsTrigger value="hình_ảnh">Hình ảnh</TabsTrigger>
                </TabsList>

                <TabsContent value="bài_viết" className="space-y-4">
                  {isOwnProfile ? (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              profileUser.imageUrl || "/placeholder-user.jpg"
                            }
                          />
                          <AvatarFallback>
                            {profileUser.userName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start font-normal text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full"
                        >
                          Bạn đang nghĩ gì?
                        </Button>
                      </div>
                      <div className="flex mt-3 pt-2 border-t">
                        <Button
                          variant="ghost"
                          className="flex-1 text-gray-600 gap-2 hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-500"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="3"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                          Ảnh/Video
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 text-gray-600 gap-2 hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-500"
                          >
                            <path d="M8 2v4" />
                            <path d="M16 2v4" />
                            <rect width="18" height="18" x="3" y="4" rx="2" />
                            <path d="M3 10h18" />
                          </svg>
                          Sự kiện
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 text-gray-600 gap-2 hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-amber-500"
                          >
                            <path d="m12 19 7-7 3 3-7 7-3-3z" />
                            <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                            <path d="m2 2 7.586 7.586" />
                            <circle cx="11" cy="11" r="2" />
                          </svg>
                          Viết bài
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {loadingPosts ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : userPosts.length > 0 ? (
                    <div>
                      {userPosts.map((post) => renderPost(post))}

                      {totalPostPages > 1 && (
                        <div className="flex justify-center mt-4 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPostsPage((prev) => Math.max(0, prev - 1))
                            }
                            disabled={postsPage === 0}
                          >
                            Trang trước
                          </Button>
                          <span className="p-2">
                            Trang {postsPage + 1} / {totalPostPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPostsPage((prev) =>
                                prev + 1 < totalPostPages ? prev + 1 : prev
                              )
                            }
                            disabled={postsPage + 1 >= totalPostPages}
                          >
                            Trang sau
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto text-gray-400 mb-3"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-800">
                        Chưa có bài viết nào
                      </h3>
                      <p className="text-gray-500 mt-2">
                        Bài viết sẽ hiển thị ở đây khi được tạo
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="giới_thiệu">
                  <div className="space-y-4 p-4 bg-white rounded-lg shadow">
                    <div className="border-b pb-3">
                      <h3 className="font-semibold text-lg mb-2">
                        Thông tin cá nhân
                      </h3>
                      {profileUser.bio ? (
                        <p className="text-gray-700 mb-3">{profileUser.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic mb-3">
                          Chưa có thông tin giới thiệu
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {profileUser.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={18} className="text-blue-500" />
                          <span>{profileUser.email}</span>
                        </div>
                      )}

                      {profileUser.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={18} className="text-red-500" />
                          <span>{profileUser.location}</span>
                        </div>
                      )}

                      {profileUser.joinDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={18} className="text-green-500" />
                          <span>
                            Tham gia từ{" "}
                            {new Date(profileUser.joinDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      )}

                      {profileUser.specialty && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase size={18} className="text-amber-500" />
                          <span>Chuyên môn: {profileUser.specialty}</span>
                        </div>
                      )}
                    </div>

                    {/* Phần kinh nghiệm */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold text-lg mb-3">
                        Kinh nghiệm
                      </h3>
                      {profileUser.experiences &&
                      profileUser.experiences.length > 0 ? (
                        <div className="space-y-4">
                          {profileUser.experiences.map((exp, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-green-500 pl-3"
                            >
                              <h4 className="font-medium">{exp.title}</h4>
                              <p className="text-sm text-gray-500">
                                {exp.company}
                              </p>
                              <p className="text-xs text-gray-500">
                                {exp.period}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          <p className="text-gray-500">
                            Chưa có thông tin kinh nghiệm
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Phần thành tựu */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold text-lg mb-3">Thành tựu</h3>
                      {profileUser.achievements &&
                      profileUser.achievements.length > 0 ? (
                        <div className="space-y-2">
                          {profileUser.achievements.map(
                            (achievement, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Award
                                  size={18}
                                  className="text-yellow-500 mt-1"
                                />
                                <p>{achievement}</p>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          <p className="text-gray-500">
                            Chưa có thông tin thành tựu
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="kết_nối">
                  {renderConnectionsTab()}
                </TabsContent>

                <TabsContent value="hình_ảnh">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto text-gray-400 mb-3"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-800">
                        Chưa có hình ảnh
                      </h3>
                      <p className="text-gray-500 mt-2">
                        Hình ảnh sẽ hiển thị ở đây khi được đăng tải
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="text-center p-12">
            <p className="mb-4 text-xl font-semibold">
              Không tìm thấy người dùng
            </p>
            <p className="text-gray-500">
              Người dùng không tồn tại hoặc đã bị xóa
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default UserProfile;
