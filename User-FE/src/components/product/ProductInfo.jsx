import { Button } from "@/components/ui/Button";
import { useCartActions } from "@/hooks/useCartActions";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
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

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{productName}</h1>

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
