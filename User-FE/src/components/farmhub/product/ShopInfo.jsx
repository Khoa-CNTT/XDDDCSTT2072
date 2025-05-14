import React from "react";
import { FaCommentDots, FaStore } from "react-icons/fa";

const ShopInfo = () => {
  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Thông tin cửa hàng</h2>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl shadow-sm flex-wrap gap-4">
        {/* Bên trái: ảnh đại diện + tên shop */}
        <div className="flex items-center gap-4 min-w-[250px]">
          <img
            src="https://weeboo.vn/wp-content/uploads/2024/05/hinh-anh_2024-05-27_101442817.jpg"
            alt="Shop Avatar"
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <h4 className="font-bold text-blue-600 text-lg">
              Farm Ngon - Nông Sản Việt
            </h4>
            <p className="text-sm text-green-600">Đang hoạt động</p>
          </div>
        </div>

        {/* Giữa: thông tin shop chia 2 hàng */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700 text-left min-w-[250px]">
          <p>
            <span className="font-semibold">Sản phẩm:</span> 245
          </p>
          <p>
            <span className="font-semibold">Đánh giá:</span> 4.8/5
          </p>
          <p>
            <span className="font-semibold">Phản hồi:</span> Trong 1 giờ
          </p>
          <p>
            <span className="font-semibold">Người theo dõi:</span> 15.2k
          </p>
        </div>

        {/* Bên phải: các hành động */}
        <div className="flex gap-3 min-w-[250px] justify-end">
          <button className="flex items-center gap-2 text-white bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-600">
            <FaCommentDots />
            Nhắn tin
          </button>
          <button className="flex items-center gap-2 text-blue-500 border border-blue-500 px-6 py-2 rounded-lg hover:bg-blue-50">
            <FaStore />
            Xem Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopInfo;
