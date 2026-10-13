import React from 'react';
import { Snackbar, Alert, AlertColor, alpha } from '@mui/material';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface NotificationSnackbarProps {
  notification: NotificationState;
  onClose: () => void;
  autoHideDuration?: number;
}

export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  notification,
  onClose,
  autoHideDuration = 5000,
}) => {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: '8px',
          boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.common.black, 0.12)}`,
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};
