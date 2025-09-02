// src/components/cashier/components/shared/RegisterHeader.tsx
import React from 'react';
import { Lock } from 'lucide-react';
import { RegisterHeaderProps } from '../cashier/types/cashier.types';

const RegisterHeader: React.FC<RegisterHeaderProps> = ({
  registerStatus,
  onCloseRegister
}) => {
  if (!registerStatus.register_open || !registerStatus.session) return null;

  const session = registerStatus.session;
  const sessionHours = Math.floor(session.session_duration_minutes / 60);
  const sessionMins = session.session_duration_minutes % 60;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            <span className="font-bold">Register Open</span>
          </div>
          <span className="text-gray-700 font-medium">
            {session.cashier_name} • {sessionHours}h {sessionMins}m
          </span>
          <span className="text-gray-700 font-medium">
            ₹{session.total_sales.toFixed(2)} ({session.transaction_count} sales)
          </span>
        </div>
        <button
          onClick={onCloseRegister}
          className="text-sm text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
        >
          <Lock className="h-4 w-4" />
          Close Register
        </button>
      </div>
    </div>
  );
};

export default RegisterHeader;