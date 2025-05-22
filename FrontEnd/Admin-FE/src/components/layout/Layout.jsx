import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Tạo theme với màu xanh dương
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Màu xanh dương chính
      light: "#42a5f5",
      dark: "#1565c0",
    },
    background: {
      default: "#e3f2fd", // Màu nền xanh dương nhạt
      paper: "#ffffff",
    },
  },
});

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập và có vai trò Admin không
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const userRole = localStorage.getItem("userRole");

    console.log("LAYOUT CHECK - Token exists:", !!token);
    console.log("LAYOUT CHECK - UserStr:", userStr);
    console.log("LAYOUT CHECK - UserRole:", userRole);

    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
      console.log("LAYOUT CHECK - Parsed user:", user);
    } catch (e) {
      console.error("Failed to parse user JSON:", e);
    }

    // Kiểm tra linh hoạt hơn: chấp nhận cả roleName
    const isAdmin =
      (user &&
        (user.role === 1 ||
          user.role === "1" ||
          user.role === "Admin" ||
          user.role === "ADMIN" ||
          user.roleName === "Admin" ||
          user.roleName === "ADMIN")) ||
      userRole === "1" ||
      userRole === 1 ||
      userRole === "Admin" ||
      userRole === "ADMIN";

    console.log("LAYOUT CHECK - Is admin:", isAdmin);

    if (!token || !isAdmin) {
      // Nếu không phải Admin, chuyển hướng về trang đăng nhập
      console.log("LAYOUT CHECK - Redirecting to login");
      navigate("/login");
    }
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Header handleDrawerToggle={handleDrawerToggle} />
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            px: { xs: 0, sm: 0, md: 0 },
            pb: 2,
            width: { sm: `calc(100% - 240px)` },
            mt: { xs: 7, sm: 8 },
            minHeight: "100vh",
            backgroundColor: (theme) => theme.palette.background.default,
            backgroundImage: "linear-gradient(to right, #e3f2fd, #bbdefb)",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(25,118,210,0.05)",
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
