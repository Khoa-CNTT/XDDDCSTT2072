import { useState } from "react";
import backgroundImage from "../assets/page-signup-signin/sign-in.jpg";
import Input from "../components/shared/Input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "@/services/accountService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: (email) => forgotPassword(email),
    onSuccess: () => {
      toast.success("Vui lòng kiểm tra email!");
      setEmail("");
      navigate("/account/reset-password");
    },
    onError: (error) => {
      console.log(error);
      toast.error(
        error.response.data.errorMessage ||
          "Failed to send reset password email"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không đúng định dạng");
      return;
    }

    mutate(email);
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
          Quên mật khẩu
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className={`w-full p-3 rounded-md transition duration-300 cursor-pointer ${
              isPending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={isPending}
          >
            {isPending ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
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

export default ForgotPassword;
