import { useState } from "react";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  Button,
  Divider,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Help as HelpIcon,
  Add as AddIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import authService from "../../services/authService";

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#1976d2",
  color: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  zIndex: theme.zIndex.drawer + 1,
}));

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  marginLeft: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
  display: "flex",
  alignItems: "center",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255, 255, 255, 0.7)",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    color: "#ffffff",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.7)",
      opacity: 1,
    },
    [theme.breakpoints.up("md")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
}));

const ActionIcons = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  "& .MuiIconButton-root": {
    color: "#ffffff",
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const QuickActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginLeft: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const Header = ({ handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

  const currentUser = authService.getCurrentUser();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
        <PersonIcon sx={{ mr: 1 }} />
        Hồ sơ
      </MenuItem>
      <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
        <SettingsIcon sx={{ mr: 1 }} />
        Cài đặt
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} />
        Đăng xuất
      </MenuItem>
    </Menu>
  );

  const notificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isNotificationsMenuOpen}
      onClose={handleNotificationsMenuClose}
    >
      <MenuItem onClick={handleNotificationsMenuClose}>
        Đơn hàng mới #1234 vừa được tạo
      </MenuItem>
      <MenuItem onClick={handleNotificationsMenuClose}>
        5 người dùng mới đăng ký trong tuần này
      </MenuItem>
      <MenuItem onClick={handleNotificationsMenuClose}>
        Cảnh báo: Hết hàng sản phẩm XYZ
      </MenuItem>
      <MenuItem
        component={Link}
        to="/notifications"
        onClick={handleNotificationsMenuClose}
      >
        Xem tất cả thông báo
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          {/* Menu button for mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo và tiêu đề */}
          <LogoContainer>
            <Avatar
              src="/admin-logo.png"
              alt="Admin Logo"
              sx={{
                width: 40,
                height: 40,
                marginRight: 1,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              A
            </Avatar>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/dashboard"
              sx={{
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              AgroSphere Admin
            </Typography>
          </LogoContainer>

          {/* Phím tắt nhanh */}
          <QuickActions>
            <Tooltip title="Dashboard">
              <IconButton color="inherit" component={Link} to="/dashboard">
                <DashboardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Đơn hàng">
              <IconButton color="inherit" component={Link} to="/orders">
                <ShoppingCartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Trang chủ">
              <IconButton color="inherit" component={Link} to="/">
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Thêm mới">
              <IconButton color="inherit">
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, backgroundColor: "rgba(255,255,255,0.3)" }}
            />
          </QuickActions>

          {/* Search với nút tìm kiếm */}
          <SearchContainer>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm..."
              inputProps={{ "aria-label": "search" }}
            />
            <SearchButton variant="contained" size="small">
              Tìm
            </SearchButton>
          </SearchContainer>

          <Box sx={{ flexGrow: 1 }} />

          {/* Trạng thái hệ thống */}
          <Chip
            label="Hệ thống: Online"
            size="small"
            sx={{
              backgroundColor: "rgba(0,255,0,0.2)",
              color: "#fff",
              mr: 2,
              display: { xs: "none", md: "flex" },
            }}
          />

          {/* Action icons */}
          <ActionIcons>
            <Tooltip title="Trợ giúp">
              <IconButton size="large" color="inherit">
                <HelpIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
              onClick={handleNotificationsMenuOpen}
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="user account"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                alt={currentUser?.name || "User"}
                src="/user-avatar.png"
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </ActionIcons>
        </Toolbar>
      </StyledAppBar>
      {profileMenu}
      {notificationsMenu}
    </>
  );
};

export default Header;
