import React from "react";

const CartItem = ({ item, onQuantityChange }) => {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };
  
  return (
    <div className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-4 rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Thông tin sản phẩm */}
      <div className="flex items-center justify-start">
        <img
          src={item.productImage}
          alt={item.name}
          className="w-16 h-16 object-cover mr-4 rounded-md transform hover:scale-110 transition-transform duration-300"
        />
        <div className="text-left">
          <p className="font-semibold">{item.name}</p>
        </div>
      </div>

      {/* Đơn giá */}
      <p className="text-red-500 text-center">{item.unitPrice.toLocaleString()}đ</p>

      {/* Số lượng */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={handleDecrease}
          className="px-2 py-1 border rounded hover:bg-gray-200 transition-colors duration-200"
        >
          -
        </button>
        <span className="px-4">{item.quantity}</span>
        <button
          onClick={handleIncrease}
          className="px-2 py-1 border rounded hover:bg-gray-200 transition-colors duration-200"
        >
          +
        </button>
      </div>

      {/* Thành tiền */}
      <p className="text-red-500 text-center">{(item.unitPrice * item.quantity).toLocaleString()}đ</p>
    </div>
  );
};

export default CartItem;
