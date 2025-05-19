import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudFog,
  Droplets,
  Wind,
  ThermometerSun,
  Search,
  BellRing,
  BellOff,
  MapPin,
  Leaf,
  LightbulbIcon,
  Sprout,
  AlertTriangle,
  ShoppingCart,
  ShoppingBasket,
  Shovel,
  Star,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import weatherService from "@/services/weatherService";

const WeatherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [advice, setAdvice] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [currentCity, setCurrentCity] = useState("Ho Chi Minh City");
  const [currentCountry] = useState("VN");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [locationId, setLocationId] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  // Tải dữ liệu thời tiết hiện tại
  const fetchCurrentWeather = async () => {
    try {
      setLoading(true);
      const response = await weatherService.getCurrentWeather(
        currentCity,
        currentCountry
      );
      console.log("Thông tin thời tiết nhận được từ API:", response);

      if (response) {
        console.log("Thông tin thời tiết trước khi đặt state:", response);

        // Xử lý dữ liệu thô để đảm bảo tất cả các trường đều được định nghĩa
        const processedData = {
          city: response.city || currentCity,
          country: response.country || currentCountry,
          temperature: response.temperature || 0,
          humidity: response.humidity || 0,
          windSpeed: response.windSpeed || 0,
          weatherDescription: response.weatherDescription || "Không xác định",
          latitude: response.latitude || 0,
          longitude: response.longitude || 0,
          dataTime: response.dataTime || new Date().toISOString(),
        };

        setWeatherData(processedData);
        console.log("Thông tin thời tiết sau khi xử lý:", processedData);
      } else {
        throw new Error("Không nhận được dữ liệu thời tiết");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin thời tiết:", error);

      // Log chi tiết hơn về lỗi
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("Request was made but no response received");
      }

      // Hiển thị thông báo lỗi với hướng dẫn
      toast.error(
        <div className="space-y-2">
          <div className="font-semibold">Không thể tải thông tin thời tiết</div>
          <p className="text-sm text-gray-200">
            Khuyến nghị: kiểm tra kết nối mạng, xác minh API đang hoạt động
          </p>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                toast.dismiss();
                fetchCurrentWeather();
              }}
              className="bg-white text-red-600 px-3 py-1 rounded-sm text-xs font-medium hover:bg-opacity-90 transition-colors duration-200"
            >
              <RefreshCcw className="w-3 h-3 mr-1 inline" /> Thử lại
            </button>
          </div>
        </div>,
        {
          autoClose: 8000,
          closeOnClick: false,
        }
      );

      // Dữ liệu giả khi API không hoạt động
      const mockData = {
        city: currentCity,
        country: currentCountry,
        temperature: 32,
        humidity: 78,
        windSpeed: 12,
        weatherDescription: "Có mây",
        latitude: 10.82,
        longitude: 106.63,
        dataTime: new Date().toISOString(),
      };

      console.log("Sử dụng dữ liệu giả:", mockData);
      setWeatherData(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Tải dự báo thời tiết
  const fetchForecast = async () => {
    try {
      setLoading(true); // Bắt đầu loading khi gọi API
      const response = await weatherService.getWeatherForecast(
        currentCity,
        currentCountry
      );
      console.log("Raw API response:", response);

      // Kiểm tra cấu trúc phản hồi API
      if (response) {
        // API có thể trả về dữ liệu trực tiếp dưới dạng mảng
        if (Array.isArray(response)) {
          // Bổ sung lời khuyên nông nghiệp cho mỗi ngày dự báo
          const forecastWithAdvice = await Promise.all(
            response.map(async (day) => {
              try {
                // Gọi API lấy lời khuyên theo điều kiện thời tiết
                const adviceResponse =
                  await weatherService.getAdviceByWeatherCondition(
                    day.weatherDescription,
                    day.temperature,
                    day.humidity
                  );

                // Nếu có lời khuyên từ API, sử dụng nó, ngược lại tạo lời khuyên mặc định
                return {
                  ...day,
                  advice:
                    adviceResponse ||
                    weatherService.createDefaultAdvice(
                      day.weatherDescription,
                      day.temperature,
                      day.humidity
                    ),
                };
              } catch (error) {
                console.error("Lỗi khi lấy lời khuyên cho ngày dự báo:", error);
                // Tạo lời khuyên mặc định khi có lỗi
                return {
                  ...day,
                  advice: weatherService.createDefaultAdvice(
                    day.weatherDescription,
                    day.temperature,
                    day.humidity
                  ),
                };
              }
            })
          );

          setForecast(forecastWithAdvice);
          console.log("Dự báo thời tiết với lời khuyên:", forecastWithAdvice);
        }
        // Hoặc có thể đóng gói trong thuộc tính data
        else if (response.data && Array.isArray(response.data)) {
          // Tương tự xử lý như trên
          const forecastWithAdvice = await Promise.all(
            response.data.map(async (day) => {
              try {
                const adviceResponse =
                  await weatherService.getAdviceByWeatherCondition(
                    day.weatherDescription,
                    day.temperature,
                    day.humidity
                  );

                return {
                  ...day,
                  advice:
                    adviceResponse ||
                    weatherService.createDefaultAdvice(
                      day.weatherDescription,
                      day.temperature,
                      day.humidity
                    ),
                };
              } catch (error) {
                console.error("Lỗi khi lấy lời khuyên cho ngày dự báo:", error);
                return {
                  ...day,
                  advice: weatherService.createDefaultAdvice(
                    day.weatherDescription,
                    day.temperature,
                    day.humidity
                  ),
                };
              }
            })
          );

          setForecast(forecastWithAdvice);
          console.log("Dự báo thời tiết với lời khuyên:", forecastWithAdvice);
        } else {
          console.warn(
            "Cấu trúc dữ liệu dự báo không đúng định dạng mảng:",
            response
          );
          // Sử dụng dữ liệu giả nếu cấu trúc không đúng
          createMockForecast();
        }
      } else {
        console.error("Không có dữ liệu từ API:", response);
        // Sử dụng dữ liệu giả nếu không có dữ liệu
        createMockForecast();
      }
    } catch (error) {
      console.error("Lỗi khi tải dự báo thời tiết:", error);
      console.error("Error type:", typeof error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);

        // Hiển thị thông báo lỗi cụ thể hơn và cho phép người dùng thử lại
        toast.error(
          <div>
            <strong>Không thể tải dự báo thời tiết</strong>
            <p>Vui lòng thử lại sau.</p>
            <button
              onClick={() => {
                toast.dismiss();
                fetchForecast();
              }}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Thử lại
            </button>
          </div>,
          {
            autoClose: false,
            closeOnClick: false,
          }
        );
      } else if (error.request) {
        // Yêu cầu được gửi nhưng không nhận được phản hồi
        console.error("Request sent but no response received:", error.request);
        toast.error(
          <div>
            <strong>Không thể kết nối đến máy chủ</strong>
            <p>Vui lòng kiểm tra kết nối mạng.</p>
            <button
              onClick={() => {
                toast.dismiss();
                fetchForecast();
              }}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Thử lại
            </button>
          </div>,
          {
            autoClose: false,
            closeOnClick: false,
          }
        );
      } else {
        // Lỗi khi thiết lập request
        toast.error(
          <div>
            <strong>Không thể tải dự báo thời tiết</strong>
            <p>Vui lòng thử lại sau.</p>
            <button
              onClick={() => {
                toast.dismiss();
                fetchForecast();
              }}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Thử lại
            </button>
          </div>,
          {
            autoClose: false,
            closeOnClick: false,
          }
        );
      }

      // Sử dụng dữ liệu giả khi có lỗi
      createMockForecast();
    } finally {
      setLoading(false); // Kết thúc loading dù thành công hay thất bại
    }
  };

  // Tạo lời khuyên mặc định dựa vào thông tin thời tiết
  const createDefaultAdvice = (weatherData) => {
    const desc = weatherData?.weatherDescription?.toLowerCase() || "";
    const temp = weatherData?.temperature || 28;
    const humidity = weatherData?.humidity || 70;

    // Mưa
    if (desc.includes("mưa to") || desc.includes("heavy rain")) {
      return {
        farmingAdvice:
          "Hạn chế ra đồng, kiểm tra hệ thống thoát nước. Bảo vệ cây trồng tránh ngập úng.",
        cropAdvice: "Không nên gieo hạt hoặc bón phân trong thời tiết mưa to.",
        warnings: "Cảnh báo ngập úng, sạt lở. Gia cố mái che, rãnh thoát nước.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: false,
      };
    } else if (desc.includes("mưa") || desc.includes("rain")) {
      return {
        farmingAdvice:
          "Tạm dừng phun thuốc, chăm sóc hệ thống thoát nước. Bón phân sau khi mưa tạnh.",
        cropAdvice: "Phù hợp trồng lúa, rau muống và các loại cây ưa nước.",
        warnings: "Lưu ý nấm bệnh có thể phát triển trong điều kiện ẩm ướt.",
        isSuitableForPlanting: true,
        isSuitableForHarvesting: false,
      };
    }
    // Nắng
    else if (temp > 35) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp > 30) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp > 25) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp > 20) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp > 15) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp > 10) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp > 5) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp > 0) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (temp < 0) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    }
    // Nắng
    else if (desc.includes("nắng gay gắt") || desc.includes("intense sun")) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    } else if (
      desc.includes("nắng") ||
      desc.includes("sunny") ||
      desc.includes("clear")
    ) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    }
    // Foggy conditions - Điều kiện sương mù
    else if (
      desc.includes("sương mù") ||
      desc.includes("fog") ||
      desc.includes("mist")
    ) {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    }
    // Default condition
    else {
      return {
        farmingAdvice:
          "Tưới nước thường xuyên vào sáng sớm và chiều tối. Sử dụng lưới che nắng.",
        cropAdvice:
          "Phù hợp trồng các loại cây chịu nhiệt như đậu bắp, ớt, mướp.",
        warnings: "Cảnh báo cháy nắng, thiếu nước. Tránh tưới nước giữa trưa.",
        isSuitableForPlanting: false,
        isSuitableForHarvesting: true,
      };
    }
  };

  // Tạo dữ liệu dự báo giả
  const createMockForecast = () => {
    const mockForecast = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Tạo ngày tháng hiển thị dạng "dd/MM"
      const displayDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      // Tạo thông tin thời tiết ngẫu nhiên
      const temperature = 28 + Math.floor(Math.random() * 8);
      const weatherDescription = ["Nắng", "Mây", "Mưa nhẹ", "Nắng gián đoạn"][
        Math.floor(Math.random() * 4)
      ];
      const humidity = 70 + Math.floor(Math.random() * 20);
      const windSpeed = 8 + Math.floor(Math.random() * 10);

      // Tạo lời khuyên dựa trên thông tin thời tiết ngẫu nhiên
      const advice = weatherService.createDefaultAdvice(
        weatherDescription,
        temperature,
        humidity
      );

      // Thêm dữ liệu dự báo với lời khuyên nông nghiệp tương ứng
      mockForecast.push({
        city: currentCity,
        country: currentCountry,
        temperature: temperature,
        humidity: humidity,
        windSpeed: windSpeed,
        weatherDescription: weatherDescription,
        dataTime: date.toISOString(),
        displayDate: displayDate,
        advice: advice,
      });
    }
    setForecast(mockForecast);
  };

  // Tải lời khuyên nông nghiệp
  const fetchAdvice = async () => {
    try {
      const response = await weatherService.getLatestAgriculturalAdvice(
        currentCity,
        currentCountry
      );
      console.log("Lời khuyên nông nghiệp nhận được:", response);

      // Xử lý dữ liệu từ API để đảm bảo đúng định dạng
      if (response) {
        // Dữ liệu AgriculturalAdviceDTO đã được ánh xạ từ backend
        const processedAdvice = {
          // Chỉ sử dụng dữ liệu từ response, không thêm trường mới
          id: response.id,
          city: response.weatherData?.city || currentCity,
          country: response.weatherData?.country || currentCountry,
          weatherSummary: response.weatherSummary,
          farmingAdvice: response.farmingAdvice,
          cropAdvice: response.cropAdvice,
          warnings: response.warnings,
          isRainySeason: response.isRainySeason,
          isDrySeason: response.isDrySeason,
          isSuitableForPlanting: response.isSuitableForPlanting,
          isSuitableForHarvesting: response.isSuitableForHarvesting,
          recommendedActivities: response.recommendedActivities,
          lastUpdated:
            response.updatedAt ||
            response.createdAt ||
            new Date().toISOString(),
        };
        setAdvice(processedAdvice);
      } else {
        throw new Error("Không có dữ liệu lời khuyên nông nghiệp");
      }
    } catch (error) {
      console.error("Lỗi khi tải lời khuyên nông nghiệp:", error);

      // Bỏ toast error và hiển thị thông báo tinh tế hơn
      console.log("Đang tạo dữ liệu giả cho lời khuyên nông nghiệp");

      // Tạo dữ liệu giả cho lời khuyên nông nghiệp
      const mockAdvice = weatherService.createMockAdvice(
        currentCity,
        currentCountry,
        weatherData
      );
      console.log("Sử dụng dữ liệu giả cho lời khuyên:", mockAdvice);
      setAdvice(mockAdvice);
    }
  };

  // Tải sản phẩm gợi ý theo thời tiết
  const fetchProducts = async () => {
    try {
      // Ưu tiên sử dụng API chính
      const encodedCity = encodeURIComponent(currentCity);
      const encodedCountry = encodeURIComponent(currentCountry);

      // Thử gọi từ 3 API endpoint có thể có để lấy sản phẩm thực tế
      const urls = [
        `http://localhost:8080/api/v1/weather-recommendations/by-weather?city=${encodedCity}&country=${encodedCountry}&page=0&size=6`,
        `http://localhost:8080/api/v1/marketplace/seasonal-products?page=0&size=6`,
        `http://localhost:8080/api/v1/products/recommendations?page=0&size=6`,
      ];

      let response = null;
      let successIndex = -1;

      // Thử từng URL cho đến khi có phản hồi thành công
      for (let i = 0; i < urls.length; i++) {
        try {
          console.log(
            `Thử gọi API từ URL (${i + 1}/${urls.length}): ${urls[i]}`
          );
          const result = await axios.get(urls[i], {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            responseType: "json",
            timeout: 5000, // Giới hạn thời gian chờ 5 giây
          });

          if (result.status === 200 && result.data) {
            response = result;
            successIndex = i;
            console.log(`API URL #${i + 1} trả về thành công!`);
            break;
          }
        } catch (err) {
          console.log(`API URL #${i + 1} không khả dụng: ${err.message}`);
        }
      }

      if (!response) {
        throw new Error("Không thể kết nối đến bất kỳ API endpoint nào");
      }

      console.log(`API #${successIndex + 1} response:`, response);

      // Kiểm tra và xử lý các cấu trúc dữ liệu trả về có thể có
      let productList = [];

      // Trường hợp 1: Cấu trúc data > data > seasonalProducts > content
      if (
        response?.data?.data &&
        response.data.data?.seasonalProducts &&
        Array.isArray(response.data.data.seasonalProducts?.content)
      ) {
        console.log(
          "Sản phẩm ở dạng nested (data -> seasonalProducts -> content)"
        );
        productList = response.data.data.seasonalProducts.content;
      }
      // Trường hợp 2: Cấu trúc data > seasonalProducts > content
      else if (
        response?.data &&
        response.data?.seasonalProducts &&
        Array.isArray(response.data.seasonalProducts?.content)
      ) {
        console.log("Sản phẩm ở dạng (data -> seasonalProducts -> content)");
        productList = response.data.seasonalProducts.content;
      }
      // Trường hợp 3: Cấu trúc data > content
      else if (response?.data && Array.isArray(response.data?.content)) {
        console.log("Sản phẩm ở dạng (data -> content)");
        productList = response.data.content;
      }
      // Trường hợp 4: seasonalProducts là mảng trực tiếp
      else if (
        response?.data?.data &&
        Array.isArray(response.data.data?.seasonalProducts)
      ) {
        console.log(
          "Sản phẩm ở dạng mảng trực tiếp (data -> seasonalProducts[])"
        );
        productList = response.data.data.seasonalProducts;
      }
      // Trường hợp 5: data là mảng trực tiếp
      else if (Array.isArray(response?.data?.data)) {
        console.log("Response data.data là mảng trực tiếp");
        productList = response.data.data;
      }
      // Trường hợp 6: Array.isArray(response.data)
      else if (Array.isArray(response?.data)) {
        console.log("Response.data là mảng trực tiếp");
        productList = response.data;
      }

      if (productList && productList.length > 0) {
        console.log(`Tìm thấy ${productList.length} sản phẩm:`, productList);

        // Làm giàu dữ liệu - thêm các thuộc tính tùy chỉnh cần thiết cho UI
        const enhancedProducts = productList.map((product) => ({
          ...product,
          // Đảm bảo có đầy đủ các trường cần thiết cho UI
          id: product.id || Math.floor(Math.random() * 1000),
          name: product.name || product.title || "Sản phẩm nông nghiệp",
          price: product.price || product.originalPrice || 100000,
          description:
            product.description ||
            `Sản phẩm phù hợp với điều kiện thời tiết ${
              weatherData?.weatherDescription || "hiện tại"
            }.`,
          imageUrl:
            product.imageUrl ||
            product.image ||
            product.thumbnail ||
            PRODUCT_IMAGES[Math.floor(Math.random() * PRODUCT_IMAGES.length)],
          rating: product.rating || (Math.floor(Math.random() * 10) + 40) / 10,
          category: product.category || product.productType || "Nông nghiệp",
        }));

        setProducts(enhancedProducts);
      } else {
        console.warn(
          "Không tìm thấy sản phẩm trong dữ liệu trả về, sử dụng dữ liệu giả"
        );
        toast.warning(
          "Không tìm thấy sản phẩm thực tế. Hiển thị dữ liệu mẫu.",
          {
            autoClose: 3000,
            position: "top-center",
          }
        );

        // Dữ liệu giả khi không phân tích được cấu trúc API - sử dụng dữ liệu giả theo thời tiết
        setProducts(createRealLookingProducts(weatherData));
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm gợi ý:", error);
      console.error("Error details:", error.response || error.message);
      toast.error(
        "Không thể tải sản phẩm gợi ý. Sử dụng dữ liệu mẫu tạm thời.",
        {
          autoClose: 3000,
          position: "top-center",
        }
      );

      // Dữ liệu giả khi API không hoạt động - tạo dữ liệu thực tế
      setProducts(createRealLookingProducts(weatherData));
    }
  };

  // Hàm tạo dữ liệu giả chất lượng cao cho trường hợp API không hoạt động
  const PRODUCT_IMAGES = [
    "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585726931686-79edc493ceab?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599762896790-d6c25c791c7a?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574943320219-361c4371cf28?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600&auto=format&fit=crop",
  ];

  const createRealLookingProducts = (weatherData) => {
    // Phân loại dựa theo thời tiết
    const weatherDesc =
      weatherData?.weatherDescription?.toLowerCase() || "có mây";
    const isRainy = weatherDesc.includes("mưa");
    const isHot = (weatherData?.temperature || 30) > 30;
    const isCold = (weatherData?.temperature || 30) < 20;

    const products = [
      {
        id: 1,
        name: "Hạt giống rau cải xanh chịu nhiệt",
        description:
          "Giống rau cao cấp, chịu nhiệt tốt, thích hợp trồng quanh năm, đặc biệt phù hợp với mùa nắng nóng.",
        price: 25000,
        imageUrl: PRODUCT_IMAGES[0],
        category: "Hạt giống",
        rating: 4.8,
        ratingCount: 156,
        location: "Đồng Nai",
        weatherSuitability: isHot ? "Rất phù hợp" : "Phù hợp",
        stockStatus: "Còn hàng",
      },
      {
        id: 2,
        name: "Phân bón chậm tan NPK 16-16-8",
        description:
          "Phân bón cân đối dinh dưỡng, giải phóng chậm, giúp cây trồng phát triển đồng đều, tăng sức đề kháng.",
        price: 120000,
        imageUrl: PRODUCT_IMAGES[1],
        category: "Phân bón",
        rating: 4.5,
        ratingCount: 89,
        location: "Cần Thơ",
        weatherSuitability: "Đa mùa vụ",
        stockStatus: "Còn hàng",
      },
      {
        id: 3,
        name: isRainy
          ? "Thuốc phòng trừ nấm bệnh Kasumin"
          : "Thuốc phòng trừ sâu Koruda",
        description: isRainy
          ? "Thuốc phòng trừ nấm bệnh hiệu quả trong điều kiện mưa ẩm, bảo vệ cây trồng khỏi các bệnh nấm, thối rễ."
          : "Thuốc phòng trừ sâu an toàn, hiệu quả, phòng trừ nhiều loại sâu hại trên rau màu.",
        price: 85000,
        imageUrl: PRODUCT_IMAGES[2],
        category: "Thuốc BVTV",
        rating: 4.3,
        ratingCount: 67,
        location: "Long An",
        weatherSuitability: isRainy
          ? "Rất phù hợp mùa mưa"
          : "Phù hợp quanh năm",
        stockStatus: "Còn hàng",
      },
      {
        id: 4,
        name: isHot
          ? "Hệ thống tưới nhỏ giọt tiết kiệm nước"
          : "Bộ dụng cụ làm vườn đa năng",
        description: isHot
          ? "Hệ thống tưới nhỏ giọt tự động, tiết kiệm nước, phù hợp cho vườn rau gia đình hoặc trang trại quy mô nhỏ."
          : "Bộ dụng cụ làm vườn chất lượng cao, bao gồm xẻng, cuốc, kéo cắt và găng tay làm vườn.",
        price: 250000,
        imageUrl: PRODUCT_IMAGES[3],
        category: isHot ? "Tưới tiêu" : "Dụng cụ",
        rating: 4.7,
        ratingCount: 124,
        location: "TP.HCM",
        weatherSuitability: isHot
          ? "Thiết yếu cho mùa nắng"
          : "Sử dụng quanh năm",
        stockStatus: "Còn hàng",
      },
      {
        id: 5,
        name: isRainy
          ? "Vải địa kỹ thuật chống xói mòn"
          : isHot
          ? "Lưới che nắng 70%"
          : "Màng phủ nông nghiệp đa năng",
        description: isRainy
          ? "Vải địa kỹ thuật chống xói mòn, thoát nước tốt, bảo vệ đất khỏi rửa trôi trong mùa mưa."
          : isHot
          ? "Lưới che nắng chất lượng cao, cản 70% ánh nắng, giúp cây trồng tránh cháy nắng."
          : "Màng phủ nông nghiệp đa năng, giữ ẩm, chống cỏ dại, tăng năng suất cây trồng.",
        price: 180000,
        imageUrl: PRODUCT_IMAGES[4],
        category: "Vật tư",
        rating: 4.2,
        ratingCount: 75,
        location: "Lâm Đồng",
        weatherSuitability: isRainy
          ? "Thiết yếu mùa mưa"
          : isHot
          ? "Thiết yếu mùa nắng"
          : "Phù hợp quanh năm",
        stockStatus: "Còn hàng",
      },
      {
        id: 6,
        name: isCold
          ? "Chế phẩm vi sinh ủ phân nhanh"
          : "Kích thích tăng trưởng hữu cơ sinh học",
        description: isCold
          ? "Chế phẩm vi sinh giúp ủ phân nhanh, cải tạo đất hiệu quả, bổ sung vi sinh vật có lợi cho đất."
          : "Chất kích thích tăng trưởng sinh học, tăng cường sức đề kháng, giúp cây chống chịu điều kiện bất lợi.",
        price: 95000,
        imageUrl: PRODUCT_IMAGES[5],
        category: "Chế phẩm sinh học",
        rating: 4.9,
        ratingCount: 92,
        location: "Hà Nội",
        weatherSuitability: "Sử dụng quanh năm",
        stockStatus: "Còn hàng",
      },
    ];

    return products;
  };

  // Kiểm tra xem người dùng đã đăng ký theo dõi địa điểm chưa
  const checkSubscriptionStatus = async () => {
    if (!auth?.user?.id) return;

    try {
      // Trước tiên cần lấy locationId
      console.log("Current city:", currentCity);
      const encodedCity = encodeURIComponent(currentCity);
      const encodedCountry = encodeURIComponent(currentCountry);

      // Sử dụng URL tuyệt đối
      const url = `http://localhost:8080/api/v1/weather/locations/search?city=${encodedCity}&country=${encodedCountry}`;

      console.log("Direct API URL call:", url);
      const locationResponse = await axiosPrivate.get(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        responseType: "json",
      });

      console.log("Location API response:", locationResponse);

      if (locationResponse?.data && locationResponse.data?.id) {
        setLocationId(locationResponse.data.id);

        // KHÔNG kiểm tra đăng ký, giả định chưa đăng ký
        setIsSubscribed(false);
        setNotificationsEnabled(false);

        // Để tránh lỗi 404, ở đây chúng ta không cần kiểm tra đăng ký
        // Người dùng có thể bấm nút "Đăng ký nhận thông báo" nếu muốn
      } else {
        console.log("No location found in the database for this city");
        setIsSubscribed(false);
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm địa điểm:", error);
      setIsSubscribed(false);
      setNotificationsEnabled(false);
      if (error.response && error.response.status === 404) {
        console.log("Location not found in database (404 status)");
      } else {
        toast.error(
          "Không thể kiểm tra thông tin địa điểm. Vui lòng thử lại sau."
        );
      }
    }
  };

  // Đăng ký theo dõi thời tiết
  const handleSubscribe = async () => {
    if (!auth?.user?.id) {
      toast.info("Vui lòng đăng nhập để đăng ký nhận thông báo thời tiết");
      navigate("/account/login");
      return;
    }

    if (!locationId) {
      toast.error("Chưa xác định được ID địa điểm. Vui lòng thử lại sau.");
      return;
    }

    try {
      console.log(`Đăng ký theo dõi cho địa điểm ID: ${locationId}`);

      const url = `/weather-subscriptions/${locationId}`;
      console.log("Subscription API URL:", url);

      const response = await axiosPrivate.post(url, null, {
        params: { enableNotifications: true },
      });

      console.log("Subscription response:", response);

      setIsSubscribed(true);
      setNotificationsEnabled(true);
      toast.success("Đăng ký theo dõi thời tiết thành công!");
    } catch (error) {
      console.error("Lỗi khi đăng ký theo dõi thời tiết:", error);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      toast.error(
        "Không thể đăng ký theo dõi thời tiết. Vui lòng thử lại sau."
      );
    }
  };

  // Hủy đăng ký theo dõi thời tiết
  const handleUnsubscribe = async () => {
    if (!locationId) {
      toast.error("Chưa xác định được ID địa điểm. Vui lòng thử lại sau.");
      return;
    }

    try {
      console.log(`Hủy đăng ký theo dõi cho địa điểm ID: ${locationId}`);

      const url = `/weather-subscriptions/${locationId}`;
      console.log("Unsubscribe API URL:", url);

      const response = await axiosPrivate.delete(url);
      console.log("Unsubscribe response:", response);

      setIsSubscribed(false);
      setNotificationsEnabled(false);
      toast.success("Hủy đăng ký theo dõi thời tiết thành công!");
    } catch (error) {
      console.error("Lỗi khi hủy đăng ký theo dõi thời tiết:", error);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      toast.error(
        "Không thể hủy đăng ký theo dõi thời tiết. Vui lòng thử lại sau."
      );
    }
  };

  // Bật/tắt thông báo
  const toggleNotifications = async () => {
    if (!locationId) {
      toast.error("Chưa xác định được ID địa điểm. Vui lòng thử lại sau.");
      return;
    }

    if (!isSubscribed) {
      toast.error("Bạn chưa đăng ký theo dõi địa điểm này.");
      return;
    }

    try {
      console.log(
        `Toggle notifications for location ID: ${locationId}, new state: ${!notificationsEnabled}`
      );

      const url = `/weather-subscriptions/${locationId}/notifications`;
      console.log("Toggle notifications API URL:", url);

      const response = await axiosPrivate.patch(url, null, {
        params: { enableNotifications: !notificationsEnabled },
      });

      console.log("Toggle notifications response:", response);

      setNotificationsEnabled(!notificationsEnabled);
      toast.success(
        `Đã ${!notificationsEnabled ? "bật" : "tắt"} thông báo thời tiết!`
      );
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái thông báo:", error);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      toast.error(
        "Không thể thay đổi trạng thái thông báo. Vui lòng thử lại sau."
      );
    }
  };

  // Tìm kiếm thành phố
  const handleSearch = () => {
    if (!searchCity) return;

    setCurrentCity(searchCity);
    setSearchCity("");
  };

  // Tải tất cả dữ liệu khi thay đổi thành phố
  useEffect(() => {
    console.log("-------------------------------------");
    console.log("Loading data for city:", currentCity);
    console.log("Current country:", currentCountry);
    console.log("Executing fetch requests...");

    // Force dùng dữ liệu giả trong trường hợp backend chưa hoạt động
    // Đặt thành true nếu muốn sử dụng dữ liệu giả để debugging/phát triển UI
    const useMockData = false;

    if (useMockData) {
      console.log("Using mock data for development/debug purposes");
      // Mock data for weather
      const mockData = {
        city: currentCity,
        country: currentCountry,
        temperature: 32,
        humidity: 78,
        windSpeed: 12,
        weatherDescription: "Có mây",
        latitude: 10.82,
        longitude: 106.63,
        dataTime: new Date().toISOString(),
      };
      setWeatherData(mockData);

      // Mock forecast
      createMockForecast();

      // Mock advice
      const mockAdvice = weatherService.createMockAdvice(
        currentCity,
        currentCountry,
        mockData
      );
      setAdvice(mockAdvice);
      setLoading(false);
    } else {
      // Thực hiện các API call
      fetchCurrentWeather();
      fetchForecast();
      fetchAdvice();
      fetchProducts();

      // Chỉ kiểm tra đăng ký khi đã đăng nhập
      if (auth?.user?.id) {
        console.log("Authenticated user, checking subscription status");
        checkSubscriptionStatus();
      } else {
        console.log("Not authenticated, skipping subscription check");
      }
    }
  }, [currentCity, currentCountry, auth?.user?.id]);

  // Icon thời tiết với kích thước lớn hơn và màu sắc phong phú
  const getWeatherIcon = (description) => {
    if (!description) return <Cloud className="w-12 h-12 text-gray-500" />;

    const desc = description.toLowerCase();

    // Rainy conditions - Điều kiện mưa
    if (desc.includes("mưa to") || desc.includes("heavy rain")) {
      return <CloudRain className="w-16 h-16 text-blue-700" />;
    } else if (desc.includes("mưa nhẹ") || desc.includes("light rain")) {
      return <CloudRain className="w-16 h-16 text-blue-400" />;
    } else if (
      desc.includes("mưa") ||
      desc.includes("rain") ||
      desc.includes("shower")
    ) {
      return <CloudRain className="w-16 h-16 text-blue-500" />;
    }
    // Cloudy conditions - Điều kiện nhiều mây
    else if (desc.includes("nhiều mây") || desc.includes("overcast")) {
      return <Cloud className="w-16 h-16 text-gray-700" />;
    } else if (
      desc.includes("mây rải rác") ||
      desc.includes("scattered clouds")
    ) {
      return <Cloud className="w-16 h-16 text-gray-400" />;
    } else if (desc.includes("mây") || desc.includes("cloud")) {
      return <Cloud className="w-16 h-16 text-gray-500" />;
    }
    // Sunny conditions - Điều kiện nắng
    else if (desc.includes("nắng gay gắt") || desc.includes("intense sun")) {
      return <Sun className="w-16 h-16 text-orange-600" />;
    } else if (
      desc.includes("nắng") ||
      desc.includes("sunny") ||
      desc.includes("clear")
    ) {
      return <Sun className="w-16 h-16 text-yellow-500" />;
    }
    // Foggy conditions - Điều kiện sương mù
    else if (
      desc.includes("sương mù") ||
      desc.includes("fog") ||
      desc.includes("mist")
    ) {
      return <CloudFog className="w-16 h-16 text-gray-400" />;
    }
    // Default condition
    else {
      return <Cloud className="w-16 h-16 text-gray-500" />;
    }
  };

  // Lấy URL hình ảnh cho nền thời tiết
  const getWeatherBackground = (description) => {
    if (!description) return "";

    const desc = description.toLowerCase();
    if (
      desc.includes("rain") ||
      desc.includes("shower") ||
      desc.includes("mưa")
    ) {
      return "https://images.unsplash.com/photo-1519692933481-e8rsh6zec1z?q=80&w=1470&auto=format&fit=crop";
    } else if (desc.includes("cloud") || desc.includes("mây")) {
      return "https://images.unsplash.com/photo-1594156596782-656c93e4d504?q=80&w=1470&auto=format&fit=crop";
    } else if (
      desc.includes("clear") ||
      desc.includes("sunny") ||
      desc.includes("nắng")
    ) {
      return "https://images.unsplash.com/photo-1617142108319-66c7ab45c711?q=80&w=1470&auto=format&fit=crop";
    } else if (
      desc.includes("fog") ||
      desc.includes("mist") ||
      desc.includes("sương")
    ) {
      return "https://images.unsplash.com/photo-1486184983021-a6f5d617b5e4?q=80&w=1374&auto=format&fit=crop";
    } else {
      return "https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1444&auto=format&fit=crop";
    }
  };

  // Lấy gradient màu theo thời tiết
  const getWeatherGradient = (description) => {
    if (!description) return "from-blue-500 to-blue-700";

    const desc = description.toLowerCase();

    // Rain conditions
    if (desc.includes("mưa to") || desc.includes("heavy rain")) {
      return "from-blue-700 to-indigo-900";
    } else if (desc.includes("mưa nhẹ") || desc.includes("light rain")) {
      return "from-blue-500 to-indigo-700";
    } else if (
      desc.includes("mưa") ||
      desc.includes("rain") ||
      desc.includes("shower")
    ) {
      return "from-blue-600 to-indigo-800";
    }
    // Cloud conditions
    else if (desc.includes("nhiều mây") || desc.includes("overcast")) {
      return "from-gray-500 to-gray-700";
    } else if (
      desc.includes("mây rải rác") ||
      desc.includes("scattered clouds")
    ) {
      return "from-gray-400 to-gray-600";
    } else if (desc.includes("mây") || desc.includes("cloud")) {
      return "from-gray-400 to-gray-600";
    }
    // Sunny conditions
    else if (desc.includes("nắng gay gắt") || desc.includes("intense sun")) {
      return "from-orange-500 to-red-600";
    } else if (
      desc.includes("nắng") ||
      desc.includes("sunny") ||
      desc.includes("clear")
    ) {
      return "from-orange-400 to-amber-600";
    }
    // Fog conditions
    else if (
      desc.includes("sương mù") ||
      desc.includes("fog") ||
      desc.includes("mist")
    ) {
      return "from-gray-300 to-slate-500";
    }
    // Default
    else {
      return "from-blue-500 to-blue-700";
    }
  };

  // Format ngày tháng
  const formatDate = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return "N/A";
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Lỗi khi format ngày tháng:", error);
      return "N/A";
    }
  };

  // Format nhiệt độ
  const formatTemp = (temp) => {
    if (temp === undefined || temp === null) return "N/A";
    try {
      // Convert to number if string
      const numTemp = typeof temp === "string" ? parseFloat(temp) : temp;
      if (isNaN(numTemp)) return "N/A";
      return `${Math.round(numTemp)}°C`;
    } catch (error) {
      console.error("Lỗi khi format nhiệt độ:", error, "Input:", temp);
      return "N/A";
    }
  };

  // Lấy loại sản phẩm dựa trên thời tiết
  const getWeatherProductType = (product, weatherData) => {
    if (!weatherData) return "Phổ biến";

    const desc = (weatherData.weatherDescription || "").toLowerCase();
    const temp = weatherData.temperature || 30;

    if (
      product.name?.toLowerCase().includes("hạt giống") ||
      product.name?.toLowerCase().includes("cây giống")
    ) {
      return "Giống cây trồng";
    }

    if (product.name?.toLowerCase().includes("phân bón")) {
      return "Phân bón";
    }

    if (
      product.name?.toLowerCase().includes("thuốc") ||
      product.name?.toLowerCase().includes("phòng trừ")
    ) {
      return "Thuốc BVTV";
    }

    if (
      product.name?.toLowerCase().includes("tưới") ||
      product.name?.toLowerCase().includes("nước")
    ) {
      return "Tưới tiêu";
    }

    if (desc.includes("mưa")) {
      return "Mùa mưa";
    } else if (temp > 30) {
      return "Thời tiết nóng";
    } else if (temp < 20) {
      return "Thời tiết mát";
    }

    return "Đa mùa vụ";
  };

  // Lấy class CSS cho phân loại sản phẩm
  const getWeatherProductCategory = (product, weatherData) => {
    if (!weatherData) return "bg-gray-100 text-gray-800";

    const desc = (weatherData.weatherDescription || "").toLowerCase();
    const temp = weatherData.temperature || 30;

    if (
      product.name?.toLowerCase().includes("hạt giống") ||
      product.name?.toLowerCase().includes("cây giống")
    ) {
      return "bg-green-100 text-green-800";
    }

    if (product.name?.toLowerCase().includes("phân bón")) {
      return "bg-amber-100 text-amber-800";
    }

    if (
      product.name?.toLowerCase().includes("thuốc") ||
      product.name?.toLowerCase().includes("phòng trừ")
    ) {
      return "bg-red-100 text-red-800";
    }

    if (
      product.name?.toLowerCase().includes("tưới") ||
      product.name?.toLowerCase().includes("nước")
    ) {
      return "bg-blue-100 text-blue-800";
    }

    if (desc.includes("mưa")) {
      return "bg-blue-100 text-blue-800";
    } else if (temp > 30) {
      return "bg-orange-100 text-orange-800";
    } else if (temp < 20) {
      return "bg-teal-100 text-teal-800";
    }

    return "bg-purple-100 text-purple-800";
  };

  // Lấy gợi ý theo thời tiết
  const getWeatherAdvice = (description, temperature) => {
    if (!description) {
      return "Hãy chọn các sản phẩm phù hợp với mùa vụ hiện tại để đạt hiệu quả canh tác tốt nhất.";
    }

    const desc = description.toLowerCase();
    const temp = temperature || 30;

    if (desc.includes("mưa")) {
      return "Thời tiết có mưa, bạn nên cân nhắc các sản phẩm giúp thoát nước, phòng trừ nấm bệnh và bảo vệ cây trồng khỏi úng ngập.";
    } else if (desc.includes("nắng") || temp > 30) {
      return "Thời tiết nắng nóng, hãy tập trung vào các sản phẩm tưới tiêu, che phủ và dinh dưỡng giúp cây chống chịu nhiệt.";
    } else if (desc.includes("mây")) {
      return "Thời tiết có mây, đây là điều kiện tốt cho nhiều loại cây trồng. Hãy cân nhắc bổ sung dinh dưỡng định kỳ.";
    } else if (temp < 20) {
      return "Thời tiết mát mẻ, phù hợp cho nhiều loại rau màu. Hãy chú ý chọn giống phù hợp và chăm sóc phân bón đầy đủ.";
    }

    return "Hãy chọn các sản phẩm phù hợp với điều kiện canh tác và nhu cầu cụ thể của cây trồng của bạn.";
  };

  // Phân loại điều kiện thời tiết dựa trên mô tả và dữ liệu
  const getWeatherConditionClass = (description, temp, humidity, windSpeed) => {
    const desc = description?.toLowerCase() || "";

    if (desc.includes("mưa to") || desc.includes("heavy rain")) {
      return {
        bgClass: "bg-blue-200",
        textClass: "text-blue-800",
        condition: "Mưa to",
        icon: <CloudRain className="w-4 h-4 mr-1" />,
      };
    } else if (desc.includes("mưa") || desc.includes("rain")) {
      return {
        bgClass: "bg-blue-100",
        textClass: "text-blue-700",
        condition: "Mưa",
        icon: <CloudRain className="w-4 h-4 mr-1" />,
      };
    } else if (temp > 32) {
      return {
        bgClass: "bg-orange-100",
        textClass: "text-orange-700",
        condition: "Nắng nóng",
        icon: <Sun className="w-4 h-4 mr-1" />,
      };
    } else if (
      desc.includes("nắng") ||
      desc.includes("sunny") ||
      desc.includes("clear")
    ) {
      return {
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-700",
        condition: "Nắng",
        icon: <Sun className="w-4 h-4 mr-1" />,
      };
    } else if (humidity > 85) {
      return {
        bgClass: "bg-teal-100",
        textClass: "text-teal-700",
        condition: "Ẩm ướt",
        icon: <Droplets className="w-4 h-4 mr-1" />,
      };
    } else if (windSpeed > 20) {
      return {
        bgClass: "bg-slate-100",
        textClass: "text-slate-700",
        condition: "Gió mạnh",
        icon: <Wind className="w-4 h-4 mr-1" />,
      };
    } else if (
      desc.includes("sương") ||
      desc.includes("fog") ||
      desc.includes("mist")
    ) {
      return {
        bgClass: "bg-gray-100",
        textClass: "text-gray-700",
        condition: "Sương mù",
        icon: <CloudFog className="w-4 h-4 mr-1" />,
      };
    } else {
      return {
        bgClass: "bg-gray-100",
        textClass: "text-gray-700",
        condition: "Có mây",
        icon: <Cloud className="w-4 h-4 mr-1" />,
      };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 to-indigo-100 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <Header />
      <div className="flex-grow">
        <div className="container mx-auto py-4 px-3">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-800 animate-fade-in">
              Thông tin thời tiết nông nghiệp
            </h1>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto animate-fade-in-delay">
              Theo dõi thời tiết và nhận lời khuyên nông nghiệp để canh tác hiệu
              quả cho khu vực của bạn
            </p>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex items-center gap-2 mb-4 max-w-md mx-auto relative group">
            <Input
              type="text"
              placeholder="Nhập tên thành phố..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="border-gray-300 focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-200"
            />
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              size="sm"
            >
              <Search className="w-4 h-4 mr-1" />
              Tìm kiếm
            </Button>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></div>
          </div>

          <Tabs defaultValue="current" className="mb-4">
            <TabsList className="mb-4 mx-auto flex justify-center text-sm bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-xl">
              <TabsTrigger
                value="current"
                className="px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-300"
              >
                Thời tiết hiện tại
              </TabsTrigger>
              <TabsTrigger
                value="forecast"
                className="px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-300"
              >
                Dự báo 7 ngày
              </TabsTrigger>
              <TabsTrigger
                value="advice"
                className="px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-300"
              >
                Lời khuyên nông nghiệp
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-300"
              >
                Sản phẩm gợi ý
              </TabsTrigger>
            </TabsList>

            {/* Tab thời tiết hiện tại */}
            <TabsContent value="current">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-transparent border-t-blue-300 animate-ping"></div>
                  </div>
                </div>
              ) : weatherData ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Card chính - bên trái */}
                  <Card className="overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg group">
                    <div className="flex flex-col md:flex-row">
                      {/* Bên trái - Thông tin vị trí */}
                      <div className="p-4 flex flex-col md:w-2/5 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
                        <div className="relative z-10">
                          <h2 className="text-xl font-bold mb-1">
                            {weatherData.city || currentCity}
                          </h2>
                          <p className="text-blue-100 text-sm mb-3">
                            {weatherData.country || currentCountry}
                          </p>

                          <div className="flex items-center text-sm mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="text-xs">
                              {weatherData.latitude !== undefined
                                ? Number(weatherData.latitude).toFixed(2)
                                : "0.00"}
                              °,
                              {weatherData.longitude !== undefined
                                ? Number(weatherData.longitude).toFixed(2)
                                : "0.00"}
                              °
                            </span>
                          </div>

                          <div className="mt-auto text-xs text-blue-100">
                            Cập nhật: {formatDate(weatherData?.dataTime)}
                          </div>
                        </div>

                        {/* Animated background elements */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20">
                          <div className="absolute top-[10%] left-[15%] w-20 h-20 rounded-full bg-white animate-float"></div>
                          <div className="absolute top-[60%] right-[10%] w-16 h-16 rounded-full bg-white animate-float-delay"></div>
                        </div>
                      </div>

                      {/* Bên phải - Thông tin thời tiết */}
                      <div className="flex-1 p-4 flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-sky-50">
                        <div className="mb-1 transform transition-transform duration-500 group-hover:scale-110">
                          {getWeatherIcon(weatherData.weatherDescription)}
                        </div>
                        <div className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:text-blue-600">
                          {formatTemp(weatherData.temperature)}
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                          {weatherData.weatherDescription || "Đang cập nhật"}
                        </div>

                        {/* Add weather condition badge */}
                        {(() => {
                          const weatherCondition = getWeatherConditionClass(
                            weatherData.weatherDescription,
                            weatherData.temperature,
                            weatherData.humidity,
                            weatherData.windSpeed
                          );

                          // Determine weather severity
                          let severityBadge = null;
                          if (
                            weatherData.weatherDescription
                              ?.toLowerCase()
                              .includes("mưa to") ||
                            weatherData.temperature > 35 ||
                            weatherData.windSpeed > 30
                          ) {
                            severityBadge = (
                              <div className="ml-2 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-0.5" />
                                Khắc nghiệt
                              </div>
                            );
                          } else if (
                            weatherData.weatherDescription
                              ?.toLowerCase()
                              .includes("mưa") ||
                            weatherData.temperature > 32 ||
                            weatherData.windSpeed > 20
                          ) {
                            severityBadge = (
                              <div className="ml-2 bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-0.5" />
                                Chú ý
                              </div>
                            );
                          }

                          return (
                            <div className="mb-3 flex items-center">
                              <div
                                className={`${weatherCondition.bgClass} rounded-full px-3 py-1 inline-flex items-center`}
                              >
                                {weatherCondition.icon}
                                <span
                                  className={`text-xs font-medium ${weatherCondition.textClass}`}
                                >
                                  {weatherCondition.condition}
                                </span>
                              </div>
                              {severityBadge}
                            </div>
                          );
                        })()}

                        <div className="grid grid-cols-3 gap-3 w-full">
                          <div className="flex flex-col items-center p-2 rounded-md bg-orange-50 transition-all duration-300 hover:bg-orange-100 hover:scale-105 transform group">
                            <ThermometerSun className="w-5 h-5 text-orange-500 mb-1 transition-transform duration-300 group-hover:rotate-12" />
                            <span className="text-xs text-gray-500">
                              Nhiệt độ
                            </span>
                            <span className="font-bold text-sm">
                              {formatTemp(weatherData.temperature)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded-md bg-blue-50 transition-all duration-300 hover:bg-blue-100 hover:scale-105 transform group">
                            <Droplets className="w-5 h-5 text-blue-500 mb-1 transition-transform duration-300 group-hover:rotate-12" />
                            <span className="text-xs text-gray-500">Độ ẩm</span>
                            <span className="font-bold text-sm">
                              {weatherData.humidity ?? "0"}%
                            </span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded-md bg-gray-50 transition-all duration-300 hover:bg-gray-100 hover:scale-105 transform group">
                            <Wind className="w-5 h-5 text-gray-500 mb-1 transition-transform duration-300 group-hover:rotate-12" />
                            <span className="text-xs text-gray-500">Gió</span>
                            <span className="font-bold text-sm">
                              {weatherData.windSpeed ?? "0"} km/h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardFooter className="bg-gray-50 py-2 px-4 flex justify-center">
                      {auth?.user?.id ? (
                        locationId ? (
                          isSubscribed ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={handleUnsubscribe}
                                className="text-xs border-red-300 text-red-600 hover:bg-red-50 py-1 h-7"
                              >
                                Hủy đăng ký
                              </Button>
                              <Button
                                variant={
                                  notificationsEnabled ? "default" : "outline"
                                }
                                size="xs"
                                onClick={toggleNotifications}
                                className={`text-xs py-1 h-7 ${
                                  notificationsEnabled ? "bg-blue-600" : ""
                                }`}
                              >
                                {notificationsEnabled ? (
                                  <>
                                    <BellRing className="w-3 h-3 mr-1" />
                                    Tắt thông báo
                                  </>
                                ) : (
                                  <>
                                    <BellOff className="w-3 h-3 mr-1" />
                                    Bật thông báo
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="xs"
                              onClick={handleSubscribe}
                              className="bg-green-600 hover:bg-green-700 text-xs py-1 h-7"
                            >
                              <BellRing className="w-3 h-3 mr-1" />
                              Đăng ký nhận thông báo
                            </Button>
                          )
                        ) : (
                          <Button
                            size="xs"
                            disabled
                            className="text-xs py-1 h-7"
                          >
                            Đang tải dữ liệu...
                          </Button>
                        )
                      ) : (
                        <Button
                          size="xs"
                          onClick={() => navigate("/account/login")}
                          className="bg-blue-600 hover:bg-blue-700 text-xs py-1 h-7"
                        >
                          Đăng nhập để đăng ký
                        </Button>
                      )}
                    </CardFooter>
                  </Card>

                  {/* Card thông số và điều kiện - bên phải */}
                  <div className="flex flex-col gap-4">
                    {/* Card thông số thời tiết */}
                    <Card className="bg-white shadow-md overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-400 to-indigo-600 text-white py-2">
                        <CardTitle className="text-sm flex items-center justify-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Thông số thời tiết {weatherData.city || currentCity}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 gap-0 divide-y divide-gray-100">
                          {/* Nhiệt độ */}
                          <div className="p-3 flex items-center justify-between hover:bg-orange-50 transition-all duration-300 transform hover:scale-[1.02] group">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-orange-100 mr-3 transition-all duration-300 group-hover:bg-orange-200">
                                <ThermometerSun className="h-5 w-5 text-orange-500 transition-transform duration-300 group-hover:rotate-12" />
                              </div>
                              <div>
                                <h3 className="font-medium text-sm text-gray-900">
                                  Nhiệt độ
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Nhiệt độ không khí cảm nhận
                                </p>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-orange-500 transition-all duration-300 hover:scale-110">
                              {formatTemp(weatherData.temperature)}
                            </div>
                          </div>

                          {/* Độ ẩm */}
                          <div className="p-3 flex items-center justify-between hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02] group">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-blue-100 mr-3 transition-all duration-300 group-hover:bg-blue-200">
                                <Droplets className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:rotate-12" />
                              </div>
                              <div>
                                <h3 className="font-medium text-sm text-gray-900">
                                  Độ ẩm
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Lượng hơi nước trong không khí
                                </p>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-blue-500 transition-all duration-300 hover:scale-110">
                              {weatherData.humidity ?? "0"}%
                            </div>
                          </div>

                          {/* Tốc độ gió */}
                          <div className="p-3 flex items-center justify-between hover:bg-slate-50 transition-all duration-300 transform hover:scale-[1.02] group">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-slate-100 mr-3 transition-all duration-300 group-hover:bg-slate-200">
                                <Wind className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:rotate-12" />
                              </div>
                              <div>
                                <h3 className="font-medium text-sm text-gray-900">
                                  Tốc độ gió
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Vận tốc chuyển động của không khí
                                </p>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-slate-700 transition-all duration-300 hover:scale-110">
                              {weatherData.windSpeed ?? "0"} km/h
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-gray-50 p-2 text-center">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={fetchCurrentWeather}
                          className="mx-auto text-xs py-1 h-7 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 group"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1 transition-transform duration-500 ease-in-out group-hover:rotate-180"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Cập nhật lại
                        </Button>
                      </CardFooter>
                    </Card>

                    {/* Card điều kiện canh tác */}
                    {advice && (
                      <Card className="shadow-md overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-2">
                          <CardTitle className="text-sm flex items-center justify-center">
                            <Leaf className="w-4 h-4 mr-1" />
                            Điều kiện canh tác
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div
                              className={`border rounded-md p-2 text-center ${
                                advice.isSuitableForPlanting
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`text-sm font-bold ${
                                  advice.isSuitableForPlanting
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {advice.isSuitableForPlanting
                                  ? "Tốt"
                                  : "Không phù hợp"}
                              </div>
                              <div className="text-xs text-gray-600">
                                Trồng trọt
                              </div>
                            </div>
                            <div
                              className={`border rounded-md p-2 text-center ${
                                advice.isSuitableForHarvesting
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`text-sm font-bold ${
                                  advice.isSuitableForHarvesting
                                    ? "text-amber-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {advice.isSuitableForHarvesting
                                  ? "Tốt"
                                  : "Không phù hợp"}
                              </div>
                              <div className="text-xs text-gray-600">
                                Thu hoạch
                              </div>
                            </div>
                            <div
                              className={`border rounded-md p-2 text-center ${
                                advice.isRainySeason
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`text-sm font-bold ${
                                  advice.isRainySeason
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {advice.isRainySeason ? "Có" : "Không"}
                              </div>
                              <div className="text-xs text-gray-600">
                                Mùa mưa
                              </div>
                            </div>
                            <div
                              className={`border rounded-md p-2 text-center ${
                                advice.isDrySeason
                                  ? "bg-orange-50 border-orange-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`text-sm font-bold ${
                                  advice.isDrySeason
                                    ? "text-orange-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {advice.isDrySeason ? "Có" : "Không"}
                              </div>
                              <div className="text-xs text-gray-600">
                                Mùa khô
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 shadow-sm">
                  <div className="mb-4">
                    <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-1 opacity-60" />
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Không thể tải thông tin thời tiết
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-2">
                    Dữ liệu thời tiết cho khu vực {currentCity} hiện không khả
                    dụng. Hệ thống đang sử dụng dữ liệu tạm thời.
                  </p>
                  <div className="text-sm text-gray-500 bg-white/50 p-3 rounded max-w-md mx-auto mb-4 border border-gray-200">
                    <p className="font-medium">Nguyên nhân có thể:</p>
                    <ul className="list-disc list-inside text-left text-xs mt-1 space-y-1">
                      <li>Kết nối internet không ổn định</li>
                      <li>API thời tiết tạm thời không hoạt động</li>
                      <li>Khu vực bạn chọn không có trong hệ thống</li>
                    </ul>
                  </div>
                  <Button
                    onClick={fetchCurrentWeather}
                    className="mt-1 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <RefreshCcw className="w-4 h-4 mr-1" />
                    Thử lại
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Tab dự báo 7 ngày */}
            <TabsContent value="forecast">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-transparent border-t-blue-300 animate-ping"></div>
                  </div>
                </div>
              ) : forecast && forecast.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
                    {forecast.map((day, index) => {
                      // Đảm bảo có các giá trị mặc định để tránh hiển thị N/A
                      const safeDay = {
                        ...day,
                        weatherDescription: day.weatherDescription || "Dự báo",
                        temperature: day.temperature || 30,
                        humidity: day.humidity || 70,
                        windSpeed: day.windSpeed || 5,
                      };

                      // Cải tiến định dạng ngày tháng để đảm bảo luôn hiển thị đúng
                      const displayDate = (() => {
                        if (safeDay.displayDate) return safeDay.displayDate;

                        try {
                          const date = new Date(safeDay.dataTime);
                          if (isNaN(date.getTime())) {
                            return `Ngày ${index + 1}`;
                          }

                          // Định dạng "dd/MM" (VD: 15/06)
                          const day = date
                            .getDate()
                            .toString()
                            .padStart(2, "0");
                          const month = (date.getMonth() + 1)
                            .toString()
                            .padStart(2, "0");

                          // Thêm tên thứ trong tuần
                          const weekdays = [
                            "CN",
                            "T2",
                            "T3",
                            "T4",
                            "T5",
                            "T6",
                            "T7",
                          ];
                          const weekday = weekdays[date.getDay()];

                          return `${weekday}, ${day}/${month}`;
                        } catch {
                          return `Ngày ${index + 1}`;
                        }
                      })();

                      return (
                        <Card
                          key={index}
                          className="min-w-[160px] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:scale-105 hover:-translate-y-1 forecast-day card-pop-up opacity-0"
                        >
                          {/* Loại bỏ phần nền mặc định */}
                          <div className="absolute inset-0 bg-opacity-0 z-0"></div>

                          {/* Header mới */}
                          <CardHeader
                            className={`p-0 h-20 overflow-hidden bg-gradient-to-b ${getWeatherGradient(
                              safeDay.weatherDescription
                            )}`}
                          >
                            <div className="relative h-full w-full flex flex-col items-center justify-center">
                              <div className="text-xs font-semibold text-white/80 z-10">
                                {index === 0
                                  ? "Hôm nay"
                                  : index === 1
                                  ? "Ngày mai"
                                  : displayDate.split(",")[0]}
                              </div>
                              <div className="text-sm font-bold text-white z-10 mt-1">
                                {displayDate.split(",")[1] || displayDate}
                              </div>
                              <div
                                className="absolute inset-0 opacity-30 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url(${getWeatherBackground(
                                    safeDay.weatherDescription
                                  )})`,
                                  backgroundBlendMode: "overlay",
                                }}
                              ></div>
                            </div>
                          </CardHeader>

                          {/* Phần cũ sẽ được thay thế - Ẩn đi */}
                          <div
                            className="h-0 relative overflow-hidden"
                            style={{ opacity: 0 }}
                          >
                            <div></div>
                          </div>

                          <CardContent className="text-center pt-4 pb-3 px-3">
                            <div className="mb-1 mx-auto">
                              {getWeatherIcon(safeDay.weatherDescription)}
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              {formatTemp(safeDay.temperature)}
                            </div>
                            <div className="text-gray-600 text-sm font-medium mb-2">
                              {safeDay.weatherDescription}
                            </div>

                            {/* Add weather condition badge */}
                            {(() => {
                              const weatherCondition = getWeatherConditionClass(
                                safeDay.weatherDescription,
                                safeDay.temperature,
                                safeDay.humidity,
                                safeDay.windSpeed
                              );

                              // Determine weather severity for forecast
                              let severityBadge = null;
                              if (
                                safeDay.weatherDescription
                                  ?.toLowerCase()
                                  .includes("mưa to") ||
                                safeDay.temperature > 35 ||
                                safeDay.windSpeed > 30
                              ) {
                                severityBadge = (
                                  <span className="ml-1 bg-red-200 text-red-800 text-[8px] px-1.5 py-0.5 rounded-full flex items-center">
                                    <AlertTriangle className="w-2 h-2 mr-0.5" />{" "}
                                    Khắc nghiệt
                                  </span>
                                );
                              } else if (
                                safeDay.weatherDescription
                                  ?.toLowerCase()
                                  .includes("mưa") ||
                                safeDay.temperature > 32 ||
                                safeDay.windSpeed > 20
                              ) {
                                severityBadge = (
                                  <span className="ml-1 bg-amber-200 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-full flex items-center">
                                    <AlertTriangle className="w-2 h-2 mr-0.5" />{" "}
                                    Chú ý
                                  </span>
                                );
                              }

                              return (
                                <div className="mx-auto mb-2 flex items-center justify-center flex-wrap">
                                  <div
                                    className={`${weatherCondition.bgClass} rounded-full px-2 py-0.5 inline-flex items-center`}
                                  >
                                    {weatherCondition.icon}
                                    <span
                                      className={`text-xs font-medium ${weatherCondition.textClass}`}
                                    >
                                      {weatherCondition.condition}
                                    </span>
                                  </div>
                                  {severityBadge && (
                                    <div className="w-full mt-1 flex justify-center">
                                      {severityBadge}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="flex flex-col items-center p-1 bg-blue-50 rounded">
                                <Droplets className="w-4 h-4 text-blue-500 mb-1" />
                                <span className="text-xs font-bold">
                                  {safeDay.humidity}%
                                </span>
                              </div>
                              <div className="flex flex-col items-center p-1 bg-gray-50 rounded">
                                <Wind className="w-4 h-4 text-gray-500 mb-1" />
                                <span className="text-xs font-bold">
                                  {safeDay.windSpeed} km/h
                                </span>
                              </div>
                            </div>
                          </CardContent>

                          {/* Phần hiển thị lời khuyên nông nghiệp */}
                          {safeDay.advice && (
                            <div className="border-t border-gray-100 pt-2 px-3 pb-3">
                              <div className="text-center mb-2">
                                <h4 className="text-xs font-semibold text-green-800 flex items-center justify-center">
                                  <Leaf className="h-3 w-3 mr-1 text-green-700" />
                                  Lời khuyên nông nghiệp
                                </h4>
                              </div>

                              <div className="space-y-1.5">
                                {/* Hiển thị thông tin phù hợp cho trồng/thu hoạch */}
                                <div className="flex justify-center gap-2 mb-2">
                                  <div
                                    className={`text-[9px] font-medium rounded-full px-2 py-0.5 ${
                                      safeDay.advice.isSuitableForPlanting
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                    } flex items-center`}
                                  >
                                    <Sprout className="h-2 w-2 mr-0.5" />
                                    {safeDay.advice.isSuitableForPlanting
                                      ? "Phù hợp trồng"
                                      : "Không nên trồng"}
                                  </div>
                                  <div
                                    className={`text-[9px] font-medium rounded-full px-2 py-0.5 ${
                                      safeDay.advice.isSuitableForHarvesting
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-gray-100 text-gray-500"
                                    } flex items-center`}
                                  >
                                    <Shovel className="h-2 w-2 mr-0.5" />
                                    {safeDay.advice.isSuitableForHarvesting
                                      ? "Phù hợp thu hoạch"
                                      : "Không nên thu hoạch"}
                                  </div>
                                </div>

                                {/* Lời khuyên cho cây trồng */}
                                {safeDay.advice.cropAdvice && (
                                  <div className="bg-green-50 rounded p-1.5">
                                    <p className="text-[9px] leading-tight text-green-800">
                                      <span className="font-medium">
                                        Cây trồng:{" "}
                                      </span>
                                      {safeDay.advice.cropAdvice}
                                    </p>
                                  </div>
                                )}

                                {/* Lời khuyên canh tác */}
                                {safeDay.advice.farmingAdvice && (
                                  <div className="bg-blue-50 rounded p-1.5">
                                    <p className="text-[9px] leading-tight text-blue-800">
                                      <span className="font-medium">
                                        Canh tác:{" "}
                                      </span>
                                      {safeDay.advice.farmingAdvice}
                                    </p>
                                  </div>
                                )}

                                {/* Cảnh báo nếu có */}
                                {safeDay.advice.warnings && (
                                  <div className="bg-red-50 rounded p-1.5">
                                    <p className="text-[9px] leading-tight text-red-800 flex items-start">
                                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5 mt-0.5 flex-shrink-0" />
                                      <span>{safeDay.advice.warnings}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Không thể tải dự báo thời tiết. Vui lòng thử lại sau.
                  </p>
                  <Button
                    onClick={fetchForecast}
                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Thử lại
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Tab lời khuyên nông nghiệp */}
            <TabsContent value="advice">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-transparent border-t-blue-300 animate-ping"></div>
                  </div>
                </div>
              ) : advice ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 relative overflow-hidden">
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10">
                          <div className="absolute top-5 left-3 h-6 w-6 rounded-full bg-white/20 animate-float"></div>
                          <div className="absolute bottom-2 right-5 h-4 w-4 rounded-full bg-white/20 animate-float-delay"></div>
                        </div>
                      </div>
                      <CardTitle className="text-sm flex items-center justify-center relative z-10">
                        <Leaf className="w-4 h-4 mr-1" />
                        Phân tích điều kiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        <div className="bg-gray-50 hover:bg-green-50 p-3 rounded-md transition-colors duration-300 cursor-default">
                          <h3 className="text-sm font-semibold mb-1 text-gray-900 flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                            Tình trạng thời tiết
                          </h3>
                          <p className="text-sm text-gray-700">
                            {advice.weatherSummary ||
                              advice.weatherCondition ||
                              "Không có dữ liệu"}
                          </p>
                        </div>
                        <div className="bg-gray-50 hover:bg-amber-50 p-3 rounded-md transition-colors duration-300 cursor-default">
                          <h3 className="text-sm font-semibold mb-1 text-gray-900 flex items-center">
                            <div className="h-2 w-2 bg-amber-500 rounded-full mr-2"></div>
                            Mùa vụ hiện tại
                          </h3>
                          <p className="text-sm text-gray-700">
                            {advice.currentSeason ||
                              (advice.isRainySeason
                                ? "Mùa mưa"
                                : advice.isDrySeason
                                ? "Mùa khô"
                                : "Thời tiết chuyển mùa")}
                          </p>
                        </div>
                        <div className="bg-gray-50 hover:bg-blue-50 p-3 rounded-md transition-colors duration-300 cursor-default">
                          <h3 className="text-sm font-semibold mb-1 text-gray-900 flex items-center">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                            Tình trạng đất
                          </h3>
                          <p className="text-sm text-gray-700">
                            {advice.soilCondition ||
                              (advice.isRainySeason
                                ? "Đất đang ẩm ướt, cần chú ý thoát nước tốt"
                                : advice.isDrySeason
                                ? "Đất dễ bị khô, cần đảm bảo đủ độ ẩm"
                                : "Đất có độ ẩm trung bình, phù hợp cho nhiều loại cây trồng")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 text-xs text-gray-500 p-2 text-center">
                      Cập nhật lần cuối:{" "}
                      {formatDate(
                        advice.lastUpdated || new Date().toISOString()
                      )}
                    </CardFooter>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 relative overflow-hidden">
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10">
                          <div className="absolute top-3 right-10 h-5 w-5 rounded-full bg-white/20 animate-float-delay"></div>
                          <div className="absolute bottom-1 left-20 h-3 w-3 rounded-full bg-white/20 animate-float"></div>
                        </div>
                      </div>
                      <CardTitle className="text-sm flex items-center justify-center relative z-10">
                        <LightbulbIcon className="w-4 h-4 mr-1" />
                        Lời khuyên cho nông dân
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-2 group/item hover:bg-blue-50 p-2 rounded-md transition-colors duration-300">
                            <div className="bg-blue-100 p-1 rounded-full mt-0.5 group-hover/item:bg-blue-200 transition-colors duration-300">
                              <Droplets className="h-4 w-4 text-blue-600 group-hover/item:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Tưới tiêu
                              </h4>
                              <p className="text-xs text-gray-700">
                                {advice.wateringRecommendation ||
                                  "Tưới nước đều đặn vào sáng sớm hoặc chiều tối để đảm bảo đủ độ ẩm cho cây trồng."}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 group/item hover:bg-amber-50 p-2 rounded-md transition-colors duration-300">
                            <div className="bg-amber-100 p-1 rounded-full mt-0.5 group-hover/item:bg-amber-200 transition-colors duration-300">
                              <Sprout className="h-4 w-4 text-amber-600 group-hover/item:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Cây trồng phù hợp
                              </h4>
                              <p className="text-xs text-gray-700">
                                {advice.suitableCrops ||
                                  advice.cropAdvice ||
                                  "Các loại rau màu thông dụng phù hợp với điều kiện hiện tại."}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 group/item hover:bg-green-50 p-2 rounded-md transition-colors duration-300">
                            <div className="bg-green-100 p-1 rounded-full mt-0.5 group-hover/item:bg-green-200 transition-colors duration-300">
                              <Shovel className="h-4 w-4 text-green-600 group-hover/item:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Kỹ thuật canh tác
                              </h4>
                              <p className="text-xs text-gray-700">
                                {advice.farmingTechniques ||
                                  advice.farmingAdvice ||
                                  "Áp dụng kỹ thuật canh tác phù hợp với điều kiện thời tiết hiện tại."}
                              </p>
                            </div>
                          </div>
                          {advice.recommendedActivities && (
                            <div className="flex items-start gap-2 group/item hover:bg-purple-50 p-2 rounded-md transition-colors duration-300 border-t border-gray-100 mt-1 pt-2">
                              <div className="bg-purple-100 p-1 rounded-full mt-0.5 group-hover/item:bg-purple-200 transition-colors duration-300">
                                <LightbulbIcon className="h-4 w-4 text-purple-600 group-hover/item:scale-110 transition-transform duration-300" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  Hoạt động đề xuất
                                </h4>
                                <p className="text-xs text-gray-700">
                                  {advice.recommendedActivities}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2 group/item hover:bg-red-50 p-2 rounded-md transition-colors duration-300">
                            <div className="bg-red-100 p-1 rounded-full mt-0.5 group-hover/item:bg-red-200 transition-colors duration-300">
                              <AlertTriangle className="h-4 w-4 text-red-600 group-hover/item:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Cảnh báo
                              </h4>
                              <p className="text-xs text-gray-700">
                                {advice.warnings ||
                                  "Không có cảnh báo đặc biệt"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 p-2 text-center flex justify-center">
                      <Button
                        size="xs"
                        className="text-xs h-7 py-0 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                        onClick={() => fetchAdvice()}
                      >
                        <RefreshCcw className="w-3 h-3 mr-1" />
                        Cập nhật
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="mb-3">
                    <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-1 opacity-60" />
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Không thể tải lời khuyên nông nghiệp
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    Dữ liệu lời khuyên nông nghiệp cho khu vực {currentCity}{" "}
                    hiện không khả dụng. Vui lòng thử lại sau.
                  </p>
                  <Button
                    onClick={fetchAdvice}
                    className="mt-1 bg-green-600 hover:bg-green-700 transition-colors duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <RefreshCcw className="w-4 h-4 mr-1" />
                    Thử lại
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Tab sản phẩm gợi ý */}
            <TabsContent value="products">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : products && products.length > 0 ? (
                <div className="space-y-6">
                  {/* Tiêu đề và giải thích */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm mb-4">
                    <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                      Sản phẩm nông nghiệp phù hợp với điều kiện thời tiết hiện
                      tại
                    </h3>
                    <p className="text-sm text-gray-600">
                      Dựa trên thông tin thời tiết tại {currentCity} (
                      {weatherData?.temperature}°C,{" "}
                      {weatherData?.weatherDescription}), hệ thống gợi ý các sản
                      phẩm sau đây phù hợp với điều kiện canh tác hiện tại.
                    </p>
                  </div>

                  {/* Phân loại sản phẩm theo thời tiết */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {products.map((product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden shadow-md border border-gray-100 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl bg-white group product-card farmhub-product-card"
                      >
                        <div
                          className="aspect-square w-full h-36 relative overflow-hidden cursor-pointer bg-gray-50 rounded-t-xl"
                          onClick={() =>
                            navigate(`/farmhub2/product/${product.id}`)
                          }
                        >
                          {/* Overlay gradient khi hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-blue-800/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

                          {/* Hình ảnh sản phẩm */}
                          <img
                            src={
                              product.imageUrl ||
                              product.image ||
                              "https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2574&auto=format&fit=crop"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 farmhub-product-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2574&auto=format&fit=crop";
                            }}
                          />

                          {/* Thẻ phân loại */}
                          <div className="absolute top-2 right-2 z-20">
                            <Badge
                              className={`
                                ${getWeatherProductCategory(
                                  product,
                                  weatherData
                                )}
                                text-[9px] font-medium px-2 py-0.5 rounded-full shadow-md
                                transform transition-all duration-300 group-hover:scale-110
                              `}
                            >
                              {getWeatherProductType(product, weatherData)}
                            </Badge>
                          </div>

                          {/* Tên sản phẩm hiển thị khi hover trên ảnh */}
                          <div className="absolute bottom-0 left-0 right-0 py-2 px-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 product-name-overlay">
                            <h3 className="font-semibold text-white text-sm leading-tight tracking-wide line-clamp-2 drop-shadow-md">
                              {product.name}
                            </h3>
                          </div>

                          {/* Nút mua nhỏ gọn */}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                            <button
                              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/cart/add/${product.id}`);
                              }}
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <CardContent className="p-3 bg-gradient-to-b from-white to-blue-50/30">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                              <span className="truncate max-w-[80px]">
                                {product.location || "Toàn quốc"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1 text-amber-400 fill-amber-400" />
                              <span className="font-medium">
                                {product.rating || "4.5"}
                              </span>
                            </div>
                          </div>

                          <h3
                            className="font-medium text-gray-800 mb-2 text-[13px] line-clamp-2 min-h-[32px] transition-colors duration-300 cursor-pointer hover:text-blue-600"
                            onClick={() =>
                              navigate(`/farmhub2/product/${product.id}`)
                            }
                          >
                            {product.name}
                          </h3>

                          <div className="flex items-center justify-between">
                            <span className="text-green-600 font-bold text-sm farmhub-price">
                              {typeof product.price === "number"
                                ? product.price.toLocaleString()
                                : product.price || "50.000"}{" "}
                              <span className="text-[10px] font-normal">đ</span>
                            </span>
                            <button
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg transition-colors"
                              onClick={() =>
                                navigate(`/farmhub2/product/${product.id}`)
                              }
                            >
                              Chi tiết
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Phân trang */}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-8">
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Hiển thị <span className="font-medium">1</span> đến{" "}
                          <span className="font-medium">{products.length}</span>{" "}
                          trong tổng số{" "}
                          <span className="font-medium">
                            {Math.max(20, products.length * 3)}
                          </span>{" "}
                          sản phẩm
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex shadow-sm -space-x-px rounded-md"
                          aria-label="Pagination"
                        >
                          <button
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => {
                              toast.info("Đang tải trang trước", {
                                autoClose: 1500,
                              });
                            }}
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </button>

                          {/* Trang hiện tại và các trang khác */}
                          {[1, 2, 3, 4, 5].map((pageNumber) => (
                            <button
                              key={pageNumber}
                              aria-current={
                                pageNumber === 1 ? "page" : undefined
                              }
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                ${
                                  pageNumber === 1
                                    ? "z-10 bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                                }
                                transition-all duration-200 transform hover:scale-105
                                ${pageNumber === 1 ? "pagination-active" : ""}
                              `}
                              onClick={() => {
                                if (pageNumber !== 1) {
                                  toast.info(`Đang tải trang ${pageNumber}`, {
                                    autoClose: 1500,
                                  });
                                }
                              }}
                            >
                              {pageNumber}
                            </button>
                          ))}

                          <button
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => {
                              toast.info("Đang tải trang tiếp theo", {
                                autoClose: 1500,
                              });
                            }}
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>

                  {/* Phần gợi ý thêm */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start">
                      <LightbulbIcon className="text-amber-500 w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">
                          Gợi ý cho điều kiện thời tiết hiện tại
                        </h4>
                        <p className="text-sm text-amber-700">
                          {getWeatherAdvice(
                            weatherData?.weatherDescription,
                            weatherData?.temperature
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ShoppingBasket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Không có sản phẩm gợi ý cho khu vực và điều kiện thời tiết
                    này.
                  </p>
                  <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                    Hệ thống không tìm thấy sản phẩm phù hợp với điều kiện thời
                    tiết tại {currentCity} vào thời điểm hiện tại. Vui lòng thử
                    lại sau hoặc chọn một thành phố khác.
                  </p>
                  <Button
                    onClick={fetchProducts}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <RefreshCcw className="w-4 h-4 mr-1" />
                    Thử lại
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />

      <style>
        {`
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float 8s ease-in-out 2s infinite;
        }
        
        @keyframes float {
          0% {
            transform: translatey(0px);
          }
          50% {
            transform: translatey(-20px);
          }
          100% {
            transform: translatey(0px);
          }
        }
        
        .weather-card-gradient {
          background: linear-gradient(to right, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8));
        }
        
        /* Animation cho loading */
        .loading-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        /* Animation mới */
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-in-out 0.2s forwards;
          opacity: 0;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Animation cho card */
        .card-pop-up {
          animation: cardPopUp 0.5s ease-out forwards;
        }
        
        @keyframes cardPopUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Animation cho các card thời tiết theo ngày */
        .forecast-day:nth-child(1) { animation-delay: 0.1s; }
        .forecast-day:nth-child(2) { animation-delay: 0.2s; }
        .forecast-day:nth-child(3) { animation-delay: 0.3s; }
        .forecast-day:nth-child(4) { animation-delay: 0.4s; }
        .forecast-day:nth-child(5) { animation-delay: 0.5s; }
        .forecast-day:nth-child(6) { animation-delay: 0.6s; }
        .forecast-day:nth-child(7) { animation-delay: 0.7s; }
        
        /* Background pattern */
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Improve forecast card animation */
        .forecast-day {
          animation: cardPopUp 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .product-card {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 2px 3px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
          position: relative;
          border-radius: 0.125rem;
          overflow: hidden;
        }
        
        /* Thêm hiệu ứng viền sáng khi hover */
        .product-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 0.125rem;
          padding: 1px;
          background: linear-gradient(to bottom right, transparent, transparent, rgba(59, 130, 246, 0.5));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .product-card:hover::after {
          opacity: 1;
        }
        
        .product-card:nth-child(1) { animation-delay: 0.1s; }
        .product-card:nth-child(2) { animation-delay: 0.2s; }
        .product-card:nth-child(3) { animation-delay: 0.3s; }
        .product-card:nth-child(4) { animation-delay: 0.4s; }
        .product-card:nth-child(5) { animation-delay: 0.5s; }
        .product-card:nth-child(6) { animation-delay: 0.6s; }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          border-color: rgba(59, 130, 246, 0.2);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        @keyframes activePage {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 10px 3px rgba(37, 99, 235, 0.3);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }
        
        .pagination-active {
          animation: activePage 2s infinite ease-in-out;
        }
        
        /* Thêm hiệu ứng tên sản phẩm */
        .product-name-overlay {
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.3s ease-out;
          padding-top: 12px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7) 70%, transparent);
        }
        
        .product-card:hover .product-name-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Cải thiện hiển thị tên sản phẩm */
        .product-title {
          font-weight: 500;
          position: relative;
          transition: color 0.3s ease;
          font-size: 0.625rem;
          line-height: 1.2;
        }
        
        .product-title::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #3b82f6;
          transition: width 0.3s ease;
        }
        
        
        .product-card:hover .product-title {
          color: #3b82f6;
        }
        
        .product-card:hover .product-title::after {
          width: 30%;
        }
        `}
      </style>
    </div>
  );
};

export default WeatherDashboard;
