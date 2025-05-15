import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import {
  TipsAndUpdates as TipsIcon,
  Bolt as BoltIcon,
  WbSunny as SunIcon,
  WaterDrop as WaterIcon,
  Thermostat as ThermostatIcon,
  Apartment as RegionIcon,
  CalendarMonth as SeasonIcon,
} from "@mui/icons-material";

/**
 * Component hiển thị lời khuyên tối ưu hóa
 */
export const OptimizationTipsList = ({ optimizationTips }) => {
  if (!optimizationTips || optimizationTips.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography>Không có dữ liệu khuyến nghị tối ưu</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Khuyến Nghị Tối Ưu Hóa
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Các lời khuyên để tối ưu hóa hiệu suất sản phẩm
      </Typography>
      <List>
        {optimizationTips.map((tip, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemIcon>
              <TipsIcon color="warning" />
            </ListItemIcon>
            <ListItemText primary={tip} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

/**
 * Component hiển thị điều kiện tối ưu cho sản phẩm
 */
export const OptimalConditionsCard = ({ optimalConditions }) => {
  if (!optimalConditions) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography>Không có dữ liệu điều kiện tối ưu</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Điều Kiện Tối Ưu
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Các điều kiện tối ưu nhất cho hiệu suất sản phẩm cao nhất
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <SunIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Thời Tiết</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {optimalConditions.weather}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ThermostatIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Nhiệt Độ</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {optimalConditions.temperature}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <WaterIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Độ Ẩm</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {optimalConditions.humidity}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <SeasonIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Mùa</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {optimalConditions.season}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

/**
 * Component hiển thị khuyến nghị sử dụng
 */
export const UsageRecommendations = ({ usageRecommendations }) => {
  if (!usageRecommendations || usageRecommendations.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography>Không có dữ liệu khuyến nghị sử dụng</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Khuyến Nghị Sử Dụng
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Các lời khuyên để sử dụng sản phẩm đạt hiệu quả cao nhất
      </Typography>
      <List>
        {usageRecommendations.map((rec, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemIcon>
              <BoltIcon color="info" />
            </ListItemIcon>
            <ListItemText primary={rec} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

/**
 * Component tổng hợp cho tab Khuyến Nghị Tối Ưu
 */
export const OptimizationRecommendationsDashboard = ({
  performanceData,
  futurePredictions,
}) => {
  if (!performanceData && !futurePredictions) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography>Không có dữ liệu khuyến nghị</Typography>
      </Box>
    );
  }

  const optimizationTips = performanceData?.optimizationTips || [];
  const optimalConditions = performanceData?.optimalConditions || null;
  const usageRecommendations = futurePredictions?.usageRecommendations || [];

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <OptimalConditionsCard optimalConditions={optimalConditions} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <OptimizationTipsList optimizationTips={optimizationTips} />
      </Box>

      <Box>
        <UsageRecommendations usageRecommendations={usageRecommendations} />
      </Box>
    </Box>
  );
};
