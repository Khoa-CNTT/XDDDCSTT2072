import Product from "@/components/farmhub2/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/constant/queryKeys";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { searchProducts } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";

const SearchPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword");

  const { data: products, isLoading } = useQuery({
    queryKey: queryKeys.searchProducts(keyword),
    queryFn: () => searchProducts(axiosPrivate, keyword),
    enabled: !!keyword, // call when have keyword
  });
  console.log(products);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-medium mb-2">
          Kết quả tìm kiếm cho từ khóa:{" "}
          <span className="text-2xl font-bold">"{keyword}</span>"
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Hiển thị Skeleton loader cho các sản phẩm */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full">
              <Skeleton className="h-26 w-full rounded-lg bg-gray-300 " />
              <Skeleton className="mt-2 h-6 w-24 rounded-lg bg-gray-300 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-medium">
          Kết quả tìm kiếm cho từ khóa:{" "}
          <span className="text-2xl font-bold text-green-700">"{keyword}"</span>
        </h1>
        <p className="text-gray-600 text-xl font-bold">
          Số lượng sản phẩm: {products.length}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <Product key={product.id} item={product} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
