import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

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
        sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};
