/* eslint-disable react/prop-types */
// src/components/forum/CommentInput.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Input } from "../ui/input";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CommentInput = ({ postId }) => {
  const [content, setContent] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const navigate = useNavigate();

  // creatComemnt
  const { mutate: createComment, isPending } = useMutation({
    mutationFn: async () => {
      // Kiểm tra đăng nhập trước khi thêm bình luận
      if (!auth?.accessToken) {
        toast.info("Vui lòng đăng nhập để bình luận");
        navigate("/account/login", { state: { from: { pathname: "/home" } } });
        return null;
      }

      const res = await axiosPrivate.post(`/forum/replies`, {
        postId,
        content,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries(["comments", postId]);
        setContent("");
        toast.success("Comment posted!");
      }
    },
    onError: () => toast.error("Failed to post comment"),
  });

  return (
    <div className="flex items-center gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          auth?.accessToken ? "Write a comment..." : "Đăng nhập để bình luận"
        }
        disabled={!auth?.accessToken}
      />
      <Button
        className=""
        onClick={() => createComment()}
        disabled={isPending || !content.trim() || !auth?.accessToken}
      >
        {isPending ? "Posting..." : "Post Comment"}
      </Button>
    </div>
  );
};

export default CommentInput;
