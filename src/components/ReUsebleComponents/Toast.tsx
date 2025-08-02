import React, { useEffect, useState } from 'react';
import ToastService from '../../utils/ToastService';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: string;
  onClose: (id: string) => void;
  
}

const Toast: React.FC<ToastProps> = ({ message, type, id, onClose }) => {
  const getBgColor = (): string => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className={`${getBgColor()} text-white px-4 py-3 rounded-lg shadow-lg flex justify-between items-center mb-2`}>
      <span>{message}</span>
      <button 
        onClick={() => onClose(id)} 
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Array<{id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'}>>([]);
  const toastService = ToastService.getInstance();

  useEffect(() => {
    const unsubscribe = toastService.subscribe(newToasts => {
      setToasts(newToasts);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleClose = (id: string): void => {
    toastService.removeToast(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;