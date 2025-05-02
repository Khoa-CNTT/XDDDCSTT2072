/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/useCartActions";
import { useState } from "react";

const CartUpdate = ({ cartItemId, quantity }) => {
  console.log(cartItemId);

  const { updateCartMutation } = useCartActions();
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const handleUpdateCart = (newQuantity) => {
    if (newQuantity < 1) return;
    setCurrentQuantity(newQuantity);
    updateCartMutation.mutate({
      itemId: cartItemId,
      quantity: newQuantity,
    });
  };

  return (
    <div className="inline-flex items-center border rounded-full overflow-hidden">
      <Button
        variant="ghost"
        className="w-10 h-10 flex justify-center items-center hover:bg-gray-200"
        onClick={() => handleUpdateCart(currentQuantity - 1)}
      >
        -
      </Button>
      <div className="w-12 h-10 flex justify-center items-center border-l border-r font-bold">
        {currentQuantity}
      </div>
      <Button
        variant="ghost"
        className="w-10 h-10 flex justify-center items-center hover:bg-gray-200"
        onClick={() => handleUpdateCart(currentQuantity + 1)}
      >
        +
      </Button>
    </div>
  );
};

export default CartUpdate;
