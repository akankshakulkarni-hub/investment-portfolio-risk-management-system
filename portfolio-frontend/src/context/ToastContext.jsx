import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const success = (msg) => toast.success(msg, { duration: 3000 });
  const error = (msg) => toast.error(msg, { duration: 4000 });
  const info = (msg) => toast(msg, { icon: 'ℹ️', duration: 3000 });

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);