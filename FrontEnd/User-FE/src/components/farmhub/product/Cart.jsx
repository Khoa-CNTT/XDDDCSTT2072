import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import CartItem from "./CartItem";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    if (!auth) return;

    const token = auth.accessToken;

    axios.get("http://localhost:8080/api/v1/cart", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        console.log("Response cart:", response.data);

        if (response.data && Array.isArray(response.data.cartItems)) {
          setCartItems(response.data.cartItems);
        } else {
          setCartItems([]);
        }
      })
      .catch(error => {
        console.error("Error fetching cart data:", error);
        setCartItems([]);
      });
  }, []);


  // Tính tổng tiền
  const total = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    : 0;

  // Hàm cập nhật số lượng sản phẩm
  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    setCartItems(updatedItems);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="container mx-auto p-6 flex-grow">
        <h1 className="text-2xl font-bold mb-4">Giỏ Hàng Của Bạn</h1>
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          {/* Tiêu đề cột */}
          <div className="grid grid-cols-4 gap-4 mb-4 font-semibold text-center">
            <p>Thông tin sản phẩm</p>
            <p>Đơn giá</p>
            <p>Số lượng</p>
            <p>Thành tiền</p>
          </div>

          {/* Danh sách sản phẩm */}
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Giỏ hàng của bạn đang trống.</p>
          ) : (
            cartItems.map((item, index) => (
              <CartItem
                key={item.id || index}
                item={item}
                onQuantityChange={(newQuantity) => handleQuantityChange(index, newQuantity)}
              />
            ))
          )}

          {/* Tổng tiền và nút thanh toán */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="col-span-3"></div>
            <div className="text-center">
              <p className="text-lg font-semibold mb-4">
                Tổng tiền: <span className="text-red-500">{total.toLocaleString()}đ</span>
              </p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105">
                Thanh Toán
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
