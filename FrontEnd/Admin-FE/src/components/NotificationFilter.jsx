import React from "react";
import { useSnackbar } from "notistack";

/**
 * Component that filters out specific notification messages
 * This is a utility component that doesn't render anything visible
 */
const NotificationFilter = () => {
  const { closeSnackbar } = useSnackbar();

  // Add a global event listener to intercept and filter notifications
  React.useEffect(() => {
    // Function to intercept the notification
    const interceptNotification = (event) => {
      // Check if this is a notification event and contains our target message
      if (
        event.target.classList.contains("SnackbarContent-root") &&
        event.target.textContent.includes(
          "Lấy gợi ý chuẩn bị cho thời tiết khắc nghiệt thành công"
        )
      ) {
        // Find the notification ID and close it
        const snackbarElement = event.target.closest(".SnackbarItem-root");
        if (snackbarElement) {
          const key = snackbarElement.getAttribute("data-key");
          if (key) {
            closeSnackbar(key);
          }
        }
      }
    };

    // Add listener for DOM mutations to detect when snackbars appear
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          Array.from(mutation.addedNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a snackbar or contains snackbars
              const snackbars = node.querySelectorAll
                ? node.querySelectorAll(".SnackbarContent-root")
                : [];

              // Process any found snackbars
              if (
                node.classList &&
                node.classList.contains("SnackbarContent-root")
              ) {
                interceptNotification({ target: node });
              } else if (snackbars.length) {
                snackbars.forEach((snackbar) => {
                  interceptNotification({ target: snackbar });
                });
              }
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [closeSnackbar]);

  // This component doesn't render anything
  return null;
};

export default NotificationFilter;
