import { useState } from "react";
import { Outlet } from "react-router-dom";
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
