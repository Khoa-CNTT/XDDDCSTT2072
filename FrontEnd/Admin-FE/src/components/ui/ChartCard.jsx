import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
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
} from "chart.js";

// Đăng ký các components Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  "& .MuiCardHeader-root": {
    borderBottom: "1px solid #e3f2fd",
    backgroundColor: "#f5f9ff",
  },
  "& .MuiCardHeader-title": {
    fontWeight: 600,
    color: "#1565c0",
  },
  "& .MuiCardHeader-subheader": {
    color: "#5c93ce",
  },
}));

const ChartContainer = styled("div")({
  width: "100%",
  height: "300px",
  position: "relative",
});

const ChartCard = ({
  title,
  subheader,
  chartType = "line",
  data,
  options,
  menuItems = [],
  onMenuItemClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (menuItem) => {
    if (onMenuItemClick) {
      onMenuItemClick(menuItem);
    }
    handleClose();
  };

  const renderChart = () => {
    const chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      ...options,
    };

    switch (chartType.toLowerCase()) {
      case "line":
        return <Line data={data} options={chartOptions} />;
      case "bar":
        return <Bar data={data} options={chartOptions} />;
      case "pie":
        return <Pie data={data} options={chartOptions} />;
      case "doughnut":
        return <Doughnut data={data} options={chartOptions} />;
      default:
        return <Line data={data} options={chartOptions} />;
    }
  };

  return (
    <StyledCard>
      <CardHeader
        action={
          menuItems.length > 0 && (
            <>
              <IconButton
                aria-label="more"
                id="chart-menu-button"
                aria-controls={open ? "chart-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="chart-menu"
                MenuListProps={{
                  "aria-labelledby": "chart-menu-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                {menuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleMenuItemClick(item)}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )
        }
        title={title}
        subheader={subheader}
      />
      <CardContent>
        <ChartContainer>{renderChart()}</ChartContainer>
      </CardContent>
    </StyledCard>
  );
};

export default ChartCard;
