import { useState } from "react";
import { FaStar } from "react-icons/fa";

function Evaluation() {
  const [rating, setRating] = useState(0); 

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-center text-lg font-semibold">Đánh giá sản phẩm</h2>
        <p className="font-bold text-lg mt-2">Tên sản phẩm</p>

        {/* Đánh giá sao */}
        <div className="mt-2">
          <span className="mr-2">Đánh giá của bạn về sản phẩm:</span>
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`inline cursor-pointer transition ${
                i < rating ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(i + 1)} 
              size={20}
            />
          ))}
        </div>

        
        <form className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Nhập họ tên của bạn"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="Email"
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <textarea
            rows="4"
            placeholder="Nhập nội dung đánh giá"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>

          
          <label className="flex items-center space-x-2 border border-gray-300 p-2 rounded-md cursor-pointer">
            <span className="text-gray-500">📷 Đính kèm hình ảnh</span>
            <input type="file" className="hidden" />
          </label>

          <button
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
            disabled={rating === 0} 
          >
            Gửi đánh giá
          </button>
        </form>
      </div>
    </div>
  );
}

export default Evaluation;
