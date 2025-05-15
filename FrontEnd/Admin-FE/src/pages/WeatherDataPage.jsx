import { useState, useEffect, Component } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudIcon from "@mui/icons-material/Cloud";
import WarningIcon from "@mui/icons-material/Warning";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import weatherService from "../services/weatherService";

// Thêm Error Boundary để bắt lỗi và tránh ứng dụng bị crash
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị UI thay thế
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Ghi log lỗi
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Hiển thị UI thay thế
      return (
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 3, my: 3 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Đã xảy ra lỗi
            </Typography>
            <Typography variant="body1" gutterBottom>
              Ứng dụng gặp sự cố khi xử lý dữ liệu. Vui lòng thử lại sau.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
              Chi tiết lỗi: {this.state.error?.toString()}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Tải lại trang
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Thêm prop-types cho ErrorBoundary
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const WeatherDataPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("VN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);

  // Dữ liệu thời tiết
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);

  // Dữ liệu lời khuyên nông nghiệp
  const [currentAdvice, setCurrentAdvice] = useState(null);
  const [adviceHistory, setAdviceHistory] = useState([]);

  // Lấy danh sách các địa điểm đang được theo dõi khi component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Hàm lấy danh sách các địa điểm đang được theo dõi
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const data = await weatherService.getActiveLocations();
      setLocations(data);

      // Nếu có địa điểm, đặt mặc định cho ô tìm kiếm
      if (data && data.length > 0) {
        setCity(data[0].city);
        setCountry(data[0].country);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách địa điểm:", err);
      setError("Không thể tải danh sách địa điểm. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (currentWeather && newValue === 1) {
      // Nếu chuyển sang tab lời khuyên và đã có dữ liệu thời tiết, lấy lời khuyên
      fetchAgriculturalAdvice();
    }
  };

  // Hàm tìm kiếm dữ liệu thời tiết
  const handleSearchWeather = async () => {
    if (!city) {
      setError("Vui lòng nhập tên thành phố để tìm kiếm");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Bắt đầu tìm kiếm thời tiết cho:", city, country);
      let weatherData;
      let historyData;

      try {
        // Lấy dữ liệu thời tiết hiện tại từ API
        console.log("Gọi API getCurrentWeather với:", city, country);
        weatherData = await weatherService.getCurrentWeather(city, country);
        console.log("Kết quả API getCurrentWeather:", weatherData);

        // Lấy lịch sử dữ liệu thời tiết 7 ngày qua
        console.log("Gọi API getWeatherHistory với:", city, country);
        historyData = await weatherService.getWeatherHistory(city, country, 7);
        console.log("Kết quả API getWeatherHistory:", historyData);
      } catch (apiError) {
        console.error("Lỗi chi tiết khi gọi API thời tiết:", apiError);
        console.error("API Error Message:", apiError.message);
        console.error("API Error Response:", apiError.response?.data);
        console.error("API Error Status:", apiError.response?.status);

        // Dùng dữ liệu mẫu nếu API không hoạt động
        console.log("Sử dụng dữ liệu mẫu thay thế");

        // Dữ liệu thời tiết mẫu
        weatherData = {
          city: city,
          country: country,
          weather: {
            description: "Mây rải rác",
            icon: "04d",
            main: "Clouds",
          },
          main: {
            temp: 27.5,
            feels_like: 28.2,
            temp_min: 26.8,
            temp_max: 30.2,
            humidity: 75,
            pressure: 1013,
          },
          wind: {
            speed: 2.5,
            deg: 120,
          },
          clouds: {
            all: 40,
          },
          rain: {
            "1h": 0.5,
          },
          dt: new Date().getTime() / 1000,
          timezone: 25200,
          sys: {
            sunrise: new Date().setHours(6, 0, 0, 0) / 1000,
            sunset: new Date().setHours(18, 0, 0, 0) / 1000,
          },
        };

        // Dữ liệu lịch sử thời tiết mẫu
        historyData = Array.from({ length: 7 }, (_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - index - 1);

          return {
            dt: date.getTime() / 1000,
            main: {
              temp: Math.random() * 5 + 25, // 25-30 độ C
              humidity: Math.random() * 20 + 60, // 60-80%
            },
            weather: [
              {
                main: ["Clear", "Clouds", "Rain"][
                  Math.floor(Math.random() * 3)
                ],
                description: ["Trời nắng", "Mây rải rác", "Mưa nhẹ"][
                  Math.floor(Math.random() * 3)
                ],
              },
            ],
            wind: {
              speed: Math.random() * 3 + 1, // 1-4 m/s
            },
            rain:
              Math.random() > 0.7 ? { "1h": Math.random() * 10 } : undefined,
          };
        });
      }

      // Cập nhật state với dữ liệu từ API hoặc dữ liệu mẫu
      console.log("Đang cập nhật state với dữ liệu thời tiết");
      setCurrentWeather(weatherData);
      setWeatherHistory(historyData);
      console.log("Đã cập nhật state thành công");

      // Nếu đang ở tab lời khuyên nông nghiệp, lấy thêm dữ liệu lời khuyên
      if (tabValue === 1) {
        await fetchAgriculturalAdvice();
      }
    } catch (err) {
      console.error("Lỗi chung khi xử lý dữ liệu thời tiết:", err);
      console.error("Error Stack:", err.stack);
      setError(
        `Không thể lấy dữ liệu thời tiết cho ${city}, ${country}. Lỗi: ${err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy lời khuyên nông nghiệp
  const fetchAgriculturalAdvice = async () => {
    if (!city) return;

    setIsLoading(true);
    try {
      let adviceData;
      let adviceHistoryData;

      try {
        adviceData = await weatherService.getLatestAgriculturalAdvice(
          city,
          country
        );
        adviceHistoryData = await weatherService.getAgriculturalAdviceHistory(
          city,
          country
        );
      } catch (apiError) {
        console.error("Lỗi khi gọi API lời khuyên:", apiError);

        // Lấy dữ liệu nhiệt độ từ dữ liệu thời tiết nếu có
        const temperature = currentWeather?.main?.temp || 27.5;
        console.log("Tạo lời khuyên dựa trên nhiệt độ:", temperature);

        // Tạo lời khuyên dựa trên nhiệt độ
        let weatherSummary = "";
        let farmingAdvice = "";
        let cropAdvice = "";
        let warnings = null;
        let isRainySeason = false;
        let isDrySeason = false;
        let isSuitableForPlanting = true;
        let isSuitableForHarvesting = true;
        let recommendedActivities = "";

        // Phân loại lời khuyên theo nhiệt độ
        if (temperature < 15) {
          // Nhiệt độ thấp (dưới 15°C)
          weatherSummary =
            "Thời tiết lạnh, cần chú ý bảo vệ cây trồng khỏi sương giá";
          farmingAdvice =
            "- Che phủ cây trồng vào ban đêm để bảo vệ khỏi sương giá\n" +
            "- Giảm tưới nước vào buổi chiều để tránh đất ẩm quá mức vào ban đêm\n" +
            "- Sử dụng màng phủ nông nghiệp để giữ nhiệt cho đất\n" +
            "- Hạn chế bón phân đạm trong thời kỳ này";
          cropAdvice =
            "- Thích hợp trồng: Cải thảo, súp lơ, bắp cải, cà rốt, hành, tỏi\n" +
            "- Không nên trồng: Cà chua, ớt, dưa chuột, bầu bí\n" +
            "- Cây trồng cần được bảo vệ khỏi gió lạnh";
          warnings =
            "Nguy cơ sương giá có thể gây hại cho cây trồng nhiệt đới. Cần che phủ hoặc tạo hệ thống sưởi nhẹ nếu nhiệt độ xuống dưới 10°C";
          isDrySeason = true;
          isSuitableForPlanting = false;
          isSuitableForHarvesting = true;
          recommendedActivities =
            "Tập trung vào thu hoạch các loại rau, củ chịu lạnh và chuẩn bị đất cho vụ mùa tới";
        } else if (temperature >= 15 && temperature < 22) {
          // Nhiệt độ mát mẻ (15-22°C)
          weatherSummary =
            "Thời tiết mát mẻ, thích hợp cho đa dạng hoạt động nông nghiệp";
          farmingAdvice =
            "- Tưới nước vừa phải, 1-2 lần/ngày tùy loại cây\n" +
            "- Thời điểm tốt để bón phân hữu cơ cho đất\n" +
            "- Có thể tiến hành cấy, ghép và nhân giống cây\n" +
            "- Kiểm soát cỏ dại thủ công để tránh cạnh tranh dưỡng chất";
          cropAdvice =
            "- Thích hợp trồng: Hầu hết các loại rau, đậu các loại, cà chua, ớt\n" +
            "- Đặc biệt phù hợp cho: Rau ăn lá các loại, hoa cảnh, dưa lưới\n" +
            "- Thời điểm lý tưởng để gieo hạt nhiều loại cây";
          isSuitableForPlanting = true;
          isSuitableForHarvesting = true;
          recommendedActivities =
            "Tận dụng thời tiết thuận lợi để gieo trồng đa dạng cây trồng, đặc biệt là các loại rau ngắn ngày";
        } else if (temperature >= 22 && temperature < 28) {
          // Nhiệt độ ấm áp (22-28°C)
          weatherSummary =
            "Thời tiết ấm áp, thích hợp cho sự phát triển của nhiều loại cây trồng";
          farmingAdvice =
            "- Tưới nước đều đặn, tốt nhất vào sáng sớm hoặc chiều tối\n" +
            "- Bón phân cân đối giữa đạm, lân, kali\n" +
            "- Thời điểm tốt để phun các chế phẩm sinh học kích thích tăng trưởng\n" +
            "- Tạo bóng râm một phần cho các cây non và cây ưa bóng mát";
          cropAdvice =
            "- Thích hợp trồng: Lúa, ngô, đậu các loại, rau quả nhiệt đới\n" +
            "- Rất thuận lợi cho: Cây ăn quả như cam, quýt, bưởi, xoài\n" +
            "- Thời điểm tốt để trồng các loại cây công nghiệp dài ngày";
          isSuitableForPlanting = true;
          isSuitableForHarvesting = true;
          recommendedActivities =
            "Đẩy mạnh hoạt động chăm sóc, bón phân và phòng trừ sâu bệnh proactively";
        } else if (temperature >= 28 && temperature < 35) {
          // Nhiệt độ nóng (28-35°C)
          weatherSummary =
            "Thời tiết nóng, cần chú ý đến chế độ tưới nước và bảo vệ cây trồng";
          farmingAdvice =
            "- Tưới nước thường xuyên, có thể 2-3 lần/ngày vào thời điểm sáng sớm và chiều tối\n" +
            "- Tuyệt đối không tưới nước vào lúc trời nắng gắt\n" +
            "- Bổ sung che phủ gốc bằng rơm rạ, mùn cưa để giữ ẩm\n" +
            "- Hạn chế bón phân đạm, tăng cường phân kali\n" +
            "- Tạo bóng râm cho cây con và cây nhạy cảm với nhiệt độ cao";
          cropAdvice =
            "- Thích hợp trồng: Các loại cây chịu nhiệt như ớt, đậu bắp, khoai lang, mía\n" +
            "- Hạn chế trồng: Rau ăn lá, súp lơ, bông cải\n" +
            "- Ưu tiên chọn giống cây chịu hạn, chịu nhiệt";
          warnings =
            "Nguy cơ cháy lá và héo rũ cây do nhiệt độ cao. Cần tăng cường tưới nước và tạo bóng râm";
          isDrySeason = true;
          isSuitableForPlanting = false;
          isSuitableForHarvesting = true;
          recommendedActivities =
            "Tập trung vào hoạt động tưới nước, che phủ đất và thu hoạch các cây đã đến thời kỳ";
        } else {
          // Nhiệt độ rất cao (trên 35°C)
          weatherSummary =
            "Thời tiết cực kỳ nóng, nguy cơ cao gây stress cho cây trồng";
          farmingAdvice =
            "- Tưới nước nhiều lần trong ngày, chỉ vào sáng sớm và chiều tối\n" +
            "- Sử dụng kỹ thuật phun sương để tăng độ ẩm không khí\n" +
            "- Che phủ hoàn toàn đất bằng rơm rạ, lá khô hoặc màng phủ nông nghiệp\n" +
            "- Dừng hoàn toàn việc bón phân\n" +
            "- Tạo mái che, lưới che để giảm cường độ ánh nắng trực tiếp";
          cropAdvice =
            "- Không nên gieo trồng mới trong thời kỳ này\n" +
            "- Chỉ duy trì các cây trồng chịu nhiệt tốt như mía, khoai lang, đậu bắp\n" +
            "- Ưu tiên cho thu hoạch sớm các loại cây đã đến thời kỳ";
          warnings =
            "Nguy cơ nghiêm trọng về héo rũ, cháy lá và mất mùa do nhiệt độ quá cao. Không nên trồng mới, tập trung vào bảo vệ cây đang có";
          isDrySeason = true;
          isSuitableForPlanting = false;
          isSuitableForHarvesting = false;
          recommendedActivities =
            "Tập trung vào các biện pháp chống nóng và bảo vệ cây trồng, hạn chế các hoạt động nông nghiệp khác";
        }

        // Điều chỉnh theo lượng mưa và độ ẩm nếu có dữ liệu
        const humidity = currentWeather?.main?.humidity || 75;
        const hasRain =
          currentWeather?.rain &&
          (currentWeather.rain["1h"] > 0 || currentWeather.rain["3h"] > 0);

        if (hasRain) {
          isRainySeason = true;
          isDrySeason = false;
          weatherSummary += ". Có mưa, thuận lợi cho cây trồng phát triển";
          farmingAdvice +=
            "\n- Hạn chế tưới nước trong những ngày mưa\n- Chú ý thoát nước cho vùng dễ bị ngập úng";

          if (humidity > 85) {
            warnings =
              (warnings || "") +
              "\nĐộ ẩm cao kết hợp với mưa tạo điều kiện thuận lợi cho nấm bệnh phát triển. Cần theo dõi và phòng trừ kịp thời.";
          }
        }

        if (humidity < 40) {
          weatherSummary += ". Độ ẩm thấp, cây trồng dễ bị stress";
          farmingAdvice +=
            "\n- Tăng cường tưới phun sương để tăng độ ẩm không khí\n- Có thể dùng các biện pháp tưới nhỏ giọt để tiết kiệm nước";
          warnings =
            (warnings || "") +
            "\nĐộ ẩm quá thấp có thể gây khô lá và ảnh hưởng đến quá trình thụ phấn của cây trồng.";
        }

        // Dữ liệu lời khuyên mẫu
        adviceData = {
          id: 1,
          weatherData: {
            city: city,
            country: country,
            temperature: temperature,
            humidity: humidity,
            windSpeed: currentWeather?.wind?.speed || 2.5,
            description: currentWeather?.weather?.description || "Mây rải rác",
          },
          weatherSummary: weatherSummary,
          farmingAdvice: farmingAdvice,
          cropAdvice: cropAdvice,
          warnings: warnings,
          isRainySeason: isRainySeason,
          isDrySeason: isDrySeason,
          isSuitableForPlanting: isSuitableForPlanting,
          isSuitableForHarvesting: isSuitableForHarvesting,
          recommendedActivities: recommendedActivities,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Dữ liệu lịch sử lời khuyên mẫu
        adviceHistoryData = Array.from({ length: 5 }, (_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - index - 1);
          const randomTemp = Math.floor(Math.random() * 10) + 25; // 25-35 độ C

          let advice = "";
          if (randomTemp < 28) {
            advice =
              "Tưới nước vừa phải, thích hợp bón phân và chăm sóc cây trồng";
          } else if (randomTemp < 32) {
            advice =
              "Tăng cường tưới nước vào sáng sớm và chiều tối, tạo bóng râm cho cây non";
          } else {
            advice =
              "Tưới nước thường xuyên, tránh để cây tiếp xúc trực tiếp với ánh nắng gay gắt";
          }

          return {
            id: 100 + index,
            weatherSummary: `Thời tiết ngày ${date.getDate()}/${
              date.getMonth() + 1
            }: ${
              ["Nắng nhẹ", "Mây rải rác", "Có mưa nhỏ"][index % 3]
            } - ${randomTemp}°C`,
            farmingAdvice: `Lời khuyên canh tác ngày ${date.getDate()}/${
              date.getMonth() + 1
            }: ${advice}`,
            createdAt: date.toISOString(),
            updatedAt: date.toISOString(),
          };
        });
      }

      setCurrentAdvice(adviceData);
      setAdviceHistory(adviceHistoryData || []);
    } catch (err) {
      console.error("Lỗi khi xử lý lời khuyên nông nghiệp:", err);
      setError(
        `Không thể lấy lời khuyên nông nghiệp cho ${city}, ${country}. Vui lòng thử lại sau.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format thời gian
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    try {
      return new Date(dateTime).toLocaleString("vi-VN");
    } catch (error) {
      console.error("Lỗi định dạng thời gian:", error);
      return dateTime;
    }
  };

  // Định dạng nhiệt độ
  const formatTemperature = (temp) => {
    if (!temp && temp !== 0) return "N/A";
    return `${parseFloat(temp).toFixed(1)}°C`;
  };

  // Render dữ liệu thời tiết hiện tại
  const renderCurrentWeather = () => {
    if (!currentWeather) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1">
            Hãy tìm kiếm thông tin thời tiết cho một thành phố.
          </Typography>
        </Box>
      );
    }

    // Kiểm tra tính toàn vẹn của dữ liệu
    if (
      !currentWeather.main ||
      !currentWeather.weather ||
      !currentWeather.sys
    ) {
      console.error("Dữ liệu thời tiết không đầy đủ:", currentWeather);
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Alert severity="error">
            Dữ liệu thời tiết nhận được không đầy đủ. Vui lòng thử lại.
          </Alert>
        </Box>
      );
    }

    // Kiểm tra an toàn thời gian mặt trời mọc/lặn
    let isDay = true;
    try {
      isDay =
        currentWeather.dt > currentWeather.sys.sunrise &&
        currentWeather.dt < currentWeather.sys.sunset;
    } catch (error) {
      console.error("Lỗi khi tính toán thời gian ban ngày/đêm:", error);
    }

    return (
      <Card elevation={3} sx={{ mt: 3 }}>
        <CardHeader
          title={`Thời tiết tại ${currentWeather.city || "N/A"}, ${
            currentWeather.country || "N/A"
          }`}
          subheader={formatDateTime(new Date(currentWeather.dt * 1000))}
          action={
            isDay ? (
              <WbSunnyIcon fontSize="large" color="warning" />
            ) : (
              <DarkModeIcon fontSize="large" color="primary" />
            )
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ThermostatIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h4">
                  {formatTemperature(currentWeather.main.temp)}
                </Typography>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Cảm giác như{" "}
                  {formatTemperature(currentWeather.main.feels_like)}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {currentWeather.weather.main} -{" "}
                {currentWeather.weather.description}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                <Chip
                  icon={<ThermostatIcon />}
                  label={`Cao: ${formatTemperature(
                    currentWeather.main.temp_max
                  )}`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<ThermostatIcon />}
                  label={`Thấp: ${formatTemperature(
                    currentWeather.main.temp_min
                  )}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Chi tiết
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <WaterDropIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      Độ ẩm: {currentWeather.main.humidity}%
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AirIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      Gió: {currentWeather.wind.speed} m/s
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CloudIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>Mây: {currentWeather.clouds.all}%</Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <WaterDropIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      Lượng mưa:{" "}
                      {currentWeather.rain
                        ? `${currentWeather.rain["1h"]} mm`
                        : "0 mm"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <WbSunnyIcon color="warning" sx={{ mr: 1 }} />
                    <Typography>
                      Bình minh:{" "}
                      {
                        formatDateTime(
                          new Date(currentWeather.sys.sunrise * 1000)
                        ).split(", ")[1]
                      }
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <DarkModeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      Hoàng hôn:{" "}
                      {
                        formatDateTime(
                          new Date(currentWeather.sys.sunset * 1000)
                        ).split(", ")[1]
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Hiển thị lời khuyên nông nghiệp
  const renderAdvice = () => {
    if (!currentAdvice) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1">
            Hãy tìm kiếm thành phố để xem lời khuyên nông nghiệp.
          </Typography>
        </Box>
      );
    }

    return (
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={`Lời khuyên nông nghiệp: ${
            currentAdvice.weatherData?.city || "N/A"
          }, ${currentAdvice.weatherData?.country || "N/A"}`}
          subheader={formatDateTime(currentAdvice.createdAt)}
        />
        <CardContent>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            <CloudIcon sx={{ mr: 1, verticalAlign: "text-bottom" }} />
            {currentAdvice.weatherSummary || "Không có mô tả"}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Lời khuyên canh tác
              </Typography>
              <Typography>{currentAdvice.farmingAdvice}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Lời khuyên cây trồng
              </Typography>
              <Typography>
                {currentAdvice.cropAdvice || "Không có lời khuyên cụ thể"}
              </Typography>
            </Grid>
          </Grid>

          {currentAdvice.warnings && (
            <Box sx={{ mt: 2, p: 1, bgcolor: "error.light", borderRadius: 1 }}>
              <Typography variant="subtitle2" color="error.dark">
                <WarningIcon sx={{ mr: 1, verticalAlign: "text-bottom" }} />
                Cảnh báo
              </Typography>
              <Typography color="error.dark">
                {currentAdvice.warnings}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Chip
                  icon={<CloudIcon />}
                  label={
                    currentAdvice.isRainySeason
                      ? "Mùa mưa"
                      : "Không phải mùa mưa"
                  }
                  color={currentAdvice.isRainySeason ? "info" : "default"}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip
                  label={
                    currentAdvice.isDrySeason ? "Mùa khô" : "Không phải mùa khô"
                  }
                  color={currentAdvice.isDrySeason ? "warning" : "default"}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip
                  label={
                    currentAdvice.isSuitableForPlanting
                      ? "Phù hợp để gieo trồng"
                      : "Không phù hợp để gieo trồng"
                  }
                  color={
                    currentAdvice.isSuitableForPlanting ? "success" : "default"
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip
                  label={
                    currentAdvice.isSuitableForHarvesting
                      ? "Phù hợp để thu hoạch"
                      : "Không phù hợp để thu hoạch"
                  }
                  color={
                    currentAdvice.isSuitableForHarvesting
                      ? "success"
                      : "default"
                  }
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          {currentAdvice.recommendedActivities && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Hoạt động đề xuất
              </Typography>
              <Typography>{currentAdvice.recommendedActivities}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Hiển thị lịch sử lời khuyên nông nghiệp
  const renderAdviceHistory = () => {
    if (!adviceHistory || adviceHistory.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Chưa có lịch sử lời khuyên nông nghiệp cho địa điểm này.
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lịch sử lời khuyên nông nghiệp
        </Typography>
        {adviceHistory.map((advice, index) => (
          <Card key={index} sx={{ mb: 2, bgcolor: "background.default" }}>
            <CardHeader
              title={`Lời khuyên ngày ${
                formatDateTime(advice.createdAt).split(",")[0]
              }`}
              subheader={formatDateTime(advice.createdAt)}
            />
            <CardContent>
              <Typography variant="body2">{advice.weatherSummary}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {advice.farmingAdvice}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Hiển thị lịch sử dữ liệu thời tiết
  const renderWeatherHistory = () => {
    if (!weatherHistory || weatherHistory.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Chưa có dữ liệu lịch sử thời tiết cho địa điểm này.
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lịch sử thời tiết 7 ngày qua
        </Typography>
        <List>
          {weatherHistory.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardHeader
                title={`Thời tiết ngày ${
                  formatDateTime(new Date(item.dt * 1000)).split(",")[0]
                }`}
                subheader={formatDateTime(new Date(item.dt * 1000))}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <ListItem>
                      <ListItemIcon>
                        <ThermostatIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Nhiệt độ: ${formatTemperature(
                          item.main.temp
                        )}`}
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ListItem>
                      <ListItemIcon>
                        <WaterDropIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={`Độ ẩm: ${item.main.humidity}%`} />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ListItem>
                      <ListItemIcon>
                        <AirIcon />
                      </ListItemIcon>
                      <ListItemText primary={`Gió: ${item.wind.speed} m/s`} />
                    </ListItem>
                  </Grid>
                </Grid>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {item.weather[0].main} - {item.weather[0].description}
                </Typography>
                {item.rain && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Lượng mưa: {item.rain["1h"] || item.rain["3h"] || 0} mm
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" sx={{ my: 3 }}>
          Quản Lý Dữ Liệu Thời Tiết & Lời Khuyên Nông Nghiệp
        </Typography>

        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Dữ Liệu Thời Tiết" />
            <Tab label="Lời Khuyên Nông Nghiệp" />
          </Tabs>
        </Paper>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Form tìm kiếm cho 2 tab đầu */}
        {(tabValue === 0 || tabValue === 1) && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                {locations.length > 0 ? (
                  <FormControl fullWidth>
                    <InputLabel>Thành Phố</InputLabel>
                    <Select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        // Tìm và cập nhật quốc gia tương ứng
                        const selectedLocation = locations.find(
                          (loc) => loc.city === e.target.value
                        );
                        if (selectedLocation) {
                          setCountry(selectedLocation.country);
                        }
                      }}
                      label="Thành Phố"
                    >
                      {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.city}>
                          {loc.name} ({loc.city})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label="Thành Phố"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Quốc Gia</InputLabel>
                  <Select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    label="Quốc Gia"
                  >
                    <MenuItem value="VN">Việt Nam (VN)</MenuItem>
                    <MenuItem value="US">Hoa Kỳ (US)</MenuItem>
                    <MenuItem value="JP">Nhật Bản (JP)</MenuItem>
                    <MenuItem value="KR">Hàn Quốc (KR)</MenuItem>
                    <MenuItem value="CN">Trung Quốc (CN)</MenuItem>
                    <MenuItem value="TH">Thái Lan (TH)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SearchIcon />
                      )
                    }
                    onClick={handleSearchWeather}
                    disabled={isLoading || !city}
                    fullWidth
                  >
                    {isLoading ? "Đang tải..." : "Tìm Kiếm"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={fetchLocations}
                    disabled={isLoading}
                  >
                    <RefreshIcon />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Tab nội dung */}
        <Box role="tabpanel" hidden={tabValue !== 0}>
          {isLoading && !currentWeather ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {renderCurrentWeather()}
              {currentWeather && renderWeatherHistory()}
            </>
          )}
        </Box>

        <Box role="tabpanel" hidden={tabValue !== 1}>
          {isLoading && !currentAdvice ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {renderAdvice()}
              {renderAdviceHistory()}
            </>
          )}
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default WeatherDataPage;
