import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  getForumPostById,
  reactToPost,
  addForumComment,
  deleteForumPost,
} from "@/services/forumService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import useForumComments from "@/hooks/useForumComments";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  MessageSquare,
  ThumbsUp,
  Share,
  MoreHorizontal,
  Edit,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "@/components/common/Loading";
import { toast } from "react-toastify";
import PostCard from "@/components/forum/PostCard";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ForumPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { loadComments, addComment } = useForumComments(axiosPrivate);

  const [commentText, setCommentText] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch post data
  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["forumPost", postId],
    queryFn: async () => {
      const data = await getForumPostById(axiosPrivate, postId);
      return data;
    },
    enabled: !!postId,
  });

  // Tải comments khi trang được load
  useEffect(() => {
    if (postId) {
      loadComments(postId);
    }
  }, [postId, loadComments]);

  // Kiểm tra xem người dùng hiện tại có phải là tác giả của bài viết không
  const isAuthor = auth?.user?.id === post?.userId;

  const handleBack = () => {
    navigate("/forum");
  };

  const handleReact = async (reactionType) => {
    try {
      await reactToPost(axiosPrivate, postId, reactionType);
      refetch(); // Tải lại bài viết để cập nhật số lượng reaction
      toast.success("Đã thêm cảm xúc");
    } catch (error) {
      console.error("Lỗi khi thêm cảm xúc:", error);
      toast.error("Có lỗi xảy ra khi thêm cảm xúc");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await addComment(postId, commentText);
      setCommentText("");
      toast.success("Đã thêm bình luận");
      refetch(); // Tải lại bài viết để cập nhật số lượng bình luận
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      toast.error("Có lỗi xảy ra khi thêm bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deleteForumPost(axiosPrivate, postId);
      toast.success("Đã xóa bài viết");
      navigate("/forum");
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      toast.error("Có lỗi xảy ra khi xóa bài viết");
    }
  };

  const handleEditPost = () => {
    navigate(`/forum/edit/${postId}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Bài viết không tồn tại hoặc đã bị xóa
        </h2>
        <Button onClick={handleBack}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{post.title || "Chi tiết bài viết"} - Diễn đàn</title>
      </Helmet>

      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>

      {/* Hiển thị bài viết */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={post.userImageUrl} alt={post.userName} />
              <AvatarFallback>{post.userName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.userName}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditPost}>
                  <Edit className="mr-2 h-4 w-4" /> Sửa bài viết
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" /> Xóa bài viết
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {post.title && <h2 className="text-xl font-bold mb-3">{post.title}</h2>}

        <div className="mb-4">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, "<br>"),
            }}
          />
        </div>

        {post.attachmentUrl && (
          <div className="mb-4">
            <img
              src={post.attachmentUrl}
              alt="Post attachment"
              className="max-w-full rounded-lg"
            />
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReact("LIKE")}
              className="flex items-center"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {post.likeCount || 0} Thích
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              {post.commentCount || 0} Bình luận
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Share className="mr-2 h-4 w-4" /> Chia sẻ
            </Button>
          </div>
        </div>
      </div>

      {/* Phần bình luận */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Bình luận</h3>

        {auth?.user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={auth.user.imageUrl} alt={auth.user.name} />
                <AvatarFallback>{auth.user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="mb-2"
                  rows={2}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !commentText.trim()}
                >
                  {isSubmitting ? "Đang gửi..." : "Bình luận"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md mb-6 text-center">
            <p className="text-sm text-gray-600">
              Vui lòng{" "}
              <Button variant="link" onClick={() => navigate("/account/login")}>
                đăng nhập
              </Button>{" "}
              để bình luận
            </p>
          </div>
        )}

        {/* Hiển thị bình luận */}
        <div className="space-y-4">
          <PostCard
            post={post}
            currentUser={auth?.user}
            onReact={handleReact}
            onComment={addComment}
            onEdit={handleEditPost}
            onDelete={() => setIsDeleteDialogOpen(true)}
            showComments={true}
          />
        </div>
      </div>

      {/* Dialog xác nhận xóa bài viết */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Xóa bài viết
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumPostPage;
