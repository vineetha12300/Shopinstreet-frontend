// src/components/cashier/components/RegisterScreen/RegisterScreen.tsx
import React from 'react';
import { Receipt, Unlock } from 'lucide-react';
import { RegisterScreenProps } from '../cashier/types/cashier.types';

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  registerForm,
  isLoadingRegister,
  onUpdateForm,
  onOpenRegister
}) => {
  const handleFloatChange = (value: string) => {
    onUpdateForm({ opening_float: parseFloat(value) || 0 });
  };

  const handleCashierNameChange = (value: string) => {
    onUpdateForm({ cashier_name: value });
  };

  const handleNotesChange = (value: string) => {
    onUpdateForm({ opening_notes: value });
  };

  const isFormValid = registerForm.cashier_name.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1DA1F2] to-[#0EA5E9] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Receipt className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Closed</h2>
          <p className="text-gray-600 text-sm">Set an opening float to open the register and start making sales.</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Opening Float</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                value={registerForm.opening_float}
                onChange={(e) => handleFloatChange(e.target.value)}
                className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none text-lg font-medium transition-all"
                placeholder="200.00"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cashier Name</label>
            <input
              type="text"
              value={registerForm.cashier_name}
              onChange={(e) => handleCashierNameChange(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none font-medium transition-all"
              placeholder="Enter cashier name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={registerForm.opening_notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none resize-none transition-all"
              rows={3}
              placeholder="Any notes for this shift"
              maxLength={255}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {registerForm.opening_notes.length}/255
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRegister}
          disabled={isLoadingRegister || !isFormValid}
          className="w-full bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoadingRegister ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Opening Register...
            </>
          ) : (
            <>
              <Unlock className="h-5 w-5" />
              Open Register
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RegisterScreen;