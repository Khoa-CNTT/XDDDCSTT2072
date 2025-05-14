import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../services/api/axios";
import backgroundImage from "../assets/page-signup-signin/sign-up.jpg";
import smallImage from "../assets/page-signup-signin/sign-up.jpg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useState } from "react";

const formSchema = z
  .object({
    userName: z.string().min(3, "UserName must to have at least 3 characters"),
    email: z.string().email("Email is not valid"),
    phone: z
      .string()
      .regex(
        /^[0-9]{10}$/,
        "Phone number is not valid. Please enter 10 characters"
      ),
    password: z.string().min(6, "Password must to have at least 6 characters"),
    confirmPassword: z.string(),
    image: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password isn't matched",
    path: ["confirmPassword"],
  });

const Register = () => {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  console.log(errors);
  // const { ref: avatarRef, ...rest } = register("image");

  const mutation = useMutation({
    mutationFn: async (formData) => {
      console.log("Đang gửi request đăng ký...");
      return await axiosInstance.post("/users/register-with-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (data) => {
      console.log("Đăng ký thành công:", data);
      toast.success("Đăng ký thành công!");
      reset();
      navigate("/account/login");
    },
    onError: (error) => {
      console.error("Lỗi đăng ký:", error);
      toast.error(
        error.response?.data || "Đăng ký thất bại, vui lòng thử lại sau"
      );
    },
  });

  // handle file change
  // const handleFileChange = (e) => {
  //   const file = e.target.files?.[0];
  //   // console.log(file);
  //   if (file) {
  //     setPreviewImage(URL.createObjectURL(file));
  //   }
  //   avatarRef.onChange(e);
  // };

  const onSubmit = (data) => {
    console.log("Dữ liệu form:", data);

    const formData = new FormData();
    formData.append("userName", data.userName);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);
    // formData.append("confirmPassword", data.confirmPassword);
    if (data.image && data.image[0]) {
      formData.append("image", data.image[0]);
      console.log("Ảnh để upload:", data.image[0]);
    }
    mutation.mutate(formData);
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
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative z-10 bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden w-full max-w-4xl border border-gray-300">
        <div className="w-full md:w-1/2 hidden md:block border-r border-gray-300">
          <img
            src={smallImage}
            alt="Signup"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white font-bold border border-gray-300">
              Logo
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div>
              <Input placeholder="Username" {...register("userName")} />
              {errors.userName && (
                <p className="text-red-500 text-sm">
                  {errors.userName.message}
                </p>
              )}
            </div>
            <div>
              <Input placeholder="Email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Input placeholder="Phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Input
                placeholder="Confirm Password"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                id="file-input"
                {...register("image", {
                  onChange: (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  },
                })}
                className="hidden"
                accept="image/*"
              />
              <label htmlFor="file-input">
                <Button
                  type="button"
                  variant="outline"
                  className="max-w-[200px]"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  {previewImage ? "Change Avatar" : "Select Avatar"}
                </Button>
              </label>
              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Loading..." : "Submit"}
            </Button>
          </form>

          <p
            className="text-center text-gray-500 mt-4 text-sm cursor-pointer"
            onClick={() => navigate("/account/login")}
          >
            Bạn đã có tài khoản?{" "}
            <span className="text-blue-500 hover:underline">Đăng nhập</span>
          </p>
          <p className="text-center text-gray-500 text-sm">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <span className="text-blue-500 hover:underline">
              Điều khoản sử dụng
            </span>{" "}
            và{" "}
            <span className="text-blue-500 hover:underline">
              Chính sách bảo mật
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
