import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Check, X, Eye } from "lucide-react";

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formMode, setFormMode] = useState("create"); // create, edit, view

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: 0,
    billingCycle: "MONTHLY",
    durationInDays: 30,
    maxUsers: 1,
    features: "",
    planType: "BASIC",
    isActive: true,
    isMostPopular: false,
  });

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      // Sử dụng mock data tạm thời
      const mockData = [
        {
          id: 1,
          name: "Gói Miễn Phí",
          shortDescription: "Dành cho người mới bắt đầu",
          price: 0,
          billingCycle: "MONTHLY",
          durationInDays: 30,
          maxUsers: 1,
          features:
            "Dự báo thời tiết cơ bản, Theo dõi mùa vụ, Hỗ trợ kỹ thuật qua email",
          planType: "FREE",
          isActive: true,
          isMostPopular: false,
        },
        {
          id: 2,
          name: "Gói Cơ Bản",
          shortDescription: "Cho nông trại nhỏ",
          price: 99000,
          billingCycle: "MONTHLY",
          durationInDays: 30,
          maxUsers: 3,
          features:
            "Tất cả tính năng của gói miễn phí, Cảnh báo thời tiết nâng cao, Quản lý mùa vụ, Hỗ trợ kỹ thuật ưu tiên",
          planType: "BASIC",
          isActive: true,
          isMostPopular: true,
        },
        {
          id: 3,
          name: "Gói Tiêu Chuẩn",
          shortDescription: "Cho nông trại vừa",
          price: 199000,
          billingCycle: "MONTHLY",
          durationInDays: 30,
          maxUsers: 10,
          features:
            "Tất cả tính năng của gói cơ bản, Phân tích dữ liệu nông nghiệp, Tích hợp IoT cơ bản, Hỗ trợ 24/7, Báo cáo định kỳ",
          planType: "STANDARD",
          isActive: true,
          isMostPopular: false,
        },
        {
          id: 4,
          name: "Gói Cao Cấp",
          shortDescription: "Cho nông trại lớn",
          price: 499000,
          billingCycle: "MONTHLY",
          durationInDays: 30,
          maxUsers: -1,
          features:
            "Tất cả tính năng của gói tiêu chuẩn, Tích hợp IoT nâng cao, Phân tích dữ liệu AI, Dự báo năng suất, Tư vấn chuyên gia, API tích hợp",
          planType: "PREMIUM",
          isActive: true,
          isMostPopular: false,
        },
      ];
      setPlans(mockData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách gói đăng ký:", error);
      toast.error("Không thể tải danh sách gói đăng ký. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, plan = null) => {
    setFormMode(mode);

    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name || "",
        description: plan.description || "",
        shortDescription: plan.shortDescription || "",
        price: plan.price || 0,
        billingCycle: plan.billingCycle || "MONTHLY",
        durationInDays: plan.durationInDays || 30,
        maxUsers: plan.maxUsers || 1,
        features: plan.features || "",
        planType: plan.planType || "BASIC",
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        isMostPopular: plan.isMostPopular || false,
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: "",
        description: "",
        shortDescription: "",
        price: 0,
        billingCycle: "MONTHLY",
        durationInDays: 30,
        maxUsers: 1,
        features: "",
        planType: "BASIC",
        isActive: true,
        isMostPopular: false,
      });
    }

    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Xử lý các kiểu dữ liệu khác nhau
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (
      name === "price" ||
      name === "durationInDays" ||
      name === "maxUsers"
    ) {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formMode === "create") {
        // Mock tạo gói mới
        const newPlan = {
          ...formData,
          id: plans.length + 1,
        };
        setPlans([...plans, newPlan]);
        toast.success("Tạo gói đăng ký mới thành công!");
      } else if (formMode === "edit") {
        // Mock cập nhật gói
        const updatedPlans = plans.map((plan) =>
          plan.id === selectedPlan.id ? { ...plan, ...formData } : plan
        );
        setPlans(updatedPlans);
        toast.success("Cập nhật gói đăng ký thành công!");
      }

      setOpenDialog(false);
    } catch (error) {
      console.error("Lỗi khi lưu gói đăng ký:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      // Mock toggle status
      const updatedPlans = plans.map((p) =>
        p.id === plan.id ? { ...p, isActive: !p.isActive } : p
      );
      setPlans(updatedPlans);

      toast.success(
        `Gói đăng ký đã được ${
          plan.isActive ? "vô hiệu hóa" : "kích hoạt"
        } thành công!`
      );
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái gói đăng ký:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói đăng ký này?")) {
      try {
        // Mock xóa gói
        const updatedPlans = plans.filter((plan) => plan.id !== planId);
        setPlans(updatedPlans);

        toast.success("Xóa gói đăng ký thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa gói đăng ký:", error);
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý gói đăng ký</h1>
        <Button
          onClick={() => handleOpenDialog("create")}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Thêm gói mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gói đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>Tên gói</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.id}</TableCell>
                      <TableCell className="font-medium">
                        {plan.name}
                        {plan.isMostPopular && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800">
                            Phổ biến
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`
                            ${
                              plan.planType === "FREE"
                                ? "bg-gray-100 text-gray-800"
                                : ""
                            }
                            ${
                              plan.planType === "BASIC"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }
                            ${
                              plan.planType === "STANDARD"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              plan.planType === "PREMIUM"
                                ? "bg-purple-100 text-purple-800"
                                : ""
                            }
                          `}
                        >
                          {plan.planType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {plan.price === 0
                          ? "Miễn phí"
                          : formatCurrency(plan.price)}
                      </TableCell>
                      <TableCell>{plan.durationInDays} ngày</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            plan.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {plan.isActive ? "Hoạt động" : "Vô hiệu"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog("view", plan)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog("edit", plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleToggleActive(plan)}
                          >
                            {plan.isActive ? (
                              <X className="w-4 h-4 text-red-500" />
                            ) : (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(plan.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Không có gói đăng ký nào. Hãy tạo gói đăng ký mới!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? "Thêm gói đăng ký mới"
                : formMode === "edit"
                ? "Chỉnh sửa gói đăng ký"
                : "Chi tiết gói đăng ký"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Tên gói
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="planType" className="text-sm font-medium">
                    Loại gói
                  </label>
                  <select
                    id="planType"
                    name="planType"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.planType}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                    required
                  >
                    <option value="FREE">Miễn phí</option>
                    <option value="BASIC">Cơ bản</option>
                    <option value="STANDARD">Tiêu chuẩn</option>
                    <option value="PREMIUM">Cao cấp</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="shortDescription"
                  className="text-sm font-medium"
                >
                  Mô tả ngắn
                </label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Mô tả đầy đủ
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full px-3 py-2 border rounded-md h-24"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Giá (VND)
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="billingCycle" className="text-sm font-medium">
                    Chu kỳ thanh toán
                  </label>
                  <select
                    id="billingCycle"
                    name="billingCycle"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.billingCycle}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                  >
                    <option value="MONTHLY">Hàng tháng</option>
                    <option value="QUARTERLY">Hàng quý</option>
                    <option value="YEARLY">Hàng năm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="durationInDays"
                    className="text-sm font-medium"
                  >
                    Thời hạn (ngày)
                  </label>
                  <Input
                    id="durationInDays"
                    name="durationInDays"
                    type="number"
                    value={formData.durationInDays}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="maxUsers" className="text-sm font-medium">
                    Số người dùng tối đa
                  </label>
                  <Input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                  />
                  <p className="text-xs text-gray-500">
                    Nhập -1 cho không giới hạn
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="features" className="text-sm font-medium">
                  Tính năng (phân cách bằng dấu phẩy)
                </label>
                <textarea
                  id="features"
                  name="features"
                  className="w-full px-3 py-2 border rounded-md h-24"
                  value={formData.features}
                  onChange={handleInputChange}
                  disabled={formMode === "view"}
                  placeholder="VD: Hỗ trợ 24/7, Dự báo thời tiết chi tiết, Tích hợp IoT, ..."
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Hoạt động
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isMostPopular"
                    name="isMostPopular"
                    checked={formData.isMostPopular}
                    onChange={handleInputChange}
                    disabled={formMode === "view"}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isMostPopular" className="text-sm">
                    Phổ biến nhất
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                {formMode === "view" ? "Đóng" : "Hủy"}
              </Button>

              {formMode !== "view" && (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {formMode === "create" ? "Tạo mới" : "Cập nhật"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlans;
