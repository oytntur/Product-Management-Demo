import notify from 'devextreme/ui/notify';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

const TOAST_POSITION = {
  at: 'bottom right',
  my: 'bottom right',
  offset: { x: -16, y: -16 },
};

const DEFAULT_TOAST_OPTIONS = {
  displayTime: 5000,
  closeOnClick: true,
};

export interface ToastOverrides {
  displayTime?: number;
  closeOnClick?: boolean;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  width?: number;
}

export const showToast = (
  message: string,
  type: ToastType = 'info',
  overrides: ToastOverrides = {}
) => {
  notify({
    message,
    type,
    position: TOAST_POSITION,
    ...DEFAULT_TOAST_OPTIONS,
    ...overrides,
  });
};

export const showErrorToast = (message: string) => showToast(message, 'error');

