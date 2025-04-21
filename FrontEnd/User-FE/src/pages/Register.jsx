import React, { useState } from 'react'; 
import backgroundImage from '../assets/page-signup-signin/sign-up.jpg';
import smallImage from '../assets/page-signup-signin/sign-up.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    userName: '',   
    email: '',
    password: '',
    phone: '',  
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let err = {};
    let valid = true;

    if (!formValues.userName.trim()) {  
        err.userName = "Vui lòng nhập Tên đăng nhập.";
        valid = false;
    } else if (formValues.userName.trim().length < 3) {
        err.userName = "Tên đăng nhập phải có ít nhất 3 ký tự.";
        valid = false;
    }

    if (!formValues.email.trim()) {
        err.email = "Vui lòng nhập Email.";
        valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
        err.email = "Email không hợp lệ.";
        valid = false;
    }

    if (!formValues.password) {
        err.password = "Vui lòng nhập Password.";
        valid = false;
    } else if (formValues.password.length < 6) {
        err.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        valid = false;
    }
    if (!formValues.phone) {
      err.phone = "Vui lòng nhập số điện thoại.";
      valid = false;
    } else if (!/^\d{10}$/.test(formValues.phone)) {
      err.phone = "Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.";
      valid = false;
    }

    if (!formValues.confirmPassword) {
        err.confirmPassword = "Vui lòng nhập Confirm Password.";
        valid = false;
    } else if (formValues.password !== formValues.confirmPassword) {
        err.confirmPassword = "Mật khẩu xác nhận không khớp.";
        valid = false;
    }

    setErrors(err);
    return valid;
}

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');
    setSuccess('');

    if (validate()) {
        const formData = new FormData();
        formData.append("userName", formValues.userName);  
        formData.append("email", formValues.email);
        formData.append("password", formValues.password);
        formData.append("phone", formValues.phone);  
        formData.append("confirmPassword", formValues.confirmPassword);

        axios.post("http://localhost:8080/api/v1/users/register-with-image", formData)
            .then((response) => {
                console.log(response.data);
                if (response.data.error) {
                    setRegisterError(response.data.error);
                } else {
                    setSuccess("Đăng ký thành công!");
                    setFormValues({ userName: '', email: '', password: '', phone:'', confirmPassword: '' });  
                    setErrors({});
                }
            })
            .catch((err) => {
                console.error(err.response);
                setRegisterError("Đăng ký thất bại, vui lòng thử lại.");
            });
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black opacity-30"></div>

      <div className="relative z-10 bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden w-full max-w-4xl border border-gray-300">
        <div className="w-full md:w-1/2 hidden md:block border-r border-gray-300">
          <img src={smallImage} alt="Signup" className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white font-bold border border-gray-300">
              Logo
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

          {registerError && <p className="text-red-500 text-center mb-4">{registerError}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={formValues.userName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.userName && <p className="text-red-500 text-sm">{errors.userName}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formValues.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formValues.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formValues.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formValues.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Confirm
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4 text-sm" onClick={() => navigate("/login")}>
            Bạn đã có tài khoản? <a href="#" className="text-blue-500 hover:underline">Đăng nhập</a>
          </p>
          <p className="text-center text-gray-500 text-sm" >
            Bằng cách đăng ký, bạn đồng ý với <a href="#" className="text-blue-500 hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-blue-500 hover:underline">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
