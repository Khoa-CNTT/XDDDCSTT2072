import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  CircularProgress,
  Alert,
  GlobalStyles,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  Agriculture,
} from "@mui/icons-material";
import authService from "../services/authService";
import { styled } from "@mui/material/styles";

// Styled components
/*
 * HƯỚNG DẪN THÊM HÌNH NỀN:
 * 1. Tải hình ảnh nông nghiệp từ Unsplash:
 *    - https://unsplash.com/fr/photos/une-vue-aerienne-dun-grand-champ-arbore-Patcj5Q7_T8
 * 2. Lưu hình với tên "agriculture-background.jpg" vào thư mục:
 *    FrontEnd/Admin-FE/public/assets/images/
 */
const LoginContainer = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage: "url('/assets/images/agriculture-background.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  padding: 0,
  margin: 0,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 0,
  },
});

const LoginCard = styled(Card)({
  maxWidth: "500px",
  width: "100%",
  borderRadius: "10px",
  boxShadow: "0 4px 25px rgba(0, 0, 0, 0.3)",
  overflow: "hidden",
  backgroundColor: "#fff",
  border: "1px solid #4e73df",
  position: "relative",
  zIndex: 1,
});

const LoginHeader = styled(Box)({
  width: "100%",
  height: "5px",
  backgroundColor: "#4e73df",
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: "20px",
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
  "& .MuiSvgIcon-root": {
    color: theme.palette.primary.main,
  },
}));

const LoginButton = styled(Button)({
  padding: "14px",
  marginTop: "15px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "16px",
  textTransform: "none",
  background: "#4e73df",
  "&:hover": {
    background: "#3757c5",
  },
  boxShadow: "0 4px 10px rgba(78, 115, 223, 0.25)",
  transition: "all 0.3s ease",
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login(credentials.email, credentials.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "html, body": {
            margin: 0,
            padding: 0,
            overflow: "hidden",
            height: "100vh",
            width: "100vw",
          },
          "#root": {
            height: "100vh",
            width: "100vw",
            overflow: "hidden",
          },
          "*": {
            boxSizing: "border-box",
            margin: 0,
            padding: 0,
          },
        }}
      />
      <LoginContainer>
        <LoginCard>
          <LoginHeader />
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Agriculture sx={{ fontSize: 50, color: "#4e73df" }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="600"
                gutterBottom
                color="#4e73df"
              >
                Đăng nhập vào AgroSphere
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Đăng nhập bằng tài khoản quản trị viên của bạn
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <StyledTextField
                label="Email"
                placeholder="Email *"
                variant="outlined"
                name="email"
                fullWidth
                value={credentials.email}
                onChange={handleChange}
                required
                InputProps={{
                  style: { paddingLeft: 12 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                label="Mật khẩu"
                placeholder="Mật khẩu *"
                variant="outlined"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={credentials.password}
                onChange={handleChange}
                required
                InputProps={{
                  style: { paddingLeft: 12 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      color="primary"
                      sx={{
                        color: "#4e73df",
                        "&.Mui-checked": {
                          color: "#4e73df",
                        },
                      }}
                    />
                  }
                  label="Ghi nhớ đăng nhập"
                />
                <Link
                  href="#"
                  variant="body2"
                  sx={{
                    textDecoration: "none",
                    color: "#4e73df",
                    fontWeight: "500",
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </Box>

              <LoginButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
              </LoginButton>
            </form>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4, color: "#4e73df", fontWeight: 500 }}
            >
              © 2024 AgroSphere. Bản quyền thuộc về Agricultural.
            </Typography>
          </CardContent>
        </LoginCard>
      </LoginContainer>
    </>
  );
};

export default LoginPage;
