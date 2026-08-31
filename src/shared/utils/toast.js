/**
 * @typedef {Object} ToastOptions
 * @property {string} message - The message to display.
 * @property {'success' | 'danger' | 'warning' | 'info'} variant - The style variant of the toast.
 */

/**
 * @callback ToastHandler
 * @param {ToastOptions} options - The toast options.
 * @returns {void}
 */

/**
 * The registered toast handler function.
 * @type {ToastHandler | null}
 */
let toastHandler = null;

/**
 * Registers a callback function to handle toast notifications.
 * This is typically called once at the root of the application
 * to connect the toast utility to the UI component.
 * 
 * @param {ToastHandler} handler - The function to execute when a toast is triggered.
 */
export const registerToast = (handler) => {
  toastHandler = handler;
};

/**
 * Utility object for triggering toast notifications throughout the application.
 */
export const toast = {
  /**
   * Displays a success toast notification.
   * @param {string} message - The success message to display.
   */
  success(message) {
    toastHandler?.({
      message,
      variant: "success",
    });
  },

  /**
   * Displays an error/danger toast notification.
   * @param {string} message - The error message to display.
   */
  error(message) {
    toastHandler?.({
      message,
      variant: "danger",
    });
  },

  /**
   * Displays a warning toast notification.
   * @param {string} message - The warning message to display.
   */
  warning(message) {
    toastHandler?.({
      message,
      variant: "warning",
    });
  },

  /**
   * Displays an informational toast notification.
   * @param {string} message - The info message to display.
   */
  info(message) {
    toastHandler?.({
      message,
      variant: "info",
    });
  },
};