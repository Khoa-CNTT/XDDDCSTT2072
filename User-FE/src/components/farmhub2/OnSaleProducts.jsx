import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { motion } from "framer-motion";
import { FaShoppingCart, FaTags, FaFire, FaPercent } from "react-icons/fa";
import PropTypes from "prop-types";

const OnSaleProducts = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnSaleProducts = async () => {
      setLoading(true);
      try {
        // Lấy sản phẩm đang giảm giá
        const response = await axiosPrivate.get("/marketplace/on-sale", {
          params: { page: 0, size: 6 },
        });

        setProducts(response.data.content || []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm đang giảm giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnSaleProducts();
  }, [axiosPrivate]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 mb-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white opacity-10 rounded-full transform -translate-y-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <FaFire className="text-yellow-300" />
              Khuyến mãi đặc biệt
            </h2>
            <p className="text-white text-opacity-80">
              Tiết kiệm đến 50% với các sản phẩm đang khuyến mãi!
            </p>
          </div>
          <button
            className="bg-white px-6 py-3 rounded-lg text-red-500 font-bold hover:bg-opacity-90 transition-all shadow-lg flex items-center gap-2"
            onClick={() => navigate("/farmhub2/on-sale")}
          >
            <FaTags />
            Xem tất cả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const discount = Math.round(
    ((product.price - product.salePrice) / product.price) * 100
  );

  const handleClick = () => {
    navigate(`/farmhub2/product/${product.id}`);
  };

  return (
    <motion.div
      className="farmhub-product-card bg-white rounded-xl shadow-md overflow-hidden relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onClick={handleClick}
    >
      {/* Badge khuyến mãi */}
      <div className="absolute top-3 left-0 bg-red-500 text-white px-3 py-1 rounded-r-full text-sm font-bold z-10 shadow-md flex items-center">
        <FaPercent className="mr-1" size={12} />
        <span>Giảm {discount}%</span>
      </div>

      {/* Ảnh sản phẩm */}
      <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40 z-10"></div>
        <img
          src={product.imageUrl || "https://placehold.co/300x300?text=No+Image"}
          alt={product.productName}
          className="farmhub-product-image w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 z-20">
          <span className="bg-white bg-opacity-90 text-red-500 font-bold px-2 py-1 rounded-lg text-sm">
            {product.salePrice?.toLocaleString()}₫
          </span>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-1">
          {product.productName}
        </h3>

        <div className="flex justify-between items-end">
          <div>
            <span className="farmhub-price-original text-xs">
              {product.price?.toLocaleString()}₫
            </span>
            <div className="text-xs text-green-600">
              Tiết kiệm: {(product.price - product.salePrice)?.toLocaleString()}
              ₫
            </div>
          </div>

          <div className="bg-red-500 text-white p-1 rounded-full">
            <FaShoppingCart size={14} />
          </div>
        </div>
      </div>

      {/* Flash animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 animate-pulse opacity-0 hover:opacity-10 transition-opacity"></div>
    </motion.div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number,
    productName: PropTypes.string,
    imageUrl: PropTypes.string,
    price: PropTypes.number,
    salePrice: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const ProductSkeleton = () => {
  return (
    <div className="py-8">
      <div className="bg-gradient-to-r from-red-300 to-orange-300 rounded-2xl p-8 mb-8 animate-pulse">
        <div className="h-12 w-48 bg-white bg-opacity-30 rounded-lg mb-2"></div>
        <div className="h-6 w-72 bg-white bg-opacity-30 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="h-40 bg-gray-200 animate-pulse"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnSaleProducts;
