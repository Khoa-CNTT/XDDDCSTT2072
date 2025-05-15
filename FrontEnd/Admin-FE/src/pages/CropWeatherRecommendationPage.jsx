import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Spa as SpaIcon,
  WbSunny as SunnyIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import productWeatherRecommendationService from "../services/productWeatherRecommendationService";
import weatherService from "../services/weatherService";
import WeatherProductCard from "../components/WeatherProductCard";

const CropWeatherRecommendationPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Hà Nội");
  const [country, setCountry] = useState("VN");
  const [cropType, setCropType] = useState("Lúa");
  const [weatherData, setWeatherData] = useState(null);
  const [products, setProducts] = useState([]);
  const [careAdvice, setCareAdvice] = useState("");
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [countries] = useState([
    { code: "VN", name: "Việt Nam" },
    { code: "US", name: "Hoa Kỳ" },
    { code: "JP", name: "Nhật Bản" },
    { code: "KR", name: "Hàn Quốc" },
    { code: "TH", name: "Thái Lan" },
    { code: "MY", name: "Malaysia" },
    { code: "SG", name: "Singapore" },
  ]);
  const { enqueueSnackbar } = useSnackbar();
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(false);
  const [displayMode, setDisplayMode] = useState("recommended"); // 'recommended' hoặc 'all'

  const locationsDefault = [
    { id: 1, city: "Hà Nội", country: "VN" },
    { id: 2, city: "Hồ Chí Minh", country: "VN" },
    { id: 3, city: "Đà Nẵng", country: "VN" },
    { id: 4, city: "Huế", country: "VN" },
    { id: 5, city: "Cần Thơ", country: "VN" },
  ];

  const cropTypes = [
    "Lúa",
    "Rau xanh",
    "Cây ăn quả",
    "Cây công nghiệp",
    "Hoa màu",
    "Cây cảnh",
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await weatherService.getFollowedLocations();
      if (
        response &&
        response.success &&
        response.data &&
        response.data.length > 0
      ) {
        setLocations(response.data);
        setCity(response.data[0].city);
        setCountry(response.data[0].country);
      } else {
        enqueueSnackbar("Không tìm thấy địa điểm nào từ server", {
          variant: "warning",
        });
        // Dùng locationsDefault chỉ khi không có dữ liệu trả về
        setLocations(locationsDefault);
        setCity(locationsDefault[0].city);
        setCountry(locationsDefault[0].country);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa điểm:", error);
      enqueueSnackbar(
        `Không thể kết nối đến server: ${error.message}. Vui lòng kiểm tra kết nối mạng và API.`,
        { variant: "error" }
      );
      // Dùng locationsDefault chỉ khi có lỗi
      setLocations(locationsDefault);
      setCity(locationsDefault[0].city);
      setCountry(locationsDefault[0].country);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (city && country && cropType) {
      fetchCropRecommendations();
    }
  }, [city, country, cropType]);

  useEffect(() => {
    if (products.length === 0 && !loading) {
      fetchAllProducts();
    }
  }, [products, loading]);

  const fetchCropRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `Đang gọi API getProductsByCropAndWeather với city=${city}, country=${country}, cropType=${cropType}`
      );
      const response =
        await productWeatherRecommendationService.getProductsByCropAndWeather(
          city,
          country,
          cropType
        );

      console.log("Response từ API getProductsByCropAndWeather:", response);

      // Xử lý dữ liệu được trả về
      if (response && response.success) {
        // Lấy dữ liệu thời tiết
        if (response.data && response.data.weatherData) {
          setWeatherData(response.data.weatherData);
        }

        // Xử lý sản phẩm
        let productsData = [];
        if (response.data && response.data.cropProducts) {
          // Trường hợp 1: Trả về là một mảng trực tiếp
          if (Array.isArray(response.data.cropProducts)) {
            productsData = response.data.cropProducts;
          }
          // Trường hợp 2: Trả về dạng phân trang (Spring)
          else if (
            response.data.cropProducts.content &&
            Array.isArray(response.data.cropProducts.content)
          ) {
            productsData = response.data.cropProducts.content;
          }
        }

        setProducts(productsData);

        // Nếu không có sản phẩm nào, tự động chuyển sang hiển thị tất cả sản phẩm
        if (productsData.length === 0) {
          setDisplayMode("all");
          fetchAllProducts();
        } else {
          setDisplayMode("recommended");
        }

        // Lấy lời khuyên chăm sóc
        if (response.data && response.data.careAdvice) {
          setCareAdvice(response.data.careAdvice);
        } else {
          setCareAdvice(
            `Chăm sóc ${cropType} cần lưu ý theo dõi thời tiết và điều chỉnh tưới tiêu phù hợp.`
          );
        }
      } else {
        // Nếu không thành công, hiển thị thông báo lỗi
        setProducts([]);
        setCareAdvice("");
        setError(response.message || "Lỗi khi lấy dữ liệu");
        // Lấy tất cả sản phẩm để hiển thị thay thế
        setDisplayMode("all");
        fetchAllProducts();
      }
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      setProducts([]);
      setCareAdvice("");
      setError(err.message || "Lỗi khi lấy dữ liệu");
      // Lấy tất cả sản phẩm để hiển thị thay thế
      setDisplayMode("all");
      fetchAllProducts();
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handleCropTypeChange = (event) => {
    setCropType(event.target.value);
  };

  /**
   * Tạo lý do gợi ý sản phẩm
   * @param {Object} product - Sản phẩm cần tạo lý do gợi ý
   * @param {string} cropType - Loại cây trồng
   * @param {Object} weatherData - Dữ liệu thời tiết
   * @returns {string} - Lý do gợi ý
   */
  const generateRecommendReason = (product, cropType, weatherData) => {
    if (!product || !weatherData) {
      return `Sản phẩm phù hợp cho cây trồng ${cropType}`;
    }

    // Lấy thông tin thời tiết
    const temperature = weatherData.temperature || 0;
    const humidity = weatherData.humidity || 0;
    const weatherDescription = (
      weatherData.weatherDescription || ""
    ).toLowerCase();

    // Lấy thông tin danh mục sản phẩm
    const categoryName =
      product.categoryName ||
      (product.category ? product.category.name : "") ||
      "";

    // Tạo lý do gợi ý tùy theo danh mục và thời tiết
    if (categoryName.includes("Phân bón")) {
      if (temperature > 30) {
        return `Phân bón phù hợp cho cây ${cropType} trong điều kiện nhiệt độ cao (${temperature}°C)`;
      } else if (weatherDescription.includes("mưa")) {
        return `Phân bón tích hợp dưỡng chất cho cây ${cropType} trong mùa mưa`;
      } else {
        return `Phân bón tăng cường dinh dưỡng cho cây ${cropType}`;
      }
    } else if (
      categoryName.includes("Thuốc") ||
      categoryName.includes("BVTV")
    ) {
      if (humidity > 70) {
        return `Thuốc bảo vệ cây ${cropType} khỏi sâu bệnh trong điều kiện độ ẩm cao (${humidity}%)`;
      } else if (weatherDescription.includes("mưa")) {
        return `Thuốc phòng trừ nấm bệnh cho cây ${cropType} trong mùa mưa`;
      } else {
        return `Thuốc bảo vệ cây ${cropType} khỏi sâu bệnh`;
      }
    } else if (
      categoryName.includes("Hạt giống") ||
      categoryName.includes("Cây giống")
    ) {
      return `Giống cây ${cropType} phù hợp cho điều kiện thời tiết hiện tại`;
    } else if (
      categoryName.includes("Thiết bị") ||
      categoryName.includes("Dụng cụ")
    ) {
      if (temperature > 32) {
        return `Thiết bị hỗ trợ tưới tiêu cho cây ${cropType} trong thời tiết nóng`;
      } else if (weatherDescription.includes("mưa")) {
        return `Thiết bị thoát nước cho cây ${cropType} trong mùa mưa`;
      } else {
        return `Thiết bị hỗ trợ chăm sóc cây ${cropType}`;
      }
    } else {
      // Mặc định
      if (temperature > 30) {
        return `Sản phẩm phù hợp cho cây ${cropType} trong điều kiện nhiệt độ cao (${temperature}°C)`;
      } else if (humidity > 70) {
        return `Sản phẩm phù hợp cho cây ${cropType} trong điều kiện độ ẩm cao (${humidity}%)`;
      } else if (weatherDescription.includes("mưa")) {
        return `Sản phẩm phù hợp cho cây ${cropType} trong điều kiện mưa`;
      } else {
        return `Sản phẩm phù hợp cho cây ${cropType} trong điều kiện thời tiết hiện tại`;
      }
    }
  };

  // Function để lấy tất cả sản phẩm từ database
  const fetchAllProducts = async () => {
    setIsLoadingAllProducts(true);
    try {
      const response =
        await productWeatherRecommendationService.getAllProducts();
      console.log("Kết quả từ getAllProducts:", response);

      if (response && response.success && response.data) {
        // Kiểm tra cấu trúc dữ liệu, có thể là Page (Spring) hoặc mảng
        if (response.data.content && Array.isArray(response.data.content)) {
          setAllProducts(response.data.content);
        } else if (Array.isArray(response.data)) {
          setAllProducts(response.data);
        } else {
          console.warn("Cấu trúc dữ liệu không xác định:", response.data);
          setAllProducts([]);
        }
      } else {
        console.warn("Không thể lấy được sản phẩm từ database");
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tất cả sản phẩm:", error);
      enqueueSnackbar("Lỗi khi lấy dữ liệu sản phẩm: " + error.message, {
        variant: "error",
      });
      setAllProducts([]);
    } finally {
      setIsLoadingAllProducts(false);
    }
  };

  // Function để lấy sản phẩm theo danh mục
  const fetchProductsByCategory = async (categoryId) => {
    if (!categoryId) {
      console.warn("categoryId không được cung cấp");
      return;
    }

    setIsLoadingAllProducts(true);
    try {
      const response =
        await productWeatherRecommendationService.getProductsByCategory(
          categoryId
        );
      console.log(`Kết quả từ getProductsByCategory(${categoryId}):`, response);

      if (response && response.success && response.data) {
        // Kiểm tra cấu trúc dữ liệu, có thể là Page (Spring) hoặc mảng
        if (response.data.content && Array.isArray(response.data.content)) {
          setAllProducts(response.data.content);
        } else if (Array.isArray(response.data)) {
          setAllProducts(response.data);
        } else {
          console.warn("Cấu trúc dữ liệu không xác định:", response.data);
          setAllProducts([]);
        }
      } else {
        console.warn(`Không thể lấy được sản phẩm cho danh mục ${categoryId}`);
        setAllProducts([]);
      }
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm theo danh mục ${categoryId}:`, error);
      enqueueSnackbar(
        "Lỗi khi lấy dữ liệu sản phẩm theo danh mục: " + error.message,
        {
          variant: "error",
        }
      );
      setAllProducts([]);
    } finally {
      setIsLoadingAllProducts(false);
    }
  };

  /**
   * Map sản phẩm để đảm bảo cấu trúc dữ liệu nhất quán
   * @param {Object} product - Sản phẩm cần map
   * @returns {Object} - Sản phẩm đã được map sang cấu trúc chuẩn
   */
  const mapProduct = (product) => {
    // Đảm bảo sản phẩm có đầy đủ các trường cần thiết
    return {
      id: product.id || Math.random().toString(36).substr(2, 9),
      name: product.name || product.productName || "Sản phẩm nông nghiệp",
      description: product.description || product.shortDescription || "",
      price: product.price || 0,
      discountedPrice:
        product.discountedPrice || product.salePrice || product.price || 0,
      salePrice:
        product.salePrice || product.discountedPrice || product.price || 0,
      quantity: product.quantity || 0,
      imageUrl: product.imageUrl || product.thumbnail || product.image || "",
      categoryId:
        product.categoryId || (product.category ? product.category.id : 0),
      categoryName:
        product.categoryName ||
        (product.category ? product.category.name : "Khác"),
      // Thêm các trường khác nếu cần
      ...product,
    };
  };

  // Xử lý các sản phẩm để đảm bảo cấu trúc dữ liệu nhất quán
  const mappedProducts = products.map(mapProduct);
  const mappedAllProducts = allProducts.map(mapProduct);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gợi Ý Sản Phẩm Theo Cây Trồng
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Hiển thị các sản phẩm phù hợp dựa trên loại cây trồng và điều kiện
          thời tiết
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="crop-type-label">Loại cây trồng</InputLabel>
              <Select
                labelId="crop-type-label"
                id="crop-type-select"
                value={cropType}
                label="Loại cây trồng"
                onChange={handleCropTypeChange}
              >
                {cropTypes.map((crop) => (
                  <MenuItem key={crop} value={crop}>
                    {crop}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchCropRecommendations}
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
            {weatherData && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Thông Tin Thời Tiết Hiện Tại
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
                        <LocationOnIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {city}, {country}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <SunnyIcon sx={{ mr: 1 }} />
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

            {careAdvice && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Lời Khuyên Chăm Sóc
                </Typography>
                <Paper
                  elevation={2}
                  sx={{ p: 2, bgcolor: "rgba(76, 175, 80, 0.08)" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    <SpaIcon sx={{ mr: 2, color: "success.main", mt: 0.5 }} />
                    <Typography variant="body1">{careAdvice}</Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            <Box sx={{ mt: 2, mb: 2 }}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5">
                  Sản Phẩm Gợi Ý Cho {cropType}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    if (displayMode === "recommended") {
                      setDisplayMode("all");
                      if (allProducts.length === 0) {
                        fetchAllProducts();
                      }
                    } else {
                      setDisplayMode("recommended");
                      fetchCropRecommendations();
                    }
                  }}
                >
                  {displayMode === "recommended"
                    ? "Xem Tất Cả Sản Phẩm"
                    : "Xem Sản Phẩm Được Gợi Ý"}
                </Button>
              </Stack>
            </Box>

            {loading || isLoadingAllProducts ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            ) : (
              <>
                {displayMode === "recommended" ? (
                  // Hiển thị sản phẩm được đề xuất
                  <>
                    {mappedProducts.length > 0 ? (
                      <Grid container spacing={2}>
                        {mappedProducts.map((product) => (
                          <Grid
                            item
                            xs={6}
                            sm={4}
                            md={3}
                            lg={2}
                            key={product.id}
                          >
                            <WeatherProductCard
                              product={product}
                              weatherData={weatherData}
                              recommendReason={generateRecommendReason(
                                product,
                                cropType,
                                weatherData
                              )}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        Không tìm thấy sản phẩm nào phù hợp cho cây trồng{" "}
                        {cropType} với điều kiện thời tiết hiện tại từ cơ sở dữ
                        liệu. Đang hiển thị tất cả sản phẩm thay thế.
                      </Alert>
                    )}
                  </>
                ) : (
                  // Hiển thị tất cả sản phẩm
                  <>
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="h6">
                        Tất Cả Sản Phẩm Từ Cơ Sở Dữ Liệu
                      </Typography>
                      <Box sx={{ display: "flex", overflowX: "auto", pb: 1 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => fetchAllProducts()}
                          sx={{ mr: 1, minWidth: "max-content" }}
                        >
                          Tất Cả
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => fetchProductsByCategory(1)}
                          sx={{ mr: 1, minWidth: "max-content" }}
                        >
                          Phân Bón
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => fetchProductsByCategory(2)}
                          sx={{ mr: 1, minWidth: "max-content" }}
                        >
                          Thuốc BVTV
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => fetchProductsByCategory(3)}
                          sx={{ mr: 1, minWidth: "max-content" }}
                        >
                          Hạt Giống
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => fetchProductsByCategory(4)}
                          sx={{ mr: 1, minWidth: "max-content" }}
                        >
                          Thiết Bị
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => fetchProductsByCategory(5)}
                          sx={{ mr: 1, minWidth: "max-content" }}
                        >
                          Vật Tư
                        </Button>
                      </Box>
                    </Stack>
                    {mappedAllProducts.length > 0 ? (
                      <Grid container spacing={2}>
                        {mappedAllProducts.map((product) => (
                          <Grid
                            item
                            xs={6}
                            sm={4}
                            md={3}
                            lg={2}
                            key={product.id}
                          >
                            <WeatherProductCard
                              product={product}
                              weatherData={weatherData}
                              recommendReason="Sản phẩm từ cơ sở dữ liệu"
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="warning">
                        Không tìm thấy sản phẩm nào trong cơ sở dữ liệu.
                      </Alert>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default CropWeatherRecommendationPage;
