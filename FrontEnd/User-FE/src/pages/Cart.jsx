import React, { useState } from "react";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/useCartActions";
import Loading from "@/components/shared/Loading";
import CartUpdate from "@/components/cart/CartUpdate";
import CartDelete from "@/components/cart/CartDelete";
import { useNavigate } from "react-router";

const Cart = () => {
  const navigate = useNavigate();
  const { getCartQuery, isLoading } = useCartActions();
  const { data: cart } = getCartQuery;
  const cartItems = cart?.cartItems || [];
  
  // State để lưu các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState({});
  
  // Chọn/bỏ chọn tất cả sản phẩm
  const [selectAll, setSelectAll] = useState(false);

  // Xử lý chọn/bỏ chọn một sản phẩm
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    
    // Kiểm tra xem có phải tất cả đều được chọn không
    const updatedSelection = {
      ...selectedItems,
      [itemId]: !selectedItems[itemId]
    };
    
    const allSelected = cartItems.every(item => updatedSelection[item.id]);
    setSelectAll(allSelected);
  };

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelection = {};
    cartItems.forEach(item => {
      newSelection[item.id] = newSelectAll;
    });
    
    setSelectedItems(newSelection);
  };
  
  // Tính tổng tiền cho các mục đã chọn
  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems[item.id])
      .reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  };
  
  // Đếm số lượng sản phẩm đã chọn
  const countSelectedItems = () => {
    return Object.values(selectedItems).filter(selected => selected).length;
  };

  // Xử lý chuyển đến thanh toán với các sản phẩm đã chọn
  const handleCheckout = () => {
    const itemsToCheckout = cartItems.filter(item => selectedItems[item.id]);
    
    if (itemsToCheckout.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    
    // Chuyển đến trang checkout với dữ liệu sản phẩm đã chọn
    navigate("/checkout", { 
      state: { 
        selectedItems: itemsToCheckout,
        fromCart: true
      } 
    });
  };

  const handleBackFarmHubPage = () => {
    navigate("/farmhub2");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      {cartItems?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg mb-4">Giỏ hàng của bạn đang trống.</p>
          <Button
            className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-lg"
            onClick={handleBackFarmHubPage}
          >
            Trở về trang FarmHub
          </Button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto mt-28 px-4">
          <h2 className="text-2xl font-bold text-center mb-6">
            Giỏ Hàng Của Bạn
          </h2>

          <table className="w-full border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="select-all" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="select-all">Chọn tất cả</label>
                  </div>
                </th>
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="text-center">Đơn giá</th>
                <th className="text-center">Số lượng</th>
                <th className="text-center">Thành tiền</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody>
              {cartItems?.map((item, index) => (
                <tr key={index} className={`border-b ${selectedItems[item.id] ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedItems[item.id] || false}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="flex items-center gap-4 p-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <span>{item.productName}</span>
                  </td>
                  <td className="text-red-500 font-semibold text-center">
                    {item.unitPrice.toLocaleString()}đ
                  </td>
                  <td className="text-center">
                    <CartUpdate cartItemId={item.id} quantity={item.quantity} />
                  </td>
                  <td className="text-red-500 font-semibold text-center">
                    {(item.unitPrice * item.quantity).toLocaleString()}đ
                  </td>
                  <td className="text-center">
                    <CartDelete cartItemId={item.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between mt-6 items-center">
            <div className="flex items-center gap-2">
              <span>Đã chọn {countSelectedItems()}/{cartItems.length} sản phẩm</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold">Tổng tiền:</span>
              <span className="text-red-500 text-xl font-bold">
                {calculateSelectedTotal().toLocaleString()}đ
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-lg"
              onClick={handleCheckout}
              disabled={countSelectedItems() === 0}
            >
              Thanh Toán ({countSelectedItems()} sản phẩm)
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;