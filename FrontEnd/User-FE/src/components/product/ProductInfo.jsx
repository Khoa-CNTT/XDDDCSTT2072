import { Button } from "@/components/ui/Button";
import { useCartActions } from "@/hooks/useCartActions";
import { useState, useEffect } from "react";
import { Minus, Plus, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  addToDefaultWishlist,
  getUserWishlists,
} from "@/services/wishlistService";

const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const {
    id: productId,
    productName,
    onSale,
    salePrice,
    price,
    quantity: stock,
    description,
    imageUrl,
  } = product;

  const { createCartMuation } = useCartActions(product);
  const [quantity, setQuantity] = useState(1);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Kiểm tra xem sản phẩm đã được yêu thích chưa
  useEffect(() => {
    if (auth?.accessToken) {
      const checkWishlistStatus = async () => {
        try {
          const wishlists = await getUserWishlists(axiosPrivate);
          if (wishlists && wishlists.length > 0) {
            // Lấy wishlist mặc định
            const defaultWishlist = wishlists.find((w) => w.isDefault === true);
            if (defaultWishlist && defaultWishlist.items) {
              // Kiểm tra nếu sản phẩm đã tồn tại trong wishlist
              const found = defaultWishlist.items.some(
                (item) => item.productId === productId
              );
              setIsInWishlist(found);
            }
          }
        } catch (error) {
          console.error("Không thể kiểm tra trạng thái wishlist:", error);
        }
      };

      checkWishlistStatus();
    }
  }, [auth?.accessToken, productId, axiosPrivate]);

  const handleIncrease = () => {
    if (quantity < stock) setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleClickAddCart = () => {
    // Kiểm tra đăng nhập
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/account/login", {
        state: { from: { pathname: `/farmhub2/product/${productId}` } },
      });
      return;
    }

    createCartMuation.mutate(quantity, {
      onSuccess: () => {
        toast.success("Sản phẩm đã được thêm vào giỏ hàng");
      },
      onError: (error) => {
        toast.error(error.response?.data?.errorMessage || "Something wrong");
      },
    });
  };

  // Xử lý Mua ngay - chuyển thẳng đến checkout với sản phẩm hiện tại
  const handleBuyNow = () => {
    // Kiểm tra đăng nhập
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để mua sản phẩm");
      navigate("/account/login", {
        state: { from: { pathname: `/farmhub2/product/${productId}` } },
      });
      return;
    }

    // Dùng state để chuyển thông tin sản phẩm đến trang checkout
    const actualPrice = onSale ? salePrice : price;

    navigate("/checkout", {
      state: {
        buyNow: true,
        product: {
          productId,
          productName,
          quantity,
          unitPrice: actualPrice,
          productImage: imageUrl,
          totalPrice: actualPrice * quantity,
        },
      },
    });
  };

  // Xử lý thêm sản phẩm vào danh sách yêu thích
  const handleAddToWishlist = async () => {
    // Kiểm tra đăng nhập
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích");
      navigate("/account/login", {
        state: { from: { pathname: `/farmhub2/product/${productId}` } },
      });
      return;
    }

    try {
      setAddingToWishlist(true);
      console.log("Chuẩn bị thêm sản phẩm vào wishlist, productId:", productId);
      console.log("Thông tin auth:", auth?.user?.id);

      // Chuẩn bị dữ liệu sản phẩm cần thêm vào wishlist
      const wishlistItem = {
        productId: productId,
        variantId: null, // Có thể thêm logic chọn variant nếu cần
      };

      console.log("Dữ liệu item gửi đi:", wishlistItem);

      // Gọi service để thêm vào danh sách yêu thích mặc định
      const response = await addToDefaultWishlist(axiosPrivate, wishlistItem);
      console.log("Phản hồi từ API:", response);

      setIsInWishlist(true);
      toast.success("Đã thêm vào danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi khi thêm vào danh sách yêu thích:", error);
      console.error("Chi tiết lỗi:", error.response?.data);

      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("đã tồn tại")
      ) {
        setIsInWishlist(true);
        toast.info("Sản phẩm đã có trong danh sách yêu thích");
      } else {
        toast.error("Không thể thêm vào danh sách yêu thích");
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{productName}</h1>
          <Button
            variant={isInWishlist ? "default" : "ghost"}
            size="lg"
            className={`rounded-full p-3 transition-all ${
              isInWishlist
                ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                : "hover:bg-red-50 border border-red-300 shadow-sm"
            }`}
            onClick={handleAddToWishlist}
            disabled={addingToWishlist}
          >
            <Heart
              size={24}
              className={
                isInWishlist ? "text-white fill-white" : "text-red-500"
              }
              fill={isInWishlist ? "currentColor" : "none"}
            />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {onSale ? (
            <>
              <p className="text-2xl text-red-500 font-semibold">
                {salePrice.toLocaleString()}₫
              </p>
              <p className="text-lg text-gray-500 line-through">
                {price.toLocaleString()}₫
              </p>
            </>
          ) : (
            <p className="text-2xl text-red-500 font-semibold">
              {price.toLocaleString()}₫
            </p>
          )}
        </div>

        <div className="text-sm text-gray-700 leading-relaxed">
          <p>{description}</p>
        </div>

        <div className="flex gap-6 text-gray-600 text-sm items-center">
          <p>Sản phẩm có sẵn: {stock}</p>
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDecrease}
              className="h-8 w-8 p-0"
            >
              <Minus size={16} />
            </Button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 1 && value <= stock) {
                  setQuantity(value);
                } else if (value > stock) {
                  setQuantity(stock);
                } else if (value < 1) {
                  setQuantity(1);
                }
              }}
              className="w-12 text-center text-sm border-x outline-none"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={handleIncrease}
              className="h-8 w-8 p-0"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          onClick={handleClickAddCart}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-xl"
        >
          Thêm vào giỏ hàng
        </Button>

        <Button
          onClick={handleBuyNow}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
