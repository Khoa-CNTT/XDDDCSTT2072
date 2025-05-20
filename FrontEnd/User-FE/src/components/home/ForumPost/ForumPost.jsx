/* eslint-disable react/prop-types */
// src/components/forum/ForumPost.jsx
import { useState } from "react";
import {
  FaThumbsUp,
  FaCommentAlt,
  FaShare,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import DeleteConfirmDialog from "./DeleteConfirmDialog";
import CreateEditPostForm from "./CreateEditPostForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import ShareDialog from "./ShareDialog";
import useAuth from "@/hooks/useAuth";

const ForumPost = ({ post, isOwner }) => {
  // console.log(post);
  
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isShareFormOpen, setIsShareFormOpen] = useState(false);

  const [showComments, setShowComments] = useState(false);

  // lấy số lượng comment của bài viết
  const { data: countTotal } = useQuery({
    queryKey: ["countCommenttPost", post.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`replies/post/${post?.id}/count`);
      return response.data.data.totalCount;
    },
  });

  // lấy số lượng reaction của bài viết
  const { data: countReaction } = useQuery({
    queryKey: ["countReactions", post.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`reactions/post/${post.id}`);
      return response.data.data.length;
    },
    refetchOnWindowFocus: true,
  });

  //Query để lấy reaction của user
  const { data: userReactions } = useQuery({
    queryKey: ["userPostReactions", post.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`reactions/post/${post.id}/user`);
      return response.data.data;
    },
  });

  // handle react
  const { mutate: toggleLike } = useMutation({
    mutationFn: async () => {
      const isLiked = userReactions?.includes("LIKE");
      return isLiked
        ? await axiosPrivate.delete(
            `reactions/post/${post.id}?reactionType=LIKE`
          )
        : await axiosPrivate.post(
            `reactions/post/${post.id}?reactionType=LIKE`
          );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userPostReactions", post.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["countReactions", post.id],
      });
    },
  });

  const isLiked = userReactions?.includes("LIKE");

  // lay số lượng chia sẻ của bài viết
  // const { data: shareCount } = useQuery({
  //   queryKey: ["sharePostCount", post.id],
  //   queryFn: async () => {
  //     const res = await axiosPrivate.get(`posts/${post.id}`);
  //     return res;
  //   },
  // });

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={post?.userAvatar || "/default-avatar.png"}
              alt="User avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{post?.userName || "Anonymous"}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(post.createdAt), "PPPp", { locale: vi })}
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditFormOpen(true)}
                  >
                    <FaEdit />
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-xl rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold text-gray-800">
                      Chỉnh sửa bài viết
                    </DialogTitle>
                    <CreateEditPostForm
                      mode="edit"
                      post={post}
                      onClose={() => setIsEditFormOpen(false)}
                    />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                // disabled={isDeleting}
              >
                <FaTrash />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {post?.hashtags.map((hashtag)=>(
             <h1 key={hashtag.id}>{hashtag.name}</h1>
          ))}
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          <h3>{post.content}</h3>
          <img src={post?.images[0]?.imageUrl} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className={`like-button ${isLiked ? "liked" : ""}`}
              onClick={() => toggleLike()}
            >
              <FaThumbsUp /> {isLiked ? "Đã thích" : "Thích"} ({countReaction})
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <FaCommentAlt /> Bình luận ({countTotal})
              {/* ({countTotal?.data?.totalCount}) */}
            </Button>
            {!isOwner && (
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setIsShareFormOpen((prev) => !prev)}
              >
                <FaShare /> Chia sẻ
              </Button>
            )}
          </div>
        </CardFooter>
        {showComments && (
          <div className="mt-2 px-4 pb-4">
            <CommentInput postId={post.id} />
            <CommentList postId={post.id} />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        postId={post.id}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />

      {/* share dialog */}
      {auth?.user && (
        <ShareDialog
          open={isShareFormOpen}
          onOpenChange={setIsShareFormOpen}
          post={post}
        />
      )}
    </>
  );
};

export default ForumPost;
