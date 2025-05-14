import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lấy đơn hàng từ localStorage khi component mount
  useEffect(() => {
    // Giả lập loading để UX tốt hơn
    const timer = setTimeout(() => {
      try {
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        console.log("Đơn hàng từ localStorage:", storedOrders);
        setOrders(storedOrders);
      } catch (error) {
        console.error("Lỗi khi đọc từ localStorage:", error);
        setOrders([]);
      }
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
      'PROCESSING': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang xử lý' },
      'SHIPPING': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang giao hàng' },
      'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
      'WAITING_PAYMENT': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Chờ thanh toán' },
    };
    
    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Không xác định' };
    
    return (
      <span className={`${statusInfo.bg} ${statusInfo.text} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {statusInfo.label}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto mt-28 px-4 py-8">
          <h2 className="text-2xl font-bold mb-8">Lịch sử đơn hàng</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto mt-28 px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">Lịch sử đơn hàng</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/farmhub2")}
            >
              Mua sắm ngay
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-red-600 font-medium">
                          {order.totalAmount?.toLocaleString()}đ
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() => navigate(`/order/${order.id}`)}
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistory;