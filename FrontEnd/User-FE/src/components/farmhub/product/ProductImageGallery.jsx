import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const images = [
    "https://tse4.mm.bing.net/th?id=OIP.4pT5JDhr9VGx2hX9R_9_6wHaEK&pid=Api&P=0&h=220",
    "https://elead.com.vn/wp-content/uploads/2022/10/cay-tieu-8.jpg",
    "https://cdn.abphotos.link/photos/resized/1024x/3057-1633065230-foodland.png",
    "https://shidai.thoidai.com.vn/stores/news_dataimages/thuyntm/102022/17/12/croped/5506_cay-ho-tieu2.jpg",
  ];

const ProductImageGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[500px] h-[400px]">
        <img
          src={images[currentIndex]}
          alt={`Main ${currentIndex}`}
          className="w-full h-full object-cover rounded-xl border"
        />

        {/* Nút trái */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white border shadow p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronLeft size={20} />
        </button>

        {/* Nút phải */}
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border shadow p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {/* Thumbnail list */}
      <div className="flex gap-2 mt-4">
        {images.map((img, idx) => (
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
