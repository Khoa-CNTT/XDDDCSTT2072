import { useCartActions } from "@/hooks/useCartActions";
import { useNavigate } from "react-router";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Cart = () => {
  const navigate = useNavigate();
  const { getCartQuery } = useCartActions();
  const { data: cart } = getCartQuery;

  const handleClickCartIcon = () => {
    navigate(`/cart`);
  };

  return (
    <div
      onClick={handleClickCartIcon}
      className="relative hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
    >
      <ShoppingCart size={20} className="text-white" />
      {cart?.cartItems?.length > 0 && (
        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
          {cart?.cartItems?.length}
        </Badge>
      )}
    </div>
  );
};

export default Cart;
