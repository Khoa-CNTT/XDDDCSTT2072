import React, { useState } from "react"; // eslint-disable-line no-unused-vars
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import backgroundImage from "../assets/page-signup-signin/sign-in.jpg";

const slides = [{ image: backgroundImage }, { image: backgroundImage }];

// Dữ liệu demo nhiều hơn để test
const allProducts = Array.from({ length: 30 }, (_, i) => ({
  name: `Cà Phê Số ${i + 1}`,
  price: `${(i + 1) * 10}.000 VNĐ`,
  image: `https://via.placeholder.com/150?text=Coffee+${i + 1}`,
}));

function FarmHub() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const productVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const [visibleCount, setVisibleCount] = useState(7);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 7);
  };

  const visibleProducts = allProducts.slice(0, visibleCount);
  const showLoadMore = visibleCount < allProducts.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">
        <Header />
        <div className="w-full">
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index}>
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-80 object-cover cursor-pointer"
                />
              </div>
            ))}
          </Slider>
        </div>
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md mt-4 p-4">
          <div className="text-center px-5">
            <h1 className="font-bold italic py-4 cursor-pointer text-2xl text-orange-600">
              Enjoy Your Youth!
            </h1>
            <p className="italic max-w-3xl mx-auto text-gray-600">
              Không chỉ đơn thuần là buôn bán nông sản, [Tên thương hiệu] còn là
              "cánh đồng xanh" của sự tận tâm – nơi chọn lọc và mang đến những
              sản phẩm tươi ngon, an toàn từ thiên nhiên. Chúng mình luôn mong
              muốn tạo ra một không gian kết nối giữa người nông dân và người
              tiêu dùng, giúp mọi người trải nghiệm sự trọn vẹn của hương vị tự
              nhiên, dinh dưỡng và chất lượng.
            </p>
          </div>

          {/* Product Type */}
          <h1 className="font-bold italic px-5 py-4 cursor-pointer text-xl text-orange-600">
            Product Type
          </h1>

          {/* Hiển thị sản phẩm theo từng nhóm 7 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-5 py-4">
            {visibleProducts.map((product, index) => (
              <motion.div
                key={index}
                className="border border-orange-200 rounded-lg p-4 text-center shadow-sm hover:shadow-lg hover:scale-105 hover:border-orange-400 transition-all duration-300 bg-white"
                variants={productVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="text-lg font-medium text-gray-800">
                  {product.name}
                </h3>
                <p className="text-orange-600 font-semibold">{product.price}</p>
              </motion.div>
            ))}

            {/* Khối Xem thêm */}
            {showLoadMore && (
              <motion.div
                className="border border-orange-200 rounded-lg p-4 text-center bg-gray-100 hover:shadow-lg hover:scale-105 hover:border-orange-400 transition-all duration-300 cursor-pointer"
                variants={productVariants}
                initial="hidden"
                animate="visible"
                custom={visibleProducts.length}
                onClick={handleLoadMore}
              >
                <div className="flex items-center justify-center h-48">
                  <p className="text-gray-600 text-lg font-medium hover:text-orange-500 transition-all duration-300">
                    Xem thêm...
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default FarmHub;
