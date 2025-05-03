/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/Button";
import { useUserActions } from "@/hooks/useUser";
import { FaCommentDots, FaStore } from "react-icons/fa";
const ShopInfo = ({shopId}) => {
  const { userByIdQuery } = useUserActions(shopId);
  const { data: user } = userByIdQuery;
  
  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Thông tin cửa hàng</h2>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl shadow-sm flex-wrap gap-4">
        <div className="flex items-center gap-4 min-w-[250px]">
          <img
            src={user?.imageUrl || "https://via.placeholder.com/56"}
            alt="Shop Avatar"
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            {/* name */}
            <h4 className="font-bold text-blue-600 text-lg">{user?.userName}</h4>
            {/* <p className="text-sm text-green-600">Đang hoạt động</p> */}
          </div>
        </div>

        <div className="flex gap-3 min-w-[250px] justify-end">
          {/* Nhắn tin button */}
          <Button className="flex items-center gap-2 text-white bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-600">
            <FaCommentDots />
            Nhắn tin
          </Button>

          {/* Xem shop button */}
          <Button className="flex items-center gap-2 text-blue-500 border border-blue-500 px-6 py-2 rounded-lg hover:bg-blue-50">
            <FaStore />
            Xem Shop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopInfo;
