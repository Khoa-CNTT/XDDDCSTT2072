import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { motion } from "framer-motion";
import { FaShoppingCart, FaTag, FaFire } from "react-icons/fa";
import PropTypes from "prop-types";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        // Lấy sản phẩm phổ biến
        const response = await axiosPrivate.get("/marketplace/popular", {
          params: { page: 0, size: 4 },
        });

        setProducts(response.data.content || []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [axiosPrivate]);

  if (loading) {
    return <ProductSkeleton />;
  }

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="farmhub-section-title text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaFire className="text-red-500" />
          Sản phẩm nổi bật
        </h2>
        <button
          className="farmhub-btn-outline text-sm px-4 py-2 rounded-lg"
          onClick={() => navigate("/farmhub2/popular")}
        >
          Xem tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/farmhub2/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // TODO: Logic thêm vào giỏ hàng
    console.log("Thêm vào giỏ hàng:", product.id);
  };

  return (
    <motion.div
      className="farmhub-product-card bg-white rounded-xl shadow-md overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={handleClick}
    >
      {product.onSale && (
        <div className="farmhub-sale-badge">
          <FaTag className="inline-block mr-1" size={10} />
          {Math.round(
            ((product.price - product.salePrice) / product.price) * 100
          )}
          % OFF
        </div>
      )}

      <div className="relative h-52 overflow-hidden">
        <img
          src={product.imageUrl || "https://placehold.co/300x300?text=No+Image"}
          alt={product.productName}
          className="farmhub-product-image w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
          {product.productName}
        </h3>

        <div className="flex justify-between items-center">
          <div>
            {product.onSale ? (
              <div>
                <span className="farmhub-price-sale font-bold text-lg">
                  {product.salePrice?.toLocaleString()}₫
                </span>
                <p className="farmhub-price-original text-sm">
                  {product.price?.toLocaleString()}₫
                </p>
              </div>
            ) : (
              <span className="farmhub-price text-lg">
                {product.price?.toLocaleString()}₫
              </span>
            )}
          </div>

          <button
            className="farmhub-btn-gradient-green p-2 rounded-full hover:scale-110 transition-transform"
            onClick={handleAddToCart}
          >
            <FaShoppingCart size={16} />
          </button>
        </div>
      </div>
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
    onSale: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const ProductSkeleton = () => {
  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="h-52 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
