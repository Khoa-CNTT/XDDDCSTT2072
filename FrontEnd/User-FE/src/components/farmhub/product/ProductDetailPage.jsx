import React from "react";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductDescription from "./ProductDescription";
import ProductReview from "./ProductReview";
import ShopInfo from "./ShopInfo";

const ProductDetailPage = () => {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProductImageGallery />
          <ProductInfo />
        </div>

        <ShopInfo />
        <ProductDescription />
        <ProductReview />
      </div>
    </>
  );
};

export default ProductDetailPage;
