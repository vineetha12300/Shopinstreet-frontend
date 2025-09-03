// src/components/cashier/components/RegisterScreen/RegisterScreen.tsx
import React from 'react';
import { Unlock, User } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-3">
            Register Closed
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Set an opening float to open the register and make a sale.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Opening Float */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Float
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={registerForm.opening_float}
                onChange={(e) => handleFloatChange(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] outline-none transition-colors"
                placeholder="200.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Cashier Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cashier Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={registerForm.cashier_name}
                onChange={(e) => handleCashierNameChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] outline-none transition-colors ${
                  registerForm.cashier_name.trim().length === 0 ? 
                  'border-red-300' : 
                  'border-gray-300'
                }`}
                placeholder="Enter cashier name"
                required
              />
            </div>
            {registerForm.cashier_name.trim().length === 0 && (
              <p className="text-xs text-red-500 mt-1">Cashier name is required</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">Optional</span>
            </label>
            <textarea
              value={registerForm.opening_notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] outline-none resize-none transition-colors"
              rows={3}
              placeholder="Enter a note"
              maxLength={255}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {registerForm.opening_notes.length}/255
            </p>
          </div>
        </div>

        {/* Open Register Button */}
        <button
          onClick={onOpenRegister}
          disabled={isLoadingRegister || !isFormValid}
          className={`w-full mt-8 font-medium py-4 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
            isFormValid && !isLoadingRegister
              ? 'bg-[#1DA1F2] hover:bg-[#1a91da] text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoadingRegister ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Opening Register...
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Open Register
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RegisterScreen;