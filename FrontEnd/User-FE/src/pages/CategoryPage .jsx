import { queryKeys } from "@/constant/queryKeys";
import { getCategoryById } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

const CategoryPage = () => {
  const { id } = useParams();
  const { data: category } = useQuery({
    queryKey: queryKeys.category,
    queryFn: () => getCategoryById(id),
  });
  console.log(category);

  return <div>{id}</div>;
};

export default CategoryPage;
