
const ProductInfo = () => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          Bưởi Da Xanh Bến Tre - 1 trái ~ 1.2kg
        </h1>
        <p className="text-2xl text-red-500 font-semibold">₫85.000</p>

        <div className="flex gap-6 text-gray-600 text-sm">
          <p>
            Đánh giá: <span className="text-yellow-500">★ 4.9</span>
          </p>
          <p>Đã bán: 1.2k</p>
          <p>Kho: 340</p>
        </div>

        {/* Mô tả ngắn */}
        <div className="text-sm text-gray-700 leading-relaxed">
          <p>
            Bưởi Da Xanh Bến Tre là đặc sản nổi tiếng với vỏ mỏng, cơm bưởi hồng,
            ngọt thanh, không hạt, được trồng theo quy trình VietGAP, đảm bảo an toàn thực phẩm.
          </p>
          <p className="mt-2">
            Thích hợp làm quà biếu hoặc dùng trong các dịp lễ Tết, cúng kiếng.
          </p>
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
