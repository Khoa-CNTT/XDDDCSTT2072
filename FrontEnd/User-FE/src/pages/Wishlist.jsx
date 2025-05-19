import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  getUserWishlists,
  getWishlistById,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  removeItemFromWishlist,
} from "@/services/wishlistService";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  PlusCircle,
  Edit,
  Heart,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

const Wishlist = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [wishlists, setWishlists] = useState([]);
  const [activeWishlist, setActiveWishlist] = useState(null);
  const [activeWishlistItems, setActiveWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [wishlistName, setWishlistName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [editingWishlistId, setEditingWishlistId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        setLoading(true);
        const result = await getUserWishlists(axiosPrivate);
        setWishlists(result || []);

        // Nếu có danh sách, mặc định chọn danh sách đầu tiên
        if (result && result.length > 0) {
          setActiveWishlist(result[0]);
          await fetchWishlistItems(result[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
        toast.error("Không thể tải danh sách yêu thích");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, [axiosPrivate]);

  const fetchWishlistItems = async (wishlistId) => {
    try {
      setLoading(true);
      const result = await getWishlistById(axiosPrivate, wishlistId);
      setActiveWishlistItems(result?.items || []);
    } catch (error) {
      console.error(
        `Lỗi khi lấy chi tiết danh sách yêu thích ID ${wishlistId}:`,
        error
      );
      toast.error("Không thể tải chi tiết danh sách yêu thích");
      setActiveWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWishlist = () => {
    setEditMode(false);
    setWishlistName("");
    setIsDefault(false);
    setDialogOpen(true);
  };

  const handleEditWishlist = (wishlist) => {
    setEditMode(true);
    setWishlistName(wishlist.name);
    setIsDefault(wishlist.isDefault);
    setEditingWishlistId(wishlist.id);
    setDialogOpen(true);
  };

  const handleDeleteWishlist = (wishlist) => {
    setEditingWishlistId(wishlist.id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteWishlist = async () => {
    try {
      await deleteWishlist(axiosPrivate, editingWishlistId);

      // Cập nhật state sau khi xóa
      setWishlists((prev) => prev.filter((w) => w.id !== editingWishlistId));

      // Nếu xóa danh sách hiện tại, chọn danh sách khác
      if (activeWishlist.id === editingWishlistId) {
        const remainingWishlists = wishlists.filter(
          (w) => w.id !== editingWishlistId
        );
        if (remainingWishlists.length > 0) {
          setActiveWishlist(remainingWishlists[0]);
          await fetchWishlistItems(remainingWishlists[0].id);
        } else {
          setActiveWishlist(null);
          setActiveWishlistItems([]);
        }
      }

      toast.success("Đã xóa danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi khi xóa danh sách yêu thích:", error);

      if (error.response?.data?.message?.includes("mặc định")) {
        toast.error("Không thể xóa danh sách yêu thích mặc định");
      } else {
        toast.error("Không thể xóa danh sách yêu thích");
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveWishlist = async () => {
    try {
      if (!wishlistName.trim()) {
        toast.error("Tên danh sách không được để trống");
        return;
      }

      const wishlistData = {
        name: wishlistName,
        isDefault,
      };

      if (editMode) {
        // Cập nhật danh sách
        await updateWishlist(axiosPrivate, editingWishlistId, wishlistData);

        // Cập nhật state sau khi cập nhật
        setWishlists((prev) =>
          prev.map((w) =>
            w.id === editingWishlistId
              ? { ...w, name: wishlistName, isDefault }
              : isDefault && w.isDefault
              ? { ...w, isDefault: false }
              : w
          )
        );

        // Cập nhật active wishlist nếu đang sửa chính nó
        if (activeWishlist.id === editingWishlistId) {
          setActiveWishlist({
            ...activeWishlist,
            name: wishlistName,
            isDefault,
          });
        }

        toast.success("Cập nhật danh sách yêu thích thành công");
      } else {
        // Tạo danh sách mới
        const result = await createWishlist(axiosPrivate, wishlistData);
        const newWishlist = result?.data;

        if (newWishlist) {
          // Cập nhật state sau khi tạo mới
          setWishlists((prev) => {
            const updated = isDefault
              ? prev.map((w) => ({ ...w, isDefault: w.id === newWishlist.id }))
              : [...prev];

            return [...updated, newWishlist];
          });

          // Chuyển sang danh sách mới tạo
          setActiveWishlist(newWishlist);
          setActiveWishlistItems([]);
        }

        toast.success("Tạo danh sách yêu thích thành công");
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu danh sách yêu thích:", error);
      toast.error("Không thể lưu danh sách yêu thích");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItemFromWishlist(axiosPrivate, activeWishlist.id, itemId);

      // Cập nhật state sau khi xóa sản phẩm
      setActiveWishlistItems((prev) =>
        prev.filter((item) => item.id !== itemId)
      );

      toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích:", error);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleWishlistChange = async (wishlistId) => {
    const selected = wishlists.find((w) => w.id === parseInt(wishlistId));
    if (selected) {
      setActiveWishlist(selected);
      await fetchWishlistItems(selected.id);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/farmhub2/product/${productId}`);
  };

  if (loading && !activeWishlist) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-gray-600">
            Đang tải danh sách yêu thích...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="text-red-500" /> Danh sách yêu thích
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý các sản phẩm yêu thích của bạn
          </p>
        </div>

        <Button
          onClick={handleAddWishlist}
          className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Tạo danh sách mới
        </Button>
      </div>

      {/* Nút tạo danh sách mới nổi bật ở góc phải */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button
          onClick={handleAddWishlist}
          className="bg-green-500 hover:bg-green-600 shadow-lg rounded-full h-14 w-14 p-0 flex items-center justify-center"
          aria-label="Tạo danh sách yêu thích mới"
        >
          <PlusCircle size={24} />
        </Button>
      </div>

      {wishlists.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Bạn chưa có danh sách yêu thích nào
          </h3>
          <p className="text-gray-600 mb-4">
            Hãy tạo danh sách yêu thích đầu tiên để lưu các sản phẩm bạn quan
            tâm
          </p>
          <Button
            onClick={handleAddWishlist}
            className="bg-green-500 hover:bg-green-600"
          >
            Tạo danh sách yêu thích
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <Tabs
            defaultValue={activeWishlist?.id?.toString()}
            onValueChange={handleWishlistChange}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-gray-100">
                {wishlists.map((wishlist) => (
                  <TabsTrigger
                    key={wishlist.id}
                    value={wishlist.id.toString()}
                    className="flex items-center gap-2"
                  >
                    {wishlist.name}
                    {wishlist.isDefault && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200"
                      >
                        Mặc định
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeWishlist && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWishlist(activeWishlist)}
                    className="text-gray-600"
                  >
                    <Edit size={16} className="mr-1" />
                    Sửa
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWishlist(activeWishlist)}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    disabled={activeWishlist.isDefault}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Xóa
                  </Button>
                </div>
              )}
            </div>

            {wishlists.map((wishlist) => (
              <TabsContent key={wishlist.id} value={wishlist.id.toString()}>
                {loading ? (
                  <div className="flex justify-center my-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activeWishlistItems.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-10 text-center">
                    <h3 className="text-lg font-medium text-gray-700">
                      Chưa có sản phẩm nào
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Hãy thêm sản phẩm vào danh sách yêu thích từ trang chi
                      tiết sản phẩm
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeWishlistItems.map((item) => (
                      <Card
                        key={item.id}
                        className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          <img
                            src={
                              item.productImage ||
                              "https://via.placeholder.com/300x300?text=Không+có+ảnh"
                            }
                            alt={item.productName}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                          {item.isOnSale && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              Giảm giá
                            </Badge>
                          )}
                        </div>

                        <CardHeader className="pb-2">
                          <h3 className="font-medium text-lg line-clamp-2">
                            {item.productName}
                          </h3>
                        </CardHeader>

                        <CardContent className="pb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-red-500">
                              {(item.isOnSale
                                ? item.salePrice
                                : item.productPrice
                              ).toLocaleString()}
                              ₫
                            </p>
                            {item.isOnSale && (
                              <p className="text-sm text-gray-500 line-through">
                                {item.productPrice.toLocaleString()}₫
                              </p>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 mt-1">
                            Đã thêm:{" "}
                            {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                          </p>
                        </CardContent>

                        <CardFooter className="flex justify-between pt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProduct(item.productId)}
                            className="flex-1 mr-2"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Xem chi tiết
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Dialog Thêm/Sửa Danh Sách Yêu Thích */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode
                ? "Sửa danh sách yêu thích"
                : "Tạo danh sách yêu thích mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="wishlistName" className="text-sm font-medium">
                Tên danh sách
              </label>
              <Input
                id="wishlistName"
                placeholder="Nhập tên danh sách yêu thích"
                value={wishlistName}
                onChange={(e) => setWishlistName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                Đặt làm danh sách mặc định
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveWishlist}>
              {editMode ? "Cập nhật" : "Tạo danh sách"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>
              Bạn có chắc chắn muốn xóa danh sách yêu thích này? Tất cả sản phẩm
              trong danh sách sẽ bị xóa.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteWishlist}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wishlist;
