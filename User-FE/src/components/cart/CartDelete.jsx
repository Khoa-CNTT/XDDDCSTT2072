/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/useCartActions";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const CartDelete = ({ cartItemId }) => {
  const { deleteCartItemsMuation } = useCartActions();

  const handleDelete = () => {
    deleteCartItemsMuation.mutate(cartItemId, {
      onSuccess: () => {
        toast.success("Xóa thành công sản phẩm khỏi giỏ hàng");
      },
      onError: (error) => {
        toast.error(error.response.data.errorMessage)
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={deleteCartItemsMuation.isPending}
    >
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

export default CartDelete;
