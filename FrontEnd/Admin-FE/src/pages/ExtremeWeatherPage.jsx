import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
  WbSunny as SunnyIcon,
  Opacity as RainIcon,
  AcUnit as ColdIcon,
  Whatshot as HotIcon,
  Cloud as CloudIcon,
  Thunderstorm as ThunderstormIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import productWeatherRecommendationService from "../services/productWeatherRecommendationService";
import weatherService from "../services/weatherService";

const ExtremeWeatherPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("VN");
  const [forecastDays, setForecastDays] = useState(7);
  const [extremeWeatherForecast, setExtremeWeatherForecast] = useState({});
  const [preparationProducts, setPreparationProducts] = useState({});
  const [preparationAdvice, setPreparationAdvice] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [countries] = useState([{ code: "VN", name: "Việt Nam" }]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await weatherService.getFollowedLocations();
      if (response.success && response.data && response.data.length > 0) {
        setLocations(response.data);
        setCity(response.data[0].city);
        setCountry(response.data[0].country);
      } else {
        enqueueSnackbar("Không thể tải danh sách địa điểm từ server", {
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa điểm:", error);
      enqueueSnackbar("Lỗi khi tải danh sách địa điểm", {
        variant: "error",
      });
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (city && country) {
      fetchExtremeWeatherPreparation();
    } else if (locations.length === 0 && !loadingLocations) {
      // Sử dụng vị trí mặc định nếu không có dữ liệu từ server
      setCity("Hà Nội");
      setCountry("VN");
    }
  }, [city, country, forecastDays, locations, loadingLocations]);

  const fetchExtremeWeatherPreparation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy dữ liệu dự báo thời tiết khắc nghiệt
      const response =
        await productWeatherRecommendationService.getExtremeWeatherPreparation(
          city,
          country,
          forecastDays
        );

      if (response.success) {
        setExtremeWeatherForecast(response.data.extremeWeatherForecast || {});
        setPreparationProducts(response.data.preparationProducts || {});
        setPreparationAdvice(response.data.preparationAdvice || []);
      } else {
        setError(response.message || "Có lỗi xảy ra khi tải dữ liệu");
      }

      // Lấy dữ liệu thời tiết hiện tại và dự báo
      await fetchWeatherData();
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thời tiết khắc nghiệt:", error);
      setError(
        error.message || "Có lỗi xảy ra khi tải dữ liệu thời tiết khắc nghiệt"
      );
      enqueueSnackbar("Không thể tải dữ liệu thời tiết khắc nghiệt", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy dữ liệu thời tiết hiện tại và dự báo
  const fetchWeatherData = async () => {
    try {
      // Lấy dữ liệu thời tiết hiện tại
      const currentWeather = await weatherService.getCurrentWeather(
        city,
        country
      );
      setWeatherData(currentWeather);

      // Lấy dữ liệu dự báo thời tiết
      const forecast = await weatherService.getWeatherForecast(
        city,
        country,
        forecastDays
      );
      setForecastData(Array.isArray(forecast) ? forecast : []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
      enqueueSnackbar("Không thể tải dữ liệu thời tiết", {
        variant: "error",
      });
    }
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handleForecastDaysChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setForecastDays(value);
    }
  };

  // Kiểm tra xem có hiện tượng thời tiết khắc nghiệt nào được dự đoán không
  const hasExtremeWeather = Object.keys(extremeWeatherForecast).length > 0;

  // Hàm lấy icon phù hợp với điều kiện thời tiết
  const getWeatherIcon = (description, temperature) => {
    description = description ? description.toLowerCase() : "";
    temperature = temperature || 0;

    if (description.includes("mưa") || description.includes("rain")) {
      return <RainIcon fontSize="large" color="info" />;
    } else if (
      description.includes("bão") ||
      description.includes("dông") ||
      description.includes("storm") ||
      description.includes("thunder")
    ) {
      return <ThunderstormIcon fontSize="large" color="error" />;
    } else if (description.includes("mây") || description.includes("cloud")) {
      return <CloudIcon fontSize="large" />;
    } else if (temperature > 30) {
      return <HotIcon fontSize="large" color="error" />;
    } else if (temperature < 15) {
      return <ColdIcon fontSize="large" color="info" />;
    } else {
      return <SunnyIcon fontSize="large" color="warning" />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chuẩn Bị Cho Thời Tiết Khắc Nghiệt
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Gợi ý sản phẩm và lời khuyên để chuẩn bị cho các hiện tượng thời tiết
          khắc nghiệt sắp tới
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="city-label">Thành phố</InputLabel>
              <Select
                labelId="city-label"
                id="city-select"
                value={city}
                label="Thành phố"
                onChange={handleCityChange}
                disabled={loadingLocations || locations.length === 0}
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.city}>
                    {location.city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="country-label">Quốc gia</InputLabel>
              <Select
                labelId="country-label"
                id="country-select"
                value={country}
                label="Quốc gia"
                onChange={handleCountryChange}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Số ngày dự báo"
              type="number"
              value={forecastDays}
              onChange={handleForecastDaysChange}
              variant="outlined"
              inputProps={{ min: 1, max: 14 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchExtremeWeatherPreparation}
              startIcon={<RefreshIcon />}
              disabled={loading || !city}
            >
              Cập Nhật
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Hiển thị thông tin thời tiết hiện tại */}
            {weatherData && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Thông Tin Thời Tiết Hiện Tại - {city}, {country}
                </Typography>
                <Paper
                  elevation={2}
                  sx={{ p: 2, bgcolor: "background.default" }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ mr: 1 }}>
                          {getWeatherIcon(
                            weatherData.weatherDescription,
                            weatherData.temperature
                          )}
                        </Box>
                        <Typography variant="body1">
                          {weatherData.weatherDescription}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h4">
                        {weatherData.temperature}°C
                      </Typography>
                      <Typography variant="body2">
                        Cảm giác như: {weatherData.feelsLike}°C
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        Độ ẩm: {weatherData.humidity}%
                      </Typography>
                      <Typography variant="body2">
                        Gió: {weatherData.windSpeed} m/s
                      </Typography>
                      <Typography variant="body2">
                        Áp suất: {weatherData.pressure} hPa
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* Hiển thị dự báo thời tiết */}
            {forecastData && forecastData.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Dự Báo Thời Tiết {forecastDays} Ngày Tới
                </Typography>
                <Grid container spacing={1}>
                  {forecastData.slice(0, 7).map((forecast, index) => (
                    <Grid
                      item
                      key={index}
                      xs={6}
                      sm={4}
                      md={3}
                      lg={Math.min(
                        Math.floor(12 / Math.min(forecastData.length, 7)),
                        2
                      )}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Typography variant="subtitle2">
                          {new Date(forecast.dataTime).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "short",
                              month: "numeric",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                        <Typography variant="h5" sx={{ my: 1 }}>
                          {forecast.temperature}°C
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ textAlign: "center" }}
                        >
                          {forecast.weatherDescription}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" display="block">
                            Độ ẩm: {forecast.humidity}%
                          </Typography>
                          <Typography variant="caption" display="block">
                            Gió: {forecast.windSpeed} m/s
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {hasExtremeWeather ? (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Dự Báo Thời Tiết Khắc Nghiệt
                  </Typography>
                  <Paper
                    elevation={2}
                    sx={{ p: 2, bgcolor: "rgba(255, 152, 0, 0.08)" }}
                  >
                    <Grid container spacing={2}>
                      {Object.entries(extremeWeatherForecast).map(
                        ([type, forecast]) => (
                          <Grid item xs={12} sm={6} key={type}>
                            <Card sx={{ mb: 2 }}>
                              <CardContent>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1,
                                  }}
                                >
                                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                                  <Typography variant="h6">
                                    {type === "heavyRain" && "Mưa lớn"}
                                    {type === "strongWind" && "Gió mạnh"}
                                    {type === "extremeHeat" &&
                                      "Nắng nóng cực đoan"}
                                    {type === "drought" && "Hạn hán"}
                                    {type === "flood" && "Lũ lụt"}
                                    {type === "storm" && "Bão"}
                                  </Typography>
                                </Box>
                                <Typography variant="body2">
                                  Thời gian: {forecast.expectedTime}
                                </Typography>
                                <Typography variant="body2">
                                  Mức độ: {forecast.severity}
                                </Typography>
                                <Typography variant="body2">
                                  {forecast.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Paper>
                </Box>

                {preparationAdvice.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Lời Khuyên Chuẩn Bị
                    </Typography>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, bgcolor: "rgba(76, 175, 80, 0.08)" }}
                    >
                      <List>
                        {preparationAdvice.map((advice, index) => (
                          <div key={index}>
                            <ListItem>
                              <ListItemIcon>
                                <InfoIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={advice} />
                            </ListItem>
                            {index < preparationAdvice.length - 1 && (
                              <Divider />
                            )}
                          </div>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                )}

                {Object.keys(preparationProducts).length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Sản Phẩm Chuẩn Bị Theo Loại Thời Tiết
                    </Typography>

                    {Object.entries(preparationProducts).map(
                      ([weatherType, products]) => (
                        <Box key={weatherType} sx={{ mb: 4 }}>
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            sx={{ mt: 2 }}
                          >
                            {weatherType === "heavyRain" &&
                              "Sản phẩm cho mưa lớn"}
                            {weatherType === "strongWind" &&
                              "Sản phẩm cho gió mạnh"}
                            {weatherType === "extremeHeat" &&
                              "Sản phẩm cho nắng nóng cực đoan"}
                            {weatherType === "drought" &&
                              "Sản phẩm cho hạn hán"}
                            {weatherType === "flood" && "Sản phẩm cho lũ lụt"}
                            {weatherType === "storm" && "Sản phẩm cho bão"}
                          </Typography>

                          <Grid container spacing={3}>
                            {products.map((product) => (
                              <Grid item xs={12} sm={6} md={4} key={product.id}>
                                <Card sx={{ height: "100%" }}>
                                  <CardMedia
                                    component="img"
                                    height="140"
                                    image={
                                      product.thumbnailUrl ||
                                      "https://via.placeholder.com/300x150?text=No+Image"
                                    }
                                    alt={product.name}
                                  />
                                  <CardContent>
                                    <Typography
                                      gutterBottom
                                      variant="h6"
                                      component="div"
                                    >
                                      {product.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {product.description}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mt: 2,
                                      }}
                                    >
                                      <Typography
                                        variant="body1"
                                        color="primary"
                                        fontWeight="bold"
                                      >
                                        {new Intl.NumberFormat("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                        }).format(product.price)}
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={
                                          product.inStock
                                            ? "Còn hàng"
                                            : "Hết hàng"
                                        }
                                        color={
                                          product.inStock ? "success" : "error"
                                        }
                                      />
                                    </Box>
                                  </CardContent>
                                  <CardActions>
                                    <Button
                                      size="small"
                                      startIcon={<ShoppingCartIcon />}
                                    >
                                      Thêm vào giỏ hàng
                                    </Button>
                                  </CardActions>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )
                    )}
                  </Box>
                )}
              </>
            ) : (
              <Alert
                severity="info"
                icon={<InfoIcon fontSize="inherit" />}
                sx={{ mb: 4 }}
              >
                Không có dự báo thời tiết khắc nghiệt nào trong {forecastDays}{" "}
                ngày tới cho {city}, {country}
              </Alert>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ExtremeWeatherPage;
