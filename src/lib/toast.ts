import { toast, type ToastOptions, type ToastTheme } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
// Import our custom toast styles
import '../styles/toast.css';

// Toast configuration options
const toastOptions = {
  position: toast.POSITION.TOP_RIGHT,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
};

// Helper functions for common toast types
export const showSuccess = (message: string, options = {}) => {
  toast.success(message, { ...toastOptions, ...options });
};

export const showError = (message: string, options = {}) => {
  toast.error(message, { ...toastOptions, ...options });
};

export const showInfo = (message: string, options = {}) => {
  toast.info(message, { ...toastOptions, ...options });
};

export const showWarning = (message: string, options = {}) => {
  toast.warning(message, { ...toastOptions, ...options });
};

// Export the toast instance for direct use
export { toast };
