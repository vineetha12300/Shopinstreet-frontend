// src/components/cashier/components/Payment/PaymentModal.tsx
import React from 'react';
import { X, DollarSign, CreditCard, CheckCircle, Printer, Gift, Mail, User } from 'lucide-react';
import { PaymentModalProps } from '../cashier/types/cashier.types';

const PaymentModal: React.FC<PaymentModalProps> = ({
  show,
  step,
  amountToPay,
  amountGiven,
  change,
  paymentMethod,
  paymentTransaction,
  customer,
  isProcessing,
  onClose,
  onSetAmountToPay,
  onSetAmountGiven,
  onSetPaymentMethod,
  onQuickTender,
  onProcessPayment,
  onCompleteSale,
  onShowCustomerModal
}) => {
  if (!show) return null;

  const generateQuickTenderAmounts = () => [
    { label: 'Exact', amount: amountToPay },
    { label: `+₹${Math.ceil(amountToPay / 10) * 10 - amountToPay}`, amount: Math.ceil(amountToPay / 10) * 10 },
    { label: `+₹${Math.ceil(amountToPay / 50) * 50 - amountToPay}`, amount: Math.ceil(amountToPay / 50) * 50 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {step === 'payment' && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-t-2xl">
              <h3 className="text-xl font-bold">Amount to Pay</h3>
              <div className="text-2xl font-bold">₹{amountToPay.toFixed(2)}</div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Pay</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={amountToPay}
                    onChange={(e) => onSetAmountToPay(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none text-lg font-bold transition-all"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">Edit to make a partial payment</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onSetPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 font-medium ${
                      paymentMethod === 'cash'
                        ? 'border-[#1DA1F2] bg-blue-50 text-[#1DA1F2]'
                        : 'border-gray-300 hover:border-[#1DA1F2]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Cash</span>
                  </button>
                  
                  <button
                    onClick={() => onSetPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 font-medium ${
                      paymentMethod === 'card'
                        ? 'border-[#1DA1F2] bg-blue-50 text-[#1DA1F2]'
                        : 'border-gray-300 hover:border-[#1DA1F2]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span>Card</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amount Given by Customer</label>
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={amountGiven}
                      onChange={(e) => onSetAmountGiven(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none text-lg font-bold transition-all"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {generateQuickTenderAmounts().map((tender, index) => (
                      <button
                        key={index}
                        onClick={() => onQuickTender(tender.amount)}
                        className="py-3 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold transition-all border-2 border-transparent hover:border-[#1DA1F2]"
                        style={{ minHeight: '44px' }}
                      >
                        {tender.label}
                      </button>
                    ))}
                  </div>

                  {amountGiven > 0 && (
                    <div className={`p-4 rounded-xl border-2 ${
                      change > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-bold">Change Due:</span>
                        <span className={`text-xl font-bold ${
                          change > 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          ₹{change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-4">
                <button
                  onClick={onShowCustomerModal}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  style={{ minHeight: '44px' }}
                >
                  <User className="h-4 w-4" />
                  {customer.name ? `Customer: ${customer.name}` : 'Add Customer (Optional)'}
                </button>
              </div>

              <div className="space-y-3">
                {paymentMethod === 'cash' && (
                  <button
                    onClick={() => onProcessPayment('cash')}
                    disabled={isProcessing || amountGiven < amountToPay}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      isProcessing || amountGiven < amountToPay
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      'Complete Cash Payment'
                    )}
                  </button>
                )}

                {paymentMethod === 'card' && (
                  <button
                    onClick={() => onProcessPayment('card')}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      isProcessing
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      'Process Card Payment'
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {step === 'success' && paymentTransaction && (
          <>
            <div className="p-6 text-center border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-t-2xl">
              <CheckCircle className="h-20 w-20 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Give ₹{change.toFixed(2)} Change</h3>
              <p className="text-green-100 font-medium">Order #{paymentTransaction.order_number}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">Transaction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Amount:</span>
                    <span className="font-bold">₹{paymentTransaction.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Amount Given:</span>
                    <span className="font-bold">₹{paymentTransaction.amount_given.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Payment Method:</span>
                    <span className="font-bold capitalize">{paymentTransaction.payment_method}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-gray-300 pt-2 mt-2">
                    <span className="text-gray-900 font-bold">Change Due:</span>
                    <span className="text-xl font-bold text-green-600">₹{paymentTransaction.change_due.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 py-4 px-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold"
                  style={{ minHeight: '44px' }}
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => alert('Gift receipt feature coming soon')}
                  className="flex items-center justify-center gap-2 py-4 px-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold"
                  style={{ minHeight: '44px' }}
                >
                  <Gift className="h-4 w-4" />
                  <span>Gift Receipt</span>
                </button>
              </div>

              {customer.email && (
                <button
                  onClick={() => alert('Email receipt sent!')}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold"
                  style={{ minHeight: '44px' }}
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Receipt to {customer.email}</span>
                </button>
              )}

              <button
                onClick={onCompleteSale}
                className="w-full py-4 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ minHeight: '44px' }}
              >
                Complete Sale
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;