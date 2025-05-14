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
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShoppingBasket,
  FaTag,
  FaLeaf,
  FaSeedling,
  FaCarrot,
} from "react-icons/fa";
import PropTypes from "prop-types";

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

  // Hiệu ứng cho sản phẩm
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

  const handleProductClick = (id) => {
    navigate(`/farmhub2/product/${id}`);
  };

  // Component hiển thị sản phẩm
  const ProductCard = ({ product, index }) => {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
        variants={productVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        onClick={() => handleProductClick(product.id)}
      >
        <div className="relative">
          <img
            src={
              product.imageUrl || "https://placehold.co/300x300?text=No+Image"
            }
            alt={product.productName}
            className="w-full h-48 object-cover transition-transform hover:scale-105 duration-300"
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
      </motion.div>
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
    index: PropTypes.number.isRequired,
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
              {/* Sản phẩm nổi bật */}
              <section className="mb-12">
                <SectionTitle
                  title="Sản phẩm nổi bật"
                  icon={<FaTag size={20} />}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {featuredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
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

              {/* Sản phẩm đang giảm giá */}
              {saleProducts.length > 0 && (
                <section className="mb-12 py-8 px-6 bg-red-50 rounded-2xl">
                  <SectionTitle
                    title="Đang giảm giá"
                    icon={<FaTag size={20} />}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {saleProducts.slice(0, 4).map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <button
                      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      onClick={() => navigate("/farmhub2/on-sale")}
                    >
                      Xem tất cả ưu đãi
                    </button>
                  </div>
                </section>
              )}

              {/* Sản phẩm mới */}
              <section className="mb-12">
                <SectionTitle
                  title="Sản phẩm mới"
                  icon={<FaLeaf size={20} />}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {newProducts.slice(0, 8).map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
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
