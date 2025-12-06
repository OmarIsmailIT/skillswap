import Swal from 'sweetalert2';

// Platform-consistent theme configuration
const platformTheme = {
  confirmButtonColor: '#9333ea', // purple-600
  cancelButtonColor: '#6b7280', // gray-500
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all',
    cancelButton: 'px-6 py-3 rounded-xl font-semibold',
    title: 'text-2xl font-bold',
    htmlContainer: 'text-base',
  },
};

/**
 * Show a success alert
 */
export const showSuccess = async (options: {
  title: string;
  message?: string;
  confirmText?: string;
  showCancelButton?: boolean;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}) => {
  const result = await Swal.fire({
    icon: 'success',
    title: options.title,
    html: options.message,
    confirmButtonText: options.confirmText || 'OK',
    showCancelButton: options.showCancelButton || false,
    cancelButtonText: options.cancelText || 'Cancel',
    ...platformTheme,
    iconColor: '#10b981', // green-500
  });

  if (result.isConfirmed && options.onConfirm) {
    await options.onConfirm();
  } else if (result.isDismissed && options.onCancel) {
    await options.onCancel();
  }

  return result;
};

/**
 * Show an error alert
 */
export const showError = async (options: {
  title: string;
  message: string;
  confirmText?: string;
}) => {
  return await Swal.fire({
    icon: 'error',
    title: options.title,
    html: options.message,
    confirmButtonText: options.confirmText || 'OK',
    ...platformTheme,
    iconColor: '#ef4444', // red-500
  });
};

/**
 * Show a confirmation dialog
 */
export const showConfirm = async (options: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info';
  input?: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'email' | 'url' | 'password' | 'number' | 'tel' | 'range' | 'file';
  inputPlaceholder?: string;
  inputValidator?: (value: string) => Promise<string | null> | string | null;
  preConfirm?: (value: any) => any;
  onConfirm?: (value?: any) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}) => {
  const iconConfig = {
    warning: { icon: 'warning' as const, iconColor: '#f59e0b' }, // amber-500
    danger: { icon: 'warning' as const, iconColor: '#ef4444' }, // red-500
    info: { icon: 'question' as const, iconColor: '#3b82f6' }, // blue-500
  };

  const config = iconConfig[options.variant || 'warning'];

  const result = await Swal.fire({
    ...config,
    title: options.title,
    html: options.message,
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Confirm',
    cancelButtonText: options.cancelText || 'Cancel',
    input: options.input,
    inputPlaceholder: options.inputPlaceholder,
    inputValidator: options.inputValidator,
    preConfirm: options.preConfirm,
    ...platformTheme,
    confirmButtonColor: options.variant === 'danger' ? '#ef4444' : platformTheme.confirmButtonColor,
  } as any);

  if (result.isConfirmed && options.onConfirm) {
    await options.onConfirm(result.value);
  } else if (result.isDismissed && options.onCancel) {
    await options.onCancel();
  }

  return result;
};

/**
 * Show an info alert
 */
export const showInfo = async (options: {
  title: string;
  message: string;
  confirmText?: string;
}) => {
  return await Swal.fire({
    icon: 'info',
    title: options.title,
    html: options.message,
    confirmButtonText: options.confirmText || 'OK',
    ...platformTheme,
    iconColor: '#3b82f6', // blue-500
  });
};

/**
 * Show a loading alert (auto-dismiss)
 */
export const showLoading = (title: string = 'Processing...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close any open SweetAlert
 */
export const closeAlert = () => {
  Swal.close();
};
