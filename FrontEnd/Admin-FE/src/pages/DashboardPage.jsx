import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Divider,
  Avatar,
  Tabs,
  Tab,
  ListItem,
  ListItemText,
  ListItemAvatar,
  List,
  Chip,
  LinearProgress,
  IconButton,
  Stack,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterListIcon,
  ArrowForward as ArrowForwardIcon,
  Speed as SpeedIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import StatCard from "../components/ui/StatCard";
import ChartCard from "../components/ui/ChartCard";
import DataTable from "../components/ui/DataTable";
import userService from "../services/userService";
import orderService from "../services/orderService";
import { styled } from "@mui/material/styles";

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

const SectionTitle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
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

const StyledAvatar = styled(Avatar)(({ theme, bgcolor = "primary.main" }) => ({
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
  const [tabValue, setTabValue] = useState(0);
  const [activities, setActivities] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Thống kê tổng quan
        setStatistics({
          totalSales: 45141,
          totalOrders: 423,
          totalUsers: 7929,
          totalProducts: 289,
        });

        // Dữ liệu biểu đồ doanh thu
        const months = [
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
        ];

        setSalesData({
          labels: months,
          datasets: [
            {
              label: "Doanh thu năm 2024",
              data: [53, 42, 51, 54, 53, 58, 54, 60, 58, 62, 50, 58],
              borderColor: "rgba(25, 118, 210, 1)",
              backgroundColor: "rgba(25, 118, 210, 0.2)",
              tension: 0.4,
            },
            {
              label: "Lượt truy cập",
              data: [88, 74, 82, 98, 95, 83, 102, 87, 110, 92, 65, 69],
              borderColor: "rgba(255, 159, 64, 1)",
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              tension: 0.4,
            },
          ],
        });

        // Dữ liệu biểu đồ tròn thị phần danh mục
        setCategoryData({
          labels: [
            "Cây trồng",
            "Phân bón",
            "Thuốc BVTV",
            "Công cụ",
            "Hạt giống",
          ],
          datasets: [
            {
              data: [35, 25, 20, 10, 10],
              backgroundColor: [
                "rgba(25, 118, 210, 0.8)",
                "rgba(156, 39, 176, 0.8)",
                "rgba(76, 175, 80, 0.8)",
                "rgba(255, 152, 0, 0.8)",
                "rgba(244, 67, 54, 0.8)",
              ],
              borderWidth: 1,
            },
          ],
        });

        // Lấy các đơn hàng gần đây
        const ordersResponse = await orderService.getRecentOrders(5);
        setRecentOrders(ordersResponse || sampleOrders);

        // Hoạt động gần đây
        setActivities([
          {
            id: 1,
            user: "Nguyễn Văn A",
            action: "đã đặt đơn hàng mới",
            target: "#1234",
            time: "5 phút trước",
            avatar: "/avatar1.png",
            type: "order",
          },
          {
            id: 2,
            user: "Admin",
            action: "đã thêm sản phẩm mới",
            target: "Phân bón NPK",
            time: "25 phút trước",
            avatar: "/avatar2.png",
            type: "product",
          },
          {
            id: 3,
            user: "Hệ thống",
            action: "phát hiện thời tiết xấu tại",
            target: "Đồng Tháp",
            time: "1 giờ trước",
            avatar: "",
            type: "weather",
          },
          {
            id: 4,
            user: "Trần Thị B",
            action: "đã đăng ký mới",
            target: "",
            time: "3 giờ trước",
            avatar: "/avatar3.png",
            type: "user",
          },
          {
            id: 5,
            user: "Lê Văn C",
            action: "đã thanh toán đơn hàng",
            target: "#1230",
            time: "5 giờ trước",
            avatar: "/avatar4.png",
            type: "payment",
          },
        ]);

        // Hiệu suất sản phẩm bán chạy
        setProductPerformance([
          {
            id: 1,
            name: "Phân bón NPK",
            sales: 120,
            rating: 4.8,
            stock: 70,
            progress: 70,
          },
          {
            id: 2,
            name: "Hạt giống lúa lai",
            sales: 98,
            rating: 4.5,
            stock: 32,
            progress: 32,
          },
          {
            id: 3,
            name: "Thuốc trừ sâu sinh học",
            sales: 85,
            rating: 4.2,
            stock: 55,
            progress: 55,
          },
          {
            id: 4,
            name: "Dụng cụ làm vườn",
            sales: 72,
            rating: 4.0,
            stock: 60,
            progress: 60,
          },
          {
            id: 5,
            name: "Máy bơm nước mini",
            sales: 63,
            rating: 4.7,
            stock: 25,
            progress: 25,
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dữ liệu biểu đồ tròn thị phần danh mục
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [],
  });

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

        return (
          <Typography
            component="span"
            sx={{
              color: statusColors[value] || "text.secondary",
              fontWeight: "medium",
            }}
          >
            {value === "PENDING" && "Chờ xử lý"}
            {value === "PROCESSING" && "Đang xử lý"}
            {value === "SHIPPED" && "Đang giao hàng"}
            {value === "DELIVERED" && "Đã giao hàng"}
            {value === "CANCELLED" && "Đã huỷ"}
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

  // Chỉ số hiệu suất chính
  const kpiData = [
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
                    {kpi.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 1,
                      color: kpi.trend.startsWith("+")
                        ? "success.main"
                        : "error.main",
                      fontWeight: "bold",
                    }}
                  >
                    {kpi.trend}
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
                {productPerformance.map((product) => (
                  <Grid item xs={12} key={product.id}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
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
                ))}
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
              data={recentOrders.length ? recentOrders : sampleOrders}
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
