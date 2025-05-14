import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  getUserById,
  updateUserProfile,
  uploadProfileImage,
  uploadCroppedProfileImage,
  changePassword,
  requestEmailVerification,
  verifyEmailChange,
  deleteUserAccount,
} from "@/services/userService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Save,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Hàm tạo crop mặc định theo tỷ lệ 1:1
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

// Hàm chuyển canvas thành blob
function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const userId = auth?.user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    password: "********",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Thêm state cho đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Thêm state cho xác thực email
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    verificationCode: "",
  });
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Thêm state và ref cho crop ảnh đại diện
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Thêm hidden password state để giữ mật khẩu thực tế
  const [hiddenPassword, setHiddenPassword] = useState("");

  // Thêm state cho xóa tài khoản
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAgreement, setDeleteAgreement] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        navigate("/account/login");
        return;
      }

      try {
        setLoading(true);
        const userData = await getUserById(axiosPrivate, userId);

        if (!userData.success || !userData.data) {
          toast.error(userData.message || "Không thể tải thông tin người dùng");
          navigate("/");
          return;
        }

        setUser(userData.data);
        setFormData({
          userName: userData.data.userName || "",
          email: userData.data.email || "",
          phone: userData.data.phone || "",
          password: "********", // Hiển thị dấu sao cho password
        });
        // Lưu trữ một trường ẩn để đánh dấu có mật khẩu
        setHiddenPassword("has-password");
        setImagePreview(userData.data.imageUrl || "");
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
        toast.error(
          "Không thể tải thông tin người dùng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, axiosPrivate, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Gán file để sử dụng khi upload
    setImageFile(file);

    // Đọc file để hiển thị preview và crop
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "");
      setCropDialogOpen(true); // Mở dialog crop khi đã load ảnh
    });
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.warn("Vui lòng chọn ảnh đại diện");
      return;
    }

    try {
      setUploading(true);
      const response = await uploadProfileImage(
        axiosPrivate,
        userId,
        imageFile
      );

      // Cập nhật auth context với URL ảnh mới
      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          imageUrl: response.imageUrl || response.image || response.avatarUrl,
        },
      }));

      setImagePreview(
        response.imageUrl || response.image || response.avatarUrl
      );
      setImageFile(null);
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      toast.error("Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra số điện thoại phải có đúng 10 chữ số
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error("Số điện thoại phải có đúng 10 chữ số");
      return;
    }

    try {
      setSaving(true);
      console.log("Đang cập nhật thông tin người dùng...");

      // Chỉ gửi các trường mà entity User có hỗ trợ
      const userDataToUpdate = {
        userName: formData.userName,
        phone: formData.phone,
        email: formData.email,
      };

      // Chỉ gửi mật khẩu mới nếu người dùng nhập vào trường mật khẩu và khác dấu sao (mật khẩu mới)
      if (formData.password && formData.password !== "********") {
        userDataToUpdate.password = formData.password;
      } else if (hiddenPassword === "has-password") {
        // Nếu có mật khẩu hiện tại và người dùng không thay đổi, gửi dấu hiệu giữ nguyên mật khẩu
        userDataToUpdate.keepExistingPassword = true;
      }

      console.log("Dữ liệu gửi lên server:", {
        ...userDataToUpdate,
        password: userDataToUpdate.password ? "******" : undefined,
        keepExistingPassword: userDataToUpdate.keepExistingPassword,
      });

      const response = await updateUserProfile(
        axiosPrivate,
        userId,
        userDataToUpdate
      );

      console.log("Kết quả cập nhật:", response);

      // Cập nhật auth context với thông tin mới
      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          userName: userDataToUpdate.userName,
          phone: userDataToUpdate.phone,
          email: userDataToUpdate.email,
        },
      }));

      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      console.log("Lỗi response:", error.response?.data);

      // Hiển thị thông báo lỗi chi tiết từ server
      if (error.response?.data?.errors) {
        // Lỗi validation từ Spring Boot
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else if (error.response?.data?.message) {
        // Lỗi nghiệp vụ từ server
        toast.error(error.response.data.message);
      } else {
        // Lỗi khác
        toast.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Thêm hàm xử lý đổi mật khẩu
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Kiểm tra đầu vào
    if (!passwordForm.currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changePassword(axiosPrivate, userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form sau khi đổi mật khẩu thành công
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordDialogOpen(false);
      toast.success("Đổi mật khẩu thành công");
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);

      // Hiển thị thông báo lỗi chi tiết từ server nếu có
      if (error.response?.data?.error) {
        toast.error(error.response.data.message || "Không thể đổi mật khẩu");
      } else if (error.response?.data?.errors) {
        // Lỗi validation từ Spring Boot
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else if (error.response?.data?.message) {
        // Lỗi nghiệp vụ từ server
        toast.error(error.response.data.message);
      } else {
        // Lỗi khác
        toast.error("Không thể đổi mật khẩu. Vui lòng thử lại sau.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Thêm hàm xử lý thay đổi email
  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestEmailVerification = async (e) => {
    e.preventDefault();

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailForm.newEmail || !emailRegex.test(emailForm.newEmail)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    try {
      setSendingVerification(true);

      const response = await requestEmailVerification(
        axiosPrivate,
        userId,
        emailForm.newEmail
      );

      setEmailVerificationSent(true);
      toast.success("Một mã xác thực đã được gửi đến email của bạn");
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu xác thực email:", error);

      // Hiển thị thông báo lỗi chi tiết từ server
      if (error.response?.data?.errors) {
        // Lỗi validation từ Spring Boot
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else if (error.response?.data?.message) {
        // Lỗi nghiệp vụ từ server
        toast.error(error.response.data.message);
      } else {
        // Lỗi khác
        toast.error("Không thể gửi mã xác thực. Vui lòng thử lại sau.");
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();

    if (!emailForm.verificationCode) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }

    try {
      setVerifyingEmail(true);

      const response = await verifyEmailChange(
        axiosPrivate,
        userId,
        emailForm.verificationCode
      );

      // Cập nhật auth context với email mới
      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          email: emailForm.newEmail,
        },
      }));

      // Cập nhật form data với email mới
      setFormData((prev) => ({
        ...prev,
        email: emailForm.newEmail,
      }));

      // Reset email form
      setEmailForm({
        newEmail: "",
        verificationCode: "",
      });

      setEmailVerificationSent(false);
      setEmailDialogOpen(false);
      toast.success("Email đã được thay đổi thành công");
    } catch (error) {
      console.error("Lỗi khi xác thực mã:", error);

      // Hiển thị thông báo lỗi chi tiết từ server
      if (error.response?.data?.errors) {
        // Lỗi validation từ Spring Boot
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else if (error.response?.data?.message) {
        // Lỗi nghiệp vụ từ server
        toast.error(error.response.data.message);
      } else {
        // Lỗi khác
        toast.error("Mã xác thực không hợp lệ. Vui lòng thử lại.");
      }
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Hàm xử lý khi ảnh được load
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // Crop theo tỷ lệ 1:1 (ảnh vuông)
  };

  // Hàm xử lý khi hoàn thành crop
  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      // Vẽ kết quả crop lên canvas
      const ctx = previewCanvasRef.current.getContext("2d");
      const image = imgRef.current;

      // Canvas size
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio || 1;

      const canvasWidth = completedCrop.width * pixelRatio;
      const canvasHeight = completedCrop.height * pixelRatio;

      previewCanvasRef.current.width = canvasWidth;
      previewCanvasRef.current.height = canvasHeight;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      // Tính toán vị trí để vẽ
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      // Áp dụng rotation và scale
      ctx.save();
      ctx.translate(
        canvasWidth / 2 / pixelRatio,
        canvasHeight / 2 / pixelRatio
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(
        -canvasWidth / 2 / pixelRatio,
        -canvasHeight / 2 / pixelRatio
      );

      // Vẽ ảnh đã crop
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      ctx.restore();
    }
  }, [completedCrop, rotation, scale]);

  // Hàm xử lý khi lưu ảnh đã crop
  const handleSaveCroppedImage = async () => {
    try {
      if (!previewCanvasRef.current) return;

      // Chuyển đổi canvas thành blob
      const croppedBlob = await canvasToBlob(previewCanvasRef.current);

      // Hiển thị preview ảnh đã crop
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setImagePreview(croppedUrl);

      // Upload ảnh đã crop
      setUploading(true);

      // Tạo một File object từ Blob để upload
      const croppedFile = new File([croppedBlob], "profile-image.jpg", {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      const response = await uploadCroppedProfileImage(
        axiosPrivate,
        userId,
        croppedFile
      );

      // Cập nhật auth context với URL ảnh mới
      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          imageUrl: response.imageUrl || response.image || response.avatarUrl,
        },
      }));

      setImageFile(null);
      setImgSrc("");
      setCropDialogOpen(false);
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      console.error("Lỗi khi xử lý ảnh:", error);
      toast.error("Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.");
    } finally {
      setUploading(false);
    }
  };

  // Thêm hàm xử lý xóa tài khoản
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    // Kiểm tra xác nhận
    if (deleteConfirmation !== formData.userName) {
      toast.error("Xác nhận tên người dùng không chính xác");
      return;
    }

    if (!deletePassword) {
      toast.error("Vui lòng nhập mật khẩu để xác nhận");
      return;
    }

    if (!deleteAgreement) {
      toast.error("Vui lòng đồng ý với điều khoản xóa tài khoản");
      return;
    }

    try {
      setDeletingAccount(true);

      await deleteUserAccount(axiosPrivate, userId, {
        password: deletePassword,
        confirmation: deleteConfirmation,
      });

      // Đăng xuất người dùng
      setAuth({});
      localStorage.removeItem("persist");

      toast.success("Tài khoản đã được xóa thành công");
      navigate("/account/login");
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể xóa tài khoản. Vui lòng thử lại sau."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-10 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => navigate(`/profile/${userId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Chỉnh sửa hồ sơ
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phần avatar */}
            <Card className="md:col-span-1 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <User size={18} />
                  Ảnh đại diện
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg mb-4">
                  <AvatarImage src={imagePreview} />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-400 text-white text-3xl">
                    {formData.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="w-full">
                  <Label
                    htmlFor="profile-image"
                    className="block text-sm font-medium mb-2"
                  >
                    Chọn ảnh mới
                  </Label>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-3"
                  />

                  {/* Dialog Crop Ảnh */}
                  <Dialog
                    open={cropDialogOpen}
                    onOpenChange={setCropDialogOpen}
                  >
                    <DialogContent className="max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Crop className="h-5 w-5" />
                          Chỉnh sửa ảnh đại diện
                        </DialogTitle>
                        <DialogDescription>
                          Di chuyển và điều chỉnh kích thước để cắt ảnh. Nhấn
                          lưu khi hoàn tất.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        {imgSrc && (
                          <div className="flex flex-col items-center gap-4">
                            <ReactCrop
                              crop={crop}
                              onChange={(_, percentCrop) =>
                                setCrop(percentCrop)
                              }
                              onComplete={(c) => setCompletedCrop(c)}
                              aspect={1}
                              circularCrop
                              className="max-h-[300px] rounded border"
                            >
                              <img
                                ref={imgRef}
                                alt="Ảnh đại diện"
                                src={imgSrc}
                                style={{
                                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                                  maxHeight: "300px",
                                  width: "auto",
                                }}
                                onLoad={onImageLoad}
                              />
                            </ReactCrop>

                            {/* Điều khiển chỉnh sửa */}
                            <div className="w-full space-y-4">
                              <div className="flex items-center gap-2">
                                <ZoomOut className="h-4 w-4 text-gray-500" />
                                <Slider
                                  min={0.5}
                                  max={3}
                                  step={0.01}
                                  value={[scale]}
                                  onValueChange={([value]) => setScale(value)}
                                  className="flex-1"
                                />
                                <ZoomIn className="h-4 w-4 text-gray-500" />
                              </div>

                              <div className="flex items-center gap-2">
                                <RotateCw className="h-4 w-4 text-gray-500" />
                                <Slider
                                  min={0}
                                  max={360}
                                  step={1}
                                  value={[rotation]}
                                  onValueChange={([value]) =>
                                    setRotation(value)
                                  }
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-500 w-8">
                                  {rotation}°
                                </span>
                              </div>
                            </div>

                            {/* Canvas preview (ẩn) */}
                            <div className="hidden">
                              <canvas
                                ref={previewCanvasRef}
                                style={{
                                  width: completedCrop?.width ?? 0,
                                  height: completedCrop?.height ?? 0,
                                }}
                              />
                            </div>

                            {/* Xem trước kết quả */}
                            {completedCrop && (
                              <div className="flex flex-col items-center">
                                <p className="text-sm text-gray-500 mb-2">
                                  Kết quả:
                                </p>
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md">
                                  <canvas
                                    ref={previewCanvasRef}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setCropDialogOpen(false);
                            setImgSrc("");
                          }}
                          disabled={uploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSaveCroppedImage}
                          disabled={
                            !completedCrop?.width ||
                            !completedCrop?.height ||
                            uploading
                          }
                          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                        >
                          {uploading ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Đang xử lý...
                            </div>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Lưu ảnh
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Form chỉnh sửa thông tin */}
            <Card className="md:col-span-2 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Chỉnh sửa thông tin hồ sơ của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Tên hiển thị</Label>
                      <Input
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        placeholder="Tên hiển thị của bạn"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex">
                        <Input
                          id="email"
                          name="email"
                          value={formData.email}
                          readOnly
                          disabled
                          className="bg-gray-100 rounded-r-none"
                        />
                        <Dialog
                          open={emailDialogOpen}
                          onOpenChange={setEmailDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              className="rounded-l-none bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Thay đổi địa chỉ email</DialogTitle>
                              <DialogDescription>
                                {!emailVerificationSent
                                  ? "Nhập địa chỉ email mới và yêu cầu mã xác thực."
                                  : "Nhập mã xác thực đã được gửi đến email mới của bạn."}
                              </DialogDescription>
                            </DialogHeader>
                            {!emailVerificationSent ? (
                              <form
                                onSubmit={handleRequestEmailVerification}
                                className="space-y-4 py-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="newEmail">Email mới</Label>
                                  <Input
                                    id="newEmail"
                                    name="newEmail"
                                    type="email"
                                    value={emailForm.newEmail}
                                    onChange={handleEmailInputChange}
                                    placeholder="Nhập địa chỉ email mới"
                                  />
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEmailDialogOpen(false)}
                                    disabled={sendingVerification}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={sendingVerification}
                                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                                  >
                                    {sendingVerification ? (
                                      <div className="flex items-center">
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Đang gửi...
                                      </div>
                                    ) : (
                                      "Gửi mã xác thực"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </form>
                            ) : (
                              <form
                                onSubmit={handleVerifyEmailChange}
                                className="space-y-4 py-4"
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label htmlFor="verificationCode">
                                      Mã xác thực
                                    </Label>
                                    <button
                                      type="button"
                                      className="text-xs text-blue-500 hover:text-blue-700"
                                      onClick={handleRequestEmailVerification}
                                      disabled={sendingVerification}
                                    >
                                      {sendingVerification
                                        ? "Đang gửi..."
                                        : "Gửi lại mã"}
                                    </button>
                                  </div>
                                  <Input
                                    id="verificationCode"
                                    name="verificationCode"
                                    value={emailForm.verificationCode}
                                    onChange={handleEmailInputChange}
                                    placeholder="Nhập mã xác thực từ email"
                                  />
                                  <p className="text-xs text-gray-500">
                                    Mã xác thực được gửi đến:{" "}
                                    {emailForm.newEmail}
                                  </p>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEmailVerificationSent(false);
                                      setEmailDialogOpen(false);
                                    }}
                                    disabled={verifyingEmail}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={verifyingEmail}
                                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                                  >
                                    {verifyingEmail ? (
                                      <div className="flex items-center">
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Đang xác thực...
                                      </div>
                                    ) : (
                                      "Xác nhận thay đổi"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                      <p className="text-xs text-gray-500">
                        Nhấn vào biểu tượng để thay đổi email
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại 10 chữ số"
                        maxLength={10}
                        pattern="\d{10}"
                      />
                      <p className="text-xs text-gray-500">
                        Số điện thoại phải có đúng 10 chữ số
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        readOnly
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">
                        Sử dụng nút "Đổi mật khẩu" để thay đổi mật khẩu
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog
                  open={passwordDialogOpen}
                  onOpenChange={setPasswordDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Đổi mật khẩu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Đổi mật khẩu</DialogTitle>
                      <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleChangePassword}
                      className="space-y-4 py-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Mật khẩu hiện tại
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Mật khẩu phải có ít nhất 6 ký tự
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Xác nhận mật khẩu mới
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPasswordDialogOpen(false)}
                          disabled={changingPassword}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          disabled={changingPassword}
                          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                        >
                          {changingPassword ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Đang xử lý...
                            </div>
                          ) : (
                            "Đổi mật khẩu"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => navigate(`/profile/${userId}`)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Đang lưu...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Thêm section xóa tài khoản */}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 px-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium text-red-500 mb-2">
                  Vùng nguy hiểm
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Hành động này không thể hoàn tác. Tài khoản của bạn sẽ bị xóa
                  vĩnh viễn.
                </p>

                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto self-start"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa tài khoản
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-red-500 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Xóa vĩnh viễn tài khoản
                      </DialogTitle>
                      <DialogDescription>
                        Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ
                        liệu của bạn. Không thể hoàn tác.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={handleDeleteAccount}
                      className="space-y-4 py-4"
                    >
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Cảnh báo</AlertTitle>
                        <AlertDescription>
                          Việc xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu
                          như: thông tin cá nhân, bài viết, kết nối, và tương
                          tác của bạn trên hệ thống.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="deleteConfirmation">
                          Nhập "
                          <span className="font-semibold">
                            {formData.userName}
                          </span>
                          " để xác nhận
                        </Label>
                        <Input
                          id="deleteConfirmation"
                          value={deleteConfirmation}
                          onChange={(e) =>
                            setDeleteConfirmation(e.target.value)
                          }
                          placeholder={`Nhập "${formData.userName}"`}
                          className="border-red-300 focus:border-red-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deletePassword">Mật khẩu</Label>
                        <div className="relative">
                          <Input
                            id="deletePassword"
                            type={showDeletePassword ? "text" : "password"}
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Nhập mật khẩu của bạn"
                            className="border-red-300 focus:border-red-400 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() =>
                              setShowDeletePassword(!showDeletePassword)
                            }
                          >
                            {showDeletePassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="deleteAgreement"
                          checked={deleteAgreement}
                          onCheckedChange={(checked) =>
                            setDeleteAgreement(checked === true)
                          }
                        />
                        <label
                          htmlFor="deleteAgreement"
                          className="text-sm leading-none"
                        >
                          Tôi hiểu rằng hành động này không thể hoàn tác và tôi
                          sẽ mất tất cả dữ liệu
                        </label>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setDeleteDialogOpen(false);
                            setDeleteConfirmation("");
                            setDeletePassword("");
                            setDeleteAgreement(false);
                          }}
                          disabled={deletingAccount}
                          className="mr-2"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={
                            deletingAccount ||
                            deleteConfirmation !== formData.userName ||
                            !deletePassword ||
                            !deleteAgreement
                          }
                        >
                          {deletingAccount ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Đang xử lý...
                            </div>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xác nhận xóa tài khoản
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditProfile;
