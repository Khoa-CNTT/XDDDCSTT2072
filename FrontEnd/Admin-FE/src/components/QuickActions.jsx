import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
  Skeleton,
} from "@mui/material";

const QuickActions = ({
  title = "Thao tác nhanh",
  actions = [],
  loading = false,
}) => {
  return (
    <Box component={Paper} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        [...Array(4)].map((_, index) => (
          <Box key={index} sx={{ display: "flex", mb: 2 }}>
            <Skeleton
              variant="circular"
              width={30}
              height={30}
              sx={{ mr: 2 }}
            />
            <Skeleton variant="rectangular" width="80%" height={30} />
          </Box>
        ))
      ) : (
        <List sx={{ p: 0 }}>
          {actions.map((action, index) => (
            <ListItem
              key={index}
              disablePadding
              sx={{ mb: 0.5, borderRadius: 1, overflow: "hidden" }}
            >
              <Tooltip title={action.tooltip || action.label}>
                <ListItemButton
                  onClick={action.onClick}
                  disabled={action.disabled}
                  sx={{
                    borderRadius: 1,
                    bgcolor: action.color ? `${action.color}.50` : undefined,
                    "&:hover": {
                      bgcolor: action.color ? `${action.color}.100` : undefined,
                    },
                  }}
                >
                  {action.icon && (
                    <ListItemIcon
                      sx={{
                        color: action.color
                          ? `${action.color}.main`
                          : "primary.main",
                        minWidth: 36,
                      }}
                    >
                      {action.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={action.label}
                    secondary={action.description}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: "medium",
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      sx: { fontSize: "0.75rem" },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      )}

      {actions.length === 0 && !loading && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ py: 2 }}
        >
          Không có thao tác nào
        </Typography>
      )}
    </Box>
  );
};

QuickActions.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      tooltip: PropTypes.string,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      color: PropTypes.string, // primary, secondary, error, warning, info, success
    })
  ),
  loading: PropTypes.bool,
};

export default QuickActions;
