/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ShareDialog = ({ open, onOpenChange, post }) => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const user = auth?.user;
  // console.log(user);
  
  const { userName, imageUrl } = user;
  const { title, content, images, userName: author, id: postId } = post;

  const { register, handleSubmit, reset } = useForm();

  const { mutate: sharePost, isPending } = useMutation({
    mutationFn: async (data) =>
      await axiosPrivate.post(`posts/${postId}/share`, {
        content: data.content,
      }),
    onSuccess: () => {
      toast.success("Chia sẻ bài viết thành công!");
      queryClient.invalidateQueries({ queryKey: ["postList"] });
      reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Chia sẻ bài viết thất bại.");
    },
  });

  const onSubmit = (data) => {
    sharePost(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Chia sẻ bài viết</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Người chia sẻ */}
          <div className="flex items-center gap-3">
            <img
              src={imageUrl || "/default-avatar.png"}
              alt={userName}
              className="w-10 h-10 rounded-full"
            />
            <span className="font-medium">{userName}</span>
          </div>

          {/* Nội dung chia sẻ */}
          <Textarea
            {...register("content")}
            placeholder="Bạn muốn nói gì về bài viết này?"
          />

          {/* Bài viết gốc */}
          <div className="border rounded p-3 bg-gray-50">
            <h4 className="font-semibold mb-1">{title}</h4>
            <p className="text-sm mb-2 line-clamp-3">{content}</p>
            {images && images.length > 0 && (
              <img
                src={images[0].imageUrl}
                alt={title}
                className="max-h-40 w-full object-cover rounded"
              />
            )}
          </div>

          <div className="text-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang chia sẻ..." : "Chia sẻ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
