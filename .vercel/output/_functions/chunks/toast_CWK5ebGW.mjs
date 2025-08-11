import { toast } from 'vue3-toastify';
/* empty css                         */

const toastOptions = {
  position: toast.POSITION.TOP_RIGHT,
  autoClose: 3e3,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true
};
const showSuccess = (message, options = {}) => {
  toast.success(message, { ...toastOptions, ...options });
};
const showError = (message, options = {}) => {
  toast.error(message, { ...toastOptions, ...options });
};
const showInfo = (message, options = {}) => {
  toast.info(message, { ...toastOptions, ...options });
};
const showWarning = (message, options = {}) => {
  toast.warning(message, { ...toastOptions, ...options });
};

export { showWarning as a, showInfo as b, showSuccess as c, showError as s };
