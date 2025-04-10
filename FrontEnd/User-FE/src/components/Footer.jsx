import React, { useState, useEffect } from 'react';
import { FaTwitter, FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Footer() {
  const [position, setPosition] = useState(null);
  const address = "03 Quang Trung, Thành phố Đà Nẵng, Việt Nam";

  // Lấy tọa độ từ địa chỉ
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await axios.get(
          'https://nominatim.openstreetmap.org/search',
          {
            params: {
              q: address,
              format: 'json',
              limit: 1,
            },
          }
        );

        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setPosition([parseFloat(lat), parseFloat(lon)]);
        } else {
          // Nếu không tìm thấy tọa độ, sử dụng tọa độ mặc định (Đà Nẵng)
          setPosition([16.0544, 108.2022]);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        // Nếu có lỗi, sử dụng tọa độ mặc định (Đà Nẵng)
        setPosition([16.0544, 108.2022]);
      }
    };

    fetchCoordinates();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-10 px-4">
      <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Address */}
        <div className="text-left">
          <div className="border border-white text-center py-4 w-24 mb-4 mx-auto">Logo</div>
          <p className="text-sm leading-relaxed">
            Address: 03 Quang Trung, Thành phố Đà Nẵng, Việt Nam
          </p>
          <p className="text-sm leading-relaxed">Phone: 0236 3827 111</p>
          <p className="text-sm leading-relaxed">Email: truongkhoahocmaytinh.com</p>
        </div>

        {/* Our Links */}
        <div className="text-center md:text-left">
          <h3 className="mb-4 font-semibold text-lg">OUR LINKS</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-gray-400">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                FarmHub
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                ChatAI
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                News
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="text-center md:text-left">
          <h3 className="mb-4 font-semibold text-lg">CONTACT US</h3>
          <div className="flex items-center justify-center md:justify-start mb-4">
            <input
              type="email"
              placeholder="your e-mail"
              className="p-2 w-full max-w-[200px] bg-gray-800 border border-gray-700 focus:outline-none rounded-l-lg"
            />
            <button className="bg-white text-black px-4 py-2 rounded-r-lg">
              Submit
            </button>
          </div>
          <h4 className="mt-4 font-semibold">FOLLOW US</h4>
          <div className="flex justify-center md:justify-start space-x-4 mt-2">
            <a href="#" className="hover:text-gray-400">
              <FaTwitter className="cursor-pointer text-xl" />
            </a>
            <a href="#" className="hover:text-gray-400">
              <FaFacebookF className="cursor-pointer text-xl" />
            </a>
            <a href="#" className="hover:text-gray-400">
              <FaInstagram className="cursor-pointer text-xl" />
            </a>
            <a href="#" className="hover:text-gray-400">
              <FaTiktok className="cursor-pointer text-xl" />
            </a>
            <a href="#" className="hover:text-gray-400">
              <FaYoutube className="cursor-pointer text-xl" />
            </a>
          </div>
        </div>

        {/* Map */}
        <div className="text-center md:text-left">
          <h3 className="mb-4 font-semibold text-lg">MAP</h3>
          {position ? (
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: '80px', width: '120px' }}
              className="rounded-lg mx-auto md:mx-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={position}>
                <Popup>03 Quang Trung, Đà Nẵng</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p className="text-sm">Loading map...</p>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;