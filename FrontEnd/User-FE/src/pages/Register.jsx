import React from 'react'; // eslint-disable-line no-unused-vars
import backgroundImage from '../assets/page-signup-signin/sign-up.jpg';
import smallImage from '../assets/page-signup-signin/sign-up.jpg';

const SignupForm = () => {
  return (
    //  background to
    <div className="min-h-screen flex items-center justify-center relative p-4" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black opacity-30"></div>
      {/* khối section hình ảnh và form */}
      <div className="relative z-10 bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden w-full max-w-4xl border border-gray-300">
        <div className="w-full md:w-1/2 hidden md:block border-r border-gray-300">
          <img src={smallImage} alt="Signup" className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white font-bold border border-gray-300">
                  Logo {/* khối này sau khi có logo sửa sau */}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Confirm
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4 text-sm">
            Bạn đã có tài khoản? <a href="#" className="text-blue-500 hover:underline">Đăng nhập</a>
          </p>
          <p className="text-center text-gray-500 text-sm">
            Bằng cách đăng ký, bạn đồng ý với <a href="#" className="text-blue-500 hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-blue-500 hover:underline">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;