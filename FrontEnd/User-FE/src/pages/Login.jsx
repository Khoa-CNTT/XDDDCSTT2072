import React, { useEffect, useState } from "react"; // eslint-disable-line no-unused-vars
import backgroundImage from "../assets/page-signup-signin/sign-in.jpg";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import Input from "../components/shared/Input";
import axiosInstance from "../services/api/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router";

const login = async ({ email, password }) => {
  try {
    const res = await axiosInstance.post("/users/login", {
      email,
      password,
    });
    toast.success("Login successfully");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const Login = () => {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // Get the intended destination from the location state
  const from = location.state?.from?.pathname || "/home";
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("auth");
    if (sessionAuth) {
      navigate(from, { replace: true });
      // navigate(from, { replace: true });
    }
  }, [from, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const accessToken = data.token;
      const user = data.user;
      const roleName = data.user.roleName;
      const authData = { accessToken, user, roleName };
      setAuth(authData);
      sessionStorage.setItem("auth", JSON.stringify(authData));
      setEmail("");
      setPassword("");
      // Navigate to the intended destination or home
      navigate(from, { replace: true });
    },
    onError: (error) => {
      if (error.response?.data?.email) {
        toast.error(error.response.data.email);
        return;
      }
      if (error.response?.data?.password) {
        toast.error(error.response.data.password);
        return;
      }
      if (error.response?.data?.error) {
        toast.error(error.response.data.message);
        return;
      }
      if (error.message) {
        toast.error(error.message);
      }
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    mutate({ email, password });
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
      <div className="relative z-10 bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden w-full max-w-3xl border border-gray-300">
        <div className="w-full md:w-1/2 hidden md:block">
          <img
            src={backgroundImage}
            alt="Sign In Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
            LOGO
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-black">
            Sign In
          </h2>
          <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
            <Input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            <Input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />

            <button
              type="submit"
              onClick={handleLogin}
              className={`w-full p-3 rounded-md transition duration-300 ${
                isPending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isPending ? "Loading..." : "Sign In"}
            </button>
          </form>
          <div className="text-center text-xl text-gray-600 mt-3 cursor-pointer font-medium">
            <Link to="/account/forgot-password" className="hover:text-blue-600">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="flex items-center justify-center mt-3">
            <p className="text-gray-600 text-sm mr-2">Or Login With</p>
            <div className="flex space-x-4">
              <FaFacebook className="text-blue-600 text-2xl cursor-pointer" />
              <FaGoogle className="text-red-600 text-2xl cursor-pointer" />
            </div>
          </div>

          <p className="text-center text-gray-500 mt-3 text-sm">
            Bạn chưa có tài khoản?{" "}
            <span className="text-xl font-bold">
              <Link to="/account/register">Đăng Ký</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
