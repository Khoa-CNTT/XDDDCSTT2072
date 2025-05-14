/* eslint-disable react/prop-types */
// src/components/forum/PostInput.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "react-toastify";

const PostInput = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.post("/posts/create", {
        title: title.trim(),
        content: content.trim(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["forumPosts"]);
      setTitle("");
      setContent("");
      setErrors({});
      onClose();
      toast.success("Post created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      createPost();
    }
  };

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors({ ...errors, title: "" });
                  }
                }}
                className={`mb-1 ${errors.title ? "border-red-500" : ""}`}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) {
                    setErrors({ ...errors, content: "" });
                  }
                }}
                className={`min-h-[100px] ${
                  errors.content ? "border-red-500" : ""
                }`}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !title.trim() || !content.trim()}
          >
            {isPending ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostInput;
