import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
  "#A4DE6C",
  "#D0ED57",
];

const NewsStats = ({ newsData, title = "Thống kê tin tức" }) => {
  // Phân loại tin tức theo danh mục
  const getCategoryCounts = () => {
    const categoryCounts = {};
    newsData.forEach((item) => {
      const category = item.category || "Khác";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Tính tỷ lệ tin tức đang hiển thị
  const getActivePercentage = () => {
    if (newsData.length === 0) return 0;
    const activeCount = newsData.filter((item) => item.active).length;
    return Math.round((activeCount / newsData.length) * 100);
  };

  // Tổng hợp dữ liệu cho biểu đồ
  const chartData = getCategoryCounts();
  const activePercentage = getActivePercentage();

  return (
    <Box component={Paper} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        {/* Tổng số tin tức */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography
                color="textSecondary"
                variant="subtitle2"
                gutterBottom
              >
                Tổng số tin tức
              </Typography>
              <Typography variant="h4">{newsData.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tin tức đang hiển thị */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography
                color="textSecondary"
                variant="subtitle2"
                gutterBottom
              >
                Đang hiển thị
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h4" sx={{ mr: 1 }}>
                  {activePercentage}%
                </Typography>
                <Chip
                  size="small"
                  label={`${newsData.filter((item) => item.active).length} tin`}
                  color="success"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={activePercentage}
                color="success"
                sx={{ mt: 1, height: 8, borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Số lượng danh mục */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography
                color="textSecondary"
                variant="subtitle2"
                gutterBottom
              >
                Số danh mục
              </Typography>
              <Typography variant="h4">{chartData.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh mục phổ biến nhất */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography
                color="textSecondary"
                variant="subtitle2"
                gutterBottom
              >
                Danh mục phổ biến
              </Typography>
              {chartData.length > 0 ? (
                <>
                  <Typography variant="h6" noWrap sx={{ maxWidth: "100%" }}>
                    {chartData[0].name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${chartData[0].value} tin`}
                    color="primary"
                  />
                </>
              ) : (
                <Typography variant="body2">Không có dữ liệu</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        {chartData.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 300, overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Danh mục</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell align="right">Tỷ lệ (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((category, index) => (
                  <TableRow
                    key={category.name}
                    sx={{
                      "&:nth-of-type(odd)": { bgcolor: "#f9f9f9" },
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: COLORS[index % COLORS.length],
                            mr: 1,
                          }}
                        />
                        {category.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{category.value}</TableCell>
                    <TableCell align="right">
                      {((category.value / newsData.length) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
            }}
          >
            <Typography variant="body1">
              Không có dữ liệu để hiển thị
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

NewsStats.propTypes = {
  newsData: PropTypes.array.isRequired,
  title: PropTypes.string,
};

export default NewsStats;
