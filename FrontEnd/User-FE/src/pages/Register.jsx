import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import backgroundImage from "../assets/page-signup-signin/sign-up.jpg";
import smallImage from "../assets/page-signup-signin/sign-up.jpg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const formSchema = z.object({
  userName: z.string().min(3, "UserName must to have at least 3 characters"),
  email: z.string().email("Email is not valid"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number is not valid. Please enter 10 characters"),
  password: z.string().min(6, "Password must to have at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password isn't matched",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.post("http://localhost:8080/api/v1/users/register-with-image", formData);
    },
    onSuccess: () => {
      toast.success("Đăng ký thành công!");
      reset();
      navigate("/account/login");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data);
    }
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
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
                <p className="text-red-500 text-sm">{errors.userName.message}</p>
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
              <Input placeholder="Password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Confirm Password"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isLoading}>
              {mutation.isLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </form>

          <p
            className="text-center text-gray-500 mt-4 text-sm cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Bạn đã có tài khoản? <span className="text-blue-500 hover:underline">Đăng nhập</span>
          </p>
          <p className="text-center text-gray-500 text-sm">
            Bằng cách đăng ký, bạn đồng ý với <span className="text-blue-500 hover:underline">Điều khoản sử dụng</span> và <span className="text-blue-500 hover:underline">Chính sách bảo mật</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;