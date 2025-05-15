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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  WbSunny as SunnyIcon,
  LocationOn as LocationOnIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import productWeatherRecommendationService from "../services/productWeatherRecommendationService";
import weatherService from "../services/weatherService";
import WeatherProductCard from "../components/WeatherProductCard";
import productService from "../services/productService";

const WeatherRecommendationPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("VN");
  const [weatherData, setWeatherData] = useState(null);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // Các state mới cho dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    inStock: true,
  });

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

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await weatherService.getFollowedLocations();
      // Kiểm tra nếu response là một mảng (format API trả về trực tiếp)
      if (Array.isArray(response) && response.length > 0) {
        setLocations(response);
        setCity(response[0].city);
        setCountry(response[0].country);
      } else if (
        response &&
        response.success &&
        response.data &&
        response.data.length > 0
      ) {
        // Xử lý trường hợp cũ nếu API trả về dạng {success, data}
        setLocations(response.data);
        setCity(response.data[0].city);
        setCountry(response.data[0].country);
      } else {
        // Nếu không có dữ liệu, sử dụng các địa điểm mặc định của Việt Nam
        const defaultLocations = [
          {
            id: 1,
            city: "Hà Nội",
            country: "VN",
            name: "Hà Nội",
            isActive: true,
          },
          {
            id: 2,
            city: "Hồ Chí Minh",
            country: "VN",
            name: "Hồ Chí Minh",
            isActive: true,
          },
          {
            id: 3,
            city: "Đà Nẵng",
            country: "VN",
            name: "Đà Nẵng",
            isActive: true,
          },
          { id: 4, city: "Huế", country: "VN", name: "Huế", isActive: true },
        ];
        setLocations(defaultLocations);
        setCity(defaultLocations[0].city);
        setCountry(defaultLocations[0].country);

        enqueueSnackbar("Sử dụng danh sách địa điểm mặc định", {
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa điểm:", error);

      // Sử dụng danh sách mặc định khi có lỗi
      const defaultLocations = [
        {
          id: 1,
          city: "Hà Nội",
          country: "VN",
          name: "Hà Nội",
          isActive: true,
        },
        {
          id: 2,
          city: "Hồ Chí Minh",
          country: "VN",
          name: "Hồ Chí Minh",
          isActive: true,
        },
        {
          id: 3,
          city: "Đà Nẵng",
          country: "VN",
          name: "Đà Nẵng",
          isActive: true,
        },
        { id: 4, city: "Huế", country: "VN", name: "Huế", isActive: true },
      ];
      setLocations(defaultLocations);
      setCity(defaultLocations[0].city);
      setCountry(defaultLocations[0].country);

      enqueueSnackbar(
        "Lỗi khi tải danh sách địa điểm, sử dụng danh sách mặc định",
        {
          variant: "error",
        }
      );
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (city && country) {
      fetchWeatherRecommendations();
    }
  }, [city, country]);

  const fetchWeatherRecommendations = async () => {
    setLoading(true);
    setError(null);
    setProducts([]); // Đặt lại danh sách sản phẩm
    try {
      console.log(
        `Đang gọi API getProductsByWeather với city=${city}, country=${country}`
      );
      const response =
        await productWeatherRecommendationService.getProductsByWeather(
          city,
          country
        );

      console.log("Response từ API weatherRecommendations:", response);

      // Kiểm tra cấu trúc và xử lý dữ liệu
      if (response && response.success && response.data) {
        console.log("Xử lý dữ liệu API thành công");

        // Lấy dữ liệu thời tiết
        if (response.data.weatherData) {
          console.log("Dữ liệu thời tiết:", response.data.weatherData);
          setWeatherData(response.data.weatherData);
        } else {
          console.warn("Không tìm thấy dữ liệu thời tiết trong response");
        }

        // Lấy danh sách sản phẩm
        let productList = [];

        // Trường hợp 1: seasonalProducts có cấu trúc Page (có content)
        if (
          response.data.seasonalProducts &&
          response.data.seasonalProducts.content &&
          Array.isArray(response.data.seasonalProducts.content)
        ) {
          console.log("Sản phẩm ở dạng Page:", response.data.seasonalProducts);
          productList = response.data.seasonalProducts.content;
        }
        // Trường hợp 2: seasonalProducts là mảng trực tiếp
        else if (
          response.data.seasonalProducts &&
          Array.isArray(response.data.seasonalProducts)
        ) {
          console.log(
            "Sản phẩm ở dạng mảng trực tiếp:",
            response.data.seasonalProducts
          );
          productList = response.data.seasonalProducts;
        }
        // Trường hợp 3: sản phẩm nằm trong content trực tiếp
        else if (
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          console.log("Sản phẩm ở dạng content:", response.data.content);
          productList = response.data.content;
        }
        // Trường hợp 4: response.data là mảng sản phẩm trực tiếp
        else if (Array.isArray(response.data)) {
          console.log(
            "Response.data là mảng sản phẩm trực tiếp:",
            response.data
          );
          productList = response.data;
        }

        console.log(`Tìm thấy ${productList.length} sản phẩm`);

        // Kiểm tra tên thuộc tính của sản phẩm
        if (productList.length > 0) {
          console.log(
            "Thuộc tính của sản phẩm đầu tiên:",
            Object.keys(productList[0])
          );
          // Kiểm tra productName vs name
          if (productList[0].productName && !productList[0].name) {
            productList = productList.map((p) => ({
              ...p,
              name: p.productName,
            }));
          }
        }

        setProducts(productList);
      } else {
        console.error(
          "Dữ liệu không đúng định dạng hoặc API trả về lỗi:",
          response
        );
        setError(response?.message || "Dữ liệu trả về không đúng định dạng");
        enqueueSnackbar(
          response?.message ||
            "Không thể tải dữ liệu gợi ý sản phẩm từ máy chủ",
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu gợi ý sản phẩm:", error);
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu gợi ý sản phẩm");
      enqueueSnackbar(
        "Không thể kết nối đến cơ sở dữ liệu. Vui lòng đảm bảo máy chủ đang chạy và có kết nối mạng ổn định.",
        {
          variant: "error",
        }
      );
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

  const handleViewProductDetail = (product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
    enqueueSnackbar(`Xem chi tiết sản phẩm: ${product.name}`, {
      variant: "info",
    });
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inStock: product.inStock !== false, // mặc định là true nếu không có giá trị
    });
    setEditDialogOpen(true);
    enqueueSnackbar(`Chỉnh sửa sản phẩm: ${product.name}`, {
      variant: "info",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setUpdatingProduct(true); // Bắt đầu quá trình cập nhật

      // Tạo FormData để gửi lên server
      const formData = new FormData();

      // Thêm các trường dữ liệu vào formData
      formData.append("productName", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("price", parseFloat(editFormData.price) || 0);

      // Nếu có categoryId
      if (selectedProduct.categoryId) {
        formData.append("categoryId", selectedProduct.categoryId);
      }

      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      formData.append("timestamp", timestamp.toString());

      // Đảm bảo quantity không bị thay đổi
      if (selectedProduct.quantity) {
        formData.append("quantity", selectedProduct.quantity);
      }

      console.log("Đang cập nhật sản phẩm ID:", selectedProduct.id);

      // Gọi API cập nhật sản phẩm
      await productService.updateProduct(selectedProduct.id, formData);

      // Cập nhật sản phẩm trong danh sách hiện tại
      const updatedProducts = products.map((p) => {
        if (p.id === selectedProduct.id) {
          return {
            ...p,
            name: editFormData.name,
            productName: editFormData.name, // Cập nhật cả productName để tương thích
            description: editFormData.description,
            price: parseFloat(editFormData.price),
            inStock: editFormData.inStock,
          };
        }
        return p;
      });

      // Cập nhật state với danh sách sản phẩm đã cập nhật
      setProducts(updatedProducts);

      // Đóng dialog và hiển thị thông báo thành công
      setEditDialogOpen(false);
      enqueueSnackbar(`Đã cập nhật sản phẩm: ${editFormData.name}`, {
        variant: "success",
      });

      // Tải lại danh sách sản phẩm để đảm bảo dữ liệu được cập nhật đầy đủ
      fetchWeatherRecommendations();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      enqueueSnackbar(
        `Lỗi khi cập nhật: ${error.message || "Vui lòng thử lại sau"}`,
        {
          variant: "error",
        }
      );
    } finally {
      setUpdatingProduct(false); // Kết thúc quá trình cập nhật
    }
  };

  const generateRecommendReason = (product, weatherData) => {
    if (!weatherData) return null;
    if (!product) return "Phù hợp với điều kiện thời tiết hiện tại";

    const description = weatherData.weatherDescription?.toLowerCase() || "";
    const temperature = weatherData.temperature || 0;
    const humidity = weatherData.humidity || 0;

    // Lấy tên danh mục, ưu tiên product.category nếu có
    const categoryName = product.category || product.categoryName || "";
    const categoryNameLower =
      typeof categoryName === "string" ? categoryName.toLowerCase() : "";

    // Đề xuất theo thời tiết
    if (description.includes("mưa") || description.includes("rain")) {
      if (categoryNameLower.includes("hạt giống")) {
        return "Lý tưởng để gieo trồng trong điều kiện mưa hiện tại";
      } else if (categoryNameLower.includes("thiết bị")) {
        return "Giúp bảo vệ vườn tược trong thời tiết mưa";
      } else if (categoryNameLower.includes("phân bón")) {
        return "Cung cấp dinh dưỡng hiệu quả trong điều kiện mưa";
      }
    } else if (temperature > 30) {
      if (categoryNameLower.includes("thiết bị")) {
        return "Hỗ trợ tưới tiêu trong thời tiết nắng nóng";
      } else if (categoryNameLower.includes("hạt giống")) {
        return "Giống cây chịu nhiệt tốt trong thời tiết nóng";
      }
    } else if (humidity < 40) {
      return "Phù hợp với điều kiện khô hanh hiện tại";
    } else if (temperature >= 18 && temperature <= 28) {
      return "Thời điểm lý tưởng để sử dụng sản phẩm này";
    }

    return "Phù hợp với điều kiện thời tiết hiện tại";
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gợi Ý Sản Phẩm Theo Thời Tiết
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Hiển thị các sản phẩm phù hợp dựa trên điều kiện thời tiết hiện tại
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
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchWeatherRecommendations}
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

            <Typography variant="h6" gutterBottom>
              Sản Phẩm Gợi Ý
            </Typography>

            {products.length > 0 ? (
              <Grid container spacing={1}>
                {products.map((product) => (
                  <Grid item xs={4} sm={3} md={2} lg={1} key={product.id}>
                    <WeatherProductCard
                      product={product}
                      weatherData={weatherData}
                      recommendReason={generateRecommendReason(
                        product,
                        weatherData
                      )}
                      onViewDetail={(prod) => handleViewProductDetail(prod)}
                      onEdit={(prod) => handleEditProduct(prod)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                Không có sản phẩm nào được gợi ý cho điều kiện thời tiết hiện
                tại
              </Alert>
            )}
          </>
        )}
      </Paper>

      {/* Dialog xem chi tiết sản phẩm */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>Chi tiết sản phẩm: {selectedProduct.name}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 3,
                      width: 120, // Giảm từ 150px xuống 120px (80%)
                      height: 120, // Giảm từ 150px xuống 120px (80%)
                      position: "relative",
                    }}
                  >
                    <img
                      src={
                        selectedProduct.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=600&h=700&q=80"
                      }
                      alt={selectedProduct.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin sản phẩm
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    <strong>Mã sản phẩm:</strong> {selectedProduct.id}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Tên sản phẩm:</strong> {selectedProduct.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Danh mục:</strong> {selectedProduct.category}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Giá:</strong>{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedProduct.price)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Tình trạng:</strong>{" "}
                    {selectedProduct.inStock ? "Còn hàng" : "Hết hàng"}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Đánh giá:</strong> {selectedProduct.rating}/5
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Mô tả sản phẩm
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description}
                  </Typography>

                  {weatherData && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Đề xuất theo thời tiết
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Phù hợp với thời tiết:</strong>{" "}
                        {weatherData.weatherDescription} (
                        {weatherData.temperature}°C)
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Lý do đề xuất:</strong>{" "}
                        {generateRecommendReason(selectedProduct, weatherData)}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDetailDialogOpen(false)}
                color="primary"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleEditProduct(selectedProduct);
                }}
                color="secondary"
              >
                Chỉnh sửa
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog chỉnh sửa sản phẩm */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              Chỉnh sửa sản phẩm: {selectedProduct.name}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 3,
                      width: 120, // Giảm từ 150px xuống 120px (80%)
                      height: 120, // Giảm từ 150px xuống 120px (80%)
                      mb: 2,
                      position: "relative",
                    }}
                  >
                    <img
                      src={
                        selectedProduct.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=600&h=700&q=80"
                      }
                      alt={selectedProduct.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 28 }}
                  >
                    Thay đổi hình ảnh
                  </Button>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box component="form" noValidate sx={{ mt: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Tên sản phẩm"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                    />
                    <TextField
                      margin="normal"
                      fullWidth
                      id="category"
                      label="Danh mục"
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditFormChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="price"
                      label="Giá (VNĐ)"
                      name="price"
                      type="number"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                    />
                    <TextField
                      margin="normal"
                      fullWidth
                      id="description"
                      label="Mô tả sản phẩm"
                      name="description"
                      multiline
                      rows={4}
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editFormData.inStock}
                          onChange={handleEditFormChange}
                          name="inStock"
                          color="primary"
                        />
                      }
                      label="Còn hàng"
                    />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setEditDialogOpen(false)}
                startIcon={<CloseIcon />}
                disabled={updatingProduct}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveEdit}
                color="primary"
                variant="contained"
                startIcon={
                  updatingProduct ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={updatingProduct}
              >
                {updatingProduct ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default WeatherRecommendationPage;
