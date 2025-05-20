/* eslint-disable react/prop-types */
// src/components/forum/CommentInput.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";

const CommentInput = ({ postId, parentId, inputRef }) => {
  const [content, setContent] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  // creatComemnt
  const { mutate: createComment, isPending, error } = useMutation({
    mutationFn: async () => {
      const res = await axiosPrivate.post(`replies`, {
        postId,
        content,
        parentId: parentId || null,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries(["postComments", postId]);
        setContent("");
      }
    },
    onError: () => toast.error("Failed to post comment"),
  });
  console.log(error);
  

  return (
    <div className="flex items-center gap-2">
      <Input
        value={content}
        ref={inputRef}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          auth?.accessToken ? "Viết bình luận..." : "Đăng nhập để bình luận"
        }
        disabled={!auth?.accessToken}
      />
      <Button
        className=""
        onClick={() => createComment()}
        disabled={isPending || !content.trim() || !auth?.accessToken}
      >
        {parentId ? "Thêm phản hồi" : "Thêm bình luận"}
      </Button>
    </div>
  );
};

export default CommentInput;
