type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

let toastFn: ((message: string, options?: ToastOptions) => void) | null = null;

export const setToastFunction = (fn: typeof toastFn) => {
  toastFn = fn;
};

export const toast = (message: string, options: ToastOptions = {}) => {
  if (toastFn) {
    toastFn(message, options);
  } else {
    console.warn('Toast function not initialized');
  }
}; 