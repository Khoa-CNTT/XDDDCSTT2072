import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductDescription from "./ProductDescription";
import ProductReview from "./ProductReview";
import ShopInfo from "./ShopInfo";
import Footer from "@/layout/Footer";
import Header from "@/layout/Header";
import axios from "axios";
import { useParams } from "react-router";
import { useEffect, useState } from "react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    const token = auth?.accessToken;
  
    axios
      .get("http://localhost:8080/api/v1/marketplace/product/" + id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response);
        setProduct(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);
  

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {product ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProductImageGallery product={product} />
              <ProductInfo product={product} />
            </div>
            <ShopInfo product={product} />
            <ProductDescription product={product} />
            <ProductReview product={product} />
          </>
        ) : (
          <div className="text-center text-gray-500 py-20">Đang tải dữ liệu sản phẩm...</div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
