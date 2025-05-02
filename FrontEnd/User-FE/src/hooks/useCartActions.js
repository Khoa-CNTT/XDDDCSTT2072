import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "./useAxiosPrivate";
import {
  createCart,
  deleteCartItems,
  getCart,
  updateCartItem,
} from "@/services/cartService";
import { queryKeys } from "@/constant/queryKeys";

export const useCartActions = (product = null) => {
  const queryClient = useQueryClient();
  const axiosPrivate = useAxiosPrivate();

  // createCart
  const createCartMuation = useMutation({
    mutationFn: (quantity) => createCart(axiosPrivate, product.id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  // getCart
  const getCartQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => getCart(axiosPrivate),
  });
  // deleteCartItems
  const deleteCartItemsMuation = useMutation({
    mutationFn: (itemId) => deleteCartItems(axiosPrivate, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  // updateCartItem
  const updateCartMutation = useMutation({
    mutationFn: ({ itemId, quantity }) =>
      updateCartItem(axiosPrivate, itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  return {
    createCartMuation,
    getCartQuery,
    deleteCartItemsMuation,
    updateCartMutation,
  };
};
