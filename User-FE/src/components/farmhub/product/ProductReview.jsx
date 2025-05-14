import React from "react";

const ProductReview = () => {
  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h2>

      <div className="space-y-4">
        <div className="border p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            {/* Avatar và tên */}
            <div className="flex items-center gap-3">
              <img
                src="https://images.baodantoc.vn/uploads/2023/Thang-9/Ngay-25/Hong-Phuc/anh-minh-hoa-271.jpg"
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
              <span className="font-semibold">Lê Minh Tuấn</span>
            </div>
            {/* Rating */}
            <span className="text-yellow-500 text-sm">★★★★★</span>
          </div>

          {/* Nội dung đánh giá */}
          <p className="text-sm text-gray-700">
            Bưởi ngon, tép mọng nước, ngọt thanh. Giao hàng nhanh, đóng gói kỹ càng. Sẽ ủng hộ dài dài!
          </p>
        </div>

        {/* Thêm nhiều đánh giá khác nếu muốn */}
      </div>
    </div>
  );
};

export default ProductReview;
