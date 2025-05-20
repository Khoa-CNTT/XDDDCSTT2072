/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const DeleteConfirmDialog = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  postId,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { mutate: deletePost, isPending: isPendingDelete } = useMutation({
    mutationFn: async () => {
      return await axiosPrivate.delete(`posts/${postId}`);
    },
    onSuccess: () => {
      toast.success("Xóa bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["postList"], exact: false });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xóa bài viết thất bại");
    },
  });
  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa bài</DialogTitle>
          <DialogDescription>Bạn muốn xóa bài viết?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isPendingDelete}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={deletePost}
            disabled={isPendingDelete}
          >
            {isPendingDelete ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
