import React, { useState } from "react"; // eslint-disable-line no-unused-vars
import backgroundImage from "../assets/page-signup-signin/sign-in.jpg";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import Input from "../components/shared/Input";
import axios from "axios";

const LoginPage = () => {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [error, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let err = {};
    let isValid = true;

    if (!formValues.email || formValues.email.trim() === "") {
      err.email = "Vui lòng nhập Email.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      err.email = "Email không hợp lệ.";
      isValid = false;
    }

    if (!formValues.password || formValues.password.trim() === "") {
      err.password = "Vui lòng nhập mật khẩu.";
      isValid = false;
    } else if(formValues.password.length <6 ){
      err.password = "Mật khẩu phải từ 6 kí tự"
      isValid = false;
    }

    setErrors(err);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    setSuccess('');
  
    if (validate()) {
      axios.post("http://localhost:8080/api/v1/users/login", {
        email: formValues.email,
        password: formValues.password
      })
        .then((response) => {
          console.log("API response:", response); 
          setSuccess("Đăng nhập thành công!");
          setFormValues({ email: "", password: "" });
          setErrors({});
          localStorage.setItem("loginInfo",JSON.stringify(response.data))
        })
        .catch((error) => {
          console.log("API error:", error); 
          setLoginError("Email hoặc mật khẩu không đúng!");
        });
    }
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
          <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

          {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}
          {success && <div className="text-green-500 text-sm mb-2">{success}</div>}

          <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit} noValidate>
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formValues.email}
                onChange={handleChange}
              />
              {error.email && <div className="text-red-500 text-sm mt-1">{error.email}</div>}
            </div>

            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formValues.password}
                onChange={handleChange}
                autoComplete="off"
              />
              {error.password && <div className="text-red-500 text-sm mt-1">{error.password}</div>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Sign In
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-3">Quên mật khẩu?</div>

          <div className="flex items-center justify-center mt-3">
            <p className="text-gray-600 text-sm mr-2">Or Login With</p>
            <div className="flex space-x-4">
              <FaFacebook className="text-blue-600 text-2xl cursor-pointer" />
              <FaGoogle className="text-red-600 text-2xl cursor-pointer" />
            </div>
          </div>

          <p className="text-center text-gray-500 mt-3 text-sm">
            Bạn chưa có tài khoản?{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Đăng Ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
