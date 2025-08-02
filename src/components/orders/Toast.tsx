// Toast.tsx - Notification toast component
import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div 
      className={`fixed top-4 right-4 z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white px-4 py-3 rounded shadow-lg flex items-center`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;