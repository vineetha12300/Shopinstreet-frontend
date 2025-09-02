import React from 'react';
import { X, Lock } from 'lucide-react';
import { RegisterCloseModalProps } from '../cashier/types/cashier.types';

const RegisterCloseModal: React.FC<RegisterCloseModalProps> = ({
  show,
  registerForm,
  registerSession,
  isLoading,
  onClose,
  onUpdateForm,
  onCloseRegister
}) => {
  if (!show) return null;

  const expectedAmount = registerSession.opening_float + registerSession.total_cash_sales;
  const variance = registerForm.closing_amount - expectedAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Close Register</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Session Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Opening Float:</span>
                <span className="font-bold">₹{registerSession.opening_float.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Cash Sales:</span>
                <span className="font-bold">₹{registerSession.total_cash_sales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Card Sales:</span>
                <span className="font-bold">₹{registerSession.total_card_sales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-2">
                <span className="text-gray-900 font-bold">Expected Cash:</span>
                <span className="font-bold text-[#1DA1F2]">₹{expectedAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Closing Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                value={registerForm.closing_amount}
                onChange={(e) => onUpdateForm({ closing_amount: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none text-lg font-bold transition-all"
                placeholder="0.00"
                step="0.01"
                style={{ minHeight: '44px' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">Count all cash in drawer</p>
          </div>

          {registerForm.closing_amount > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-[#1DA1F2]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#1DA1F2] font-bold">Variance:</span>
                <span className={`font-bold text-lg ${
                  variance === 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  ₹{variance.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Closing Notes</label>
            <textarea
              value={registerForm.closing_notes}
              onChange={(e) => onUpdateForm({ closing_notes: e.target.value })}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none resize-none transition-all font-medium"
              rows={3}
              placeholder="Any issues or notes for this shift"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-all"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </button>
          <button
            onClick={onCloseRegister}
            disabled={isLoading || registerForm.closing_amount <= 0}
            className="flex-1 px-4 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ minHeight: '44px' }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Closing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Close Register
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterCloseModal;