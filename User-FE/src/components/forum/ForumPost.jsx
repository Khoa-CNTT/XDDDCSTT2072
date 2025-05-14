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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";

const ForumPost = ({ post, isOwner }) => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Get user data
  const { data: user } = useQuery({
    queryKey: ["user", post.userId],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/users/${post.userId}`);
      return response.data;
    },
    enabled: !!post.userId,
  });

  // count reply
  const {data: countTotal} = useQuery({
    queryKey: ["counCommenttPost", post.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`forum/replies/post/${post?.id}/count`);
      return response.data
    }
  })
  
  // Delete post mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await axiosPrivate.delete(`/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["forumPosts"]);
      toast.success("Post deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });

  // Update post mutation
  const { mutate: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.put(`/posts/update/${post.id}`, {
        title: post.title,
        content: editedContent,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["forumPosts"]);
      setIsEditing(false);
      toast.success("Post updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });

  const handleDelete = () => {
    deletePost();
  };

  const handleUpdate = () => {
    updatePost();
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={user?.imageUrl || "/default-avatar.png"}
              alt="User avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{user?.userName || "Anonymous"}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(post.createdAt), "PPPp", { locale: vi })}
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isUpdating}
              >
                <FaEdit />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <FaTrash />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          ) : (
            <p className="text-gray-700">{post.content}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-4">
            <Button variant="ghost" className="flex items-center gap-2">
              <FaThumbsUp /> Like
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <FaCommentAlt /> Comment ({countTotal?.data?.totalCount})
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <FaShare /> Share
            </Button>
          </div>
          {isEditing && (
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardFooter>
        {showComments && (
          <div className="mt-2 px-4 pb-4">
            <CommentInput postId={post.id} />
            <CommentList postId={post.id} />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ForumPost;
