import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SellerRegistrationForm from "@/components/user/SellerRegistrationForm";
import userSubscriptionService from "@/services/userSubscriptionService";
import sellerRegistrationService from "@/services/sellerRegistrationService";
import { toast } from "react-hot-toast";

const SellerRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState(null);

  // Thêm effect này để loại bỏ tất cả các thông báo khi trang được load
  useEffect(() => {
    // Xóa tất cả thông báo toast hiện có
    toast.dismiss();

    // Xóa flag trong localStorage nếu có
    if (localStorage.getItem("productSubmitSuccess")) {
      localStorage.removeItem("productSubmitSuccess");
    }
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);

        // Kiểm tra xem người dùng đã có đăng ký bán hàng đã được phê duyệt chưa
        const isApproved = await sellerRegistrationService.isApproved();
        console.log(
          "Kiểm tra người dùng đã được phê duyệt bán hàng chưa:",
          isApproved
        );

        if (isApproved?.data === true) {
          // Thông báo và chuyển đến trang quản lý bán hàng
          toast.success("Bạn đã được phê duyệt bán hàng trên nền tảng!");
          setRegistrationStatus({ status: "APPROVED" });
          // Không return ở đây để code có thể tiếp tục
        } else {
          // Kiểm tra người dùng có đơn đăng ký đang chờ duyệt không
          const hasPending =
            await sellerRegistrationService.hasPendingRegistration();

          if (hasPending?.data === true) {
            // Lấy thông tin đơn đăng ký gần nhất
            const registrationData =
              await sellerRegistrationService.getCurrentRegistration();
            setRegistrationStatus(registrationData?.data);
          }
        }

        // Kiểm tra quyền bán hàng (gói Premium)
        await userSubscriptionService.checkSellerPermission();
      } catch (error) {
        console.error("Lỗi khi kiểm tra quyền truy cập:", error);
        // Xóa thông báo lỗi và chỉ log ra console
        console.log(
          "Có lỗi xảy ra khi kiểm tra thông tin đăng ký, nhưng không hiển thị cho người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  const handleRegistrationSuccess = (data) => {
    // Sau khi đăng ký thành công, cập nhật trạng thái và hiển thị thông tin đơn đăng ký
    console.log("Đăng ký thành công, dữ liệu trả về:", data);
    setRegistrationStatus(data?.data);
    toast.success("Đăng ký bán hàng thành công! Vui lòng đợi phê duyệt.");
  };

  // Hàm xử lý khi người dùng bấm vào nút "Đi đến trang quản lý bán hàng"
  const handleGoToSellerDashboard = () => {
    try {
      console.log("Chuyển hướng đến trang quản lý bán hàng");
      // Truyền state để đánh dấu là đã từ trang đăng ký điều hướng sang
      navigate("/seller/dashboard", {
        replace: true,
        state: { fromRegistration: true },
      });
    } catch (error) {
      console.error("Lỗi khi chuyển hướng:", error);
      // Xóa thông báo lỗi
      console.log("Lỗi chuyển hướng nhưng không hiển thị cho người dùng");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log("Trạng thái đăng ký hiện tại:", registrationStatus);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
          <ShoppingBag className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Đăng ký bán hàng</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Đăng ký để trở thành người bán hàng trên nền tảng của chúng tôi. Bạn
          sẽ có thể đăng sản phẩm và tiếp cận hàng ngàn khách hàng tiềm năng.
        </p>
      </div>

      {registrationStatus?.status === "APPROVED" ? (
        <div className="max-w-xl mx-auto bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <h2 className="text-xl font-semibold text-green-800">
              Đơn đăng ký của bạn đã được phê duyệt!
            </h2>
          </div>
          <p className="text-gray-700 mb-6">
            Chúc mừng! Bạn đã được phê duyệt để bán hàng trên nền tảng. Hãy bắt
            đầu quản lý cửa hàng và đăng sản phẩm ngay bây giờ.
          </p>
          <Button
            onClick={handleGoToSellerDashboard}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Đi đến trang quản lý bán hàng
          </Button>
        </div>
      ) : registrationStatus?.status === "PENDING" ? (
        <div className="max-w-xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-yellow-800">
              Đơn đăng ký của bạn đang được xét duyệt
            </h2>
          </div>
          <p className="text-gray-700 mb-4">
            Bạn đã gửi đơn đăng ký bán hàng và đang chờ được phê duyệt. Chúng
            tôi sẽ thông báo cho bạn khi có kết quả.
          </p>
          <div className="bg-white p-4 rounded border border-yellow-100">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Trạng thái:</span>
              <span className="text-yellow-600 font-medium">
                Đang chờ duyệt
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Ngày đăng ký:</span>
              <span>
                {new Date(registrationStatus.createdAt).toLocaleDateString(
                  "vi-VN"
                )}
              </span>
            </div>
          </div>
        </div>
      ) : registrationStatus?.status === "REJECTED" ? (
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-red-800">
              Đơn đăng ký của bạn đã bị từ chối
            </h2>
          </div>
          <p className="text-gray-700 mb-4">
            Rất tiếc, đơn đăng ký bán hàng của bạn đã bị từ chối. Vui lòng xem
            lý do bên dưới và thử đăng ký lại.
          </p>
          <div className="bg-white p-4 rounded border border-red-100">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Lý do từ chối:</span>
              <span className="text-red-600">
                {registrationStatus.notes || "Không có thông tin chi tiết"}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Ngày xử lý:</span>
              <span>
                {registrationStatus.processedAt
                  ? new Date(registrationStatus.processedAt).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Không xác định"}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setRegistrationStatus(null)}
            className="w-full mt-4 bg-red-600 hover:bg-red-700"
          >
            Đăng ký lại
          </Button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <SellerRegistrationForm onSuccess={handleRegistrationSuccess} />
        </div>
      )}

      <div className="max-w-xl mx-auto mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Quy trình đăng ký bán hàng
        </h2>
        <ol className="space-y-4">
          <li className="flex">
            <span className="bg-blue-100 text-blue-600 font-semibold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">
              1
            </span>
            <div>
              <p className="font-medium">Đăng ký gói Premium</p>
              <p className="text-gray-600">
                Bạn cần có gói Premium để đăng ký bán hàng trên nền tảng.
              </p>
            </div>
          </li>
          <li className="flex">
            <span className="bg-blue-100 text-blue-600 font-semibold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">
              2
            </span>
            <div>
              <p className="font-medium">Điền thông tin đăng ký</p>
              <p className="text-gray-600">
                Cung cấp thông tin doanh nghiệp của bạn để đăng ký làm người
                bán.
              </p>
            </div>
          </li>
          <li className="flex">
            <span className="bg-blue-100 text-blue-600 font-semibold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">
              3
            </span>
            <div>
              <p className="font-medium">Chờ phê duyệt</p>
              <p className="text-gray-600">
                Đội ngũ của chúng tôi sẽ xem xét đơn đăng ký của bạn trong vòng
                1-3 ngày làm việc.
              </p>
            </div>
          </li>
          <li className="flex">
            <span className="bg-blue-100 text-blue-600 font-semibold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">
              4
            </span>
            <div>
              <p className="font-medium">Bắt đầu bán hàng</p>
              <p className="text-gray-600">
                Sau khi được phê duyệt, bạn có thể bắt đầu đăng sản phẩm và bán
                hàng trên nền tảng.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default SellerRegistration;
