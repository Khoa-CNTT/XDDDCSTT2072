/* eslint-disable react/prop-types */

import { useNavigate } from "react-router";

const Product = ({ item }) => {
  const { productName, imageUrl, currentPrice, id } = item;
  const navigate = useNavigate();
  // handleClickproduct
  const handleClickProduct = () => {
    navigate(`/farmhub2/product/${id}`);
  };

  return (
    <div
      className="flex flex-col items-center bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 w-full cursor-pointer"
      onClick={handleClickProduct}
    >
      <img
        src={imageUrl}
        alt={productName}
        className="w-32 h-32 object-cover rounded-xl mb-3"
      />
      <div className="text-center">
        <h2 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">
          {productName}
        </h2>
        <p className="text-green-600 font-semibold">
          {currentPrice.toLocaleString()}₫
        </p>
      </div>
    </div>
  );
};

export default Product;
