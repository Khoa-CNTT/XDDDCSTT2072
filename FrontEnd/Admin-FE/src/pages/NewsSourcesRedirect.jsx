import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";

const NewsSourcesRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Chuyển hướng đến trang tin tức với state để mở tab nguồn tin
    navigate("/news", { state: { openSourcesTab: true } });
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Đang chuyển hướng đến trang quản lý nguồn tin tức...
      </Typography>
    </Box>
  );
};

export default NewsSourcesRedirect;
