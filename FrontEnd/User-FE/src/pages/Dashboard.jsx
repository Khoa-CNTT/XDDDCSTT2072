import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Leaf,
  ThermometerSun,
  Droplets,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu thời tiết cho trang Dashboard
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get("/api/v1/weather/current", {
          params: {
            city: "Ho Chi Minh",
            country: "VN",
          },
        });
        setWeatherData(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thời tiết:", error);
        // Sử dụng dữ liệu mẫu khi API lỗi
        setWeatherData({
          city: "Ho Chi Minh",
          country: "VN",
          temperature: 29,
          humidity: 75,
          weatherDescription: "Nắng",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Weather dashboard */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full flex flex-col">
              <CardHeader className="text-white mb-0 pb-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">
                    Thời tiết nông nghiệp
                  </CardTitle>
                  <Button
                    variant="outline"
                    className="bg-white/20 text-white"
                    onClick={() => navigate("/weather")}
                  >
                    Xem chi tiết
                  </Button>
                </div>
                <CardDescription className="text-blue-100">
                  Cập nhật thông tin thời tiết và lời khuyên canh tác
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-grow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="flex items-center mb-2">
                      <CloudSun className="w-8 h-8 mr-2" />
                      <div className="text-3xl font-bold">
                        {weatherData
                          ? `${Math.round(weatherData.temperature)}°C`
                          : "29°C"}
                      </div>
                    </div>
                    <p>
                      {weatherData
                        ? `${weatherData.city} - ${weatherData.weatherDescription}, độ ẩm ${weatherData.humidity}%`
                        : "TP. Hồ Chí Minh - Nắng, độ ẩm 75%"}
                    </p>
                  </div>
                  <div className="space-y-2 hidden md:block">
                    <p className="text-white/90 border-l-4 border-white/80 pl-2">
                      Thích hợp gieo trồng cây ngắn ngày
                    </p>
                    <p className="text-white/90 border-l-4 border-white/80 pl-2">
                      Tưới nước vào sáng sớm và chiều tối
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-white/20 p-2 rounded-md text-center text-white">
                    <p className="text-xs">27/05</p>
                    <CloudRain className="w-6 h-6 mx-auto my-1" />
                    <p className="text-sm font-semibold">28°C</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-md text-center text-white">
                    <p className="text-xs">28/05</p>
                    <Cloud className="w-6 h-6 mx-auto my-1" />
                    <p className="text-sm font-semibold">30°C</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-md text-center text-white">
                    <p className="text-xs">29/05</p>
                    <Sun className="w-6 h-6 mx-auto my-1" />
                    <p className="text-sm font-semibold">32°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="h-full flex flex-col">
              <CardHeader className="mb-0 pb-0">
                <CardTitle className="text-xl font-bold">
                  Lời khuyên nông nghiệp
                </CardTitle>
                <CardDescription>
                  Dựa trên điều kiện thời tiết hiện tại
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-800">
                      <Leaf className="w-4 h-4 inline mr-1" />
                      Thời điểm phù hợp để gieo trồng rau xanh, đậu và các loại
                      cây ngắn ngày
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-sm text-yellow-800">
                      <ThermometerSun className="w-4 h-4 inline mr-1" />
                      Chú ý bảo vệ cây trồng khỏi ánh nắng gay gắt vào buổi trưa
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <Droplets className="w-4 h-4 inline mr-1" />
                      Tăng cường độ ẩm cho cây trồng bằng cách phun sương nhẹ
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/weather")}
                >
                  <CloudSun className="w-4 h-4 mr-2" />
                  Xem chi tiết thời tiết
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        {/* End Weather dashboard */}

        {/* Thêm nội dung Dashboard khác ở đây */}
      </div>
    </Layout>
  );
};

export default Dashboard;
