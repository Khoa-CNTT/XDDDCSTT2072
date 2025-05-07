/* eslint-disable react/prop-types */
// src/components/forum/CommentInput.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Input } from "../ui/input";

const CommentInput = ({ postId }) => {
  const [content, setContent] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // creatComemnt
  const { mutate: createComment, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosPrivate.post(`/forum/replies`, {
        postId,
        content,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setContent("");
      toast.success("Comment posted!");
    },
    onError: () => toast.error("Failed to post comment"),
  });

  return (
    <div className="flex items-center gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
      />
      <Button
        className=""
        onClick={() => createComment()}
        disabled={isPending || !content.trim()}
      >
        {isPending ? "Posting..." : "Post Comment"}
      </Button>
    </div>
  );
};

export default CommentInput;
