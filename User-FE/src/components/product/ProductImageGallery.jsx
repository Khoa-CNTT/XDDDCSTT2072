/* eslint-disable react/prop-types */
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductImageGallery = ({ imageUrl, productName }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[500px] h-[400px]">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover rounded-xl border"
        />
        <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white border shadow p-2 rounded-full hover:bg-gray-100">
          <FaChevronLeft size={20} />
        </button>
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border shadow p-2 rounded-full hover:bg-gray-100">
          <FaChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductImageGallery;
