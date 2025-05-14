/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share,
  Globe,
  Send,
  Smile,
  MapPin,
  Clock,
  Bookmark,
  Flag,
  Heart,
  ChevronDown,
  Lightbulb,
  Award,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryClient } from "@tanstack/react-query";
import { getPostImages, getComments } from "@/services/forumService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
// Thêm import CommentDialog
import CommentDialog from "./CommentDialog";

// Thêm hàm helper để format thời gian cho title tooltip, với xử lý lỗi tốt hơn
const formatTitleDate = (dateString) => {
  try {
    // Kiểm tra các giá trị không hợp lệ hoặc không xác định
    if (!dateString || dateString === "null" || dateString === "undefined") {
      return "Không rõ thời gian";
    }

    // Kiểm tra format ngày hợp lệ
    const date = new Date(dateString);

    // Kiểm tra xem ngày có hợp lệ không
    if (isNaN(date.getTime())) {
      console.log("Ngày không hợp lệ cho tooltip:", dateString);
      return "Không rõ thời gian";
    }

    // Format ngày với xử lý lỗi
    try {
      return format(date, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi });
    } catch (formatError) {
      console.error("Lỗi format ngày cho tooltip:", formatError);
      return "Không rõ thời gian";
    }
  } catch (error) {
    console.error("Lỗi xử lý ngày cho tooltip:", error);
    return "Không rõ thời gian";
  }
};

const PostCard = ({
  post,
  currentUser,
  onReact,
  onComment,
  onShare,
  onEdit,
  onDelete,
}) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [likedComments, setLikedComments] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [localUserReaction, setLocalUserReaction] = useState(
    post.userReaction || null
  );
  const [localReactionCounts, setLocalReactionCounts] = useState(
    post.reactionCounts || {}
  );
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [localCommentCount, setLocalCommentCount] = useState(
    post.commentCount || 0
  );
  const [postImages, setPostImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  // Thêm state trong component PostCard
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  // Query client để lấy dữ liệu từ cache
  const queryClient = useQueryClient();
  // Axios Private để gọi API khi cần
  const axiosPrivate = useAxiosPrivate();

  // Cập nhật state local khi prop thay đổi và khôi phục dữ liệu từ localStorage
  useEffect(() => {
    // Đảm bảo post có thời gian hợp lệ
    if (!post.createdAt) {
      post.createdAt = new Date().toISOString();
    }

    // Đảm bảo mỗi comment có thời gian hợp lệ
    if (post.comments && Array.isArray(post.comments)) {
      post.comments = post.comments.map((comment) => {
        if (!comment.createdAt) {
          return { ...comment, createdAt: new Date().toISOString() };
        }
        return comment;
      });
    }

    // Đảm bảo dữ liệu hình ảnh/đính kèm được xử lý đúng
    let attachmentUrl = post.attachment_url || post.attachmentUrl;
    let attachmentType = post.attachment_type || post.attachmentType;

    if (attachmentUrl) {
      console.log("Phát hiện hình ảnh đính kèm:", {
        url: attachmentUrl,
        type: attachmentType,
      });
    } else {
      console.log(
        "Không tìm thấy URL đính kèm trong dữ liệu bài viết, sẽ thử khôi phục..."
      );
    }

    // Luôn tải hình ảnh từ API để lấy tất cả các hình ảnh của bài đăng
    loadPostImages();

    // Kiểm tra và khôi phục phản ứng từ localStorage trước (ưu tiên cao nhất)
    let userReactionFromLocalStorage = null;
    let reactionCountsFromLocalStorage = null;

    try {
      // Kiểm tra reaction - CHỈ lấy reaction nếu nó thuộc về người dùng hiện tại
      const reactionKey = `reaction-post-${post.id}`;
      const storedReaction = localStorage.getItem(reactionKey);
      if (storedReaction) {
        const parsedReaction = JSON.parse(storedReaction);
        // Kiểm tra chặt chẽ: chỉ sử dụng reaction nếu nó thuộc về người dùng hiện tại
        if (
          parsedReaction &&
          parsedReaction.type &&
          parsedReaction.userId &&
          parsedReaction.userId === currentUser?.id
        ) {
          userReactionFromLocalStorage = parsedReaction.type;
          console.log(
            `Đã tìm thấy phản ứng của người dùng ${currentUser?.id} cho bài viết ${post.id}: ${parsedReaction.type}`
          );
        } else {
          // Nếu reaction không thuộc về người dùng hiện tại, xóa khỏi state local
          console.log(
            `Phản ứng trong localStorage không phải của người dùng hiện tại (${currentUser?.id}): `,
            parsedReaction
          );
          if (parsedReaction && parsedReaction.userId !== currentUser?.id) {
            console.log("Phản ứng thuộc về người dùng khác, không áp dụng");
          }
          userReactionFromLocalStorage = null;
        }
      }

      // Kiểm tra reaction counts
      const reactionCountsKey = `reactionCounts-${post.id}`;
      const storedCounts = localStorage.getItem(reactionCountsKey);
      if (storedCounts) {
        reactionCountsFromLocalStorage = JSON.parse(storedCounts);
      }
    } catch (e) {
      console.error("Lỗi khi đọc reaction từ localStorage:", e);
    }

    // Ưu tiên dữ liệu theo thứ tự: localStorage > props > null
    // Chỉ sử dụng userReaction từ props nếu nó thuộc về người dùng hiện tại
    const propUserReaction =
      post.userReaction && post.userReactionUserId === currentUser?.id
        ? post.userReaction
        : null;

    setLocalUserReaction(
      userReactionFromLocalStorage || propUserReaction || null
    );
    setLocalReactionCounts(
      reactionCountsFromLocalStorage || post.reactionCounts || {}
    );

    // Ưu tiên comments từ props luôn luôn
    if (
      post.comments &&
      Array.isArray(post.comments) &&
      post.comments.length > 0
    ) {
      const uniqueComments = removeDuplicateComments(post.comments);
      setLocalComments(uniqueComments);
      setLocalCommentCount(post.commentCount || uniqueComments.length);
    } else {
      // Không có dữ liệu trong props
      setLocalComments([]);
      setLocalCommentCount(post.commentCount || 0);
    }

    // Đánh dấu trạng thái đã hiển thị đầy đủ
    if (
      showComments &&
      localComments.length === 0 &&
      post.comments &&
      post.comments.length > 0
    ) {
      const uniqueComments = removeDuplicateComments(post.comments);
      setLocalComments(uniqueComments);
    }

    // Kiểm tra xem có dữ liệu được lưu trong cache không
    const checkCachedData = async () => {
      try {
        // Kiểm tra và lấy dữ liệu phản ứng từ cache nếu chưa có từ localStorage
        if (!userReactionFromLocalStorage) {
          const reactionData = queryClient.getQueryData([
            "reactions",
            "post",
            post.id,
          ]);
          if (reactionData && reactionData.type) {
            setLocalUserReaction(reactionData.type);
          }
        }

        // Kiểm tra và lấy dữ liệu số lượng phản ứng từ cache nếu chưa có từ localStorage
        if (!reactionCountsFromLocalStorage) {
          const reactionCountsData = queryClient.getQueryData([
            "reactionCounts",
            post.id,
          ]);
          if (reactionCountsData && reactionCountsData.counts) {
            setLocalReactionCounts(reactionCountsData.counts);
          }
        }

        // Nếu chưa có comments từ props, kiểm tra từ cache
        if (
          (!post.comments ||
            !Array.isArray(post.comments) ||
            post.comments.length === 0) &&
          localComments.length === 0
        ) {
          // Kiểm tra và lấy dữ liệu bình luận từ cache
          const commentsData = queryClient.getQueryData(["comments", post.id]);
          if (
            commentsData &&
            Array.isArray(commentsData) &&
            commentsData.length > 0
          ) {
            const uniqueComments = removeDuplicateComments(commentsData);
            setLocalComments(uniqueComments);
            setLocalCommentCount(uniqueComments.length);
          }
        }
      } catch (e) {
        console.error("Lỗi khi kiểm tra dữ liệu từ cache:", e);
      }
    };

    // Gọi hàm kiểm tra cache
    checkCachedData();
  }, [post, currentUser, queryClient, showComments, axiosPrivate]);

  // Thêm useEffect mới để tải comments từ API khi showComments thay đổi, không sử dụng localStorage
  useEffect(() => {
    // Nếu showComments được bật, tải bình luận từ API
    if (showComments) {
      const fetchComments = async () => {
        try {
          console.log(
            `Đang tải bình luận cho bài viết ID ${post.id} từ API...`
          );

          // Gọi API để lấy dữ liệu comments mới nhất
          const commentsData = await getComments(axiosPrivate, post.id);
          console.log("Dữ liệu bình luận từ API:", commentsData);

          if (
            commentsData &&
            commentsData.content &&
            Array.isArray(commentsData.content)
          ) {
            // Cập nhật comments từ API
            const newComments = removeDuplicateComments(commentsData.content);
            console.log(
              `Đã nhận ${newComments.length} bình luận từ API cho bài viết ID ${post.id}`
            );

            setLocalComments(newComments);

            // Cập nhật số lượng comment từ API
            const newCommentCount =
              commentsData.totalElements || newComments.length;
            setLocalCommentCount(newCommentCount);
          } else if (commentsData && Array.isArray(commentsData)) {
            // Trường hợp API trả về mảng trực tiếp
            const newComments = removeDuplicateComments(commentsData);
            console.log(
              `Đã nhận ${newComments.length} bình luận (dạng mảng) từ API cho bài viết ID ${post.id}`
            );

            setLocalComments(newComments);
            setLocalCommentCount(newComments.length);
          } else {
            console.log(
              "API trả về dữ liệu không đúng định dạng:",
              commentsData
            );
            // Thử gọi trực tiếp đến endpoint khác
            try {
              console.log("Thử lại với endpoint /forum/replies/post");
              const response = await axiosPrivate.get(
                `/forum/replies/post/${post.id}`
              );
              if (
                response.data &&
                response.data.content &&
                Array.isArray(response.data.content)
              ) {
                const newComments = removeDuplicateComments(
                  response.data.content
                );
                console.log(
                  `Đã nhận ${newComments.length} bình luận từ endpoint thay thế`
                );

                setLocalComments(newComments);
                setLocalCommentCount(
                  response.data.totalElements || newComments.length
                );
              }
            } catch (error) {
              console.error(
                "Lỗi khi gọi endpoint thay thế:",
                error.message || "Không có thông tin chi tiết"
              );

              // Thử endpoint cuối cùng
              try {
                console.log("Thử lại với endpoint /posts/{id}/comments");
                const finalResponse = await axiosPrivate.get(
                  `/posts/${post.id}/comments`
                );
                if (finalResponse.data && Array.isArray(finalResponse.data)) {
                  const newComments = removeDuplicateComments(
                    finalResponse.data
                  );
                  console.log(
                    `Đã nhận ${newComments.length} bình luận từ endpoint cuối cùng`
                  );

                  setLocalComments(newComments);
                  setLocalCommentCount(newComments.length);
                }
              } catch (error) {
                console.error(
                  "Tất cả các cách lấy bình luận đều thất bại:",
                  error.message || "Không có thông tin lỗi"
                );
              }
            }
          }
        } catch (error) {
          console.error(`Lỗi khi tải comments từ API:`, error);
          // Nếu có lỗi, thử gọi API với endpoint khác
          try {
            console.log("Thử lại với endpoint /api/v1/posts/{id}/comments");
            // Thử gọi trực tiếp đến endpoint /api/v1/posts/{postId}/comments
            const response = await axiosPrivate.get(
              `/api/v1/posts/${post.id}/comments`
            );
            if (response.data && Array.isArray(response.data)) {
              const newComments = removeDuplicateComments(response.data);
              console.log(
                `Đã nhận ${newComments.length} bình luận từ API thay thế`
              );

              setLocalComments(newComments);
              setLocalCommentCount(newComments.length);
            } else if (
              response.data &&
              response.data.content &&
              Array.isArray(response.data.content)
            ) {
              const newComments = removeDuplicateComments(
                response.data.content
              );
              console.log(
                `Đã nhận ${newComments.length} bình luận từ API thay thế`
              );

              setLocalComments(newComments);
              setLocalCommentCount(
                response.data.totalElements || newComments.length
              );
            }
          } catch (error) {
            console.error("Thử lại cũng thất bại:", error);

            // Thử với endpoint cuối cùng
            try {
              console.log("Thử lại với endpoint /replies/post");
              const finalResponse = await axiosPrivate.get(
                `/replies/post/${post.id}`
              );
              if (finalResponse.data && Array.isArray(finalResponse.data)) {
                const newComments = removeDuplicateComments(finalResponse.data);
                console.log(
                  `Đã nhận ${newComments.length} bình luận từ endpoint cuối cùng`
                );

                setLocalComments(newComments);
                setLocalCommentCount(newComments.length);
              }
            } catch (error) {
              console.error(
                "Tất cả các cách lấy bình luận đều thất bại:",
                error.message || "Không có thông tin lỗi"
              );
            }
          }
        }
      };

      fetchComments();
    }
  }, [showComments, post.id, axiosPrivate]);

  // Hàm tải hình ảnh bài viết từ API
  const loadPostImages = async () => {
    try {
      if (loadingImages) return;

      setLoadingImages(true);
      console.log(`Đang tải hình ảnh cho bài viết ID ${post.id} từ API...`);

      // Sử dụng cache nếu có
      const cachedImages = queryClient.getQueryData(["postImages", post.id]);
      if (cachedImages && cachedImages.length > 0) {
        console.log(
          `Đã tìm thấy ${cachedImages.length} hình ảnh trong cache cho bài viết ID ${post.id}`
        );
        setPostImages(cachedImages);

        // Cập nhật trạng thái main image nếu cần
        const mainImageUrl = post.attachment_url || post.attachmentUrl;
        if (!mainImageUrl && cachedImages.length > 0) {
          const imageUrl = cachedImages[0].url || cachedImages[0].imageUrl;
          if (imageUrl) {
            post.attachment_url = imageUrl;
            post.attachmentUrl = imageUrl;
            post.attachment_type = "IMAGE";
            post.attachmentType = "IMAGE";
            console.log("Đã cập nhật URL hình ảnh chính từ cache:", imageUrl);
          }
        }

        return;
      }

      try {
        // Gọi API để lấy hình ảnh
        const images = await getPostImages(axiosPrivate, post.id);
        console.log(
          `Đã nhận ${images.length} hình ảnh từ API cho bài viết ID ${post.id}:`,
          images
        );

        if (images && images.length > 0) {
          // Lưu vào state và cache
          setPostImages(images);
          queryClient.setQueryData(["postImages", post.id], images);

          // Cập nhật URL hình ảnh cho bài viết nếu chưa có
          const mainImageUrl = post.attachment_url || post.attachmentUrl;
          if (!mainImageUrl) {
            const imageUrl = images[0].url || images[0].imageUrl;
            if (imageUrl) {
              post.attachment_url = imageUrl;
              post.attachmentUrl = imageUrl;
              post.attachment_type = "IMAGE";
              post.attachmentType = "IMAGE";
              console.log("Đã cập nhật URL hình ảnh chính từ API:", imageUrl);

              // Cưỡng chế render lại
              setLocalCommentCount((prev) => prev);
            }
          }
        } else {
          console.log(
            `Không tìm thấy hình ảnh từ API cho bài viết ID ${post.id}`
          );
        }
      } catch (apiError) {
        console.error("Lỗi khi tải hình ảnh từ API:", apiError);

        // Nếu có lỗi khi tải từ API, tạo mảng ảnh giả từ attachment_url nếu có
        if (post.attachment_url || post.attachmentUrl) {
          const mainImageUrl = post.attachment_url || post.attachmentUrl;
          const fakeImages = [
            {
              id: "main-image",
              url: mainImageUrl,
              imageUrl: mainImageUrl,
              postId: post.id,
            },
          ];

          setPostImages(fakeImages);
          queryClient.setQueryData(["postImages", post.id], fakeImages);
          console.log("Đã tạo mảng ảnh giả từ attachment_url:", fakeImages);
        }
      }
    } catch (error) {
      console.error("Lỗi chung khi tải hình ảnh bài viết:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Thêm hàm loại bỏ comments trùng lặp
  const removeDuplicateComments = (comments) => {
    if (!comments || !Array.isArray(comments)) return [];

    // Tạo Map để lưu trữ comments theo ID (ưu tiên ID thật, không phải ID tạm)
    const commentMap = new Map();

    // Sắp xếp comments để ID thật được ưu tiên trước ID tạm
    const sortedComments = [...comments].sort((a, b) => {
      const aIsTemp = a.id && a.id.toString().startsWith("temp-");
      const bIsTemp = b.id && b.id.toString().startsWith("temp-");
      return aIsTemp && !bIsTemp ? 1 : !aIsTemp && bIsTemp ? -1 : 0;
    });

    // Lọc các comments trùng lặp theo nội dung và người dùng
    const seenComments = new Set();

    for (const comment of sortedComments) {
      if (!comment) continue;

      // Nếu đã có ID thật, ưu tiên sử dụng ID thật
      if (comment.id && !comment.id.toString().startsWith("temp-")) {
        commentMap.set(comment.id, comment);
      } else {
        // Nếu là ID tạm, kiểm tra xem comment này đã có phiên bản ID thật chưa
        const contentUserKey = `${comment.content}-${comment.userId}`;
        if (!seenComments.has(contentUserKey)) {
          // Nếu chưa có, thêm vào map
          const tempId =
            comment.id ||
            `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          commentMap.set(tempId, comment);
          seenComments.add(contentUserKey);
        }
      }
    }

    // Chuyển map thành mảng và sắp xếp theo thời gian mới nhất
    return Array.from(commentMap.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // Reaction types với icon và màu sắc
  const reactionTypes = [
    {
      type: "LIKE",
      icon: <ThumbsUp size={16} />,
      label: "Thích",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      hoverColor: "hover:text-blue-600",
      hoverBgColor: "hover:bg-blue-100",
    },
    {
      type: "LOVE",
      icon: <Heart size={16} />,
      label: "Yêu thích",
      color: "text-red-600",
      bgColor: "bg-red-100",
      hoverColor: "hover:text-red-600",
      hoverBgColor: "hover:bg-red-100",
    },
    {
      type: "FUNNY",
      icon: <Smile size={16} />,
      label: "Hài hước",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      hoverColor: "hover:text-yellow-600",
      hoverBgColor: "hover:bg-yellow-100",
    },
    {
      type: "INSIGHTFUL",
      icon: <Lightbulb size={16} />,
      label: "Sâu sắc",
      color: "text-green-600",
      bgColor: "bg-green-100",
      hoverColor: "hover:text-green-600",
      hoverBgColor: "hover:bg-green-100",
    },
    {
      type: "SUPPORT",
      icon: <Award size={16} />,
      label: "Hỗ trợ",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      hoverColor: "hover:text-purple-600",
      hoverBgColor: "hover:bg-purple-100",
    },
    {
      type: "CELEBRATE",
      icon: <Trophy size={16} />,
      label: "Chúc mừng",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      hoverColor: "hover:text-orange-600",
      hoverBgColor: "hover:bg-orange-100",
    },
  ];

  // Hàm an toàn để format thời gian, tránh lỗi với giá trị không hợp lệ
  const safeFormatDate = (dateString) => {
    try {
      // Kiểm tra các giá trị không hợp lệ hoặc không xác định
      if (!dateString || dateString === "null" || dateString === "undefined") {
        return "Vừa xong";
      }

      // Kiểm tra format ngày hợp lệ
      let date;
      try {
        date = new Date(dateString);

        // Kiểm tra xem ngày có hợp lệ không
        if (isNaN(date.getTime())) {
          console.log("Ngày không hợp lệ:", dateString);
          return "Vừa xong";
        }
      } catch (parseError) {
        console.error("Lỗi khi parse ngày:", parseError);
        return "Vừa xong";
      }

      // Tính thời gian chênh lệch tính bằng giây
      const diffSeconds = Math.floor((new Date() - date) / 1000);

      // Hiển thị theo các khoảng thời gian khác nhau
      if (diffSeconds < 5) {
        return "Vừa xong";
      } else if (diffSeconds < 60) {
        return `${diffSeconds} giây trước`;
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        return `${minutes} phút trước`;
      } else if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600);
        return `${hours} giờ trước`;
      } else if (diffSeconds < 604800) {
        const days = Math.floor(diffSeconds / 86400);
        return `${days} ngày trước`;
      } else {
        // Với thời gian xa hơn 1 tuần, hiển thị ngày tháng năm cụ thể
        try {
          return format(date, "HH:mm dd/MM/yyyy", { locale: vi });
        } catch (formatError) {
          console.error("Lỗi khi format ngày:", formatError);
          return "Ngày không xác định";
        }
      }
    } catch (error) {
      console.error("Lỗi xử lý định dạng thời gian:", error, dateString);
      return "Vừa xong";
    }
  };

  // Check if current user is the post author
  const isAuthor = currentUser?.id === post.userId;

  // Handle submit comment
  const handleCommentFormSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Gọi hàm xử lý comment chung
    handleCommentProcess(commentText);

    // Xóa nội dung đã nhập
    setCommentText("");
  };

  // Hàm chung xử lý comment
  const handleCommentProcess = (content) => {
    if (!content.trim() || !onComment) return;

    // Luôn hiển thị phần comments sau khi thêm bình luận
    setShowComments(true);

    // Tạo comment tạm thời với dữ liệu đầy đủ và thời gian hợp lệ
    const tempComment = {
      id: `temp-${Date.now()}`, // ID tạm với prefix để dễ nhận diện
      content: content,
      userId: currentUser?.id,
      postId: post.id,
      userName:
        currentUser?.userName || currentUser?.username || currentUser?.name,
      userImageUrl: currentUser?.imageUrl,
      createdAt: new Date().toISOString(), // Đảm bảo thời gian hợp lệ
      likeCount: 0,
      replyCount: 0,
    };

    // Kiểm tra trùng lặp trong danh sách bình luận hiện tại
    const isDuplicate = localComments.some(
      (comment) =>
        comment.content === content &&
        comment.userId === currentUser?.id &&
        new Date() - new Date(comment.createdAt) < 2000
    );

    if (!isDuplicate) {
      console.log("Thêm bình luận mới vào danh sách:", tempComment);

      // Cập nhật UI local ngay lập tức
      setLocalComments((prev) => {
        // Thêm comment mới vào đầu danh sách
        const updatedComments = [tempComment, ...prev];
        // Lọc bỏ các comment trùng lặp
        return removeDuplicateComments(updatedComments);
      });

      // Cập nhật số lượng comment
      setLocalCommentCount((prev) => prev + 1);

      // Lưu trạng thái vào cache
      const commentsKey = ["comments", post.id];
      const existingComments = queryClient.getQueryData(commentsKey) || [];
      const updatedComments = [tempComment, ...existingComments];
      queryClient.setQueryData(
        commentsKey,
        removeDuplicateComments(updatedComments)
      );
    }

    // Gọi API add comment - chỉ gọi một lần
    onComment(post.id, content)
      .then((response) => {
        console.log("API response for new comment:", response);

        // Sau khi API trả về kết quả, cập nhật lại danh sách comments từ API
        const fetchLatestComments = async () => {
          try {
            const commentsData = await getComments(axiosPrivate, post.id);
            if (
              commentsData &&
              commentsData.content &&
              Array.isArray(commentsData.content)
            ) {
              const newComments = removeDuplicateComments(commentsData.content);
              console.log(
                `Đã nhận ${newComments.length} bình luận mới từ API cho bài viết ID ${post.id}`
              );

              setLocalComments(newComments);
              setLocalCommentCount(
                commentsData.totalElements || newComments.length
              );
            } else if (commentsData && Array.isArray(commentsData)) {
              const newComments = removeDuplicateComments(commentsData);
              console.log(
                `Đã nhận ${newComments.length} bình luận mới (dạng mảng) từ API cho bài viết ID ${post.id}`
              );

              setLocalComments(newComments);
              setLocalCommentCount(newComments.length);
            }
          } catch (error) {
            console.error("Lỗi khi tải lại comments mới nhất:", error);
          }
        };

        // Gọi hàm tải bình luận mới nhất sau khi thêm bình luận thành công
        fetchLatestComments();
      })
      .catch((error) => {
        console.error("Lỗi khi thêm bình luận:", error);
      });
  };

  // Get hashtags from content
  const extractHashtags = (content) => {
    const hashtagRegex =
      /#[a-zA-Z0-9_\u00C0-\u017Fàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]+/g;
    const matches = content.match(hashtagRegex);
    return matches || [];
  };

  const hashtags = extractHashtags(post.content);

  // Replace content with formatted content including hashtags
  const formatContentWithHashtags = (content) => {
    if (!content) return "";

    // Kiểm tra xem nội dung có chứa thẻ HTML không
    const containsHtml = /<[a-z][\s\S]*>/i.test(content);

    if (containsHtml) {
      // Nếu có HTML, sử dụng dangerouslySetInnerHTML để hiển thị nội dung đã định dạng
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Nếu không có HTML, xử lý hashtag như thông thường
    const parts = content.split(
      /(#[a-zA-Z0-9_\u00C0-\u017Fàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]+)/g
    );

    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={index}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Thêm hàm xử lý thích bình luận
  const handleLikeComment = (commentId) => {
    // Gọi API thích/bỏ thích bình luận ở đây
    // Trong ví dụ này, chỉ cập nhật UI locally
    setLikedComments({
      ...likedComments,
      [commentId]: !likedComments[commentId],
    });
  };

  // Thêm hàm xử lý phản hồi bình luận
  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Xử lý nội dung phản hồi
    const replyContent = `@${
      localComments.find((c) => c.id === commentId)?.userName || "Người dùng"
    } ${replyText}`;

    // Gọi hàm xử lý comment thông thường với nội dung phản hồi
    if (onComment) {
      // Tạo comment tạm thời cho phản hồi
      const tempReplyComment = {
        id: `temp-reply-${Date.now()}`,
        content: replyContent,
        userId: currentUser?.id,
        postId: post.id,
        userName:
          currentUser?.userName || currentUser?.username || currentUser?.name,
        userImageUrl: currentUser?.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        replyCount: 0,
        parentId: commentId, // Thêm parentId để đánh dấu đây là reply
      };

      console.log("Thêm phản hồi mới vào danh sách:", tempReplyComment);

      // Thêm phản hồi vào danh sách comments
      setLocalComments((prev) => {
        const updatedComments = [tempReplyComment, ...prev];
        return removeDuplicateComments(updatedComments);
      });

      // Cập nhật số lượng comment
      setLocalCommentCount((prev) => prev + 1);

      // Gọi API để gửi comment và cập nhật lại
      onComment(post.id, replyContent, commentId)
        .then((response) => {
          console.log("API response for new reply:", response);

          // Sau khi API trả về kết quả, cập nhật lại danh sách comments từ API
          const fetchLatestComments = async () => {
            try {
              const commentsData = await getComments(axiosPrivate, post.id);
              if (
                commentsData &&
                commentsData.content &&
                Array.isArray(commentsData.content)
              ) {
                const newComments = removeDuplicateComments(
                  commentsData.content
                );
                console.log(
                  `Đã nhận ${newComments.length} bình luận mới từ API sau khi trả lời`
                );

                setLocalComments(newComments);
                setLocalCommentCount(
                  commentsData.totalElements || newComments.length
                );
              } else if (commentsData && Array.isArray(commentsData)) {
                const newComments = removeDuplicateComments(commentsData);
                console.log(
                  `Đã nhận ${newComments.length} bình luận mới (dạng mảng) từ API sau khi trả lời`
                );

                setLocalComments(newComments);
                setLocalCommentCount(newComments.length);
              }
            } catch (error) {
              console.error("Lỗi khi tải lại comments sau khi trả lời:", error);
            }
          };

          // Gọi hàm tải bình luận mới nhất sau khi thêm phản hồi thành công
          fetchLatestComments();
        })
        .catch((error) => {
          console.error("Lỗi khi thêm phản hồi:", error);
        });
    }

    // Reset trạng thái
    setReplyText("");
    setReplyingTo(null);
  };

  // Thêm error boundary bằng try/catch tại mỗi phần hiển thị có thể gây lỗi
  const renderSafely = (renderFunction) => {
    try {
      return renderFunction();
    } catch (error) {
      console.error("Error rendering component:", error);
      return null;
    }
  };

  // Xử lý khi người dùng nhấn nút thích/phản ứng
  const handleReactionClick = (reactionType) => {
    if (onReact) {
      // Cập nhật UI ngay lập tức (optimistic update)
      const oldReaction = localUserReaction;
      const newReaction = oldReaction === reactionType ? null : reactionType;

      // Cập nhật trạng thái local
      setLocalUserReaction(newReaction);

      // Cập nhật số lượng phản ứng local
      const newReactionCounts = { ...localReactionCounts };

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

      setLocalReactionCounts(newReactionCounts);

      // Lưu trạng thái vào cache
      queryClient.setQueryData(["reactions", "post", post.id], {
        type: newReaction,
        timestamp: new Date().toISOString(),
        userId: currentUser?.id, // Luôn đính kèm userId
      });

      // Lưu vào localStorage trực tiếp
      try {
        // Lưu reaction
        if (newReaction) {
          localStorage.setItem(
            `reaction-post-${post.id}`,
            JSON.stringify({
              type: newReaction,
              postId: post.id,
              userId: currentUser?.id,
              timestamp: new Date().toISOString(),
            })
          );
        } else {
          // Xóa reaction nếu người dùng bỏ phản ứng
          localStorage.removeItem(`reaction-post-${post.id}`);
        }

        // Cập nhật reactionCounts trong localStorage
        localStorage.setItem(
          `reactionCounts-${post.id}`,
          JSON.stringify(newReactionCounts)
        );

        // Cập nhật trong forumPosts nếu có
        const forumPostsJSON = localStorage.getItem("forumPosts");
        if (forumPostsJSON) {
          try {
            const forumPosts = JSON.parse(forumPostsJSON);
            if (
              forumPosts &&
              forumPosts.content &&
              Array.isArray(forumPosts.content)
            ) {
              const updatedContent = forumPosts.content.map((p) => {
                if (p.id === post.id) {
                  return {
                    ...p,
                    userReaction: newReaction,
                    reactionCounts: newReactionCounts,
                    userReactionUserId: currentUser?.id, // Thêm userId vào thông tin reaction
                  };
                }
                return p;
              });

              localStorage.setItem(
                "forumPosts",
                JSON.stringify({
                  ...forumPosts,
                  content: updatedContent,
                })
              );
            }
          } catch (e) {
            console.error("Lỗi khi cập nhật forumPosts trong localStorage:", e);
          }
        }
      } catch (e) {
        console.error("Lỗi khi lưu reaction vào localStorage:", e);
      }

      // Gọi hàm xử lý phản ứng từ component cha
      onReact(post.id, reactionType);
    }
  };

  // Handle post options
  const handlePostAction = (action) => {
    if (action === "edit" && isAuthor) {
      onEdit(post);
    } else if (action === "delete" && isAuthor) {
      onDelete(post.id);
    }
  };

  // Kiểm tra URL ảnh trước khi hiển thị
  const getImageUrl = (post) => {
    let url = post.attachment_url || post.attachmentUrl;

    if (
      !url &&
      post.images &&
      Array.isArray(post.images) &&
      post.images.length > 0
    ) {
      // Thử lấy URL từ mảng images
      url = post.images[0].url || post.images[0].imageUrl;
      if (url) {
        // Cập nhật post gốc để lần sau không cần tìm lại
        post.attachment_url = url;
        post.attachmentUrl = url;
        post.attachment_type = "IMAGE";
        post.attachmentType = "IMAGE";
      }
    }

    // Debug URL ảnh
    if (url) {
      console.log(`✅ Bài viết ID ${post.id} có hình ảnh: ${url}`);
    } else {
      console.log(`❌ Bài viết ID ${post.id} không có URL hình ảnh`);

      // Kiểm tra các thuộc tính liên quan đến hình ảnh
      console.log("Thông tin bài viết:", {
        attachment_url: post.attachment_url,
        attachmentUrl: post.attachmentUrl,
        attachment_type: post.attachment_type,
        attachmentType: post.attachmentType,
        hasImages: post.images && post.images.length > 0,
      });
    }

    return url;
  };

  // Lấy tất cả các hình ảnh của bài đăng
  const getAllPostImages = () => {
    // Nếu đã có mảng postImages từ API, sử dụng nó
    if (postImages && postImages.length > 0) {
      return postImages;
    }

    // Nếu bài đăng có mảng images, sử dụng nó
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images;
    }

    // Nếu bài đăng chỉ có một ảnh từ attachment_url/attachmentUrl
    const mainImageUrl = getImageUrl(post);
    if (mainImageUrl) {
      // Tạo một mảng chỉ có một hình ảnh
      return [
        {
          id: "main-image",
          url: mainImageUrl,
          imageUrl: mainImageUrl,
          postId: post.id,
        },
      ];
    }

    // Không có hình ảnh nào
    return [];
  };

  // Sửa hàm xử lý khi người dùng bấm vào nút bình luận
  const handleShowCommentsClick = () => {
    console.log("Đang mở dialog bình luận cho bài viết ID:", post.id);
    setCommentDialogOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
        {/* Post Header */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage
                  src={post.userImageUrl || "/placeholder-user.jpg"}
                />
                <AvatarFallback>
                  {post.userName?.charAt(0) ||
                    post.username?.charAt(0) ||
                    post.name?.charAt(0) ||
                    post.user?.userName?.charAt(0) ||
                    post.user?.name?.charAt(0) ||
                    post.user?.fullName?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  <Link
                    to={`/profile/${post.userId}`}
                    className="hover:underline"
                  >
                    {console.log("DEBUG - Thông tin người dùng:", {
                      userName: post.userName,
                      username: post.username,
                      name: post.name,
                      user: post.user,
                    })}
                    {post.userName ||
                      post.username ||
                      post.name ||
                      post.user?.userName ||
                      post.user?.name ||
                      post.user?.fullName ||
                      "Người dùng"}
                  </Link>
                  {post.userRole && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs font-normal"
                    >
                      {post.userRole}
                    </Badge>
                  )}
                  {post.feeling && (
                    <span className="font-normal text-gray-600 ml-1">
                      đang cảm thấy {post.feeling}
                    </span>
                  )}
                </h3>
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <span title={formatTitleDate(post.createdAt)}>
                    {safeFormatDate(post.createdAt)}
                  </span>
                  <span className="mx-1">•</span>
                  <Globe size={12} title="Công khai" />
                  {post.location && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {post.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthor && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handlePostAction("edit")}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Clock size={16} className="text-gray-500" />
                      Chỉnh sửa bài viết
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handlePostAction("delete")}
                      className="text-red-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Flag size={16} className="text-red-500" />
                      Xóa bài viết
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Bookmark size={16} className="text-gray-500" />
                  Lưu bài viết
                </DropdownMenuItem>
                {!isAuthor && (
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Flag size={16} className="text-gray-500" />
                    Báo cáo bài viết
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Content */}
          <div className="mt-3 text-gray-800">
            <div className="whitespace-pre-line">
              {formatContentWithHashtags(post.content)}
            </div>

            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Post attachment */}
            {(post.attachment_type !== "NONE" ||
              post.attachmentType !== "NONE" ||
              (post.images && post.images.length > 0) ||
              postImages.length > 0) &&
              getImageUrl(post) && (
                <div className="mt-3">
                  {/* Hiển thị hình ảnh kiểu album giống Facebook */}
                  {(post.attachment_type === "IMAGE" ||
                    post.attachmentType === "IMAGE" ||
                    postImages.length > 0) && (
                    <div className="image-gallery max-h-[400px] overflow-hidden">
                      {(() => {
                        const allImages = getAllPostImages();

                        if (allImages.length <= 1) {
                          // Hiển thị một ảnh duy nhất
                          return (
                            <div className="relative w-full overflow-hidden rounded-lg">
                              <img
                                src={getImageUrl(post)}
                                alt="Hình ảnh đính kèm"
                                className="w-full object-cover max-h-[350px] rounded-lg mx-auto hover:opacity-95 transition-opacity cursor-pointer"
                                onError={(e) => {
                                  console.error(
                                    "Lỗi khi tải hình ảnh:",
                                    e.target.src
                                  );
                                  e.target.onerror = null;
                                  e.target.src = "/img/placeholder-image.jpg";
                                  e.target.className =
                                    "w-full object-cover rounded-lg mx-auto opacity-50";
                                }}
                                onClick={() => {
                                  window.open(getImageUrl(post), "_blank");
                                }}
                              />
                              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                            </div>
                          );
                        } else if (allImages.length === 2) {
                          // Hiển thị 2 ảnh cạnh nhau
                          return (
                            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-[300px]">
                              {allImages.map((img, index) => (
                                <div
                                  key={index}
                                  className="relative overflow-hidden h-[300px]"
                                >
                                  <img
                                    src={img.url || img.imageUrl}
                                    alt={`Hình ảnh ${index + 1}`}
                                    className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                    onClick={() =>
                                      window.open(
                                        img.url || img.imageUrl,
                                        "_blank"
                                      )
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                                </div>
                              ))}
                            </div>
                          );
                        } else if (allImages.length === 3) {
                          // Hiển thị 3 ảnh với layout đặc biệt
                          return (
                            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-[300px]">
                              <div className="relative overflow-hidden h-[300px]">
                                <img
                                  src={
                                    allImages[0].url || allImages[0].imageUrl
                                  }
                                  alt="Hình ảnh 1"
                                  className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                  onClick={() =>
                                    window.open(
                                      allImages[0].url || allImages[0].imageUrl,
                                      "_blank"
                                    )
                                  }
                                />
                                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                              </div>
                              <div className="grid grid-rows-2 gap-1">
                                {allImages.slice(1, 3).map((img, index) => (
                                  <div
                                    key={index}
                                    className="relative overflow-hidden h-[148px]"
                                  >
                                    <img
                                      src={img.url || img.imageUrl}
                                      alt={`Hình ảnh ${index + 2}`}
                                      className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                      onClick={() =>
                                        window.open(
                                          img.url || img.imageUrl,
                                          "_blank"
                                        )
                                      }
                                    />
                                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } else if (allImages.length === 4) {
                          // Hiển thị 4 ảnh trong lưới 2x2
                          return (
                            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-[300px]">
                              {allImages.map((img, index) => (
                                <div
                                  key={index}
                                  className="relative overflow-hidden h-[148px]"
                                >
                                  <img
                                    src={img.url || img.imageUrl}
                                    alt={`Hình ảnh ${index + 1}`}
                                    className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                    onClick={() =>
                                      window.open(
                                        img.url || img.imageUrl,
                                        "_blank"
                                      )
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          // Hiển thị 5+ ảnh (4 ảnh đầu tiên + hiển thị có thêm ảnh)
                          return (
                            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-[300px]">
                              {allImages.slice(0, 4).map((img, index) => (
                                <div
                                  key={index}
                                  className="relative overflow-hidden h-[148px]"
                                >
                                  <img
                                    src={img.url || img.imageUrl}
                                    alt={`Hình ảnh ${index + 1}`}
                                    className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                    onClick={() =>
                                      window.open(
                                        img.url || img.imageUrl,
                                        "_blank"
                                      )
                                    }
                                  />
                                  {index === 3 && allImages.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                      <span className="text-white text-2xl font-bold">
                                        +{allImages.length - 4}
                                      </span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {(post.attachment_type === "VIDEO" ||
                    post.attachmentType === "VIDEO") && (
                    <video
                      src={getImageUrl(post)}
                      controls
                      className="w-full rounded-lg max-h-[350px] object-contain mx-auto"
                      onError={(e) => {
                        console.error("Lỗi khi tải video:", e.target.src);
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    ></video>
                  )}

                  {(post.attachment_type === "DOCUMENT" ||
                    post.attachmentType === "DOCUMENT") && (
                    <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                      <span className="text-blue-600">Tài liệu đính kèm</span>
                      <a
                        href={getImageUrl(post)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Tải xuống
                      </a>
                    </div>
                  )}

                  {(post.attachment_type === "LINK" ||
                    post.attachmentType === "LINK") && (
                    <a
                      href={getImageUrl(post)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {getImageUrl(post)}
                    </a>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Reaction counts */}
        {renderSafely(
          () =>
            ((localReactionCounts &&
              Object.values(localReactionCounts).some((count) => count > 0)) ||
              localCommentCount > 0 ||
              post.shareCount > 0) && (
              <div className="px-4 py-2 border-t">
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {localReactionCounts &&
                      Object.values(localReactionCounts).some(
                        (count) => count > 0
                      ) && (
                        <div className="flex items-center">
                          {/* Hiển thị các biểu tượng phản ứng có trong bài viết */}
                          <div className="flex -space-x-1 group">
                            {Object.entries(localReactionCounts)
                              .filter(([, count]) => count > 0)
                              .sort((a, b) => b[1] - a[1]) // Sắp xếp theo số lượng giảm dần
                              .slice(0, 3) // Chỉ lấy tối đa 3 loại phản ứng phổ biến nhất
                              .map(([reactionType]) => {
                                try {
                                  const reaction = reactionTypes.find(
                                    (r) => r.type === reactionType
                                  );
                                  if (!reaction) return null;
                                  return (
                                    <div
                                      key={reactionType}
                                      className={`${reaction.bgColor} ${
                                        reaction.color
                                      } rounded-full p-1 h-5 w-5 flex items-center justify-center border border-white ${
                                        localUserReaction === reactionType
                                          ? "ring-2 ring-blue-300"
                                          : ""
                                      } transition-transform group-hover:scale-110 hover:z-10`}
                                      title={`${reaction.label} (${localReactionCounts[reactionType]})`}
                                    >
                                      {reaction.icon}
                                    </div>
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error rendering reaction icon:",
                                    error,
                                    reactionType
                                  );
                                  return null;
                                }
                              })}
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <span className="ml-2 cursor-pointer hover:underline">
                                {Object.values(localReactionCounts).reduce(
                                  (sum, count) => sum + count,
                                  0
                                )}
                              </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3 rounded-lg shadow-lg border-0">
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Tất cả phản ứng
                                </p>
                                <div className="space-y-1.5">
                                  {Object.entries(localReactionCounts)
                                    .filter(([, count]) => count > 0)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([type, count]) => {
                                      const reaction = reactionTypes.find(
                                        (r) => r.type === type
                                      );
                                      if (!reaction) return null;
                                      return (
                                        <div
                                          key={type}
                                          className="flex items-center gap-2"
                                        >
                                          <div
                                            className={`${reaction.bgColor} ${reaction.color} rounded-full p-1 h-6 w-6 flex items-center justify-center`}
                                          >
                                            {reaction.icon}
                                          </div>
                                          <span className="text-sm">
                                            {reaction.label} ({count})
                                          </span>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                  </div>
                  <div className="flex gap-3">
                    {localCommentCount > 0 && (
                      <button
                        className="hover:underline"
                        onClick={handleShowCommentsClick}
                      >
                        {localCommentCount} bình luận
                      </button>
                    )}
                    {post.shareCount > 0 && (
                      <span>{post.shareCount} chia sẻ</span>
                    )}
                  </div>
                </div>
              </div>
            )
        )}

        {/* Action buttons */}
        <div className="px-4 py-1 border-t">
          <div className="flex justify-around">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex-1 text-gray-600 gap-2 rounded-none py-2 hover:bg-gray-100 ${
                    localUserReaction ? "bg-gray-50" : ""
                  }`}
                  onClick={() => {
                    // Xử lý khi bấm vào nút thích chính
                    if (localUserReaction) {
                      // Nếu đã có reaction, bỏ reaction
                      handleReactionClick(localUserReaction);
                    } else {
                      // Nếu chưa có reaction, thêm reaction mặc định LIKE
                      handleReactionClick("LIKE");
                    }
                  }}
                >
                  {renderSafely(() =>
                    localUserReaction ? (
                      // Nếu đã có phản ứng, hiển thị icon tương ứng
                      (() => {
                        const currentReaction = reactionTypes.find(
                          (r) => r.type === localUserReaction
                        );
                        const reactionColor =
                          currentReaction?.color || "text-blue-600";

                        return (
                          <>
                            <span className={reactionColor}>
                              {currentReaction?.icon || (
                                <ThumbsUp size={18} className="fill-blue-600" />
                              )}
                            </span>
                            <span className={`${reactionColor} font-medium`}>
                              {currentReaction?.label || "Thích"}
                            </span>
                          </>
                        );
                      })()
                    ) : (
                      // Nếu chưa có phản ứng, hiển thị icon mặc định
                      <>
                        <ThumbsUp size={18} />
                        <span>Thích</span>
                      </>
                    )
                  )}
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex p-1 rounded-lg shadow-lg border-0 w-auto min-w-0">
                <div className="flex gap-1">
                  {reactionTypes.map((reaction) =>
                    renderSafely(() => {
                      // Tạo className dựa trên trạng thái
                      const isActive = localUserReaction === reaction.type;
                      const buttonClass = `rounded-full p-2 h-auto w-auto transition-all duration-200 transform hover:scale-110 ${reaction.hoverBgColor} ${reaction.hoverColor}`;
                      const activeClass = isActive
                        ? `${reaction.bgColor} ${reaction.color}`
                        : "";

                      return (
                        <Button
                          key={reaction.type}
                          variant="ghost"
                          size="sm"
                          className={`${buttonClass} ${activeClass} reaction-${post.id}-${reaction.type}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log(
                              "Đang bấm nút phản ứng:",
                              reaction.type
                            );
                            console.log("ID bài viết:", post.id);
                            console.log(
                              "Phản ứng hiện tại:",
                              localUserReaction
                            );

                            // Gọi hàm handleReactionClick để xử lý phản ứng
                            handleReactionClick(reaction.type);
                          }}
                          title={reaction.label}
                        >
                          {reaction.icon}
                        </Button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              className="flex-1 text-gray-600 gap-2 rounded-none py-2 hover:bg-gray-100 hover:text-green-600"
              onClick={handleShowCommentsClick}
            >
              <MessageSquare size={18} />
              Bình luận
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-gray-600 gap-2 rounded-none py-2 hover:bg-gray-100 hover:text-amber-600"
              onClick={() => onShare(post.id)}
            >
              <Share size={18} />
              Chia sẻ
            </Button>
          </div>
        </div>

        {/* Comments section */}
        <div className={`border-t ${showComments ? "block" : "hidden"}`}>
          <div className="p-4 bg-gray-50">
            {/* Hiển thị loading state khi đang tải */}
            {showComments && localComments.length === 0 && (
              <div className="flex justify-center py-4">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-2 w-24 bg-gray-300 rounded"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    Đang tải bình luận...
                  </p>
                </div>
              </div>
            )}

            {/* Hiển thị bình luận khi đã tải xong */}
            {showComments && localComments && localComments.length > 0 && (
              <div className="space-y-3 mb-4">
                {/* Xử lý nhóm comments thành cha-con */}
                {(() => {
                  // Tìm các comment gốc (không có parentId)
                  const parentComments = localComments
                    .filter((comment) => !comment.parentId)
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    ); // Sắp xếp theo thời gian mới nhất

                  // Tìm các comment con (có parentId)
                  const childComments = localComments.filter(
                    (comment) => comment.parentId
                  );

                  // Nhóm các comment con theo parentId
                  const commentGroups = {};
                  childComments.forEach((comment) => {
                    if (!commentGroups[comment.parentId]) {
                      commentGroups[comment.parentId] = [];
                    }
                    commentGroups[comment.parentId].push(comment);
                  });

                  // Sắp xếp các comment con theo thời gian mới nhất trong mỗi nhóm
                  Object.keys(commentGroups).forEach((parentId) => {
                    commentGroups[parentId].sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );
                  });

                  if (parentComments.length === 0) {
                    return (
                      <div className="text-center text-gray-500 py-2 text-sm">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                      </div>
                    );
                  }

                  // Hiển thị các comment gốc và comment con của nó
                  return parentComments.map((comment) => {
                    // Lấy danh sách các comment con của comment hiện tại
                    const children = commentGroups[comment.id] || [];

                    return (
                      <div key={comment.id} className="comment-group">
                        {/* Comment cha */}
                        <div className="flex gap-2 comment-parent">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                comment.userImageUrl || "/placeholder-user.jpg"
                              }
                            />
                            <AvatarFallback>
                              {comment.userName?.charAt(0) ||
                                comment.username?.charAt(0) ||
                                comment.name?.charAt(0) ||
                                comment.user?.userName?.charAt(0) ||
                                comment.user?.fullName?.charAt(0) ||
                                comment.user?.name?.charAt(0) ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                              <p className="font-semibold text-sm">
                                {comment.userName ||
                                  comment.username ||
                                  comment.name ||
                                  comment.user?.userName ||
                                  comment.user?.name ||
                                  comment.user?.fullName ||
                                  "Người dùng"}
                              </p>
                              <p className="text-sm whitespace-pre-line">
                                {comment.content &&
                                comment.content.startsWith("@") ? (
                                  <>
                                    <span className="font-medium text-blue-600">
                                      {comment.content.split(" ")[0]}
                                    </span>{" "}
                                    {comment.content.substring(
                                      comment.content.indexOf(" ") + 1
                                    )}
                                  </>
                                ) : (
                                  comment.content || "Không có nội dung"
                                )}
                              </p>
                            </div>
                            <div className="flex gap-3 ml-2 mt-1 text-xs text-gray-600">
                              <button
                                className={`${
                                  likedComments[comment.id]
                                    ? "text-blue-600 font-medium"
                                    : "hover:text-blue-600"
                                }`}
                                onClick={() => handleLikeComment(comment.id)}
                              >
                                {likedComments[comment.id]
                                  ? "Đã thích"
                                  : "Thích"}
                              </button>
                              <button
                                className="hover:text-blue-600"
                                onClick={() =>
                                  setReplyingTo(
                                    replyingTo === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                              >
                                Phản hồi
                              </button>
                              <span title={formatTitleDate(comment.createdAt)}>
                                {safeFormatDate(comment.createdAt)}
                              </span>
                            </div>

                            {/* Reply form cho comment cha */}
                            {replyingTo === comment.id && (
                              <div className="flex gap-2 items-end mt-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={
                                      currentUser?.imageUrl ||
                                      "/placeholder-user.jpg"
                                    }
                                  />
                                  <AvatarFallback>
                                    {currentUser?.userName?.charAt(0) ||
                                      currentUser?.username?.charAt(0) ||
                                      currentUser?.name?.charAt(0) ||
                                      "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 relative">
                                  <Textarea
                                    value={replyText}
                                    onChange={(e) =>
                                      setReplyText(e.target.value)
                                    }
                                    placeholder={`Phản hồi ${
                                      comment.userName ||
                                      comment.username ||
                                      comment.name ||
                                      comment.user?.userName ||
                                      comment.user?.name ||
                                      comment.user?.fullName ||
                                      "Người dùng"
                                    }...`}
                                    className="min-h-0 pl-3 pr-12 py-2 rounded-full resize-none overflow-hidden text-sm bg-white"
                                    rows={1}
                                  />
                                  <Button
                                    type="button"
                                    disabled={!replyText.trim()}
                                    className={`absolute right-3 bottom-2 h-auto p-0 m-0 bg-transparent hover:bg-transparent ${
                                      replyText.trim()
                                        ? "text-blue-500 hover:text-blue-600"
                                        : "text-gray-400"
                                    }`}
                                    onClick={(e) =>
                                      handleReplySubmit(e, comment.id)
                                    }
                                  >
                                    <Send size={14} />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Comment con - hiển thị lùi vào bên phải */}
                        {children.length > 0 && (
                          <div className="pl-10 mt-2 space-y-2">
                            {children.map((childComment) => (
                              <div key={childComment.id} className="flex gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={
                                      childComment.userImageUrl ||
                                      "/placeholder-user.jpg"
                                    }
                                  />
                                  <AvatarFallback>
                                    {childComment.userName?.charAt(0) ||
                                      childComment.username?.charAt(0) ||
                                      childComment.name?.charAt(0) ||
                                      childComment.user?.userName?.charAt(0) ||
                                      childComment.user?.name?.charAt(0) ||
                                      childComment.user?.fullName?.charAt(0) ||
                                      "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                                    <p className="font-semibold text-sm">
                                      {childComment.userName ||
                                        childComment.username ||
                                        childComment.name ||
                                        childComment.user?.userName ||
                                        childComment.user?.name ||
                                        childComment.user?.fullName ||
                                        "Người dùng"}
                                    </p>
                                    <p className="text-sm whitespace-pre-line">
                                      {childComment.content &&
                                      childComment.content.startsWith("@") ? (
                                        <>
                                          <span className="font-medium text-blue-600">
                                            {childComment.content.split(" ")[0]}
                                          </span>{" "}
                                          {childComment.content.substring(
                                            childComment.content.indexOf(" ") +
                                              1
                                          )}
                                        </>
                                      ) : (
                                        childComment.content ||
                                        "Không có nội dung"
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex gap-3 ml-2 mt-1 text-xs text-gray-600">
                                    <button
                                      className={`${
                                        likedComments[childComment.id]
                                          ? "text-blue-600 font-medium"
                                          : "hover:text-blue-600"
                                      }`}
                                      onClick={() =>
                                        handleLikeComment(childComment.id)
                                      }
                                    >
                                      {likedComments[childComment.id]
                                        ? "Đã thích"
                                        : "Thích"}
                                    </button>
                                    <button
                                      className="hover:text-blue-600"
                                      onClick={() =>
                                        setReplyingTo(
                                          replyingTo === childComment.id
                                            ? null
                                            : comment.id
                                        )
                                      }
                                    >
                                      Phản hồi
                                    </button>
                                    <span
                                      title={formatTitleDate(
                                        childComment.createdAt
                                      )}
                                    >
                                      {safeFormatDate(childComment.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Hiển thị thông báo không có bình luận */}
            {showComments &&
              localComments &&
              localComments.length === 0 &&
              !post.commentCount && (
                <div className="text-center text-gray-500 py-2 text-sm">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
              )}

            {/* Form thêm bình luận */}
            {showComments && (
              <form
                onSubmit={handleCommentFormSubmit}
                className="flex gap-2 items-end mt-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser?.imageUrl || "/placeholder-user.jpg"}
                  />
                  <AvatarFallback>
                    {currentUser?.userName?.charAt(0) ||
                      currentUser?.username?.charAt(0) ||
                      currentUser?.name?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="min-h-0 pl-3 pr-12 py-2 rounded-full resize-none overflow-hidden text-sm bg-white"
                    rows={1}
                  />
                  <div className="absolute right-3 bottom-2 flex gap-2">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-yellow-500"
                    >
                      <Smile size={16} />
                    </button>
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className={`text-gray-400 ${
                        commentText.trim()
                          ? "text-blue-500 hover:text-blue-600"
                          : ""
                      }`}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Comment Dialog */}
      <CommentDialog
        post={post}
        currentUser={currentUser}
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        onComment={onComment}
        onShare={onShare}
        onReact={onReact}
      />
    </>
  );
};

// Sửa lại export để optimized re-render
export default React.memo(PostCard, (prevProps, nextProps) => {
  // So sánh chính xác các props quan trọng
  // Chỉ re-render khi các props quan trọng thay đổi
  try {
    const prevReactions = JSON.stringify(prevProps.post?.reactionCounts || {});
    const nextReactions = JSON.stringify(nextProps.post?.reactionCounts || {});

    const prevComments = prevProps.post?.comments?.length || 0;
    const nextComments = nextProps.post?.comments?.length || 0;

    const prevCommentCount = prevProps.post?.commentCount || 0;
    const nextCommentCount = nextProps.post?.commentCount || 0;

    return (
      prevProps.post?.id === nextProps.post?.id &&
      prevProps.post?.userReaction === nextProps.post?.userReaction &&
      prevReactions === nextReactions &&
      prevCommentCount === nextCommentCount &&
      prevComments === nextComments
    );
  } catch (error) {
    console.error("Error in PostCard memo comparison:", error);
    // Nếu có lỗi, cứ re-render cho an toàn
    return false;
  }
});
