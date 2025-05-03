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
  // get Category by id
  const { data: category } = useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => getCategoryById(axiosPrivate, id),
    onError: (error) => {
      console.log(error);
    },
  });
  console.log(category);

  // get Product by category
  const { data: products, isPending } = useQuery({
    queryKey: queryKeys.productsByCategory(id),
    queryFn: () => getProductsByCategory(axiosPrivate, id),
  });

  const productsByCategory = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product, index) => {
          return <Product key={index} item={product} />;
        })}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        <span className="text-xl">Danh mục:</span>{" "}
        {isPending ? (
          <Skeleton className="h-6 w-12 rounded-md bg-gray-300 inline-block" />
        ) : (
          <span>{category?.data?.name} ({category?.data.productCount})</span>
        )}
      </h1>
      {isPending ? <Loading /> : productsByCategory()}
    </div>
  );
};

export default CategoryPage;
