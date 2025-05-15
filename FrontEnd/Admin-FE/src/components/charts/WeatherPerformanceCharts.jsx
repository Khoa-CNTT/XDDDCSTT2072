import { useTheme } from "@mui/material/styles";
import { Box, Typography, Paper } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Bar, Line, Pie, Radar } from "react-chartjs-2";
import ChartCard from "../ui/ChartCard";

// Đăng ký các components Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

/**
 * Biểu đồ hiệu suất theo loại thời tiết
 */
export const WeatherTypeChart = ({ performanceData }) => {
  const theme = useTheme();

  if (!performanceData || !performanceData.weatherPerformanceDetailed) {
    return <Typography>Không có dữ liệu</Typography>;
  }

  const weatherTypes = Object.keys(performanceData.weatherPerformanceDetailed);
  const performanceValues = weatherTypes.map(
    (type) =>
      performanceData.weatherPerformanceDetailed[type].averagePerformance
  );
  const salesVolumes = weatherTypes.map(
    (type) => performanceData.weatherPerformanceDetailed[type].salesVolume
  );

  const data = {
    labels: weatherTypes,
    datasets: [
      {
        label: "Hiệu suất trung bình (%)",
        data: performanceValues,
        backgroundColor: theme.palette.primary.main + "80", // 50% opacity
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        label: "Số lượng bán ra",
        data: salesVolumes,
        backgroundColor: theme.palette.secondary.main + "80", // 50% opacity
        borderColor: theme.palette.secondary.main,
        borderWidth: 1,
        type: "line",
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
          text: "Số lượng",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <ChartCard
      title="Hiệu Suất Theo Loại Thời Tiết"
      subheader="So sánh hiệu suất và số lượng bán ra theo từng loại thời tiết"
      chartType="bar"
      data={data}
      options={options}
    />
  );
};

/**
 * Biểu đồ hiệu suất theo nhiệt độ
 */
export const TemperaturePerformanceChart = ({ performanceData }) => {
  const theme = useTheme();

  if (!performanceData || !performanceData.temperaturePerformance) {
    return <Typography>Không có dữ liệu</Typography>;
  }

  const tempRanges = Object.keys(performanceData.temperaturePerformance);
  const performanceValues = tempRanges.map(
    (range) => performanceData.temperaturePerformance[range]
  );

  const data = {
    labels: tempRanges,
    datasets: [
      {
        label: "Hiệu suất theo nhiệt độ (%)",
        data: performanceValues,
        backgroundColor: theme.palette.success.main + "80",
        borderColor: theme.palette.success.main,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Hiệu suất (%)",
        },
      },
    },
  };

  return (
    <ChartCard
      title="Hiệu Suất Theo Nhiệt Độ"
      subheader="Ảnh hưởng của nhiệt độ đến hiệu suất sản phẩm"
      chartType="line"
      data={data}
      options={options}
    />
  );
};

/**
 * Biểu đồ hiệu suất theo độ ẩm
 */
export const HumidityPerformanceChart = ({ performanceData }) => {
  const theme = useTheme();

  if (!performanceData || !performanceData.humidityPerformance) {
    return <Typography>Không có dữ liệu</Typography>;
  }

  const humidityRanges = Object.keys(performanceData.humidityPerformance);
  const performanceValues = humidityRanges.map(
    (range) => performanceData.humidityPerformance[range]
  );

  const data = {
    labels: humidityRanges,
    datasets: [
      {
        label: "Hiệu suất theo độ ẩm (%)",
        data: performanceValues,
        backgroundColor: theme.palette.info.main + "80",
        borderColor: theme.palette.info.main,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Hiệu suất (%)",
        },
      },
    },
  };

  return (
    <ChartCard
      title="Hiệu Suất Theo Độ Ẩm"
      subheader="Ảnh hưởng của độ ẩm đến hiệu suất sản phẩm"
      chartType="bar"
      data={data}
      options={options}
    />
  );
};

/**
 * Biểu đồ hiệu suất theo mùa
 */
export const SeasonalPerformanceChart = ({ performanceData }) => {
  const theme = useTheme();

  if (!performanceData || !performanceData.seasonalPerformance) {
    return <Typography>Không có dữ liệu</Typography>;
  }

  const seasons = Object.keys(performanceData.seasonalPerformance);
  const performanceValues = seasons.map(
    (season) => performanceData.seasonalPerformance[season]
  );

  const data = {
    labels: seasons,
    datasets: [
      {
        label: "Hiệu suất theo mùa (%)",
        data: performanceValues,
        backgroundColor: [
          theme.palette.primary.main + "80",
          theme.palette.secondary.main + "80",
          theme.palette.warning.main + "80",
          theme.palette.success.main + "80",
        ],
        borderColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.warning.main,
          theme.palette.success.main,
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <ChartCard
      title="Hiệu Suất Theo Mùa"
      subheader="So sánh hiệu suất sản phẩm trong các mùa khác nhau"
      chartType="pie"
      data={data}
      options={options}
    />
  );
};

/**
 * Biểu đồ dự đoán hiệu suất
 */
export const FuturePerformanceChart = ({ futurePredictions }) => {
  const theme = useTheme();

  if (!futurePredictions || !futurePredictions.performancePredictions) {
    return <Typography>Không có dữ liệu dự đoán</Typography>;
  }

  const dates = futurePredictions.performancePredictions.map((day) => {
    const date = new Date(day.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const performanceValues = futurePredictions.performancePredictions.map(
    (day) => day.performance
  );

  const weatherTypes = futurePredictions.performancePredictions.map(
    (day) => day.weather
  );

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Hiệu suất dự đoán (%)",
        data: performanceValues,
        backgroundColor: weatherTypes.map((type) => {
          if (type.includes("Mưa")) {
            return theme.palette.info.main + "80";
          } else if (type.includes("Nắng")) {
            return theme.palette.warning.main + "80";
          }
          return theme.palette.primary.main + "80";
        }),
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Hiệu suất (%)",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterLabel: function (context) {
            const dataIndex = context.dataIndex;
            const prediction =
              futurePredictions.performancePredictions[dataIndex];
            return [
              `Thời tiết: ${prediction.weather}`,
              `Nhiệt độ: ${prediction.temperature}°C`,
              `Độ ẩm: ${prediction.humidity}%`,
            ];
          },
        },
      },
    },
  };

  return (
    <ChartCard
      title="Dự Đoán Hiệu Suất Sản Phẩm"
      subheader={`Hiệu suất dự đoán theo điều kiện thời tiết (Xu hướng: ${futurePredictions.trend})`}
      chartType="bar"
      data={data}
      options={options}
    />
  );
};

/**
 * Biểu đồ radar các điều kiện tối ưu
 */
export const OptimalConditionsChart = ({ performanceData }) => {
  const theme = useTheme();

  if (!performanceData || !performanceData.optimalConditions) {
    return <Typography>Không có dữ liệu</Typography>;
  }

  // Tạo dataset cho biểu đồ radar thể hiện điều kiện tối ưu
  // Mỗi chỉ số được quy đổi sang thang điểm 0-100
  const weatherScore =
    {
      "Nắng nhẹ": 75,
      "Mưa nhẹ": 85,
      "Nắng vừa": 65,
      "Mưa vừa": 80,
    }[performanceData.optimalConditions.weather] || 50;

  const tempScore =
    {
      "15-20°C": 80,
      "20-25°C": 90,
      "25-30°C": 70,
      "30-35°C": 50,
      ">35°C": 30,
    }[performanceData.optimalConditions.temperature] || 50;

  const humidityScore =
    {
      "<40%": 40,
      "40-60%": 70,
      "60-80%": 90,
      ">80%": 60,
    }[performanceData.optimalConditions.humidity] || 50;

  const seasonScore =
    {
      Xuân: 90,
      Hè: 70,
      Thu: 80,
      Đông: 60,
    }[performanceData.optimalConditions.season] || 50;

  const data = {
    labels: ["Thời tiết", "Nhiệt độ", "Độ ẩm", "Mùa"],
    datasets: [
      {
        label: "Điều kiện tối ưu",
        data: [weatherScore, tempScore, humidityScore, seasonScore],
        backgroundColor: theme.palette.primary.main + "40", // 25% opacity
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: theme.palette.primary.main,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            const dataIndex = context.dataIndex;
            const labels = ["Thời tiết", "Nhiệt độ", "Độ ẩm", "Mùa"];
            const optimalValues = [
              performanceData.optimalConditions.weather,
              performanceData.optimalConditions.temperature,
              performanceData.optimalConditions.humidity,
              performanceData.optimalConditions.season,
            ];

            return `${label} - ${labels[dataIndex]}: ${optimalValues[dataIndex]} (${value}%)`;
          },
        },
      },
    },
  };

  return (
    <Box component={Paper} sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom>
        Điều Kiện Tối Ưu
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Các điều kiện tối ưu cho hiệu suất cao nhất
      </Typography>
      <Box sx={{ height: 300, mt: 2 }}>
        <Radar data={data} options={options} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Thời tiết tối ưu:{" "}
          <strong>{performanceData.optimalConditions.weather}</strong>
        </Typography>
        <Typography variant="body2">
          Nhiệt độ tối ưu:{" "}
          <strong>{performanceData.optimalConditions.temperature}</strong>
        </Typography>
        <Typography variant="body2">
          Độ ẩm tối ưu:{" "}
          <strong>{performanceData.optimalConditions.humidity}</strong>
        </Typography>
        <Typography variant="body2">
          Mùa tối ưu:{" "}
          <strong>{performanceData.optimalConditions.season}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

// Component tổng hợp các biểu đồ hiệu suất
export const WeatherPerformanceDashboard = ({
  performanceData,
  futurePredictions,
}) => {
  if (!performanceData) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography>Không có dữ liệu hiệu suất</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <WeatherTypeChart performanceData={performanceData} />
        </Box>

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
          <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: 300 }}>
            <TemperaturePerformanceChart performanceData={performanceData} />
          </Box>
          <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: 300 }}>
            <HumidityPerformanceChart performanceData={performanceData} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: 300 }}>
            <SeasonalPerformanceChart performanceData={performanceData} />
          </Box>
          <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: 300 }}>
            <OptimalConditionsChart performanceData={performanceData} />
          </Box>
        </Box>
      </Box>

      {futurePredictions && (
        <Box sx={{ mt: 4 }}>
          <FuturePerformanceChart futurePredictions={futurePredictions} />
        </Box>
      )}
    </Box>
  );
};
