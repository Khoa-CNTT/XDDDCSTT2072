const ReviewsSection = () => {
  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h2>
      <div className="space-y-4">
        <div className="border p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src="https://via.placeholder.com/40"
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
              <span className="font-semibold">Người dùng</span>
            </div>
            <span className="text-yellow-500 text-sm">★★★★★</span>
          </div>
          <p className="text-sm text-gray-700">
            Sản phẩm chất lượng tốt, giao hàng nhanh chóng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
