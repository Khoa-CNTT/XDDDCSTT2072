import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/productService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Loading from "@/components/shared/Loading";
import { queryKeys } from "@/constant/queryKeys";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ShopInfo from "@/components/product/ShopInfo";
import ReviewsSection from "@/components/product/ReviewsSection";

const ProductDetail = () => {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();

  const { data: product, isLoading } = useQuery({
    queryKey: queryKeys.productById(id),
    queryFn: () => getProductById(axiosPrivate, id),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!product) {
    return <div>Sản phẩm không tồn tại</div>;
  }

  const { productName, imageUrl, userId } = product;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Image Gallery */}
        <ProductImageGallery imageUrl={imageUrl} productName={productName} />
        {/* Product Info */}
        <ProductInfo product={product} />
      </div>
      {/* Shop Info */}
      <ShopInfo shopId={userId} />
      {/* Reviews Section */}
      <ReviewsSection/>
    </div>
  );
};

export default ProductDetail;
