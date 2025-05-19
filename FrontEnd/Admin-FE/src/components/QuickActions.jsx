import { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Divider,
} from "@mui/material";

const QuickActions = ({
  title = "Hành động nhanh",
  subtitle,
  actions = [],
  buttons = [],
}) => {
  const [loadingStates, setLoadingStates] = useState(actions.map(() => false));

  const handleActionClick = async (index, actionFn) => {
    setLoadingStates((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    try {
      await actionFn();
    } finally {
      setLoadingStates((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };

  // Nếu chỉ có buttons, hiển thị dưới dạng inline
  if (buttons.length > 0 && actions.length === 0) {
    return (
      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            variant="contained"
            color={button.color || "primary"}
            startIcon={button.icon}
            onClick={button.onClick}
            disabled={button.loading}
            size="medium"
          >
            {button.loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Đang xử lý...
              </>
            ) : (
              button.label
            )}
          </Button>
        ))}
      </Box>
    );
  }

  // Hiển thị dạng card với actions
  return (
    <Card sx={{ mb: 3, height: "100%" }}>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        {(title || subtitle) && <Divider sx={{ my: 1.5 }} />}

        <Grid container spacing={1} sx={{ mt: 1 }}>
          {actions.map((action, index) => (
            <Grid item xs={12} key={index}>
              <Button
                fullWidth
                variant="outlined"
                color={action.color || "primary"}
                startIcon={action.icon}
                onClick={() => handleActionClick(index, action.onClick)}
                disabled={loadingStates[index]}
                sx={{ justifyContent: "flex-start", textAlign: "left", py: 1 }}
              >
                {loadingStates[index] ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {action.label}
                    {action.description && (
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{ color: "text.secondary" }}
                      >
                        {action.description}
                      </Typography>
                    )}
                  </>
                )}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

QuickActions.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
      color: PropTypes.string,
    })
  ),
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
      loading: PropTypes.bool,
      color: PropTypes.string,
    })
  ),
};

export default QuickActions;
