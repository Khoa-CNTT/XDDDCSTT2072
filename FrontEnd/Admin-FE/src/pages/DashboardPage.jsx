import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  CardContent,
  Button,
  Divider,
  Avatar,
  ListItem,
  ListItemText,
  ListItemAvatar,
  List,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterListIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import StatCard from "../components/ui/StatCard";
import ChartCard from "../components/ui/ChartCard";
import DataTable from "../components/ui/DataTable";
import dashboardService from "../services/dashboardService";
import { styled } from "@mui/material/styles";

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

const SectionTitle = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
}));

const StyledPaper = styled(Paper)(() => ({
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  overflow: "hidden",
  height: "100%",
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  "&:hover": {
    backgroundColor: "#f5f9ff",
  },
  borderBottom: "1px solid #f0f0f0",
}));

const ProgressBar = styled(Box)(({ theme, value, color = "primary" }) => ({
  height: 8,
  width: "100%",
  backgroundColor: "#f0f0f0",
  borderRadius: 4,
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${value}%`,
    backgroundColor: theme.palette[color].main,
    borderRadius: 4,
  },
}));

const StyledAvatar = styled(Avatar)(({ bgcolor = "primary.main" }) => ({
  backgroundColor: bgcolor,
  color: "#fff",
  width: 40,
  height: 40,
}));

const DashboardPage = () => {
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [],
  });
  const [kpiData, setKPIData] = useState([
    {
      title: "Tỷ lệ chuyển đổi",
      value: "5.64%",
      trend: "+0.8%",
      color: "primary",
    },
    {
      title: "Giá trị đơn hàng TB",
      value: "2.568.000đ",
      trend: "+12%",
      color: "success",
    },
    { title: "Tỷ lệ hủy đơn", value: "0.8%", trend: "-0.2%", color: "success" },
    { title: "Khách hàng quay lại", value: "45%", trend: "+5%", color: "info" },
  ]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Lấy thống kê tổng quan
      try {
        const statisticsData = await dashboardService.getStatistics();
        setStatistics({
          totalSales: statisticsData.totalSales || 0,
          totalOrders: statisticsData.totalOrders || 0,
          totalUsers: statisticsData.totalUsers || 0,
          totalProducts: statisticsData.totalProducts || 0,
        });
      } catch (error) {
        console.error("Error fetching statistics data:", error);
        // Dữ liệu mẫu nếu API lỗi
        setStatistics({
          totalSales: 45141000,
          totalOrders: 128,
          totalUsers: 867,
          totalProducts: 256,
        });
      }

      // 2. Lấy dữ liệu biểu đồ doanh thu
      try {
        const salesChartData = await dashboardService.getSalesChart();
        setSalesData(salesChartData);
      } catch (error) {
        console.error("Error fetching sales chart data:", error);
        // Dữ liệu mẫu nếu API lỗi
        setSalesData({
          labels: [
            "T1",
            "T2",
            "T3",
            "T4",
            "T5",
            "T6",
            "T7",
            "T8",
            "T9",
            "T10",
            "T11",
            "T12",
          ],
          datasets: [
            {
              label: "Doanh thu",
              data: [
                2500000, 3200000, 2800000, 5100000, 4300000, 6200000, 5800000,
                4900000, 6800000, 7100000, 7500000, 8200000,
              ],
              borderColor: "#4782DA",
              backgroundColor: "rgba(71, 130, 218, 0.1)",
              fill: true,
            },
          ],
        });
      }

      // 3. Lấy dữ liệu phân bố danh mục sản phẩm
      try {
        const categoryData = await dashboardService.getCategoryDistribution();
        setCategoryData(categoryData);
      } catch (error) {
        console.error("Error fetching category data:", error);
        // Dữ liệu mẫu nếu API lỗi
        setCategoryData({
          labels: ["Hạt giống", "Phân bón", "Thuốc BVTV", "Công cụ", "Máy móc"],
          datasets: [
            {
              data: [35, 25, 15, 15, 10],
              backgroundColor: [
                "#4782DA",
                "#FF6B6B",
                "#56CA00",
                "#FFB020",
                "#9C27B0",
              ],
            },
          ],
        });
      }

      // 4. Lấy danh sách đơn hàng gần đây
      try {
        const recentOrdersData = await dashboardService.getRecentOrders();
        setRecentOrders(recentOrdersData);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
        // Dữ liệu mẫu nếu API lỗi
        setRecentOrders(sampleOrders);
      }

      // 5. Lấy danh sách hoạt động gần đây
      try {
        const activitiesData = await dashboardService.getRecentActivities();
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching activities:", error);
        // Dữ liệu mẫu nếu API lỗi
        setActivities([
          {
            id: "activity-1",
            type: "order",
            user: "Nguyễn Văn A",
            action: "đã đặt một đơn hàng",
            target: "#1001",
            time: "2024-06-05 10:23:45",
          },
          {
            id: "activity-2",
            type: "weather",
            user: "Hệ thống",
            action: "phát hiện cảnh báo mưa lớn tại",
            target: "Hà Nội",
            time: "2024-06-05 09:15:30",
          },
          {
            id: "activity-3",
            type: "product",
            user: "Trần Thị B",
            action: "đã thêm sản phẩm mới",
            target: "Hạt giống lúa ST25",
            time: "2024-06-05 08:45:12",
          },
          {
            id: "activity-4",
            type: "user",
            user: "Lê Văn C",
            action: "đã đăng ký tài khoản",
            target: "",
            time: "2024-06-04 17:30:00",
          },
          {
            id: "activity-5",
            type: "order",
            user: "Phạm Thị D",
            action: "đã hủy đơn hàng",
            target: "#985",
            time: "2024-06-04 16:15:22",
          },
        ]);
      }

      // 6. Lấy dữ liệu sản phẩm bán chạy
      try {
        const topProductsData = await dashboardService.getTopProducts();
        setProductPerformance(topProductsData);
      } catch (error) {
        console.error("Error fetching top products:", error);
        // Dữ liệu mẫu nếu API lỗi
        setProductPerformance([
          {
            id: 1,
            name: "Hạt giống lúa ST25",
            sales: 124,
            stock: 85,
            progress: 75,
          },
          {
            id: 2,
            name: "Phân bón hữu cơ vi sinh",
            sales: 98,
            stock: 70,
            progress: 65,
          },
          {
            id: 3,
            name: "Thuốc phòng trừ sâu hại",
            sales: 85,
            stock: 55,
            progress: 58,
          },
          {
            id: 4,
            name: "Máy phun thuốc tự động",
            sales: 72,
            stock: 48,
            progress: 45,
          },
          {
            id: 5,
            name: "Bộ dụng cụ làm vườn",
            sales: 65,
            stock: 92,
            progress: 40,
          },
        ]);
      }

      // 7. Lấy dữ liệu KPI
      try {
        const kpiData = await dashboardService.getKPIData();
        setKPIData(kpiData);
      } catch (error) {
        console.error("Error fetching KPI data:", error);
        // Giữ nguyên dữ liệu mẫu nếu API lỗi (đã được khởi tạo trong state)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Cấu hình bảng đơn hàng gần đây
  const orderColumns = [
    { id: "id", label: "Mã đơn", minWidth: 80, sortable: true },
    { id: "customerName", label: "Khách hàng", minWidth: 150, sortable: true },
    { id: "date", label: "Ngày đặt", minWidth: 120, sortable: true },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 120,
      sortable: true,
      format: (value) => {
        const statusColors = {
          PENDING: "warning.main",
          PROCESSING: "info.main",
          SHIPPED: "primary.main",
          DELIVERED: "success.main",
          CANCELLED: "error.main",
        };

        const statusText = {
          PENDING: "Chờ xử lý",
          PROCESSING: "Đang xử lý",
          SHIPPED: "Đang giao hàng",
          DELIVERED: "Đã giao hàng",
          CANCELLED: "Đã huỷ",
        };

        return (
          <Typography
            component="span"
            sx={{
              color: statusColors[value] || "text.secondary",
              fontWeight: "medium",
            }}
          >
            {statusText[value] || value}
          </Typography>
        );
      },
    },
    {
      id: "total",
      label: "Tổng tiền",
      minWidth: 120,
      sortable: true,
      numeric: true,
      format: (value) => `${value.toLocaleString()}đ`,
    },
  ];

  // Tạo dữ liệu mẫu trong khi chờ API thực tế
  const sampleOrders = [
    {
      id: 1001,
      customerName: "Nguyễn Văn A",
      date: "2024-06-01",
      status: "DELIVERED",
      total: 1250000,
    },
    {
      id: 1002,
      customerName: "Trần Thị B",
      date: "2024-06-02",
      status: "PROCESSING",
      total: 850000,
    },
    {
      id: 1003,
      customerName: "Lê Văn C",
      date: "2024-06-03",
      status: "PENDING",
      total: 450000,
    },
    {
      id: 1004,
      customerName: "Phạm Thị D",
      date: "2024-06-04",
      status: "SHIPPED",
      total: 1500000,
    },
    {
      id: 1005,
      customerName: "Hoàng Văn E",
      date: "2024-06-05",
      status: "CANCELLED",
      total: 950000,
    },
  ];

  return (
    <DashboardContainer>
      {/* Header với nút chức năng */}
      <SectionTitle>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Bảng điều khiển
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xin chào Admin, đây là tổng quan của hệ thống ngày hôm nay
          </Typography>
        </Box>

        <Box>
          <Button
            variant="outlined"
            startIcon={<CalendarIcon />}
            sx={{ mr: 1 }}
          >
            Thời gian thực
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Làm mới
          </Button>
        </Box>
      </SectionTitle>

      {/* Thông báo hệ thống */}
      <Alert
        severity="info"
        sx={{ mb: 3, borderRadius: 2 }}
        action={
          <Button color="inherit" size="small">
            XEM
          </Button>
        }
      >
        Có <b>3</b> cảnh báo thời tiết mới cần xử lý và <b>5</b> đơn hàng đang
        chờ duyệt
      </Alert>

      {/* Thẻ thống kê */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng doanh thu"
            value={`${statistics.totalSales.toLocaleString()}đ`}
            subtitle="Tuần này"
            icon={<AttachMoneyIcon sx={{ fontSize: 36 }} />}
            color="primary"
            increasedBy={7}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng đơn hàng"
            value={statistics.totalOrders.toLocaleString()}
            subtitle="Đã hoàn thành tháng này"
            icon={<ShoppingCartIcon sx={{ fontSize: 36 }} />}
            color="secondary"
            increasedBy={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng người dùng"
            value={statistics.totalUsers.toLocaleString()}
            subtitle="Đã đăng ký"
            icon={<PersonIcon sx={{ fontSize: 36 }} />}
            color="info"
            increasedBy={18}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng sản phẩm"
            value={statistics.totalProducts.toLocaleString()}
            subtitle="Đang hoạt động"
            icon={<InventoryIcon sx={{ fontSize: 36 }} />}
            color="success"
            increasedBy={-3}
          />
        </Grid>
      </Grid>

      {/* KPI Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledPaper>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {kpi.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {kpi.value || "0đ"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 1,
                      color: kpi.trend?.startsWith("+")
                        ? "success.main"
                        : "error.main",
                      fontWeight: "bold",
                    }}
                  >
                    {kpi.trend || "+0%"}
                  </Typography>
                </Box>
                <ProgressBar value={65 + index * 5} color={kpi.color} />
              </CardContent>
            </StyledPaper>
          </Grid>
        ))}
      </Grid>

      {/* Biểu đồ chính và hoạt động */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <StyledPaper>
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Phân tích doanh thu
              </Typography>
              <Box>
                <IconButton size="small">
                  <FilterListIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ p: 0 }}>
              <ChartCard
                chartType="line"
                data={salesData}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                px: 2,
                py: 1,
                backgroundColor: "#f9f9f9",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tổng doanh thu tháng này
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  45.141.000đ
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Dự báo tháng sau
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  58.250.000đ
                </Typography>
              </Box>
            </Box>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <StyledPaper
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Hoạt động gần đây
              </Typography>
              <Chip
                label="Hôm nay"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflow: "auto", p: 0 }}>
              {activities.map((activity) => (
                <ActivityItem key={activity.id}>
                  <ListItemAvatar>
                    {activity.type === "weather" ? (
                      <StyledAvatar bgcolor="error.main">
                        <WarningIcon />
                      </StyledAvatar>
                    ) : activity.type === "order" ? (
                      <StyledAvatar bgcolor="primary.main">
                        <ShoppingCartIcon />
                      </StyledAvatar>
                    ) : activity.type === "product" ? (
                      <StyledAvatar bgcolor="success.main">
                        <InventoryIcon />
                      </StyledAvatar>
                    ) : activity.type === "user" ? (
                      <StyledAvatar bgcolor="info.main">
                        <PersonIcon />
                      </StyledAvatar>
                    ) : (
                      <StyledAvatar bgcolor="secondary.main">
                        <AttachMoneyIcon />
                      </StyledAvatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" noWrap>
                        <b>{activity.user}</b> {activity.action}{" "}
                        {activity.target && <b>{activity.target}</b>}
                      </Typography>
                    }
                    secondary={activity.time}
                  />
                </ActivityItem>
              ))}
            </List>
            <Box sx={{ p: 2, borderTop: "1px solid #f0f0f0" }}>
              <Button
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{ justifyContent: "space-between" }}
              >
                Xem tất cả hoạt động
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Biểu đồ tròn và sản phẩm bán chạy */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5} lg={4}>
          <StyledPaper
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Phân bổ danh mục sản phẩm
              </Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                p: 2,
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {categoryData &&
              categoryData.labels &&
              categoryData.labels.length > 0 ? (
                <ChartCard
                  chartType="doughnut"
                  data={categoryData}
                  options={{
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                    cutout: "70%",
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Đang tải dữ liệu danh mục...
                </Typography>
              )}
            </Box>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={7} lg={8}>
          <StyledPaper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Sản phẩm bán chạy
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {productPerformance && productPerformance.length > 0 ? (
                  productPerformance.map((product) => (
                    <Grid item xs={12} key={product.id}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Box flexGrow={1} mr={2}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={0.5}
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.sales} đã bán
                            </Typography>
                          </Box>
                          <ProgressBar
                            value={product.progress}
                            color={product.progress < 30 ? "error" : "primary"}
                          />
                        </Box>
                        <Chip
                          label={`${product.stock}%`}
                          size="small"
                          color={product.stock < 30 ? "error" : "primary"}
                          variant={product.stock < 30 ? "filled" : "outlined"}
                        />
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      Đang tải dữ liệu sản phẩm...
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            <Box sx={{ p: 2, borderTop: "1px solid #f0f0f0" }}>
              <Button
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{ justifyContent: "space-between" }}
              >
                Xem báo cáo đầy đủ
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Đơn hàng gần đây */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Đơn hàng gần đây
              </Typography>
            </Box>
            <Divider />
            <DataTable
              columns={orderColumns}
              data={
                recentOrders && recentOrders.length > 0
                  ? recentOrders
                  : sampleOrders
              }
              loading={isLoading}
              pagination={true}
              selectable={false}
              onRowClick={(row) => {
                console.log("Clicked order:", row);
              }}
              searchable={true}
              searchPlaceholder="Tìm kiếm đơn hàng..."
            />
          </StyledPaper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default DashboardPage;
