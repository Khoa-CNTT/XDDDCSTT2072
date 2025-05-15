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
  Tabs,
  Tab,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import productWeatherRecommendationService from "../services/productWeatherRecommendationService";
import marketPlaceService from "../services/marketPlaceService";

// Import các components biểu đồ mới
import { WeatherPerformanceDashboard } from "../components/charts/WeatherPerformanceCharts";
import { OptimizationRecommendationsDashboard } from "../components/charts/OptimizationRecommendations";
import { FuturePredictionsDashboard } from "../components/charts/FuturePredictions";

// Khu vực
const mockRegions = [
  { id: "north", name: "Miền Bắc" },
  { id: "central", name: "Miền Trung" },
  { id: "south", name: "Miền Nam" },
  { id: "highlands", name: "Tây Nguyên" },
];

const ProductPerformancePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState("");
  const [region, setRegion] = useState("");
  const [period, setPeriod] = useState(6);
  const [performanceData, setPerformanceData] = useState(null);
  const [optimizationTips, setOptimizationTips] = useState([]);
  const [futurePredictions, setFuturePredictions] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([
    { id: 1, productName: "Hạt giống lúa", price: 50000 },
    { id: 2, productName: "Phân bón NPK", price: 120000 },
    { id: 3, productName: "Thuốc trừ sâu", price: 180000 },
    { id: 4, productName: "Máy phun sương", price: 1500000 },
    { id: 5, productName: "Cây giống táo", price: 85000 },
  ]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Thời gian phân tích
  const timePeriods = [
    { value: 3, label: "3 tháng" },
    { value: 6, label: "6 tháng" },
    { value: 12, label: "12 tháng" },
  ];

  useEffect(() => {
    fetchProducts();
    // Chỉ fetch dữ liệu phân tích khi người dùng nhấn nút Phân tích
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      console.log("Đang lấy danh sách sản phẩm...");
      const response = await marketPlaceService.getAllProducts(0, 100);
      console.log("Kết quả lấy danh sách sản phẩm:", response);

      if (response.success) {
        const productData = response.data.content || [];
        console.log("Đã lấy được", productData.length, "sản phẩm");
        setProducts(productData);
      } else {
        console.error("Lỗi khi lấy danh sách sản phẩm:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Kiểm tra và log các thông số đầu vào
      console.log("Đang lấy dữ liệu phân tích với params:", {
        productId,
        region,
        period,
      });

      const response =
        await productWeatherRecommendationService.getWeatherProductPerformance(
          productId || null,
          region || null,
          period
        );

      console.log("Nhận dữ liệu từ service:", response);

      if (response && response.success) {
        if (response.data) {
          console.log("Dữ liệu phân tích hiệu suất:", response.data);
          setPerformanceData(response.data.performanceData || {});
          setOptimizationTips(response.data.optimizationTips || []);
          setFuturePredictions(response.data.futurePredictions || {});
        } else {
          setError("Dữ liệu trả về không đúng định dạng");
          enqueueSnackbar("Dữ liệu phân tích hiệu suất không đúng định dạng", {
            variant: "warning",
          });
        }
      } else {
        setError(response?.message || "Có lỗi xảy ra khi tải dữ liệu");
        enqueueSnackbar(
          response?.message ||
            "Không thể tải dữ liệu phân tích hiệu suất sản phẩm",
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu phân tích hiệu suất sản phẩm:", error);
      setError(
        error.message ||
          "Có lỗi xảy ra khi tải dữ liệu phân tích hiệu suất sản phẩm"
      );
      enqueueSnackbar("Không thể tải dữ liệu phân tích hiệu suất sản phẩm", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (event) => {
    setProductId(event.target.value);
    console.log("Đã chọn sản phẩm ID:", event.target.value);
  };

  const handleRegionChange = (event) => {
    setRegion(event.target.value);
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAnalyzeClick = () => {
    console.log(
      "Phân tích dữ liệu với productId:",
      productId,
      "region:",
      region,
      "period:",
      period
    );

    // Kiểm tra nếu chưa chọn sản phẩm và khu vực
    if (!productId) {
      enqueueSnackbar("Vui lòng chọn sản phẩm cần phân tích", {
        variant: "warning",
      });
    }

    if (!region) {
      enqueueSnackbar("Vui lòng chọn khu vực cần phân tích", {
        variant: "warning",
      });
    }

    // Vẫn tiếp tục fetch dữ liệu kể cả khi không chọn đủ thông tin
    // để hiển thị dữ liệu mặc định
    fetchPerformanceData();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Phân Tích Hiệu Suất Sản Phẩm Theo Thời Tiết
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Phân tích mối quan hệ giữa thời tiết và hiệu suất của sản phẩm nông
          nghiệp
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="product-label">Sản phẩm</InputLabel>
              <Select
                labelId="product-label"
                value={productId}
                label="Sản phẩm"
                onChange={handleProductChange}
                disabled={loadingProducts}
              >
                <MenuItem value="">
                  <em>Tất cả sản phẩm</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.productName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="region-label">Khu vực</InputLabel>
              <Select
                labelId="region-label"
                value={region}
                label="Khu vực"
                onChange={handleRegionChange}
              >
                <MenuItem value="">
                  <em>Tất cả khu vực</em>
                </MenuItem>
                {mockRegions.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="period-label">Khoảng thời gian</InputLabel>
              <Select
                labelId="period-label"
                value={period}
                label="Khoảng thời gian"
                onChange={handlePeriodChange}
              >
                {timePeriods.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAnalyzeClick}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              Phân Tích
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
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="Tabs phân tích hiệu suất"
              >
                <Tab label="Hiệu Suất Theo Thời Tiết" />
                <Tab label="Khuyến Nghị Tối Ưu" />
                <Tab label="Dự Đoán Tương Lai" />
              </Tabs>
            </Box>

            {/* Tab Hiệu Suất Theo Thời Tiết */}
            {activeTab === 0 && (
              <Box sx={{ py: 2 }}>
                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : !performanceData?.weatherPerformanceDetailed ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Không có dữ liệu hiệu suất theo thời tiết. Vui lòng chọn sản
                    phẩm và khu vực để xem dữ liệu.
                  </Alert>
                ) : (
                  <WeatherPerformanceDashboard
                    performanceData={performanceData}
                    futurePredictions={futurePredictions}
                  />
                )}
              </Box>
            )}

            {/* Tab Khuyến Nghị Tối Ưu */}
            {activeTab === 1 && (
              <Box sx={{ py: 2 }}>
                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : !performanceData ? (
                  <Alert severity="info">
                    Không có khuyến nghị tối ưu. Vui lòng chọn sản phẩm và khu
                    vực để nhận khuyến nghị.
                  </Alert>
                ) : (
                  <OptimizationRecommendationsDashboard
                    performanceData={{
                      optimalConditions: performanceData.optimalConditions,
                      optimizationTips: optimizationTips,
                    }}
                    futurePredictions={futurePredictions}
                  />
                )}
              </Box>
            )}

            {/* Tab Dự Đoán Tương Lai */}
            {activeTab === 2 && (
              <Box sx={{ py: 2 }}>
                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : !futurePredictions ||
                  !futurePredictions.performancePredictions ||
                  futurePredictions.performancePredictions.length === 0 ? (
                  <Alert severity="info">
                    Không có dữ liệu dự đoán. Vui lòng chọn sản phẩm và khu vực
                    để xem dự đoán hiệu suất.
                  </Alert>
                ) : (
                  <FuturePredictionsDashboard
                    futurePredictions={futurePredictions}
                  />
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProductPerformancePage;
