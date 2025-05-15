import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Drawer,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  LocalOffer as LocalOfferIcon,
  Forum as ForumIcon,
  ExpandLess,
  ExpandMore,
  MonetizationOn as MonetizationOnIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Cloud as CloudIcon,
  LocationOn as LocationOnIcon,
  WbSunny as SunnyIcon,
  Spa as SpaIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Newspaper as NewspaperIcon,
} from "@mui/icons-material";
import SubscriptionIcon from "@mui/icons-material/Subscriptions";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import RecommendIcon from "@mui/icons-material/Recommend";

// Styled components
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const SidebarLogo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: "#ffffff",
  "& img": {
    width: 40,
    height: 40,
    marginRight: theme.spacing(1),
  },
  "& h3": {
    margin: 0,
    color: "#1976d2",
    fontSize: 18,
    fontWeight: 600,
  },
}));

const SidebarItem = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: 8,
  marginBottom: 4,
  color: active ? "#1565c0" : theme.palette.text.secondary,
  backgroundColor: active ? "#e3f2fd" : "transparent",
  "&:hover": {
    backgroundColor: "#f5f9ff",
  },
}));

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();
  const [openProductSubmenu, setOpenProductSubmenu] = useState(false);
  const [openWeatherSubmenu, setOpenWeatherSubmenu] = useState(false);
  const [openSubscriptionSubmenu, setOpenSubscriptionSubmenu] = useState(false);
  const [openRecommendationSubmenu, setOpenRecommendationSubmenu] =
    useState(false);
  const [openPaymentSubmenu, setOpenPaymentSubmenu] = useState(false);
  const [openNewsSubmenu, setOpenNewsSubmenu] = useState(false);

  const handleProductClick = () => {
    setOpenProductSubmenu(!openProductSubmenu);
  };

  const handleWeatherClick = () => {
    setOpenWeatherSubmenu(!openWeatherSubmenu);
  };

  const handleSubscriptionClick = () => {
    setOpenSubscriptionSubmenu(!openSubscriptionSubmenu);
  };

  const handleRecommendationClick = () => {
    setOpenRecommendationSubmenu(!openRecommendationSubmenu);
  };

  const handlePaymentClick = () => {
    setOpenPaymentSubmenu(!openPaymentSubmenu);
  };

  const handleNewsClick = () => {
    setOpenNewsSubmenu(!openNewsSubmenu);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: "Đơn hàng",
      icon: <ShoppingCartIcon />,
      path: "/orders",
    },
    {
      text: "Sản phẩm",
      icon: <CategoryIcon />,
      submenu: true,
      onClick: handleProductClick,
      open: openProductSubmenu,
      items: [
        {
          text: "Tất cả sản phẩm",
          path: "/products",
        },
        {
          text: "Danh mục",
          path: "/categories",
        },
        {
          text: "Mã giảm giá",
          path: "/coupons",
        },
        {
          text: "Flash Sale",
          path: "/flash-sales",
        },
      ],
    },
    {
      text: "Tin tức",
      icon: <NewspaperIcon />,
      submenu: true,
      onClick: handleNewsClick,
      open: openNewsSubmenu,
      items: [
        {
          text: "Quản lý tin tức",
          path: "/news",
        },
        {
          text: "Nguồn tin tức",
          path: "/news-sources",
        },
      ],
    },
    {
      text: "Thời Tiết",
      icon: <CloudIcon />,
      submenu: true,
      onClick: handleWeatherClick,
      open: openWeatherSubmenu,
      items: [
        {
          text: "Địa Điểm Theo Dõi",
          path: "/weather/locations",
          icon: <LocationOnIcon fontSize="small" />,
        },
        {
          text: "Dữ Liệu Thời Tiết",
          path: "/weather/data",
          icon: <SunnyIcon fontSize="small" />,
        },
        {
          text: "Lời Khuyên Nông Nghiệp",
          path: "/weather/advice",
          icon: <SpaIcon fontSize="small" />,
        },
        {
          text: "Đăng Ký Theo Dõi",
          path: "/weather/subscriptions",
          icon: <NotificationsIcon fontSize="small" />,
        },
      ],
    },
    {
      text: "Gợi Ý Sản Phẩm",
      icon: <RecommendIcon />,
      submenu: true,
      onClick: handleRecommendationClick,
      open: openRecommendationSubmenu,
      items: [
        {
          text: "Gợi Ý Theo Thời Tiết",
          path: "/weather-recommendations/by-weather",
          icon: <SunnyIcon fontSize="small" />,
        },
        {
          text: "Gợi Ý Theo Cây Trồng",
          path: "/weather-recommendations/by-crop",
          icon: <SpaIcon fontSize="small" />,
        },
        {
          text: "Chuẩn Bị Thời Tiết Xấu",
          path: "/weather-recommendations/extreme-weather",
          icon: <WarningIcon fontSize="small" />,
        },
        {
          text: "Phân Tích Hiệu Suất",
          path: "/weather-recommendations/performance",
          icon: <AssessmentIcon fontSize="small" />,
        },
      ],
    },
    {
      text: "Đăng Ký Dịch Vụ",
      icon: <SubscriptionIcon />,
      submenu: true,
      onClick: handleSubscriptionClick,
      open: openSubscriptionSubmenu,
      items: [
        {
          text: "Gói Đăng Ký",
          path: "/subscription-plans",
          icon: <PaymentIcon fontSize="small" />,
        },
        {
          text: "Đăng Ký Người Dùng",
          path: "/user-subscriptions",
          icon: <PersonIcon fontSize="small" />,
        },
      ],
    },
    {
      text: "Người dùng",
      icon: <PeopleIcon />,
      path: "/users",
    },
    {
      text: "Địa chỉ người dùng",
      icon: <HomeIcon />,
      path: "/user-addresses",
    },
    {
      text: "Thanh toán",
      icon: <PaymentIcon />,
      submenu: true,
      onClick: handlePaymentClick,
      open: openPaymentSubmenu,
      items: [
        {
          text: "Quản lý giao dịch",
          path: "/payments",
          icon: <MonetizationOnIcon fontSize="small" />,
        },
        {
          text: "Thống kê doanh thu",
          path: "/payment-statistics",
          icon: <AssessmentIcon fontSize="small" />,
        },
      ],
    },
    {
      text: "Mã giảm giá",
      icon: <LocalOfferIcon />,
      path: "/coupons",
    },
    {
      text: "Diễn đàn",
      icon: <ForumIcon />,
      path: "/forum-posts",
    },
    {
      text: "Thông báo",
      icon: <NotificationsIcon />,
      path: "/notifications",
    },
    {
      text: "Cài đặt",
      icon: <SettingsIcon />,
      path: "/settings",
    },
  ];

  const drawerContent = (
    <>
      <SidebarLogo>
        <img src="/vite.svg" alt="Logo" />
        <h3>AgroSphere Admin</h3>
      </SidebarLogo>
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <div key={item.text}>
            {item.submenu ? (
              <>
                <ListItem disablePadding>
                  <SidebarItem onClick={item.onClick}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.open ? <ExpandLess /> : <ExpandMore />}
                  </SidebarItem>
                </ListItem>
                <Collapse in={item.open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.items.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <SidebarItem
                          active={isActive(subItem.path) ? 1 : 0}
                          component={Link}
                          to={subItem.path}
                          sx={{ pl: 4 }}
                        >
                          <ListItemText primary={subItem.text} />
                        </SidebarItem>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <SidebarItem
                  active={isActive(item.path) ? 1 : 0}
                  component={Link}
                  to={item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </SidebarItem>
              </ListItem>
            )}
          </div>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <SidebarContainer
        component="nav"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <Drawer variant="permanent" open>
          {drawerContent}
        </Drawer>
      </SidebarContainer>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

// PropTypes validation
Sidebar.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default Sidebar;
