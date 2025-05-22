import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Heart,
  Trash2,
  ShoppingCart,
  Plus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import {
  getUserWishlists,
  createWishlist,
  deleteWishlist,
  removeItemFromWishlist,
} from "@/services/wishlistService";

const Wishlist = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWishlistId, setSelectedWishlistId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newWishlistName, setNewWishlistName] = useState("");
  const [isCreatingWishlist, setIsCreatingWishlist] = useState(false);

  // Tải danh sách yêu thích của người dùng
  useEffect(() => {
    const fetchWishlists = async () => {
      if (!auth?.user) {
        navigate("/account/login");
        return;
      }

      try {
        setLoading(true);
        const wishlistData = await getUserWishlists(axiosPrivate);
        console.log("Dữ liệu danh sách yêu thích:", wishlistData);

        if (Array.isArray(wishlistData) && wishlistData.length > 0) {
          // Kiểm tra và xử lý dữ liệu để đảm bảo items được hiển thị đúng
          const processedWishlists = wishlistData.map((wishlist) => {
            // Nếu không có mảng items hoặc items rỗng nhưng có productItems, sử dụng productItems
            if (!wishlist.items || wishlist.items.length === 0) {
              if (wishlist.productItems && wishlist.productItems.length > 0) {
                return {
                  ...wishlist,
                  items: wishlist.productItems,
                };
              }
              // Kiểm tra nếu có thuộc tính products
              if (wishlist.products && wishlist.products.length > 0) {
                return {
                  ...wishlist,
                  items: wishlist.products,
                };
              }
            }
            return wishlist;
          });

          console.log("Danh sách sau khi xử lý:", processedWishlists);
          setWishlists(processedWishlists);

          // Chọn danh sách đầu tiên làm mặc định
          setSelectedWishlistId(processedWishlists[0].id);
        } else {
          setWishlists([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
        toast.error("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, [auth, navigate, axiosPrivate]);

  // Tạo danh sách yêu thích mới
  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast.error("Vui lòng nhập tên cho danh sách yêu thích");
      return;
    }

    try {
      const result = await createWishlist(axiosPrivate, {
        name: newWishlistName,
        description: `Danh sách yêu thích: ${newWishlistName}`,
      });

      toast.success("Tạo danh sách yêu thích mới thành công!");
      setWishlists([...wishlists, result]);
      setSelectedWishlistId(result.id);
      setNewWishlistName("");
      setIsCreatingWishlist(false);
    } catch (error) {
      console.error("Lỗi khi tạo danh sách yêu thích mới:", error);
      toast.error("Không thể tạo danh sách yêu thích. Vui lòng thử lại sau.");
    }
  };

  // Xóa danh sách yêu thích
  const handleDeleteWishlist = async (wishlistId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa danh sách yêu thích này không?"
      )
    ) {
      return;
    }

    try {
      await deleteWishlist(axiosPrivate, wishlistId);
      toast.success("Đã xóa danh sách yêu thích");

      // Cập nhật lại danh sách sau khi xóa
      const updatedWishlists = wishlists.filter(
        (list) => list.id !== wishlistId
      );
      setWishlists(updatedWishlists);

      // Nếu xóa danh sách đang được chọn, chuyển sang danh sách khác
      if (selectedWishlistId === wishlistId) {
        if (updatedWishlists.length > 0) {
          setSelectedWishlistId(updatedWishlists[0].id);
        } else {
          setSelectedWishlistId(null);
        }
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh sách yêu thích:", error);
      toast.error("Không thể xóa danh sách yêu thích. Vui lòng thử lại sau.");
    }
  };

  // Xóa sản phẩm khỏi danh sách yêu thích
  const handleRemoveFromWishlist = async (wishlistId, productId) => {
    try {
      console.log(
        `Đang xóa sản phẩm ID ${productId} khỏi danh sách ID ${wishlistId}`
      );

      await removeItemFromWishlist(axiosPrivate, wishlistId, productId);
      toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");

      // Cập nhật UI sau khi xóa sản phẩm
      const updatedWishlists = wishlists.map((wishlist) => {
        if (wishlist.id === wishlistId) {
          return {
            ...wishlist,
            items: Array.isArray(wishlist.items)
              ? wishlist.items.filter((item) => {
                  const itemId = getProductId(item);
                  return itemId !== productId;
                })
              : [],
          };
        }
        return wishlist;
      });

      setWishlists(updatedWishlists);
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích:", error);
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product) => {
    // Logic thêm vào giỏ hàng sẽ được implement sau
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  // Lọc sản phẩm trong danh sách đang chọn theo từ khóa tìm kiếm
  const getFilteredItems = () => {
    const selectedWishlist = wishlists.find(
      (list) => list.id === selectedWishlistId
    );

    if (!selectedWishlist) return [];

    console.log("Đang xử lý danh sách yêu thích:", selectedWishlist);

    // Kiểm tra cấu trúc dữ liệu và xử lý các trường hợp khác nhau
    let items = [];

    // Trường hợp 1: Có sẵn mảng items
    if (
      Array.isArray(selectedWishlist.items) &&
      selectedWishlist.items.length > 0
    ) {
      items = selectedWishlist.items;
      console.log("Lấy dữ liệu từ trường items:", items);
    }
    // Trường hợp 2: Có trường productItems
    else if (
      Array.isArray(selectedWishlist.productItems) &&
      selectedWishlist.productItems.length > 0
    ) {
      items = selectedWishlist.productItems;
      console.log("Lấy dữ liệu từ trường productItems:", items);
    }
    // Trường hợp 3: Có trường products
    else if (
      Array.isArray(selectedWishlist.products) &&
      selectedWishlist.products.length > 0
    ) {
      items = selectedWishlist.products;
      console.log("Lấy dữ liệu từ trường products:", items);
    }
    // Trường hợp 4: Kiểm tra các cấu trúc dữ liệu lồng nhau
    else if (
      selectedWishlist.data &&
      Array.isArray(selectedWishlist.data.items) &&
      selectedWishlist.data.items.length > 0
    ) {
      items = selectedWishlist.data.items;
      console.log("Lấy dữ liệu từ cấu trúc lồng nhau data.items:", items);
    }

    console.log("Danh sách sản phẩm cuối cùng:", items);

    // Nếu không tìm thấy mảng items nào có dữ liệu
    if (items.length === 0) {
      console.error(
        "Không tìm thấy dữ liệu sản phẩm trong danh sách yêu thích:",
        selectedWishlist
      );
      return [];
    }

    // Lọc theo từ khóa tìm kiếm
    return items.filter((item) => {
      const itemName = item.name || item.productName || "";
      const itemDesc = item.description || "";
      return (
        itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemDesc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // Lấy URL ảnh đúng cho sản phẩm
  const getProductImageUrl = (item) => {
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    if (item.productImage) return item.productImage;

    const id = item.id || item.productId;
    if (id) {
      // Đường dẫn đúng đến API ảnh sản phẩm
      return `/api/v1/marketplace/products/${id}/image`;
    }

    return "/placeholder-product.jpg";
  };

  // Lấy giá sản phẩm đã được định dạng
  const getFormattedPrice = (item) => {
    // Kiểm tra nhiều nguồn giá có thể có
    let price = null;

    // Kiểm tra các trường giá khác nhau
    if (item.price !== undefined && item.price !== null) {
      price = item.price;
    } else if (item.unitPrice !== undefined && item.unitPrice !== null) {
      price = item.unitPrice;
    } else if (item.product && item.product.price) {
      price = item.product.price;
    } else if (item.productPrice !== undefined && item.productPrice !== null) {
      price = item.productPrice;
    }

    // Debug
    console.log("Thông tin giá sản phẩm:", {
      item: item,
      extractedPrice: price,
    });

    // Nếu giá là 0, thử tìm giá ở các trường khác
    if (price === 0 || price === null) {
      // Tìm bất kỳ trường nào có thể chứa giá
      for (const key in item) {
        if (
          typeof item[key] === "number" &&
          key.toLowerCase().includes("price") &&
          item[key] > 0
        ) {
          price = item[key];
          console.log("Tìm thấy giá ở trường:", key, price);
          break;
        }
      }
    }

    // Vẫn sử dụng 0 là giá mặc định nếu không tìm thấy giá
    return `${(price || 0).toLocaleString("vi-VN")}đ`;
  };

  // Lấy ID sản phẩm chính xác
  const getProductId = (item) => {
    // Debug để xem cấu trúc dữ liệu
    console.log("Cấu trúc dữ liệu item:", item);

    // Trường hợp API trả về đúng cấu trúc WishlistItemDTO (productId riêng biệt)
    if (item.productId !== undefined && item.productId !== null) {
      console.log("Lấy productId riêng:", item.productId);
      return item.productId;
    }

    // Trường hợp item là MarketPlace hay Product trực tiếp
    if (item.id) {
      console.log("Lấy id trực tiếp:", item.id);
      return item.id;
    }

    // Trường hợp có product lồng bên trong
    if (item.product && item.product.id) {
      console.log("Lấy product.id:", item.product.id);
      return item.product.id;
    }

    console.error("Không thể xác định ID sản phẩm:", item);
    return null;
  };

  // Lấy tên sản phẩm
  const getProductName = (item) => {
    return item.name || item.productName || "Sản phẩm không có tên";
  };

  // Lấy giá sản phẩm từ API
  const fetchProductPrice = async (productId) => {
    try {
      const response = await axiosPrivate.get(
        `/api/v1/marketplace/products/${productId}`
      );
      if (response.data) {
        console.log(
          "Lấy giá từ API cho sản phẩm ID:",
          productId,
          response.data
        );
        return response.data.price || 0;
      }
      return 0;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin giá sản phẩm:", error);
      return 0;
    }
  };

  // Cập nhật giá sản phẩm trong danh sách
  const updateProductPrice = async (wishlistId, productId, newPrice) => {
    setWishlists((prev) => {
      return prev.map((wishlist) => {
        if (wishlist.id === wishlistId) {
          return {
            ...wishlist,
            items: Array.isArray(wishlist.items)
              ? wishlist.items.map((item) => {
                  const itemId = item.id || item.productId;
                  if (itemId === productId) {
                    return { ...item, price: newPrice };
                  }
                  return item;
                })
              : [],
          };
        }
        return wishlist;
      });
    });
  };

  // Effect để cập nhật giá sản phẩm nếu không có giá
  useEffect(() => {
    const updatePrices = async () => {
      if (!selectedWishlistId) return;

      const selectedWishlist = wishlists.find(
        (list) => list.id === selectedWishlistId
      );
      if (!selectedWishlist || !Array.isArray(selectedWishlist.items)) return;

      for (const item of selectedWishlist.items) {
        const itemId = item.id || item.productId;
        const hasPrice =
          item.price || item.unitPrice || (item.product && item.product.price);

        if (!hasPrice && itemId) {
          console.log("Cần cập nhật giá cho sản phẩm:", itemId);
          const price = await fetchProductPrice(itemId);
          if (price > 0) {
            updateProductPrice(selectedWishlistId, itemId, price);
          }
        }
      }
    };

    updatePrices();
  }, [selectedWishlistId, wishlists]);

  // Render UI
  return (
    <>
      <Header />
      <main className="container mx-auto py-6 px-4 mt-20">
        <div className="flex flex-col gap-6">
          {/* Tiêu đề trang */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="text-red-500" />
              Danh sách yêu thích của tôi
            </h1>

            {/* Nút tạo danh sách mới */}
            {!isCreatingWishlist ? (
              <Button
                onClick={() => setIsCreatingWishlist(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo danh sách mới
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Tên danh sách mới..."
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  className="w-48 md:w-60"
                />
                <Button onClick={handleCreateWishlist}>Tạo mới</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingWishlist(false);
                    setNewWishlistName("");
                  }}
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>

          {/* Hiển thị trạng thái loading */}
          {loading && (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          {/* Hiển thị khi không có danh sách yêu thích nào */}
          {!loading && (!wishlists || wishlists.length === 0) && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Chưa có danh sách yêu thích nào
              </h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Bạn chưa tạo danh sách yêu thích nào. Hãy tạo danh sách mới để
                lưu các sản phẩm yêu thích.
              </p>
              <Button
                onClick={() => setIsCreatingWishlist(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo danh sách yêu thích đầu tiên
              </Button>
            </div>
          )}

          {/* Hiển thị danh sách yêu thích */}
          {!loading && wishlists && wishlists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Sidebar chứa các danh sách */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
                    Danh sách của tôi
                  </h2>
                  <ul className="space-y-1">
                    {wishlists.map((list) => (
                      <li key={list.id}>
                        <div
                          className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                            selectedWishlistId === list.id
                              ? "bg-gray-100 border-l-4 border-green-500"
                              : ""
                          }`}
                          onClick={() => setSelectedWishlistId(list.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Heart
                              size={16}
                              className={
                                selectedWishlistId === list.id
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }
                            />
                            <span>{list.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {list.items?.length || 0}
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWishlist(list.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nội dung danh sách yêu thích */}
              <div className="md:col-span-9">
                <div className="bg-white rounded-lg shadow-md p-6">
                  {/* Tìm kiếm trong danh sách đang chọn */}
                  <div className="mb-6 relative">
                    <Input
                      placeholder="Tìm kiếm trong danh sách yêu thích..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  {/* Hiển thị sản phẩm trong danh sách */}
                  {selectedWishlistId && (
                    <>
                      <h3 className="text-xl font-semibold mb-4">
                        {wishlists.find(
                          (list) => list.id === selectedWishlistId
                        )?.name || "Danh sách yêu thích"}
                      </h3>

                      {getFilteredItems().length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-6 h-6 text-gray-400" />
                          </div>
                          {searchTerm ? (
                            <>
                              <h4 className="text-lg font-medium mb-2">
                                Không tìm thấy sản phẩm nào
                              </h4>
                              <p className="text-gray-500">
                                Không có sản phẩm nào phù hợp với tìm kiếm "
                                {searchTerm}"
                              </p>
                            </>
                          ) : (
                            <>
                              <h4 className="text-lg font-medium mb-2">
                                Danh sách trống
                              </h4>
                              <p className="text-gray-500">
                                Chưa có sản phẩm nào trong danh sách này. Hãy
                                thêm sản phẩm từ trang chi tiết sản phẩm.
                              </p>
                              <Button
                                className="mt-4 bg-green-600 hover:bg-green-700"
                                onClick={() => navigate("/products")}
                              >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Khám phá sản phẩm
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getFilteredItems().map((item) => (
                            <div
                              key={
                                getProductId(item) || item.id || "wishlist-item"
                              }
                              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <Link
                                to={`/farmhub2/product/${getProductId(item)}`}
                              >
                                <img
                                  src={getProductImageUrl(item)}
                                  alt={getProductName(item)}
                                  className="w-full h-48 object-cover"
                                  onError={(e) => {
                                    console.log(
                                      "Lỗi tải ảnh, thử đường dẫn khác"
                                    );
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder-product.jpg";
                                  }}
                                />
                              </Link>
                              <div className="p-4">
                                <Link
                                  to={`/farmhub2/product/${getProductId(item)}`}
                                  className="hover:text-green-600"
                                >
                                  <h4 className="font-medium text-lg mb-1">
                                    {getProductName(item)}
                                  </h4>
                                </Link>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="text-green-600 font-semibold">
                                    {getFormattedPrice(item)}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                                      onClick={() =>
                                        handleRemoveFromWishlist(
                                          selectedWishlistId,
                                          getProductId(item)
                                        )
                                      }
                                      title="Xóa khỏi yêu thích"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100"
                                      onClick={() => handleAddToCart(item)}
                                      title="Thêm vào giỏ hàng"
                                    >
                                      <ShoppingCart size={16} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Wishlist;
