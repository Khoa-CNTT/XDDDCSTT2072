import React from "react";
import Product from "@/components/farmhub2/Product";
import Loading from "@/components/shared/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/constant/queryKeys";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  getCategoryById,
  getProductsByCategory,
} from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

const CategoryPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const { id } = useParams();
  
  // Lấy thông tin danh mục
  const { 
    data: categoryResponse, 
    isLoading: isCategoryLoading,
    error: categoryError 
  } = useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => getCategoryById(axiosPrivate, id),
    onError: (error) => {
      console.log("Category error:", error);
    },
  });
  
  // Truy xuất dữ liệu danh mục đúng cách
  const category = categoryResponse?.data;
  
  // Lấy sản phẩm theo danh mục
  const { 
    data: products, 
    isLoading: isProductsLoading,
    error: productsError
  } = useQuery({
    queryKey: queryKeys.productsByCategory(id),
    queryFn: () => getProductsByCategory(axiosPrivate, id),
    onError: (error) => {
      console.log("Products error:", error);
    },
  });
  
  // Kiểm tra trạng thái loading tổng hợp
  const isLoading = isCategoryLoading || isProductsLoading;
  
  // Hiển thị các sản phẩm theo danh mục
  const renderProducts = () => {
    if (productsError) {
      return (
        <div className="py-10 text-center text-red-500">
          Lỗi khi tải sản phẩm: {productsError.message}
        </div>
      );
    }
    
    if (!products || products.length === 0) {
      return (
        <div className="py-10 text-center text-gray-500">
          Không có sản phẩm nào trong danh mục này
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <Product key={index} item={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hiển thị tiêu đề danh mục */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <span className="text-xl mr-2">Danh mục:</span>
          {isLoading ? (
            <Skeleton className="h-8 w-40 rounded-md bg-gray-300 inline-block" />
          ) : categoryError ? (
            <span className="text-red-500">Lỗi tải danh mục</span>
          ) : !category ? (
            <span className="text-gray-500">Không tìm thấy danh mục</span>
          ) : (
            <span>
              {category.name} 
              {category.productCount !== null && 
                <span className="text-gray-500 ml-2">({category.productCount} sản phẩm)</span>
              }
            </span>
          )}
        </h1>
        
        {/* Hiển thị mô tả danh mục nếu có */}
        {!isLoading && category?.description && (
          <p className="text-gray-600 mb-4">{category.description}</p>
        )}
      </div>
      
      {/* Hiển thị sản phẩm hoặc loading */}
      {isLoading ? <Loading /> : renderProducts()}
    </div>
  );
};

export default CategoryPage;