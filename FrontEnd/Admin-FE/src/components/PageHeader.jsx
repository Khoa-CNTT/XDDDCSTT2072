import { Box, Typography, Paper } from "@mui/material";
import PropTypes from "prop-types";

const PageHeader = ({ title, subtitle, icon }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        backgroundColor: "background.default",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon && (
        <Box
          sx={{
            display: "flex",
            mr: 2,
            backgroundColor: "primary.light",
            p: 1,
            borderRadius: "50%",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="h5" component="h1" fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
};

export default PageHeader;
