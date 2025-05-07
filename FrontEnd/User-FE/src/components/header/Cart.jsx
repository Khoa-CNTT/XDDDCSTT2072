import { useCartActions } from "@/hooks/useCartActions";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router";
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
      className="relative hover:scale-110 transition-transform cursor-pointer"
    >
      <FaShoppingCart size={22} className="text-black dark:text-white" />
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
        {cart?.cartItems?.length}
      </span>
    </div>
  );
};

export default Cart;
