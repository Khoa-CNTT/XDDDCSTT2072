import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Store, Building, Phone, FileText, Info } from "lucide-react";
import sellerRegistrationService from "@/services/sellerRegistrationService";
import userSubscriptionService from "@/services/userSubscriptionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const SellerRegistrationForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [canRegisterAsSeller, setCanRegisterAsSeller] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Kiểm tra trạng thái đăng ký và quyền bán hàng khi component được load
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        // Kiểm tra xem người dùng có gói Premium không
        const hasPremium =
          await userSubscriptionService.checkSellerPermission();
        setCanRegisterAsSeller(hasPremium);

        // Kiểm tra trạng thái đăng ký hiện tại
        try {
          const currentRegistration =
            await sellerRegistrationService.getCurrentRegistration();
          setRegistrationStatus(currentRegistration.data);
        } catch (error) {
          // Xử lý trường hợp chưa có đăng ký
          console.log("Chưa có đăng ký bán hàng:", error);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái:", error);
      }
    };

    checkRegistrationStatus();
  }, []);

  const onSubmit = async (data) => {
    if (!canRegisterAsSeller) {
      toast.error("Bạn cần nâng cấp lên gói Premium để đăng ký bán hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await sellerRegistrationService.registerAsSeller(data);
      toast.success("Đăng ký bán hàng thành công, đang chờ phê duyệt");
      reset();
      if (onSuccess) onSuccess(response);

      // Cập nhật trạng thái đăng ký sau khi gửi thành công
      setRegistrationStatus({
        status: "PENDING",
        message: "Đơn đăng ký của bạn đang được xem xét",
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký bán hàng:", error);
      toast.error(
        error.response?.data?.message ||
          "Đăng ký bán hàng thất bại, vui lòng thử lại sau"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị trạng thái đăng ký
  const renderRegistrationStatus = () => {
    if (!registrationStatus) return null;

    let alertType = "default";
    let icon = <Info className="h-4 w-4" />;
    let title = "Trạng thái đăng ký";
    let message = "";

    switch (registrationStatus.status) {
      case "PENDING":
        alertType = "warning";
        title = "Đơn đăng ký đang chờ xét duyệt";
        message =
          "Đơn đăng ký bán hàng của bạn đang được xem xét. Chúng tôi sẽ thông báo khi có kết quả.";
        break;
      case "APPROVED":
        alertType = "success";
        title = "Đơn đăng ký đã được phê duyệt";
        message =
          "Chúc mừng! Bạn đã được phê duyệt để bán hàng trên nền tảng của chúng tôi.";
        break;
      case "REJECTED":
        alertType = "destructive";
        title = "Đơn đăng ký đã bị từ chối";
        message = `Đơn đăng ký của bạn đã bị từ chối. Lý do: ${
          registrationStatus.notes || "Không có thông tin chi tiết."
        }`;
        break;
      default:
        break;
    }

    return (
      <Alert variant={alertType} className="mb-6">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  };

  // Nếu người dùng chưa có gói Premium
  if (!canRegisterAsSeller) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký bán hàng</CardTitle>
          <CardDescription>
            Để đăng ký bán hàng trên nền tảng, bạn cần nâng cấp lên gói Premium
            trước.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTitle>Cần nâng cấp tài khoản</AlertTitle>
            <AlertDescription>
              Chỉ người dùng có gói Premium mới có thể đăng ký bán hàng trên nền
              tảng.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => navigate("/subscriptions", { replace: true })}
            className="w-full"
          >
            Nâng cấp lên gói Premium
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Nếu đã có đơn đăng ký được phê duyệt
  if (registrationStatus?.status === "APPROVED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký bán hàng</CardTitle>
          <CardDescription>Trạng thái đăng ký bán hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {renderRegistrationStatus()}
          <p className="text-center mt-4">
            Bạn đã được phê duyệt bán hàng trên nền tảng. Hãy bắt đầu quản lý
            sản phẩm của bạn.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() =>
              navigate("/seller/dashboard", {
                replace: true,
                state: { fromRegistration: true },
              })
            }
            className="w-full"
          >
            Đi đến trang quản lý bán hàng
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Nếu đang chờ phê duyệt
  if (registrationStatus?.status === "PENDING") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký bán hàng</CardTitle>
          <CardDescription>Trạng thái đăng ký bán hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {renderRegistrationStatus()}
          <p className="text-center mt-4">
            Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ thông báo cho
            bạn khi có kết quả.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Form đăng ký bán hàng
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký bán hàng</CardTitle>
        <CardDescription>
          Hãy cung cấp thông tin doanh nghiệp của bạn để đăng ký bán hàng trên
          nền tảng
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderRegistrationStatus()}

        <form id="seller-registration-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="businessName">
                <Store className="h-4 w-4 inline mr-1" /> Tên doanh nghiệp *
              </Label>
              <Input
                id="businessName"
                placeholder="Nhập tên doanh nghiệp của bạn"
                {...register("businessName", {
                  required: "Vui lòng nhập tên doanh nghiệp",
                })}
                className={errors.businessName ? "border-red-500" : ""}
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessAddress">
                <Building className="h-4 w-4 inline mr-1" /> Địa chỉ doanh
                nghiệp *
              </Label>
              <Input
                id="businessAddress"
                placeholder="Nhập địa chỉ doanh nghiệp của bạn"
                {...register("businessAddress", {
                  required: "Vui lòng nhập địa chỉ doanh nghiệp",
                })}
                className={errors.businessAddress ? "border-red-500" : ""}
              />
              {errors.businessAddress && (
                <p className="text-red-500 text-sm">
                  {errors.businessAddress.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessPhone">
                <Phone className="h-4 w-4 inline mr-1" /> Số điện thoại doanh
                nghiệp *
              </Label>
              <Input
                id="businessPhone"
                placeholder="Nhập số điện thoại doanh nghiệp của bạn"
                {...register("businessPhone", {
                  required: "Vui lòng nhập số điện thoại doanh nghiệp",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Số điện thoại phải có 10 chữ số",
                  },
                })}
                className={errors.businessPhone ? "border-red-500" : ""}
              />
              {errors.businessPhone && (
                <p className="text-red-500 text-sm">
                  {errors.businessPhone.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="taxCode">
                <FileText className="h-4 w-4 inline mr-1" /> Mã số thuế
              </Label>
              <Input
                id="taxCode"
                placeholder="Nhập mã số thuế của doanh nghiệp (nếu có)"
                {...register("taxCode")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                <Info className="h-4 w-4 inline mr-1" /> Mô tả doanh nghiệp
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả ngắn về doanh nghiệp của bạn"
                {...register("description")}
                rows={4}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          form="seller-registration-form"
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Đăng ký bán hàng"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SellerRegistrationForm;
