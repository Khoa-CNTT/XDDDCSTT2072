/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

const postSchema = z.object({
  title: z
    .string()
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(200, "Tiêu đề không được vượt quá 200 ký tự"),
  content: z
    .string()
    .min(10, "Nội dung phải có ít nhất 10 ký tự")
    .max(5000, "Nội dung không được vượt quá 5000 ký tự"),
  image: z.any().refine(
    (fileList) => {
      if (!fileList || fileList.length === 0) return true; // không bắt buộc
      return fileList[0].size <= 5 * 1024 * 1024;
    },
    { message: "Ảnh không được vượt quá 5MB" }
  ),
  hashtags: z.array(z.string()).optional(),
});

export default function CreateEditPostForm({ mode, post, onClose }) {
  console.log(post?.images[0]);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
  });
  const { auth } = useAuth();
  const { user } = auth;
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (mode === "edit" && post) {
      reset({
        title: post.title || "",
        content: post.content || "",
        image: null, // Không set ảnh vào input file
      });

      if (post.images?.length > 0) {
        setPreviewImage(post.images[0].imageUrl); // hoặc post.image nếu đó là đường dẫn
      }
    }
  }, [mode, post, reset]);
  // create Post
  const { mutate: createPost, isPending: isPendingCreate } = useMutation({
    mutationFn: async ({ title, content, image, hashtags }) => {
      const formData = new FormData();

      const postPayload = {
        title,
        content,
        privacyLevel: "PUBLIC",
        hashtags,
      };

      formData.append(
        "post",
        new Blob([JSON.stringify(postPayload)], {
          type: "application/json",
        })
      );

      if (image) {
        formData.append("images", image);
      }
      return await axiosPrivate.post("posts/with-images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Tạo bài viết thành công");
      // Refetch lại tất cả các page của postList
      queryClient.invalidateQueries({ queryKey: ["postList"], exact: false });
      onClose();
      reset();
      setPreviewImage(null);
    },
    onError: (error) => {
      console.log("Lỗi tạo post:", error);
      toast.error(error.response.data.errorMessage);
    },
  });

  // update Post  , ( lam update anh truoc)
  const { mutate: updatePost, isPending: isPendingUpdate } = useMutation({
    mutationFn: async ({ title, content }) => {
      await axiosPrivate.put(`posts/${post.id}`, {
        title,
        content,
      });
    },
    onSuccess: () => {
      toast.success("Cập nhật bài viết thành công");
      onClose();
      reset();
      queryClient.invalidateQueries({ queryKey: ["postList"], exact: false });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Cập nhật bài viết thất bại"
      );
    },
  });

  const onSubmit = (data) => {
    console.log("Du lieu form", data);
    if (post?.id) {
      updatePost({
        title: data.title, // Thêm title
        content: data.content,
      });
    } else {
      createPost({
        title: data.title,
        content: data.content,
        image: data?.image[0] || null,
        hashtags: data.hashtags,
      });
    }
  };

  // lấy danh sách hashtag
  //   const { data: trendingHashtags } = useQuery({
  //     queryKey: ['hashtags', 'trending'],
  //     queryFn: async () => {
  //       const res = await axiosPrivate.get('hashtags/trending', {
  //         params: {
  //           page: 0,
  //           size: 10
  //         }
  //       });
  //       return res.data;
  //     }
  // });
  // console.log(trendingHashtags);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 py-2
     max-h-[500px] overflow-auto"
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{user?.userName || "U"}</AvatarFallback>
        </Avatar>
        <span>{user?.userName}</span>
      </div>
      {mode === "create" && (
        <div className="grid gap-1">
          <Label>Hashtags</Label>
          <Input
            placeholder="Nhập các hashtag, cách nhau bởi dấu phẩy. Ví dụ: #dev, #reactjs"
            {...register("hashtags", {
              setValueAs: (v) =>
                typeof v === "string"
                  ? v
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag !== "")
                  : [],
            })}
          />
          {errors.hashtags && (
            <p className="text-sm text-red-500">{errors.hashtags.message}</p>
          )}
        </div>
      )}
      <div className="grid gap-1">
        <Label>Tiêu đề</Label>
        <Input placeholder="Nhập tiêu đề" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-1">
        <Label>Nội dung</Label>
        <Textarea
          className="max-h-[150]"
          {...register("content")}
          placeholder="Viết gì đó..."
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>
      {mode === "create" ? (
        <div className="grid gap-1">
          <Label>Ảnh bài viết</Label>
          <Input
            type="file"
            accept="image/*"
            id="file-input"
            {...register("image", {
              onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPreviewImage(URL.createObjectURL(file));
                }
              },
            })}
            className="hidden"
          />
          <label htmlFor="file-input">
            <Button
              type="button"
              variant="outline"
              className="max-w-[100px]"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {previewImage ? "Đổi Ảnh" : "Chọn ảnh"}
            </Button>
          </label>
          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message}</p>
          )}
          {previewImage && (
            <div className="mt-2">
              <img
                src={previewImage}
                alt="Avatar Preview"
                className="w-50 h-50 rounded-xl object-cover border"
              />
            </div>
          )}
        </div>
      ) : null}

      <Button type="submit" disabled={isPendingCreate || isPendingUpdate}>
        {isPendingCreate || isPendingUpdate
          ? mode === "edit"
            ? "Đang cập nhật..."
            : "Đang đăng..."
          : mode === "edit"
          ? "Cập nhật"
          : "Đăng bài"}
      </Button>
    </form>
  );
}
