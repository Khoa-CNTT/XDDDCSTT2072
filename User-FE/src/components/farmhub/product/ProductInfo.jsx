

const ProductInfo = ({ product }) => {
  if (!product) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{product.productName}</h1>
        <p className="text-2xl text-red-500 font-semibold">
          ₫{product.salePrice.toLocaleString()}
        </p>

        <div className="flex gap-6 text-gray-600 text-sm">
          <p>
            Đánh giá:{" "}
            <span className="text-yellow-500">
              {product.averageRating || "★ 0"}
            </span>
          </p>
          <p>Đã bán: {product.totalFeedbacks} </p>
          <p>Kho: {product.quantity}</p>
        </div>

        {/* Mô tả ngắn */}
        <div className="text-sm text-gray-700 leading-relaxed">
          <p>{product.description}</p>
        </div>
      </div>

      {/* Nút hành động nằm dưới cùng */}
      <div className="flex gap-4 mt-6">
        <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-xl">
          Thêm vào giỏ hàng
        </button>
        <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl">
          Mua ngay
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
