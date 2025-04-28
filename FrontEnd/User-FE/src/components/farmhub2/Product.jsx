/* eslint-disable react/prop-types */

const Product = ({ item }) => {
  const { productName, imageUrl, currentPrice } = item;

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 w-48 cursor-pointer">
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
