import { useState, useEffect } from "react";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PostCard from "@/components/forum/PostCard";
import CreatePostForm from "@/components/forum/CreatePostForm";
import UserConnectionItem from "@/components/user/UserConnectionItem";
import {
  getForumPosts,
  createForumPost,
  updateForumPost,
  reactToPost,
  removeReaction,
  addForumComment,
  sharePost,
  deleteForumPost,
  getPopularHashtags,
  getConnectionPosts,
} from "@/services/forumService";
import {
  getSuggestedConnections,
  sendConnectionRequest,
} from "@/services/userService";
import {
  Calendar,
  Bookmark,
  Bell,
  Users,
  PenTool,
  Image,
  Search,
  TrendingUp,
  Award,
  Filter,
  Hash,
  Zap,
  Newspaper,
  Home as HomeIcon,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

const Home = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Fetch forum posts
  const {
    data: postsData = { content: [], totalElements: 0, totalPages: 0 },
    isLoading: isLoadingPosts,
    error: postsError,
  } = useQuery({
    queryKey: ["forumPosts"],
    queryFn: () => getForumPosts(axiosPrivate, 0, 10, "createdAt", "desc"),
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 30 * 60 * 1000, // 30 phút
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Luôn refetch khi component được mount
  });

  // Fetch popular hashtags
  const { data: hashtags = [], isLoading: isLoadingHashtags } = useQuery({
    queryKey: ["popularHashtags"],
    queryFn: () => getPopularHashtags(axiosPrivate),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch connection posts
  const {
    data: connectionPostsData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
    },
    isLoading: isLoadingConnectionPosts,
    error: connectionPostsError,
  } = useQuery({
    queryKey: ["connectionPosts"],
    queryFn: () => getConnectionPosts(axiosPrivate, 0, 10),
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Luôn refetch khi component được mount
  });

  // Fetch suggested connections (users)
  const { data: suggestedUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: () => getSuggestedConnections(axiosPrivate),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Share post mutation
  const shareMutation = useMutation({
    mutationFn: ({ postId, content }) =>
      sharePost(axiosPrivate, postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });

  // Handle create/update post submission
  const handlePostSubmit = async (postData) => {
    try {
      console.log(
        "Bắt đầu tạo/cập nhật bài viết",
        postData instanceof FormData ? "Dữ liệu dạng FormData" : postData
      );
      let responseData;

      if (editingPost) {
        // Đang cập nhật bài viết
        if (postData instanceof FormData) {
          // Nếu có FormData (có ảnh mới), thêm ID bài viết cần cập nhật
          const postId = editingPost.id;
          responseData = await updateForumPost(axiosPrivate, postId, postData);
        } else {
          // Cập nhật thông thường không có ảnh mới
          responseData = await updateForumPost(
            axiosPrivate,
            editingPost.id,
            postData
          );
        }
        toast.success("Bài viết đã được cập nhật");
        setEditingPost(null);
      } else {
        // Đang tạo bài viết mới
        responseData = await createForumPost(axiosPrivate, postData);
        toast.success("Bài viết đã được tạo");
      }

      // Đóng form tạo bài viết
      setIsCreatePostOpen(false);

      // Cập nhật cache thủ công để đảm bảo hình ảnh được hiển thị ngay
      if (responseData) {
        console.log("Dữ liệu phản hồi từ API:", responseData);

        // Chuẩn hóa dữ liệu từ API để đảm bảo các trường hình ảnh đính kèm được xử lý đúng
        const normalizedPost = {
          ...responseData,
          // Đảm bảo cả hai trường đều có dữ liệu (cho trường hợp backend chỉ trả về một trong hai)
          attachment_url:
            responseData.attachmentUrl || responseData.attachment_url,
          attachment_type:
            responseData.attachmentType ||
            responseData.attachment_type ||
            "NONE",
          // Đảm bảo người dùng đầy đủ thông tin
          userName: responseData.userName || auth?.user?.userName,
          userImageUrl: responseData.userImageUrl || auth?.user?.imageUrl,
        };

        console.log("Dữ liệu bài viết đã chuẩn hóa:", normalizedPost);

        // Cập nhật queryClient cache
        const currentData = queryClient.getQueryData(["forumPosts"]);
        if (currentData && currentData.content) {
          let updatedContent;

          if (editingPost) {
            // Cập nhật bài viết hiện có trong cache
            updatedContent = currentData.content.map((post) =>
              post.id === normalizedPost.id ? normalizedPost : post
            );
          } else {
            // Thêm bài viết mới vào đầu danh sách
            updatedContent = [normalizedPost, ...currentData.content];
          }

          // Cập nhật cache
          queryClient.setQueryData(["forumPosts"], {
            ...currentData,
            content: updatedContent,
          });

          // Lưu vào localStorage
          try {
            localStorage.setItem(
              "forumPosts",
              JSON.stringify({
                ...currentData,
                content: updatedContent,
              })
            );
          } catch (error) {
            console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
          }
        }
      }

      // Làm mới danh sách bài viết
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý bài viết:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  // Handle post reaction
  const handleReaction = async (postId, reactionType) => {
    console.log("Xử lý phản ứng:", postId, reactionType);
    try {
      // Lấy dữ liệu hiện tại từ cache
      const currentData = queryClient.getQueryData(["forumPosts"]);

      if (!currentData || !currentData.content) return;

      // Tìm bài viết hiện tại
      const currentPost = currentData.content.find((p) => p.id === postId);
      if (!currentPost) return;

      // Lấy phản ứng hiện tại của người dùng
      const oldReaction = currentPost.userReaction;

      // Xác định phản ứng mới sẽ là gì:
      // - Nếu người dùng nhấn vào cùng phản ứng hiện tại -> xóa phản ứng (null)
      // - Nếu người dùng nhấn vào phản ứng khác -> thay đổi phản ứng
      const newReaction = oldReaction === reactionType ? null : reactionType;

      console.log(`Thay đổi phản ứng từ ${oldReaction} -> ${newReaction}`);

      // Cập nhật UI ngay lập tức (Optimistic Update)
      const updatedContent = currentData.content.map((post) => {
        if (post.id === postId) {
          // Tạo bản sao của reactionCounts
          const newReactionCounts = { ...post.reactionCounts };

          // Nếu đã có phản ứng cũ, giảm đi 1
          if (oldReaction && newReactionCounts[oldReaction]) {
            newReactionCounts[oldReaction] = Math.max(
              0,
              newReactionCounts[oldReaction] - 1
            );
          }

          // Nếu có phản ứng mới, tăng lên 1
          if (newReaction) {
            newReactionCounts[newReaction] =
              (newReactionCounts[newReaction] || 0) + 1;
          }

          return {
            ...post,
            userReaction: newReaction, // Cập nhật phản ứng hiện tại
            userReactionUserId: auth?.user?.id, // Thêm userId cho phản ứng để phân biệt giữa các người dùng
            reactionCounts: newReactionCounts,
          };
        }
        return post;
      });

      // Cập nhật cache với dữ liệu mới
      queryClient.setQueryData(["forumPosts"], {
        ...currentData,
        content: updatedContent,
      });

      // Lưu thông tin phản ứng vào nhiều cache key khác nhau để đảm bảo dữ liệu được giữ lại
      // 1. Key chính cho reaction của post
      const postReactionKey = ["postReaction", postId];
      queryClient.setQueryData(postReactionKey, {
        postId,
        reactionType: newReaction,
        previousReaction: oldReaction,
        timestamp: new Date().toISOString(),
        userId: auth?.user?.id,
      });

      // 2. Key dạng string để lưu vào localStorage dễ dàng hơn
      const reactionStringKey = `reaction-post-${postId}`;
      queryClient.setQueryData([reactionStringKey], {
        type: newReaction,
        timestamp: new Date().toISOString(),
        userId: auth?.user?.id,
      });

      // 3. Key cho tất cả reaction của người dùng hiện tại
      if (auth?.user?.id) {
        const userReactionsKey = ["userReactions", auth.user.id];
        const currentUserReactions =
          queryClient.getQueryData(userReactionsKey) || {};

        queryClient.setQueryData(userReactionsKey, {
          ...currentUserReactions,
          [postId]: {
            type: newReaction,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Lưu trực tiếp vào localStorage
      try {
        const updatedPost = updatedContent.find((p) => p.id === postId);

        // Lưu reaction
        if (newReaction) {
          localStorage.setItem(
            reactionStringKey,
            JSON.stringify({
              type: newReaction,
              postId: postId,
              userId: auth?.user?.id,
              timestamp: new Date().toISOString(),
            })
          );
        } else {
          // Xóa reaction nếu người dùng bỏ phản ứng
          localStorage.removeItem(reactionStringKey);
        }

        // Lưu reactionCounts
        if (updatedPost && updatedPost.reactionCounts) {
          localStorage.setItem(
            `reactionCounts-${postId}`,
            JSON.stringify(updatedPost.reactionCounts)
          );
        }

        // Lưu forumPosts vào localStorage - đảm bảo thông tin userReactionUserId được lưu
        localStorage.setItem(
          "forumPosts",
          JSON.stringify(queryClient.getQueryData(["forumPosts"]))
        );
      } catch (e) {
        console.error("Lỗi khi lưu reaction vào localStorage:", e);
      }

      try {
        // Gọi API tương ứng và đợi phản hồi
        let response;

        if (newReaction) {
          // Thêm hoặc thay đổi phản ứng
          response = await reactToPost(axiosPrivate, postId, newReaction);
          console.log("Phản ứng thành công:", response);

          // Lưu dữ liệu vào cache
          queryClient.setQueryData(["reactions", "post", postId], {
            type: newReaction,
            timestamp: new Date().toISOString(),
            userId: auth?.user?.id, // Thêm userId để xác định người dùng
          });
        } else {
          // Xóa phản ứng (trong trường hợp oldReaction không null)
          if (oldReaction) {
            response = await removeReaction(axiosPrivate, postId, oldReaction);
            console.log("Đã xóa phản ứng:", response);
            // Xóa dữ liệu khỏi cache
            queryClient.removeQueries(["reactions", "post", postId]);
          }
        }

        // THAY ĐỔI: Không gọi invalidateQueries sau khi API thành công
        // Thay vào đó chỉ cập nhật cache khi cần thiết
        if (response) {
          // Bảo vệ trạng thái của posts sau khi API hoàn thành
          const latestData = queryClient.getQueryData(["forumPosts"]);
          if (latestData && latestData.content) {
            // Tìm post mới nhất
            const latestPost = latestData.content.find((p) => p.id === postId);

            // Tạo query key cho reaction counts
            const reactionCountsKey = ["reactionCounts", postId];

            // Lưu số lượng reactions vào cache
            queryClient.setQueryData(reactionCountsKey, {
              postId,
              counts: latestPost?.reactionCounts || {},
              timestamp: new Date().toISOString(),
              userId: auth?.user?.id, // Lưu userId để phân biệt giữa các người dùng
            });

            // Lưu lại dữ liệu forumPosts vào localStorage
            try {
              localStorage.setItem("forumPosts", JSON.stringify(latestData));

              // Lưu reaction counts vào localStorage
              if (latestPost && latestPost.reactionCounts) {
                localStorage.setItem(
                  `reactionCounts-${postId}`,
                  JSON.stringify(latestPost.reactionCounts)
                );
              }
            } catch (e) {
              console.log("Không thể lưu vào localStorage:", e);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi xử lý phản ứng:", err);
        toast.error("Đã có lỗi xảy ra khi xử lý phản ứng, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi chung khi xử lý phản ứng:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau");
    }
  };

  // Handle post comment
  const handleComment = async (postId, content, parentId = null) => {
    try {
      const response = await addForumComment(
        axiosPrivate,
        postId,
        content,
        parentId
      );
      if (response) {
        // Cập nhật cache React Query - thêm comment mới vào đầu danh sách
        const queryKey = ["forumPosts"];
        const currentData = queryClient.getQueryData(queryKey);

        if (currentData && currentData.content) {
          const updatedContent = currentData.content.map((post) => {
            if (post.id === postId) {
              // Thêm comment mới vào đầu danh sách và cập nhật số lượng
              const comments = post.comments || [];
              const newComment = {
                ...response,
                userId: auth?.user?.id,
                userName: auth?.user?.name,
                userImageUrl: auth?.user?.imageUrl,
                parentId: parentId, // Lưu trữ thông tin parentId cho comment mới
              };

              // Cập nhật post với comment mới
              return {
                ...post,
                comments: [newComment, ...comments],
                commentCount: (post.commentCount || 0) + 1,
              };
            }
            return post;
          });

          // Cập nhật cache với dữ liệu mới
          queryClient.setQueryData(queryKey, {
            ...currentData,
            content: updatedContent,
          });

          // Cập nhật vào localStorage
          localStorage.setItem(
            "forumPosts",
            JSON.stringify({
              ...currentData,
              content: updatedContent,
            })
          );
        }
      }
    } catch (err) {
      console.error("Lỗi khi thêm bình luận:", err);
      toast.error("Không thể thêm bình luận. Vui lòng thử lại!");
    }
  };

  // Handle post sharing
  const handleShare = (postId) => {
    shareMutation.mutate({ postId, content: "" });
  };

  // Handle post edit
  const handleEdit = (post) => {
    setEditingPost(post);
  };

  // Handle post deletion
  const handleDelete = (postId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này không?")) {
      try {
        deleteForumPost(axiosPrivate, postId)
          .then(() => {
            toast.success("Bài viết đã được xóa");

            // Cập nhật cache trong React Query
            const currentData = queryClient.getQueryData(["forumPosts"]);
            if (currentData && currentData.content) {
              // Lọc bỏ bài viết đã xóa
              const updatedContent = currentData.content.filter(
                (post) => post.id !== postId
              );

              // Cập nhật cache với dữ liệu mới
              queryClient.setQueryData(["forumPosts"], {
                ...currentData,
                content: updatedContent,
                totalElements:
                  currentData.totalElements > 0
                    ? currentData.totalElements - 1
                    : 0,
              });

              // Cập nhật localStorage
              try {
                localStorage.setItem(
                  "forumPosts",
                  JSON.stringify({
                    ...currentData,
                    content: updatedContent,
                    totalElements:
                      currentData.totalElements > 0
                        ? currentData.totalElements - 1
                        : 0,
                  })
                );

                // Xóa các dữ liệu liên quan khác trong localStorage
                localStorage.removeItem(`comments-post-${postId}`);
                localStorage.removeItem(`reaction-post-${postId}`);
                localStorage.removeItem(`reactionCounts-${postId}`);
              } catch (e) {
                console.error("Lỗi khi cập nhật localStorage:", e);
              }
            }

            // Làm mới dữ liệu
            queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
          })
          .catch((error) => {
            console.error("Lỗi khi xóa bài viết:", error);
            toast.error(
              "Đã xảy ra lỗi khi xóa bài viết, vui lòng thử lại sau."
            );
          });
      } catch (error) {
        console.error("Lỗi xử lý xóa bài viết:", error);
      }
    }
  };

  // Handle connecting with user
  const handleConnect = (userId) => {
    // Gọi API gửi yêu cầu kết nối
    sendConnectionRequest(axiosPrivate, userId)
      .then(() => {
        // Hiển thị thông báo thành công
        alert("Đã gửi lời mời kết nối thành công!");
        // Làm mới danh sách gợi ý kết nối
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      })
      .catch((error) => {
        console.error(
          `Lỗi khi gửi lời mời kết nối đến user ID: ${userId}`,
          error
        );
        alert("Có lỗi xảy ra khi gửi lời mời kết nối. Vui lòng thử lại sau.");
      });
  };

  // Mock news và events
  const latestNews = [
    { id: 1, title: "Hội nghị Nông nghiệp xanh 2023", date: "24/11/2023" },
    { id: 2, title: "Triển lãm công nghệ nông nghiệp", date: "15/12/2023" },
    { id: 3, title: "Cập nhật kỹ thuật nuôi trồng mới", date: "10/01/2024" },
  ];

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

  // Thêm kiểm soát tải trang
  useEffect(() => {
    // Đánh dấu đã tải sau 1 giây, kể cả khi có lỗi
    const timer = setTimeout(() => {
      setIsLoadingPage(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Xử lý tìm kiếm và lọc bài viết
  useEffect(() => {
    if (!postsData || !postsData.content) return;

    let filtered = [...postsData.content];

    // Áp dụng tìm kiếm
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          (post.content && post.content.toLowerCase().includes(term)) ||
          (post.title && post.title.toLowerCase().includes(term)) ||
          (post.hashtags &&
            post.hashtags.some((tag) => tag.toLowerCase().includes(term))) ||
          (post.userName && post.userName.toLowerCase().includes(term))
      );
    }

    // Áp dụng bộ lọc theo danh mục
    if (activeFilter !== "all") {
      switch (activeFilter) {
        case "new":
          // Lọc bài viết mới nhất (đã sắp xếp theo mặc định)
          break;
        case "smart":
          // Lọc bài viết có hashtag liên quan đến nông nghiệp thông minh
          filtered = filtered.filter(
            (post) =>
              post.hashtags &&
              post.hashtags.some((tag) =>
                [
                  "nongnghiepthongminh",
                  "smartfarming",
                  "iot",
                  "congnghe",
                ].includes(tag.toLowerCase().replace(/[^a-z0-9]/g, ""))
              )
          );
          break;
        case "growing":
          // Lọc bài viết về kỹ thuật trồng trọt
          filtered = filtered.filter(
            (post) =>
              post.hashtags &&
              post.hashtags.some((tag) =>
                [
                  "trongtrot",
                  "caytrongvumua",
                  "kythuat",
                  "phanbonhuu",
                ].includes(tag.toLowerCase().replace(/[^a-z0-9]/g, ""))
              )
          );
          break;
        case "animal":
          // Lọc bài viết về chăn nuôi
          filtered = filtered.filter(
            (post) =>
              post.hashtags &&
              post.hashtags.some((tag) =>
                ["channuoi", "thucung", "thuysan", "giasucs"].includes(
                  tag.toLowerCase().replace(/[^a-z0-9]/g, "")
                )
              )
          );
          break;
        default:
          break;
      }
    }

    setFilteredPosts(filtered);
  }, [postsData, searchTerm, activeFilter]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Hiển thị màn hình loading khi đang tải
  if (isLoadingPage) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">
              Đang tải trang chủ...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-2 md:px-4 py-4 mt-14">
        {/* Sticky Search bar with shortcuts - Cải tiến */}
        <div className="sticky top-16 z-10 bg-white backdrop-blur-sm bg-opacity-90 shadow-md p-3 mb-5 rounded-xl flex items-center gap-2 transition-all duration-300">
          <div className="relative flex-1 group">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 social-search-icon"
            />
            <Input
              placeholder="Tìm kiếm bài viết, hashtag..."
              className="pl-10 social-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="gap-1 rounded-lg font-medium border-gray-100 shadow-sm hover:bg-green-50 hover:border-green-300 transition-all btn-interactive"
            onClick={() =>
              document
                .getElementById("post-filters")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            <Filter size={16} className="text-green-600" />
            <span className="hidden sm:inline">Lọc</span>
          </Button>
          <Button
            variant="outline"
            className="gap-1 rounded-lg font-medium border-gray-100 shadow-sm hover:bg-green-50 hover:border-green-300 transition-all btn-interactive"
            onClick={() => handleFilterChange("new")}
          >
            <TrendingUp size={16} className="text-green-600" />
            <span className="hidden sm:inline">Xu hướng</span>
          </Button>
          <Button
            variant="outline"
            className="gap-1 rounded-lg font-medium border-gray-100 shadow-sm hover:bg-green-50 hover:border-green-300 transition-all btn-interactive"
            onClick={() => setSearchTerm("#")}
          >
            <Hash size={16} className="text-green-600" />
            <span className="hidden sm:inline">Hashtag</span>
          </Button>
        </div>

        {/* Tìm kiếm và thông tin nhanh - Cải tiến */}
        <div className="hidden md:flex justify-between items-center mb-5">
          <div className="flex gap-4">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 cursor-pointer px-3 py-2 rounded-lg shadow-sm border-green-200 transition-all duration-200"
            >
              <Zap size={16} className="mr-1 text-green-600" />
              <span className="font-medium">Nông nghiệp thông minh</span>
            </Badge>
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 cursor-pointer px-3 py-2 rounded-lg shadow-sm border-blue-200 transition-all duration-200"
            >
              <Award size={16} className="mr-1 text-blue-600" />
              <span className="font-medium">Sản phẩm chất lượng cao</span>
            </Badge>
          </div>

          <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md flex items-center gap-2 rounded-full px-4">
            <Newspaper size={18} />
            <span>Tin mới nhất</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Sidebar */}
          <div className="hidden md:block md:col-span-3 space-y-5">
            {/* User Profile Card - Cải tiến */}
            <div className="card-3d overflow-hidden">
              <div className="relative">
                <div className="h-24 bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400"></div>
                <div className="absolute -bottom-6 left-4">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                    <AvatarImage
                      src={auth?.user?.imageUrl || "/placeholder-user.jpg"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-400 text-white text-xl font-bold">
                      {auth?.user?.username?.charAt(0) ||
                        auth?.user?.userName?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-10 pb-4 px-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {auth?.user?.username || auth?.user?.userName || "Người dùng"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {auth?.user?.email || ""}
                </p>
              </div>
              <div className="border-t border-b border-gray-100 px-4 py-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                    Xem hồ sơ của bạn
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-600 font-normal"
                  >
                    100 lượt xem
                  </Badge>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
                  <Bookmark size={18} className="text-teal-500" />
                  <span>Lưu bài viết</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
                  <Users size={18} className="text-blue-500" />
                  <span>Nhóm</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
                  <Calendar size={18} className="text-amber-500" />
                  <span>Sự kiện</span>
                </div>
              </div>
            </div>

            {/* Trending Hashtags - Cải tiến */}
            <div className="card-3d p-4">
              <h3 className="font-semibold mb-3 text-gray-800 flex items-center">
                <TrendingUp size={18} className="mr-2 text-green-600" />
                Chủ đề thịnh hành
              </h3>
              <div className="space-y-3">
                {isLoadingHashtags ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="skeleton-loader h-12 rounded-lg"
                      ></div>
                    ))}
                  </div>
                ) : (
                  Array.isArray(hashtags) &&
                  hashtags.map((tag, index) => (
                    <div
                      key={tag?.id || index}
                      className="gradient-border flex items-center text-sm hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-all duration-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-blue-600">
                          #{tag?.name || "hashtag"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tag?.postCount || 0} bài viết
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-teal-700 hover:from-green-200 hover:to-teal-200 hover:text-teal-800 border-0 font-normal transition-all duration-200 btn-interactive">
                        Theo dõi
                      </Badge>
                    </div>
                  ))
                )}

                {/* Fallback hashtags */}
                {!isLoadingHashtags &&
                  (!hashtags ||
                    !Array.isArray(hashtags) ||
                    hashtags.length === 0) && (
                    <div className="space-y-3">
                      <div className="gradient-border flex items-center text-sm hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-all duration-200">
                        <div className="flex-1">
                          <p className="font-medium text-blue-600">
                            #nôngnghiệp
                          </p>
                          <p className="text-xs text-gray-500">124 bài viết</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-teal-700 hover:from-green-200 hover:to-teal-200 hover:text-teal-800 border-0 font-normal transition-all duration-200 btn-interactive">
                          Theo dõi
                        </Badge>
                      </div>
                      <div className="gradient-border flex items-center text-sm hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-all duration-200">
                        <div className="flex-1">
                          <p className="font-medium text-blue-600">
                            #caytrongvumua
                          </p>
                          <p className="text-xs text-gray-500">98 bài viết</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-teal-700 hover:from-green-200 hover:to-teal-200 hover:text-teal-800 border-0 font-normal transition-all duration-200 btn-interactive">
                          Theo dõi
                        </Badge>
                      </div>
                      <div className="gradient-border flex items-center text-sm hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-all duration-200">
                        <div className="flex-1">
                          <p className="font-medium text-blue-600">
                            #nongsanthuanviet
                          </p>
                          <p className="text-xs text-gray-500">76 bài viết</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-teal-700 hover:from-green-200 hover:to-teal-200 hover:text-teal-800 border-0 font-normal transition-all duration-200 btn-interactive">
                          Theo dõi
                        </Badge>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="card-3d p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Dark Mode
              </span>
              <button
                className="theme-toggle"
                onClick={() =>
                  document.documentElement.classList.toggle("dark")
                }
                aria-label="Toggle dark mode"
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-6 space-y-5">
            {/* Tabs - Cải tiến */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <Tabs defaultValue="trangchu" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-gradient-to-r from-gray-50 to-gray-100">
                  <TabsTrigger
                    value="trangchu"
                    className="py-4 px-6 social-tab"
                  >
                    Trang chủ
                  </TabsTrigger>
                  <TabsTrigger
                    value="ketnoicuatoi"
                    className="py-4 px-6 social-tab"
                  >
                    Kết nối của tôi
                  </TabsTrigger>
                  <TabsTrigger value="phobien" className="py-4 px-6 social-tab">
                    Phổ biến
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trangchu" className="m-0 p-0">
                  {/* Bộ lọc bài viết - Cải tiến */}
                  <div id="post-filters" className="bg-white mb-5 p-4 border-b">
                    <h3 className="font-medium text-gray-700 mb-3">
                      Lọc bài viết
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={`cursor-pointer px-3 py-2 transition-all duration-200 btn-interactive ${
                          activeFilter === "all"
                            ? "bg-gradient-to-r from-green-100 to-teal-100 text-teal-700 border-teal-200"
                            : "hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-teal-700"
                        }`}
                        onClick={() => handleFilterChange("all")}
                      >
                        Tất cả
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer px-3 py-2 transition-all duration-200 btn-interactive ${
                          activeFilter === "new"
                            ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                            : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700"
                        }`}
                        onClick={() => handleFilterChange("new")}
                      >
                        Bài viết mới nhất
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer px-3 py-2 transition-all duration-200 btn-interactive ${
                          activeFilter === "smart"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200"
                            : "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700"
                        }`}
                        onClick={() => handleFilterChange("smart")}
                      >
                        Nông nghiệp thông minh
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer px-3 py-2 transition-all duration-200 btn-interactive ${
                          activeFilter === "growing"
                            ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-200"
                            : "hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700"
                        }`}
                        onClick={() => handleFilterChange("growing")}
                      >
                        Kỹ thuật trồng trọt
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer px-3 py-2 transition-all duration-200 btn-interactive ${
                          activeFilter === "animal"
                            ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-200"
                            : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700"
                        }`}
                        onClick={() => handleFilterChange("animal")}
                      >
                        Chăn nuôi
                      </Badge>
                    </div>
                  </div>

                  {/* Create Post Box - Cải tiến */}
                  <div className="p-5 border-b border-gray-100 bg-white rounded-xl shadow-md mb-5 card-3d">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-green-100 shadow-sm">
                        <AvatarImage
                          src={auth?.user?.imageUrl || "/placeholder-user.jpg"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-400 text-white text-lg font-bold">
                          {auth?.user?.username?.charAt(0) ||
                            auth?.user?.userName?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>

                      <Dialog
                        open={isCreatePostOpen}
                        onOpenChange={setIsCreatePostOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 justify-start font-normal text-gray-500 post-input-box h-12 px-5"
                          >
                            Bạn đang nghĩ gì?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl rounded-xl">
                          <DialogHeader>
                            <DialogTitle className="text-center text-xl font-semibold text-gray-800">
                              Tạo bài viết
                            </DialogTitle>
                          </DialogHeader>
                          <CreatePostForm onSubmit={handlePostSubmit} />
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex mt-4 pt-3 border-t">
                      <Button
                        variant="ghost"
                        className="flex-1 text-gray-600 gap-2 post-action-button"
                        onClick={() => setIsCreatePostOpen(true)}
                      >
                        <Image size={18} className="text-blue-500" />
                        Ảnh/Video
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-gray-600 gap-2 post-action-button"
                        onClick={() => setIsCreatePostOpen(true)}
                      >
                        <Calendar size={18} className="text-green-500" />
                        Sự kiện
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-gray-600 gap-2 post-action-button"
                        onClick={() => setIsCreatePostOpen(true)}
                      >
                        <PenTool size={18} className="text-amber-500" />
                        Viết bài
                      </Button>
                    </div>
                  </div>

                  {/* Editing post dialog */}
                  {editingPost && (
                    <Dialog
                      open={!!editingPost}
                      onOpenChange={(open) => !open && setEditingPost(null)}
                    >
                      <DialogContent className="max-w-xl rounded-xl">
                        <DialogHeader>
                          <DialogTitle className="text-center text-xl font-semibold text-gray-800">
                            Chỉnh sửa bài viết
                          </DialogTitle>
                        </DialogHeader>
                        <CreatePostForm
                          onSubmit={handlePostSubmit}
                          editMode={true}
                          initialPost={editingPost}
                          onCancel={() => setEditingPost(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Post Feed - Cải tiến */}
                  {isLoadingPosts ? (
                    <div className="bg-white p-8 text-center rounded-xl shadow-md">
                      <div className="animate-pulse flex flex-col space-y-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                          </div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-40 bg-gray-200 rounded-lg"></div>
                        <div className="flex justify-between mt-4">
                          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                      <p className="text-gray-500 mt-4 font-medium">
                        Đang tải bài viết...
                      </p>
                    </div>
                  ) : postsError ? (
                    <div className="bg-white p-8 text-center rounded-xl shadow-md">
                      <p className="text-red-500 mb-4">
                        Có lỗi xảy ra khi tải bài viết.
                      </p>
                      <Button
                        variant="outline"
                        className="bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 border-red-200 shadow-sm mt-2"
                        onClick={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["forumPosts"],
                          })
                        }
                      >
                        Thử lại
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {searchTerm && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-700 mb-4">
                          <p className="flex items-center">
                            <Search size={16} className="mr-2" />
                            Kết quả tìm kiếm cho:{" "}
                            <span className="font-medium ml-1">
                              &quot;{searchTerm}&quot;
                            </span>
                            <Button
                              variant="ghost"
                              className="ml-auto text-xs hover:bg-blue-100"
                              onClick={() => setSearchTerm("")}
                            >
                              Xóa
                            </Button>
                          </p>
                        </div>
                      )}

                      {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => {
                          console.log("Bài viết gốc:", post);
                          console.log("Thông tin người dùng:", {
                            id: post.userId,
                            username: post.username,
                            userName: post.userName,
                            name: post.name,
                            user: post.user,
                          });

                          // Đảm bảo post có đủ thông tin người dùng
                          const enhancedPost = {
                            ...post,
                            // Cập nhật - Trong DB trường tên người dùng thực sự là "userName" không phải "username"
                            username:
                              post.userName ||
                              (post.user ? post.user.userName : null) ||
                              "",
                            // Thêm log để kiểm tra
                            _debug_originalData: {
                              id: post.id,
                              username: post.username, // Trường này có thể không tồn tại
                              userName: post.userName, // Trường này mới chính xác
                              name: post.name,
                              user: post.user,
                            },
                          };

                          console.log("Bài viết đã xử lý:", enhancedPost);

                          return (
                            <PostCard
                              key={post.id}
                              post={enhancedPost}
                              currentUser={auth?.user}
                              onReact={handleReaction}
                              onComment={handleComment}
                              onShare={handleShare}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          );
                        })
                      ) : (
                        <div className="bg-white p-8 text-center rounded-xl shadow-md">
                          <div className="flex flex-col items-center">
                            <Search size={48} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-4 text-lg">
                              {searchTerm
                                ? "Không tìm thấy bài viết nào phù hợp với từ khóa."
                                : "Chưa có bài viết nào phù hợp với bộ lọc."}
                            </p>
                            <Button
                              variant="outline"
                              className="gap-2 px-6"
                              onClick={() => {
                                setSearchTerm("");
                                setActiveFilter("all");
                              }}
                            >
                              <Filter size={16} className="text-green-600" />
                              Xóa bộ lọc
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ketnoicuatoi" className="p-0">
                  {isLoadingConnectionPosts ? (
                    <div className="space-y-5 p-5">
                      {[1, 2, 3].map((index) => (
                        <div
                          key={`skeleton-${index}`}
                          className="bg-white rounded-xl shadow-md p-5 card-3d"
                        >
                          <div className="flex items-center gap-3 mb-4 skeleton-loader h-12 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="skeleton-loader h-4 rounded w-3/4"></div>
                            <div className="skeleton-loader h-4 rounded"></div>
                            <div className="skeleton-loader h-4 rounded w-5/6"></div>
                          </div>
                          <div className="skeleton-loader h-40 rounded-lg mt-4"></div>
                          <div className="flex justify-between mt-4">
                            <div className="skeleton-loader h-8 rounded w-1/4"></div>
                            <div className="skeleton-loader h-8 rounded w-1/4"></div>
                            <div className="skeleton-loader h-8 rounded w-1/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : connectionPostsError ? (
                    <div className="bg-white p-8 text-center rounded-xl shadow-md m-5 card-3d">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 text-red-500 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                          <AlertTriangle size={32} />
                        </div>
                        <p className="text-red-500 mb-4 font-medium">
                          Đã xảy ra lỗi khi tải bài viết từ những người bạn kết
                          nối.
                        </p>
                        <Button
                          variant="outline"
                          className="bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 border-red-200 shadow-sm btn-interactive"
                          onClick={() => {
                            queryClient.invalidateQueries({
                              queryKey: ["connectionPosts"],
                            });
                          }}
                        >
                          Thử lại
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 p-5">
                      {connectionPostsData &&
                        Array.isArray(connectionPostsData.content) &&
                        connectionPostsData.content
                          // Lọc chỉ hiển thị bài viết từ người khác, không phải của người dùng hiện tại
                          .filter((post) => post.userId !== auth?.user?.id)
                          .map((post) => {
                            // Xác định chủ đề bài viết dựa vào hashtags
                            let postTopic = "";
                            if (post.hashtags) {
                              const tags = post.hashtags.map((tag) =>
                                tag.toLowerCase().replace(/[^a-z0-9]/g, "")
                              );
                              if (
                                tags.some((tag) =>
                                  [
                                    "nongnghiepthongminh",
                                    "smartfarming",
                                    "iot",
                                    "congnghe",
                                  ].includes(tag)
                                )
                              ) {
                                postTopic = "topic-tech";
                              } else if (
                                tags.some((tag) =>
                                  [
                                    "trongtrot",
                                    "caytrongvumua",
                                    "kythuat",
                                    "phanbonhuu",
                                  ].includes(tag)
                                )
                              ) {
                                postTopic = "topic-farming";
                              } else if (
                                tags.some((tag) =>
                                  [
                                    "channuoi",
                                    "thucung",
                                    "thuysan",
                                    "giasucs",
                                  ].includes(tag)
                                )
                              ) {
                                postTopic = "topic-animals";
                              } else {
                                postTopic = "topic-news";
                              }
                            }

                            // Tăng cường dữ liệu từ post
                            const enhancedPost = {
                              ...post,
                              // Đảm bảo cả hai trường attachment đều có dữ liệu
                              attachmentUrl:
                                post.attachmentUrl || post.attachment_url,
                              attachment_url:
                                post.attachment_url || post.attachmentUrl,
                              // Đảm bảo cả hai trường attachment type đều có dữ liệu
                              attachmentType:
                                post.attachmentType || post.attachment_type,
                              attachment_type:
                                post.attachment_type || post.attachmentType,
                              // Thiết lập các giá trị mặc định
                              userReaction: post.userReaction || null,
                              reactionCounts: post.reactionCounts || {},
                              // Đảm bảo thông tin người dùng đăng bài
                              authorName: post.userName || "",
                              authorAvatar:
                                post.userAvatar || post.userImageUrl || "",
                              isAuthor: post.userId === auth?.user?.id,
                            };

                            return (
                              <div
                                key={post.id}
                                className={`post-card ${postTopic}`}
                              >
                                <PostCard
                                  post={enhancedPost}
                                  currentUser={auth?.user}
                                  onReact={handleReaction}
                                  onComment={handleComment}
                                  onShare={handleShare}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                />
                              </div>
                            );
                          })}

                      {/* Fallback khi không có bài viết hoặc tất cả là bài viết của người dùng hiện tại */}
                      {connectionPostsData &&
                        (!connectionPostsData.content ||
                          !Array.isArray(connectionPostsData.content) ||
                          connectionPostsData.content.length === 0 ||
                          connectionPostsData.content.every(
                            (post) => post.userId === auth?.user?.id
                          )) && (
                          <div className="card-3d p-8 text-center rounded-xl farmhub-animate-fadeIn">
                            <div className="flex flex-col items-center">
                              <div className="bg-blue-50 rounded-full p-4 mb-4">
                                <Users size={48} className="text-blue-500" />
                              </div>
                              <h3 className="text-gray-800 mb-3 text-xl font-semibold">
                                Chưa có bài viết nào từ những người bạn kết nối
                              </h3>
                              <p className="text-gray-500 mb-6 max-w-md">
                                Kết nối với nhiều người hơn để xem bài viết,
                                chia sẻ kinh nghiệm và học hỏi từ cộng đồng nông
                                nghiệp.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                                <Button
                                  variant="default"
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md gap-2 px-6 py-2 btn-interactive"
                                >
                                  <Users size={18} />
                                  Tìm người để kết nối
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2 px-6 py-2 btn-interactive"
                                >
                                  <PenTool size={18} />
                                  Tạo bài viết mới
                                </Button>
                              </div>

                              {/* Gợi ý người kết nối */}
                              {Array.isArray(suggestedUsers) &&
                                suggestedUsers.length > 0 && (
                                  <div className="mt-8 w-full">
                                    <h4 className="text-gray-700 font-medium mb-4 text-left">
                                      Gợi ý kết nối
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {suggestedUsers
                                        .filter(
                                          (user) => user.id !== auth?.user?.id
                                        )
                                        .slice(0, 4)
                                        .map((user) => (
                                          <div
                                            key={user.id}
                                            className="connection-card flex items-center gap-2 p-3"
                                          >
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage
                                                src={
                                                  user.imageUrl ||
                                                  user.avatarUrl
                                                }
                                              />
                                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400">
                                                {user.userName?.charAt(0) ||
                                                  "U"}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 truncate">
                                              <p className="font-medium text-sm">
                                                {user.userName || user.name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {getRoleLabel(user.role)}
                                              </p>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleConnect(user.id)
                                              }
                                              className="h-8 px-2 text-xs btn-interactive"
                                            >
                                              Kết nối
                                            </Button>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="phobien" className="p-6 text-center">
                  <div className="bg-white p-8 text-center rounded-xl shadow-md">
                    <div className="flex flex-col items-center">
                      <TrendingUp size={48} className="text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4 text-lg font-medium">
                        Đang hiển thị bài viết phổ biến nhất
                      </p>
                      <p className="text-gray-400 mb-4">
                        Tính năng này đang được phát triển. Vui lòng quay lại
                        sau.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar - Cải tiến */}
          <div className="hidden md:block md:col-span-3 space-y-5">
            {/* Gợi ý kết nối */}
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
                              role: user.role
                                ? getRoleLabel(user.role)
                                : "Người dùng",
                            }}
                            onConnect={handleConnect}
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

            {/* Tin tức và sự kiện */}
            <div className="card-3d p-5">
              <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
                <Bell size={18} className="mr-2 text-amber-600" />
                Tin tức và sự kiện
              </h3>

              <div className="space-y-3">
                {latestNews.map((news) => (
                  <div
                    key={news.id}
                    className="hover:bg-gray-50 p-3 rounded-lg cursor-pointer border border-gray-50 transition-all duration-200 gradient-border"
                  >
                    <p className="font-medium text-sm text-gray-800">
                      {news.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <Calendar size={12} className="mr-1 text-green-500" />
                      {news.date}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                variant="link"
                className="w-full text-blue-600 hover:text-blue-700 mt-3 font-medium transition-colors btn-interactive"
              >
                Xem tất cả
              </Button>
            </div>

            {/* Cộng đồng */}
            <div className="card-3d p-5">
              <h3 className="font-semibold mb-4 text-gray-800">
                Cộng đồng nông nghiệp
              </h3>
              <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                <p className="text-sm text-gray-700 mb-3">
                  Kết nối với hơn 5,000 nông dân và chuyên gia nông nghiệp!
                </p>
                <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md btn-interactive">
                  Tham gia ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Menu */}
      <div className="md:hidden mobile-menu">
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
            <AvatarImage src={auth?.user?.imageUrl} />
            <AvatarFallback className="bg-green-500 text-white text-xs">
              {auth?.user?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span>Cá nhân</span>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;
