import imgCafe from "../assets/images/cafe.jpg";
import Footer from "../layout/Footer";
import Header from "../layout/Header";

function Cart() {
  return (
    <>
      <Header />

      <div className="max-w-6xl mx-auto mt-10 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">Giỏ Hàng Của Bạn</h2>

        <table className="w-full border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Thông tin sản phẩm</th>
              <th className="text-center">Đơn giá</th>
              <th className="text-center">Số lượng</th>
              <th className="text-center">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="flex items-center gap-4 p-4">
                <img
                  src={imgCafe}
                  alt="Cà phê"
                  className="w-20 h-20 object-cover rounded"
                />
                <span>Cà phê Tây Nguyên</span>
              </td>
              <td className="text-red-500 font-semibold text-center">100.000đ</td>
              <td className="text-center">
                <div className="inline-flex items-center border rounded-full overflow-hidden">
                  <button className="w-10 h-10 flex justify-center items-center hover:bg-gray-200">
                    -
                  </button>
                  <div className="w-12 h-10 flex justify-center items-center border-l border-r font-bold">
                    2
                  </div>
                  <button className="w-10 h-10 flex justify-center items-center hover:bg-gray-200">
                    +
                  </button>
                </div>
              </td>
              <td className="text-red-500 font-semibold text-center">200.000đ</td>
            </tr>

            <tr className="border-b">
              <td className="flex items-center gap-4 p-4">
                <img
                  src={imgCafe}
                  alt="Tiêu khô"
                  className="w-20 h-20 object-cover rounded"
                />
                <span>Hạt tiêu khô</span>
              </td>
              <td className="text-red-500 font-semibold text-center">100.000đ</td>
              <td className="text-center">
                <div className="inline-flex items-center border rounded-full overflow-hidden">
                  <button className="w-10 h-10 flex justify-center items-center hover:bg-gray-200">
                    -
                  </button>
                  <div className="w-12 h-10 flex justify-center items-center border-l border-r font-bold">
                    1
                  </div>
                  <button className="w-10 h-10 flex justify-center items-center hover:bg-gray-200">
                    +
                  </button>
                </div>
              </td>
              <td className="text-red-500 font-semibold text-center">100.000đ</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mt-6 items-center gap-4">
          <span className="text-lg font-semibold">Tổng tiền:</span>
          <span className="text-red-500 text-xl font-bold">300.000đ</span>
        </div>

        <div className="flex justify-end mt-4 p-3">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Thanh Toán
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Cart;
