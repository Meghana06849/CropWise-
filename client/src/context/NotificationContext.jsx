import { createContext, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = ({ title, message }) => {
    const entry = {
      id: crypto.randomUUID(),
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications((current) => [entry, ...current].slice(0, 50));
  };

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      clearAll
    }),
    [notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
