import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationSnackbar, NotificationState } from '@/shared/ui/NotificationSnackbar';

interface NotificationContextValue {
  notification: NotificationState;
  notify: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const notify = useCallback(
    (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, notify, closeNotification }}>
      {children}
      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
};

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
