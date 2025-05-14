import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThumbsUp, MessageSquare, Share, Send, Smile, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getComments } from "@/services/forumService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";

const CommentDialog = ({
  post,
  currentUser,
  isOpen,
  onClose,
  onComment,
  onShare,
  onReact,
}) => {
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [comments, setComments] = useState([]);
  const [likedComments, setLikedComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Tải bình luận khi dialog mở
  useEffect(() => {
    if (isOpen && post?.id) {
      setIsLoading(true);
      fetchComments();
    }
  }, [isOpen, post?.id]);

  // Hàm tải bình luận từ API
  const fetchComments = async () => {
    try {
      console.log(`Đang tải bình luận cho bài viết ID ${post.id} từ API...`);
      const commentsData = await getComments(axiosPrivate, post.id);

      if (
        commentsData &&
        commentsData.content &&
        Array.isArray(commentsData.content)
      ) {
        const newComments = removeDuplicateComments(commentsData.content);
        console.log(`Đã nhận ${newComments.length} bình luận từ API`);
        setComments(newComments);
      } else if (commentsData && Array.isArray(commentsData)) {
        const newComments = removeDuplicateComments(commentsData);
        console.log(
          `Đã nhận ${newComments.length} bình luận (dạng mảng) từ API`
        );
        setComments(newComments);
      } else {
        console.log("API trả về dữ liệu không đúng định dạng:", commentsData);
        setComments([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm loại bỏ comments trùng lặp
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

  // Xử lý khi gửi bình luận
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Kiểm tra đăng nhập trước khi thêm bình luận
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để bình luận");
      navigate("/account/login", { state: { from: { pathname: "/home" } } });
      return;
    }

    // Tạo comment tạm thời
    const tempComment = {
      id: `temp-${Date.now()}`,
      content: commentText,
      userId: currentUser?.id,
      postId: post.id,
      userName:
        currentUser?.userName || currentUser?.username || currentUser?.name,
      userImageUrl: currentUser?.imageUrl,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      replyCount: 0,
    };

    // Cập nhật UI ngay lập tức
    setComments((prev) => {
      const updatedComments = [tempComment, ...prev];
      return removeDuplicateComments(updatedComments);
    });

    // Gọi API để tạo bình luận
    onComment(post.id, commentText).then(() => {
      // Tải lại bình luận sau khi API trả về kết quả
      fetchComments();
    });

    // Reset form
    setCommentText("");
  };

  // Xử lý khi gửi phản hồi
  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Kiểm tra đăng nhập trước khi thêm phản hồi
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để phản hồi bình luận");
      navigate("/account/login", { state: { from: { pathname: "/home" } } });
      return;
    }

    const parentComment = comments.find((c) => c.id === commentId);
    const replyContent = `@${
      parentComment?.userName || "Người dùng"
    } ${replyText}`;

    // Tạo phản hồi tạm thời
    const tempReply = {
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
      parentId: commentId,
    };

    // Cập nhật UI ngay lập tức
    setComments((prev) => {
      const updatedComments = [tempReply, ...prev];
      return removeDuplicateComments(updatedComments);
    });

    // Gọi API để tạo phản hồi
    onComment(post.id, replyContent, commentId).then(() => {
      // Tải lại bình luận sau khi API trả về kết quả
      fetchComments();
    });

    // Reset form
    setReplyText("");
    setReplyingTo(null);
  };

  // Xử lý thích bình luận
  const handleLikeComment = (commentId) => {
    setLikedComments({
      ...likedComments,
      [commentId]: !likedComments[commentId],
    });
  };

  // Format thời gian an toàn
  const formatTimeAgo = (dateString) => {
    try {
      if (!dateString) return "Vừa xong";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Vừa xong";
      }

      const diffSeconds = Math.floor((new Date() - date) / 1000);

      if (diffSeconds < 60) {
        return "Vừa xong";
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
        return format(date, "dd/MM/yyyy", { locale: vi });
      }
    } catch (error) {
      console.error("Lỗi format thời gian:", error);
      return "Vừa xong";
    }
  };

  // Render danh sách bình luận
  const renderComments = () => {
    // Tìm các comment gốc (không có parentId)
    const parentComments = comments.filter((comment) => !comment.parentId);

    // Tìm các comment con (có parentId)
    const childComments = comments.filter((comment) => comment.parentId);

    // Nhóm các comment con theo parentId
    const commentGroups = {};
    childComments.forEach((comment) => {
      if (!commentGroups[comment.parentId]) {
        commentGroups[comment.parentId] = [];
      }
      commentGroups[comment.parentId].push(comment);
    });

    // Sắp xếp các comment con theo thời gian
    Object.keys(commentGroups).forEach((parentId) => {
      commentGroups[parentId].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    if (parentComments.length === 0 && !isLoading) {
      return (
        <div className="text-center text-gray-500 py-6">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      );
    }

    return parentComments.map((comment) => {
      const children = commentGroups[comment.id] || [];

      return (
        <div key={comment.id} className="mb-4">
          {/* Comment chính */}
          <div className="flex gap-2">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage
                src={comment.userImageUrl || "/placeholder-user.jpg"}
              />
              <AvatarFallback>
                {comment.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="font-medium text-sm">
                  {comment.userName || "Người dùng"}
                </div>
                <div className="text-sm">
                  {comment.content && comment.content.startsWith("@") ? (
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
                </div>
              </div>

              <div className="flex gap-4 ml-2 mt-1 text-xs text-gray-600">
                <button
                  className={`${
                    likedComments[comment.id] ? "text-blue-600 font-medium" : ""
                  }`}
                  onClick={() => handleLikeComment(comment.id)}
                >
                  {likedComments[comment.id] ? "Đã thích" : "Thích"}
                </button>
                <button
                  className="hover:underline"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  Phản hồi
                </button>
                <span>{formatTimeAgo(comment.createdAt)}</span>
              </div>

              {/* Form trả lời */}
              {replyingTo === comment.id && (
                <div className="flex gap-2 mt-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={currentUser?.imageUrl || "/placeholder-user.jpg"}
                    />
                    <AvatarFallback>
                      {currentUser?.userName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 relative">
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Phản hồi ${
                          comment.userName || "người dùng"
                        }...`}
                        className="min-h-0 pr-12 py-2 rounded-full resize-none bg-gray-100 text-sm"
                        rows={1}
                      />
                      <Button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="absolute right-2 bottom-1 p-1 h-auto bg-transparent hover:bg-transparent text-blue-500"
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* Replies */}
              {children.length > 0 && (
                <div className="pl-2 mt-2 space-y-2">
                  {children.map((childComment) => (
                    <div key={childComment.id} className="flex gap-2">
                      <Avatar className="h-7 w-7 mt-1">
                        <AvatarImage
                          src={
                            childComment.userImageUrl || "/placeholder-user.jpg"
                          }
                        />
                        <AvatarFallback>
                          {childComment.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <div className="font-medium text-sm">
                            {childComment.userName || "Người dùng"}
                          </div>
                          <div className="text-sm">
                            {childComment.content &&
                            childComment.content.startsWith("@") ? (
                              <>
                                <span className="font-medium text-blue-600">
                                  {childComment.content.split(" ")[0]}
                                </span>{" "}
                                {childComment.content.substring(
                                  childComment.content.indexOf(" ") + 1
                                )}
                              </>
                            ) : (
                              childComment.content || "Không có nội dung"
                            )}
                          </div>
                        </div>

                        <div className="flex gap-4 ml-2 mt-1 text-xs text-gray-600">
                          <button
                            className={`${
                              likedComments[childComment.id]
                                ? "text-blue-600 font-medium"
                                : ""
                            }`}
                            onClick={() => handleLikeComment(childComment.id)}
                          >
                            {likedComments[childComment.id]
                              ? "Đã thích"
                              : "Thích"}
                          </button>
                          <button
                            className="hover:underline"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            Phản hồi
                          </button>
                          <span>{formatTimeAgo(childComment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  // Hiển thị loading state
  const renderLoading = () => {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <p className="text-sm text-gray-400 mt-2">Đang tải bình luận...</p>
        </div>
      </div>
    );
  };

  // Nếu không có post hoặc dialog không mở, không render gì cả
  if (!post || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[500px] p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center text-lg">Bình luận</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </DialogHeader>

        {/* Nội dung bài viết */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={post.userImageUrl || "/placeholder-user.jpg"} />
              <AvatarFallback>
                {post.userName?.charAt(0) || post.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold">
                <Link
                  to={`/profile/${post.userId}`}
                  className="hover:underline"
                >
                  {post.userName || post.username || post.name || "Người dùng"}
                </Link>
              </h3>
              <div className="text-xs text-gray-500">
                {formatTimeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          <div className="mt-3 text-gray-800">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>

          {post.attachmentUrl && post.attachmentType === "IMAGE" && (
            <div className="mt-3">
              <img
                src={post.attachmentUrl}
                alt="Ảnh đính kèm"
                className="rounded-md max-h-60 object-cover"
              />
            </div>
          )}
        </div>

        {/* Các nút tương tác */}
        <div className="flex border-b">
          <button className="flex-1 py-2 text-center text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2">
            <ThumbsUp size={18} /> Thích
          </button>
          <button className="flex-1 py-2 text-center text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2">
            <MessageSquare size={18} /> Bình luận
          </button>
          <button className="flex-1 py-2 text-center text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2">
            <Share size={18} /> Chia sẻ
          </button>
        </div>

        {/* Danh sách bình luận */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? renderLoading() : renderComments()}
        </div>

        {/* Form bình luận */}
        <div className="p-3 border-t">
          <form
            onSubmit={handleCommentSubmit}
            className="flex gap-2 items-start"
          >
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage
                src={currentUser?.imageUrl || "/placeholder-user.jpg"}
              />
              <AvatarFallback>
                {currentUser?.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 relative">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  auth?.accessToken
                    ? "Viết bình luận..."
                    : "Vui lòng đăng nhập để bình luận"
                }
                className="min-h-[40px] pr-12 py-2 rounded-full resize-none bg-gray-100"
                rows={1}
                disabled={!auth?.accessToken}
              />
              <div className="absolute right-3 bottom-2 flex gap-2">
                <button
                  type="button"
                  className="text-gray-500 hover:text-yellow-500"
                  disabled={!auth?.accessToken}
                >
                  <Smile size={18} />
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim() || !auth?.accessToken}
                  className={`${
                    commentText.trim() && auth?.accessToken
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
