import { useState } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";

const UserAddressManager = () => {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    id: null,
    address: "",
    city: "",
    country: "Việt Nam", // Mặc định là Việt Nam
    postalCode: "",
    isDefault: false,
  });

  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth(); // Lấy thông tin người dùng hiện tại

  const handleOpenDialog = () => {
    setCurrentAddress({
      id: null,
      address: "",
      city: "",
      country: "Việt Nam",
      postalCode: "",
      isDefault: false,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDefaultChange = () => {
    setCurrentAddress((prev) => ({
      ...prev,
      isDefault: !prev.isDefault,
    }));
  };

  const validateForm = () => {
    if (!currentAddress.address) return "Vui lòng nhập địa chỉ";
    if (!currentAddress.city) return "Vui lòng nhập thành phố/tỉnh";
    if (!currentAddress.country) return "Vui lòng nhập quốc gia";
    return null;
  };

  const handleSaveAddress = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      // Tạo đối tượng để gửi lên server, chỉ bao gồm các trường hợp lệ
      // Loại bỏ isDefault và không thêm user_id vì backend tự xử lý từ JWT token
      // eslint-disable-next-line no-unused-vars
      const { isDefault, ...addressData } = currentAddress;

      // Lấy userId từ auth context
      const userId = auth?.user?.id;
      console.log("Đang lưu địa chỉ cho user ID:", userId);

      // Tạo query params để truyền userId
      const queryParams = userId ? `?userId=${userId}` : "";

      // Add new address
      console.log("Thêm địa chỉ mới:", addressData);
      await axiosPrivate.post(`/user-addresses${queryParams}`, addressData);
      toast.success("Thêm địa chỉ mới thành công!");

      handleCloseDialog();
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);

      // Hiển thị thông báo lỗi chi tiết nếu có
      if (error.response?.data?.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Địa chỉ của tôi
          </CardTitle>
          <CardDescription>
            Quản lý danh sách địa chỉ giao hàng của bạn
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenDialog()}
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Thêm địa chỉ mới
          </Button>
        </div>
      </CardHeader>

      {/* Address Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm địa chỉ mới</DialogTitle>
            <DialogDescription>
              Vui lòng điền đầy đủ thông tin địa chỉ của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                name="address"
                value={currentAddress.address}
                onChange={handleInputChange}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
              />
            </div>

            <div>
              <Label htmlFor="city">Tỉnh/Thành phố</Label>
              <Input
                id="city"
                name="city"
                value={currentAddress.city}
                onChange={handleInputChange}
                placeholder="Ví dụ: Hà Nội, Hồ Chí Minh, Đà Nẵng"
              />
            </div>

            <div>
              <Label htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                name="country"
                value={currentAddress.country}
                onChange={handleInputChange}
                placeholder="Ví dụ: Việt Nam"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Mã bưu điện (không bắt buộc)</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={currentAddress.postalCode || ""}
                onChange={handleInputChange}
                placeholder="Ví dụ: 700000"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isDefault"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={currentAddress.isDefault}
                onChange={handleDefaultChange}
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Đặt làm địa chỉ mặc định
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSaveAddress} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserAddressManager;
