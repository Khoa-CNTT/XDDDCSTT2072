import { useState, useEffect } from "react";
import Footer from "@/layout/Footer";
import Header from "@/layout/Header";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import farmHub_bg_2 from "@/assets/images/farmHub_bg_2.jpg";
import farmHub_bg_3 from "@/assets/images/farmHub_bg_3.jpg";
import farmHub_bg_4 from "@/assets/images/farmHub_bg_4.jpg";
import { Outlet, useNavigate } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShoppingBasket,
  FaTag,
  FaLeaf,
  FaSeedling,
  FaCarrot,
  FaFire,
  FaBolt,
  FaClock,
} from "react-icons/fa";
import PropTypes from "prop-types";

// Add global styles
import "@/assets/css/flashSale.css";

const slides = [
  {
    image: farmHub_bg_2,
    title: "Sản phẩm nông nghiệp chất lượng cao",
    description:
      "Nguồn sản phẩm được lựa chọn kỹ lưỡng từ các nhà cung cấp uy tín",
  },
  {
    image: farmHub_bg_3,
    title: "Giảm giá đặc biệt mỗi tuần",
    description: "Cập nhật thường xuyên ưu đãi hấp dẫn cho các sản phẩm",
  },
  {
    image: farmHub_bg_4,
    title: "Giao hàng tận nơi toàn quốc",
    description: "Đặt hàng dễ dàng, nhận sản phẩm nhanh chóng",
  },
];

const FarmHub2 = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState({
    hours: 5,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Lấy sản phẩm phổ biến
        const popularRes = await axiosPrivate.get("/marketplace/popular", {
          params: { page: 0, size: 6 },
        });

        // Lấy sản phẩm mới nhất
        const recentRes = await axiosPrivate.get(
          "/marketplace/recently-updated",
          {
            params: { page: 0, size: 8 },
          }
        );

        // Lấy sản phẩm đang giảm giá
        const saleRes = await axiosPrivate.get("/marketplace/on-sale", {
          params: { page: 0, size: 8 },
        });

        setFeaturedProducts(popularRes.data.content || []);
        setNewProducts(recentRes.data.content || []);
        setSaleProducts(saleRes.data.content || []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [axiosPrivate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTimeLeft((prev) => {
        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        if (newHours < 0) {
          return { hours: 5, minutes: 0, seconds: 0 };
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  const handleProductClick = (id) => {
    navigate(`/farmhub2/product/${id}`);
  };

  // Component hiển thị sản phẩm
  const ProductCard = ({ product }) => {
    return (
      <div
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500"
        onClick={() => handleProductClick(product.id)}
      >
        <div className="relative">
          <img
            src={
              product.imageUrl || "https://placehold.co/300x300?text=No+Image"
            }
            alt={product.productName}
            className="w-full h-48 object-cover transition-transform hover:scale-105 duration-700"
          />
          {product.onSale && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SALE
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 h-14">
            {product.productName}
          </h3>
          <div className="flex justify-between items-end mt-2">
            <div>
              {product.onSale ? (
                <div>
                  <span className="text-gray-500 line-through text-sm">
                    {product.price.toLocaleString()}đ
                  </span>
                  <p className="text-red-500 font-bold">
                    {product.salePrice.toLocaleString()}đ
                  </p>
                </div>
              ) : (
                <p className="text-green-600 font-bold">
                  {product.price.toLocaleString()}đ
                </p>
              )}
            </div>
            <div className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600">
              <FaShoppingBasket />
            </div>
          </div>
        </div>
      </div>
    );
  };

  ProductCard.propTypes = {
    product: PropTypes.shape({
      id: PropTypes.number.isRequired,
      productName: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      price: PropTypes.number.isRequired,
      salePrice: PropTypes.number,
      onSale: PropTypes.bool,
    }).isRequired,
  };

  // Component hiển thị sản phẩm cho Flash Sale với hiệu ứng chậm
  const FlashSaleProductCard = ({ product }) => {
    return (
      <div
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all flash-sale-item"
        onClick={() => handleProductClick(product.id)}
      >
        <div className="relative">
          <img
            src={
              product.imageUrl || "https://placehold.co/300x300?text=No+Image"
            }
            alt={product.productName}
            className="w-full h-48 object-cover transition-transform"
          />
          {product.onSale && (
            <div className="absolute top-0 right-0">
              <div className="bg-red-500 text-white font-bold px-4 py-2 rounded-bl-lg flex items-center">
                <FaBolt className="mr-1 text-yellow-300 slow-pulse" />
                <span>
                  {Math.round(
                    ((product.price - product.salePrice) / product.price) * 100
                  )}
                  %
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 h-14">
            {product.productName}
          </h3>
          <div className="flex justify-between items-end mt-2">
            <div>
              {product.onSale && (
                <div>
                  <span className="text-gray-500 line-through text-sm">
                    {product.price.toLocaleString()}đ
                  </span>
                  <p className="text-red-500 font-bold">
                    {product.salePrice.toLocaleString()}đ
                  </p>
                </div>
              )}
            </div>
            <div className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600">
              <FaShoppingBasket />
            </div>
          </div>
        </div>
      </div>
    );
  };

  FlashSaleProductCard.propTypes = {
    product: PropTypes.shape({
      id: PropTypes.number.isRequired,
      productName: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      price: PropTypes.number.isRequired,
      salePrice: PropTypes.number,
      onSale: PropTypes.bool,
    }).isRequired,
  };

  const SectionTitle = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-6">
      <span className="bg-green-100 p-2 rounded-full text-green-600">
        {icon}
      </span>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );

  SectionTitle.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <div className="flex-1">
        <Header />

        {/* Banner Slider */}
        <div className="w-full mb-8 mt-16">
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index} className="relative">
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center px-16">
                  <h2 className="text-white text-4xl font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-white text-xl">{slide.description}</p>
                  <button
                    className="bg-green-500 text-white py-2 px-6 rounded-lg mt-6 hover:bg-green-600 transition-colors w-fit"
                    onClick={() => navigate("/farmhub2")}
                  >
                    Khám phá ngay
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Thể loại quicklinks */}
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CategoryButton
              title="Hạt giống"
              icon={<FaSeedling size={24} />}
              color="from-green-400 to-green-600"
              onClick={() => navigate("/farmhub2/category/1")}
            />
            <CategoryButton
              title="Phân bón"
              icon={<FaLeaf size={24} />}
              color="from-blue-400 to-blue-600"
              onClick={() => navigate("/farmhub2/category/2")}
            />
            <CategoryButton
              title="Thuốc bảo vệ"
              icon={<FaTag size={24} />}
              color="from-yellow-400 to-yellow-600"
              onClick={() => navigate("/farmhub2/category/3")}
            />
            <CategoryButton
              title="Rau củ quả"
              icon={<FaCarrot size={24} />}
              color="from-red-400 to-red-600"
              onClick={() => navigate("/farmhub2/category/4")}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 mb-10">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            </div>
          ) : (
            <>
              {/* Sản phẩm đang giảm giá - Moved to the top for better visibility */}
              {saleProducts.length > 0 && (
                <section className="mb-12 bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl overflow-hidden border-2 border-yellow-300 shadow-xl">
                  <div className="py-8 px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                      <div className="flex items-center">
                        <div className="bg-white rounded-full p-3 mr-4 shadow-md">
                          <FaFire
                            size={24}
                            className="text-red-500 animate-pulse"
                          />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white flex items-center text-shadow">
                            FLASH SALE{" "}
                            <FaBolt className="ml-2 text-yellow-300" />
                          </h2>
                          <p className="text-white font-medium">
                            Ưu đãi đặc biệt - Số lượng có hạn
                          </p>
                        </div>
                      </div>

                      {/* Countdown timer */}
                      <div className="flex items-center bg-white px-5 py-3 rounded-lg shadow-md">
                        <FaClock className="text-red-500 mr-3" />
                        <span className="text-red-600 font-bold mr-3">
                          Kết thúc sau:
                        </span>
                        <div className="flex ml-2">
                          <div className="bg-red-500 text-white font-bold px-3 py-2 rounded shadow-sm mx-1">
                            {String(flashSaleTimeLeft.hours).padStart(2, "0")}
                          </div>
                          <span className="text-red-600 font-bold text-xl mx-1">
                            :
                          </span>
                          <div className="bg-red-500 text-white font-bold px-3 py-2 rounded shadow-sm mx-1">
                            {String(flashSaleTimeLeft.minutes).padStart(2, "0")}
                          </div>
                          <span className="text-red-600 font-bold text-xl mx-1">
                            :
                          </span>
                          <div className="bg-red-500 text-white font-bold px-3 py-2 rounded shadow-sm mx-1">
                            {String(flashSaleTimeLeft.seconds).padStart(2, "0")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {saleProducts.slice(0, 4).map((product) => (
                        <FlashSaleProductCard
                          key={product.id}
                          product={product}
                        />
                      ))}
                    </div>
                    <div className="text-center mt-8">
                      <button
                        className="bg-white text-red-500 px-8 py-3 rounded-lg hover:bg-red-50 transition-colors font-bold shadow-md"
                        onClick={() => navigate("/farmhub2/on-sale")}
                      >
                        Xem tất cả ưu đãi
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Sản phẩm nổi bật */}
              <section className="mb-12">
                <SectionTitle
                  title="Sản phẩm nổi bật"
                  icon={<FaTag size={20} />}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <button
                    className="bg-white border border-green-500 text-green-500 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors"
                    onClick={() => navigate("/farmhub2")}
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              </section>

              {/* Sản phẩm mới */}
              <section className="mb-12">
                <SectionTitle
                  title="Sản phẩm mới"
                  icon={<FaLeaf size={20} />}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {newProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <button
                    className="bg-white border border-green-500 text-green-500 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors"
                    onClick={() => navigate("/farmhub2/recently-updated")}
                  >
                    Xem thêm sản phẩm mới
                  </button>
                </div>
              </section>

              {/* Outlet cho các trang con */}
              <Outlet />
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Component nút danh mục
const CategoryButton = ({ title, icon, color, onClick }) => (
  <button
    className={`bg-gradient-to-r ${color} text-white rounded-xl p-4 flex flex-col items-center justify-center h-32 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}
    onClick={onClick}
  >
    <div className="mb-2">{icon}</div>
    <h3 className="font-bold">{title}</h3>
  </button>
);

CategoryButton.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

// Custom arrows cho slider
const CustomPrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-80"
      onClick={onClick}
    >
      <FaChevronLeft className="text-gray-800" />
    </button>
  );
};

CustomPrevArrow.propTypes = {
  onClick: PropTypes.func,
};

const CustomNextArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-80"
      onClick={onClick}
    >
      <FaChevronRight className="text-gray-800" />
    </button>
  );
};

CustomNextArrow.propTypes = {
  onClick: PropTypes.func,
};

export default FarmHub2;
