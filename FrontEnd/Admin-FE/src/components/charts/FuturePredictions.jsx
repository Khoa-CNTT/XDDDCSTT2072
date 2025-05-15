import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from "@mui/icons-material";
import { Line, Bar } from "react-chartjs-2";
import ChartCard from "../ui/ChartCard";

/**
 * Component hiển thị biểu đồ dự đoán theo thời gian
 */
export const FuturePredictionChart = ({ futurePredictions }) => {
  const theme = useTheme();

  if (!futurePredictions || !futurePredictions.performancePredictions) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography>Không có dữ liệu dự đoán</Typography>
      </Box>
    );
  }

  const dates = futurePredictions.performancePredictions.map((day) => {
    const date = new Date(day.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const performanceValues = futurePredictions.performancePredictions.map(
    (day) => day.performance
  );

  const temperatureValues = futurePredictions.performancePredictions.map(
    (day) => day.temperature
  );

  const humidityValues = futurePredictions.performancePredictions.map(
    (day) => day.humidity
  );

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Hiệu suất dự đoán (%)",
        data: performanceValues,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main + "40",
        yAxisID: "y",
        fill: true,
      },
      {
        label: "Nhiệt độ (°C)",
        data: temperatureValues,
        borderColor: theme.palette.error.main,
        backgroundColor: "transparent",
        borderDash: [5, 5],
        yAxisID: "y1",
      },
      {
        label: "Độ ẩm (%)",
        data: humidityValues,
        borderColor: theme.palette.info.main,
        backgroundColor: "transparent",
        borderDash: [3, 3],
        yAxisID: "y2",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Hiệu suất (%)",
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Nhiệt độ (°C)",
        },
        min: 0,
        max: 50,
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Độ ẩm (%)",
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <ChartCard
      title="Dự Đoán Hiệu Suất Tương Lai"
      subheader={`Hiệu suất trung bình dự kiến: ${futurePredictions.averagePerformance}% (${futurePredictions.trend})`}
      chartType="line"
      data={data}
      options={options}
    />
  );
};

/**
 * Component hiển thị bảng chi tiết dự đoán
 */
export const FuturePredictionTable = ({ futurePredictions }) => {
  if (!futurePredictions || !futurePredictions.performancePredictions) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography>Không có dữ liệu dự đoán</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Chi Tiết Dự Đoán Theo Ngày
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hiệu suất dự đoán chi tiết theo từng điều kiện thời tiết
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Thời tiết</TableCell>
              <TableCell>Nhiệt độ (°C)</TableCell>
              <TableCell>Độ ẩm (%)</TableCell>
              <TableCell align="right">Hiệu suất (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {futurePredictions.performancePredictions.map((pred, index) => {
              const date = new Date(pred.date);
              const formattedDate = `${date.getDate()}/${
                date.getMonth() + 1
              }/${date.getFullYear()}`;

              let chipColor = "default";
              if (pred.weather.includes("Mưa")) {
                chipColor = "info";
              } else if (pred.weather.includes("Nắng")) {
                chipColor = "warning";
              }

              return (
                <TableRow key={index}>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={pred.weather}
                      size="small"
                      color={chipColor}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{pred.temperature}</TableCell>
                  <TableCell>{pred.humidity}</TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      {pred.performance >= 85 ? (
                        <TrendingUpIcon
                          color="success"
                          fontSize="small"
                          sx={{ mr: 0.5 }}
                        />
                      ) : pred.performance >= 70 ? (
                        <TrendingFlatIcon
                          color="primary"
                          fontSize="small"
                          sx={{ mr: 0.5 }}
                        />
                      ) : (
                        <TrendingDownIcon
                          color="error"
                          fontSize="small"
                          sx={{ mr: 0.5 }}
                        />
                      )}
                      {pred.performance}%
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

/**
 * Component hiển thị tổng quan dự đoán
 */
export const PredictionSummary = ({ futurePredictions }) => {
  if (!futurePredictions) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography>Không có dữ liệu dự đoán</Typography>
      </Box>
    );
  }

  const getBestDay = () => {
    if (!futurePredictions.performancePredictions?.length) return null;

    const bestDay = futurePredictions.performancePredictions.reduce(
      (best, current) =>
        current.performance > best.performance ? current : best,
      futurePredictions.performancePredictions[0]
    );

    const date = new Date(bestDay.date);
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      performance: bestDay.performance,
      weather: bestDay.weather,
    };
  };

  const getWorstDay = () => {
    if (!futurePredictions.performancePredictions?.length) return null;

    const worstDay = futurePredictions.performancePredictions.reduce(
      (worst, current) =>
        current.performance < worst.performance ? current : worst,
      futurePredictions.performancePredictions[0]
    );

    const date = new Date(worstDay.date);
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      performance: worstDay.performance,
      weather: worstDay.weather,
    };
  };

  const bestDay = getBestDay();
  const worstDay = getWorstDay();

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tổng Quan Dự Đoán
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Các chỉ số dự đoán tổng quan
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Hiệu suất trung bình
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                {futurePredictions.averagePerformance}%
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {futurePredictions.trend === "Tăng" ? (
                  <TrendingUpIcon color="success" />
                ) : futurePredictions.trend === "Giảm" ? (
                  <TrendingDownIcon color="error" />
                ) : (
                  <TrendingFlatIcon color="primary" />
                )}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {futurePredictions.trend}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {bestDay && (
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày hiệu suất cao nhất
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                  {bestDay.performance}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bestDay.date} • {bestDay.weather}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {worstDay && (
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày hiệu suất thấp nhất
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                  {worstDay.performance}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {worstDay.date} • {worstDay.weather}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

/**
 * Component tổng hợp cho tab Dự Đoán Tương Lai
 */
export const FuturePredictionsDashboard = ({ futurePredictions }) => {
  if (!futurePredictions) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography>Không có dữ liệu dự đoán</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PredictionSummary futurePredictions={futurePredictions} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FuturePredictionChart futurePredictions={futurePredictions} />
      </Box>

      <Box>
        <FuturePredictionTable futurePredictions={futurePredictions} />
      </Box>
    </Box>
  );
};
