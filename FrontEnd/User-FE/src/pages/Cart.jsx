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
  const cartItems = cart?.cartItems;

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
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="text-center">Đơn giá</th>
                <th className="text-center">Số lượng</th>
                <th className="text-center">Thành tiền</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index} className="border-b">
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
                    <CartUpdate
                      cartItemId={item.id}
                      currentQuantity={item.quantity}
                    />
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

          <div className="flex justify-end mt-6 items-center gap-4">
            <span className="text-lg font-semibold">Tổng tiền:</span>
            <span className="text-red-500 text-xl font-bold">
              {cartItems
                .reduce(
                  (total, item) => total + item.unitPrice * item.quantity,
                  0
                )
                .toLocaleString()}
              đ
            </span>
          </div>

          <div className="flex justify-end mt-4">
            <Button className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-lg">
              Thanh Toán
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
