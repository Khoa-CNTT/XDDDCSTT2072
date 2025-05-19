import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const NewsStats = ({ news }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    categoryDistribution: [],
    sourceDistribution: [],
    activeVsInactive: [
      { name: "Đang hiển thị", value: 0 },
      { name: "Đã ẩn", value: 0 },
    ],
    publishedByMonth: [],
  });

  useEffect(() => {
    if (news && news.length > 0) {
      calculateStats(news);
    }
  }, [news]);

  const calculateStats = (newsData) => {
    setLoading(true);

    // Total articles
    const totalArticles = newsData.length;

    // Category distribution
    const categoryMap = {};
    newsData.forEach((item) => {
      const category = item.category || "Không phân loại";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
    }));

    // Source distribution
    const sourceMap = {};
    newsData.forEach((item) => {
      const source = item.sourceName || "Không rõ nguồn";
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });
    const sourceDistribution = Object.keys(sourceMap)
      .map((key) => ({
        name: key,
        value: sourceMap[key],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 sources

    // Active vs Inactive
    let activeCount = 0;
    let inactiveCount = 0;
    newsData.forEach((item) => {
      if (item.active) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });
    const activeVsInactive = [
      { name: "Đang hiển thị", value: activeCount },
      { name: "Đã ẩn", value: inactiveCount },
    ];

    // Published by month (for last 6 months)
    const monthMap = {};
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${d.getMonth() + 1}/${d.getFullYear()}`;
      monthMap[monthYear] = 0;
    }

    newsData.forEach((item) => {
      if (item.publishedDate) {
        const date = new Date(item.publishedDate);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (monthMap[monthYear] !== undefined) {
          monthMap[monthYear]++;
        }
      }
    });

    const publishedByMonth = Object.keys(monthMap)
      .map((key) => ({
        name: key,
        value: monthMap[key],
      }))
      .reverse();

    setStats({
      totalArticles,
      categoryDistribution,
      sourceDistribution,
      activeVsInactive,
      publishedByMonth,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {/* Tổng số bài viết */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tổng số bài viết
              </Typography>
              <Typography variant="h3">{stats.totalArticles}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Phân bố theo danh mục */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Phân bố theo danh mục
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trạng thái bài viết */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Trạng thái bài viết
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.activeVsInactive}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      <Cell fill="#4caf50" />
                      <Cell fill="#f44336" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Số lượng bài viết theo tháng */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Số lượng bài viết theo tháng (6 tháng gần nhất)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.publishedByMonth}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Số bài viết"
                      fill="#8884d8"
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 5 nguồn tin */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Top 5 nguồn tin
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.sourceDistribution}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 80,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Số bài viết"
                      fill="#82ca9d"
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

NewsStats.propTypes = {
  news: PropTypes.array.isRequired,
};

export default NewsStats;
