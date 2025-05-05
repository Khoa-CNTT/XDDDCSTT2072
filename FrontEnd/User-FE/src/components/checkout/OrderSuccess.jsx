import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import { FaCheck, FaShoppingCart, FaListAlt } from "react-icons/fa";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentPending } = location.state || {};

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-28 px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheck size={28} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
          {orderId && (
            <span className="block mt-2">
              Mã đơn hàng: <span className="font-semibold">{orderId}</span>
            </span>
          )}
          {paymentPending && (
            <span className="block mt-2 text-orange-600">
              Vui lòng hoàn tất thanh toán để đơn hàng của bạn được xử lý.
            </span>
          )}
        </p>
        
        <div className="space-y-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/order-history")}
          >
            <FaListAlt className="mr-2" />
            Xem đơn hàng của tôi
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/farmhub2")}
          >
            <FaShoppingCart className="mr-2" />
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;