import { FaTwitter, FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import mapImages from "../assets/images/map.jpg";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 px-4">
      <div className="container mx-auto grid grid-cols-4 gap-x-16 justify-between">
        <div className="text-left">
          <div className="bg-gray-700 text-center py-4 w-32 mb-4 mx-auto">Logo</div>
          <p className="text-sm">Address: Phú Hoà 2,Hoà Nhơn,Hoà Vang-Tp Đà Nẵng</p>
          <p className="text-sm">Phone: 0236 3827 111</p>
          <p className="text-sm">Email: truongkhoahocmaytinh.com</p>
        </div>
        
        <div className="text-center">
          <h3 className="mb-4 font-semibold">OUR LINKS</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-gray-400">Home</a></li>
            <li><a href="#" className="hover:text-gray-400">FarmHub</a></li>
            <li><a href="#" className="hover:text-gray-400">ChatAI</a></li>
            <li><a href="#" className="hover:text-gray-400">News</a></li>
            <li><a href="#" className="hover:text-gray-400">About Us</a></li>
          </ul>
        </div>
        
        <div className="text-center">
          <h3 className="mb-4 font-semibold">CONTACT US</h3>
          <div className="flex items-center justify-center">
            <input
              type="email"
              placeholder="your e-mail"
              className="p-2 w-full bg-gray-800 border border-gray-700 focus:outline-none rounded-lg"
            />
            <button className="bg-white text-black px-4 py-2 ml-2 rounded-lg">Submit</button>
          </div>
          <h4 className="mt-4">Follow Us</h4>
          <div className="flex justify-center space-x-4 mt-2">
            <FaTwitter className="cursor-pointer text-xl" />
            <FaFacebookF className="cursor-pointer text-xl" />
            <FaInstagram className="cursor-pointer text-xl" />
            <FaTiktok className="cursor-pointer text-xl" />
            <FaYoutube className="cursor-pointer text-xl" />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="mb-4 font-semibold">MAP</h3>
          <img
            src={mapImages}
            alt="Map"
            className="w-32 h-20 object-cover mx-auto"
          />
        </div>
      </div>
    </footer>
  );
}
export default Footer
