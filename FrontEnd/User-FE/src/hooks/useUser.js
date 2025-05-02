import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "./useAxiosPrivate";
import { queryKeys } from "@/constant/queryKeys";
import { getUserById } from "@/services/userService";

export const useUserActions = (id) => {
  const axiosPrivate = useAxiosPrivate();

  const userByIdQuery = useQuery({
    queryKey: queryKeys.userById(id),
    queryFn: () => getUserById(axiosPrivate, id),
  });
  return { userByIdQuery };
};
