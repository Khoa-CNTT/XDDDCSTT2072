import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import backgroundImage from "../assets/page-signup-signin/sign-in.jpg";
import axios from "axios";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { useNavigate } from "react-router";

const slides = [{ image: backgroundImage }, { image: backgroundImage }];

function FarmHub() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/marketplace/products")
      .then((response) => {
        console.log("Dữ liệu API:", response);
        if (response.data && Array.isArray(response.data.content)) {
          setProducts(response.data.content);
        } else {
          console.error("Dữ liệu không đúng định dạng");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi tải sản phẩm:", error);
      });
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const visibleProducts = products.slice(0, visibleCount);
  const showLoadMore = visibleCount < products.length;

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
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">
        <Header />

        {/* Slider */}
        <div className="w-full">
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index}>
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-50 object-cover cursor-pointer"
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Giới thiệu */}
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

          {/* Tiêu đề sản phẩm */}
          <h1 className="font-bold italic px-5 py-4 cursor-pointer text-xl text-orange-600">
            Product Type
          </h1>

          {/* Danh sách sản phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 px-4 py-6 cursor-pointer">
            {visibleProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="border border-orange-200 rounded-lg p-2 text-center shadow-sm hover:shadow-md hover:scale-105 hover:border-orange-400 transition-all duration-300 bg-white"
                variants={productVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                onClick={() => navigate(`/farmhub/product/details/${product.id}`)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 overflow-hidden">
                  {product.productName}
                </h3>
                <p className="text-orange-600 font-semibold text-sm">
                  {product.onSale
                    ? `${product.salePrice.toLocaleString()} VNĐ`
                    : `${product.price.toLocaleString()} VNĐ`}
                </p>
              </motion.div>
            ))}

            {/* Xem thêm */}
            {showLoadMore && (
              <motion.div
                className="border border-orange-200 rounded-lg p-2 text-center bg-gray-100 hover:shadow-md hover:scale-105 hover:border-orange-400 transition-all duration-300 cursor-pointer flex items-center justify-center"
                variants={productVariants}
                initial="hidden"
                animate="visible"
                custom={visibleProducts.length}
                onClick={handleLoadMore}
              >
                <p className="text-gray-600 text-sm font-medium hover:text-orange-500 transition-all duration-300">
                  Xem thêm...
                </p>
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
