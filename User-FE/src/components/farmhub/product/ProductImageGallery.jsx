import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductImageGallery = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!product) return null;

  let gallery = [];

  if (product.images && product.images.length > 0) {
    gallery = product.images;
  } else if (product.mainImageUrl) {
    gallery = [product.mainImageUrl];
  } else if (product.imageUrl) {
    gallery = [product.imageUrl];
  }

  if (gallery.length === 0) return <div className="text-center">Không có ảnh sản phẩm</div>;

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[500px] h-[400px]">
        <img
          src={gallery[currentIndex]}
          alt={`Ảnh ${currentIndex + 1}`}
          className="w-full h-full object-cover rounded-xl border"
        />

        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white border shadow p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronLeft size={20} />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border shadow p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        {gallery.map((img, idx) => (
          <img
            key={idx}
            src={img}
            onClick={() => setCurrentIndex(idx)}
            className={`w-16 h-16 object-cover cursor-pointer rounded-md border ${
              currentIndex === idx ? "border-blue-500" : "border-gray-300"
            }`}
            alt={`Thumb ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
