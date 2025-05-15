import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Info as InfoIcon } from "@mui/icons-material";

const StyledCard = styled(Card)(({ theme, color = "primary" }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: 16,
  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  backgroundColor: "#ffffff",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "5px",
    backgroundColor:
      color === "primary" ? "#1976d2" : theme.palette[color].main,
  },
  border: "1px solid #e0e0e0",
}));

const IconWrapper = styled(Box)(({ theme, color = "primary" }) => ({
  position: "absolute",
  right: 20,
  top: 20,
  width: 60,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  opacity: 0.15,
  backgroundColor:
    color === "primary" ? "#1976d2" : theme.palette[color]?.main || "#1976d2",
}));

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  increasedBy,
  onClick,
}) => {
  return (
    <StyledCard color={color}>
      <CardContent sx={{ position: "relative", padding: 3 }}>
        <IconWrapper
          sx={{ backgroundColor: (theme) => theme.palette[color].main }}
        >
          {icon}
        </IconWrapper>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            component="div"
            color="text.secondary"
            gutterBottom
          >
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>

          {increasedBy && (
            <Typography
              variant="body2"
              sx={{
                color: increasedBy > 0 ? "success.main" : "error.main",
                fontWeight: "bold",
              }}
            >
              {increasedBy > 0 ? "+" : ""}
              {increasedBy}%
            </Typography>
          )}
        </Box>

        {onClick && (
          <IconButton
            size="small"
            sx={{ position: "absolute", bottom: 8, right: 8 }}
            onClick={onClick}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;
