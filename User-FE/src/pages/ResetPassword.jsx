import { useState } from "react";
import backgroundImage from "../assets/page-signup-signin/sign-in.jpg";
import Input from "../components/shared/Input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "@/services/accountService";

const ResetPassword = () => {
  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success("Mật khẩu đã được đặt lại thành công!");
      navigate("/account/login");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response?.data || "Đặt lại mật khẩu thất bại");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    if (!token) {
      toast.error("Vui lòng nhập token xác nhận");
      return;
    }
    mutate({ token, newPassword });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-30 backdrop-blur-md pointer-events-none"></div>
      <div className="relative z-10 bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto">
          LOGO
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Đặt lại mật khẩu
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Token xác nhận"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            className={`w-full p-3 rounded-md cursor-pointer transition duration-300 ${
              isPending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={isPending}
          >
            {isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-4 text-sm">
          <Link to="/account/login" className="text-blue-500 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
