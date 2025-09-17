// src/components/cashier/components/Payment/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { X, DollarSign, QrCode, CheckCircle, Printer, Gift, Mail, User, Copy, RotateCcw } from 'lucide-react';
import { PaymentModalProps } from '../cashier/types/cashier.types';

// Types for the new UPI flow
interface UPIPaymentState {
  status: 'idle' | 'pending' | 'paid' | 'failed' | 'timeout';
  qrCode: string;
  upiId: string;
  intentId: string;
  pollingCount: number;
}

// Types for split payments
interface Payment {
  id: string;
  method: 'cash' | 'upi';
  amount: number;
  amountGiven?: number;
  change?: number;
  status: 'completed' | 'pending';
  timestamp: string;
}

// Add these functions at the top of PaymentModal.tsx, after imports and before the component

// Check if register is open
const checkRegisterStatus = async (vendorId: number) => {
  try {
    const response = await fetch(`http://localhost:8000/api/cashier/register-status/${vendorId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking register status:', error);
    return { register_open: false };
  }
};

// Open register if neede
const openRegister = async (vendorId: number, cashierName: string, openingFloat: number = 0) => {
  try {
    const response = await fetch(`http://localhost:8000/api/cashier/register/open?vendor_id=${vendorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opening_float: openingFloat,
        cashier_name: cashierName,
        register_name: "Main Register",
        opening_notes: "Register opened for sales"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    return await response.json();
  } catch (error) {
    console.error('Error opening register:', error);
    throw error;
  }
};



const PaymentModal: React.FC<PaymentModalProps & { orderNote?: string; vendorId: number }> = ({
  show,
  step,
  amountToPay,
  amountGiven,
  change,
  paymentMethod,
  paymentTransaction,
  customer,
  isProcessing,
  cart = [],
  subtotal = 0,
  taxAmount = 0,
  taxRate = 0,
  discountAmount = 0,
  orderNote='',
  vendorId, // ADD THIS LINE
  onClose,
  onSetAmountToPay,
  onSetAmountGiven,
  onSetPaymentMethod,
  onQuickTender,
  onProcessPayment,
  onCompleteSale,
  onShowCustomerModal
}) => {
  const [showPartialPaymentEdit, setShowPartialPaymentEdit] = useState(false);
  const [customAmount, setCustomAmount] = useState(amountToPay);
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [upiState, setUpiState] = useState<UPIPaymentState>({
    status: 'idle',
    qrCode: '',
    upiId: '',
    intentId: '',
    pollingCount: 0
  });

  // Split payment state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(amountToPay);
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [cashAmountGiven, setCashAmountGiven] = useState(0);
  const [showUPIDialog, setShowUPIDialog] = useState(false);
  // Initialize and calculate remaining amount
  // Replace the existing useEffect that sets remainingAmount
useEffect(() => {
  if (show && step === 'payment') {
    // Calculate the actual sale total
    const calculatedTotal = subtotal - discountAmount + taxAmount;
    
    setPayments([]);
    setRemainingAmount(calculatedTotal); // Use calculated total instead of amountToPay
    setCurrentPaymentAmount(calculatedTotal);
    setUpiState({
      status: 'idle',
      qrCode: '',
      upiId: '',
      intentId: '',
      pollingCount: 0
    });
  }
}, [show, step, subtotal, discountAmount, taxAmount]); // Add dependencies

// Also update the other useEffect
useEffect(() => {
  if (show) {
    const calculatedTotal = subtotal - discountAmount + taxAmount; // Use calculated total
    const totalPaid = payments.reduce((sum, payment) => 
      payment.status === 'completed' ? sum + payment.amount : sum, 0
    );
    const remaining = calculatedTotal - totalPaid; // Use calculated total
    setRemainingAmount(remaining);
    
    if (currentPaymentAmount === 0 && remaining > 0) {
      setCurrentPaymentAmount(remaining);
    }
  }
}, [show, payments, subtotal, discountAmount, taxAmount]); // Updated dependencies



  // Add payment tracking function
  const addPayment = (method: 'cash' | 'upi', amount: number, status: 'completed' | 'pending' = 'completed', amountGiven?: number) => {
    const payment: Payment = {
      id: `payment_${Date.now()}`,
      method,
      amount,
      amountGiven,
      change: amountGiven ? Math.max(0, amountGiven - amount) : undefined,
      status,
      timestamp: new Date().toISOString()
    };
    
    setPayments(prev => [...prev, payment]);
    
    // Update remaining amount
    const newRemainingAmount = remainingAmount - amount;
    setRemainingAmount(newRemainingAmount);
    
    // Set next payment amount to remaining amount
    setCurrentPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount : 0);
    
    // Reset UPI state
    setUpiState({
      status: 'idle',
      qrCode: '',
      upiId: '',
      intentId: '',
      pollingCount: 0
    });
  };

  // Generate quick tender amounts with better logic
  const generateQuickTenderAmounts = (total: number) => {
    const amounts = [
      { label: 'Exact', amount: total }
    ];
    
    // Add rounded amounts
    const nextTen = Math.ceil(total / 10) * 10;
    const nextFifty = Math.ceil(total / 50) * 50;
    const nextHundred = Math.ceil(total / 100) * 100;
    
    if (nextTen > total && nextTen <= total + 50) {
      amounts.push({ label: `+₹${nextTen - total}`, amount: nextTen });
    }
    if (nextFifty > total && nextFifty !== nextTen && nextFifty <= total + 100) {
      amounts.push({ label: `+₹${nextFifty - total}`, amount: nextFifty });
    }
    if (nextHundred > total && nextHundred !== nextFifty && nextHundred <= total + 200) {
      amounts.push({ label: `+₹${nextHundred - total}`, amount: nextHundred });
    }
    
    return amounts.slice(0, 4); // Max 4 options
  };

  // Mock UPI payment creation
  // Enhanced createUPIPayment function with debugging
// Fixed createUPIPayment function - replace your existing one with this
// Modified createUPIPayment - remove automatic polling
const copyUPIId = () => {
  navigator.clipboard.writeText(upiState.upiId);
  // Optional: Show a toast or alert
  console.log('UPI ID copied to clipboard');
};

const createUPIPayment = async (amount: number) => {
  console.log('createUPIPayment called with amount:', amount);
  
  try {
    const intentId = `upi_${Date.now()}`;
    console.log('Generated intentId:', intentId);
    
    // Simple SVG without special characters
    const mockQR = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="black">UPI QR</text>
        <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="10" fill="black">Rs ${amount}</text>
      </svg>
    `)}`;
    
    console.log('Setting UPI state to pending...');
    setUpiState({
      status: 'pending',
      qrCode: mockQR,
      upiId: 'merchant@paytm',
      intentId,
      pollingCount: 0
    });
    
    console.log('QR generated, waiting for manual confirmation...');
  } catch (error) {
    console.error('Error in createUPIPayment:', error);
  }
};

const confirmUPIPayment = () => {
  console.log('Manual UPI payment confirmation');
  setUpiState(prev => ({ ...prev, status: 'paid' }));
  addPayment('upi', currentPaymentAmount, 'completed');
};

const cancelUPIPayment = () => {
  console.log('UPI payment cancelled');
  setUpiState({
    status: 'idle',
    qrCode: '',
    upiId: '',
    intentId: '',
    pollingCount: 0
  });
  setSelectedPaymentMethod('cash');
};






{selectedPaymentMethod === 'upi' && upiState.status !== 'idle' && (
  <div className="border border-gray-200 rounded-lg p-6 space-y-4">
    {upiState.status === 'pending' && (
      <>
        <div className="text-center">
          <img 
            src={upiState.qrCode} 
            alt="UPI QR Code" 
            className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
          />
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">UPI ID:</span>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{upiState.upiId}</code>
            <button
              onClick={copyUPIId}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-lg font-bold text-blue-600">₹{currentPaymentAmount.toFixed(2)}</div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Waiting for customer payment...
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Ask customer to scan QR code or use UPI ID to pay
          </p>
          
          {/* Manual Confirmation Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={cancelUPIPayment}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={confirmUPIPayment}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Payment Received
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-400">
            Click "Payment Received" after customer completes the payment
          </div>
        </div>
      </>
    )}

    {upiState.status === 'paid' && (
      <div className="text-center text-green-600">
        <CheckCircle className="h-12 w-12 mx-auto mb-2" />
        <p className="font-medium">Payment Confirmed!</p>
        <p className="text-sm text-gray-600">₹{currentPaymentAmount.toFixed(2)} received via UPI</p>
      </div>
    )}
  </div>
)}


  

  const retryUPIPayment = () => {
    createUPIPayment(currentPaymentAmount || remainingAmount);
  };


  // Handle cash payment
  const handleCashPayment = () => {
    if (cashAmountGiven >= currentPaymentAmount) {
      addPayment('cash', currentPaymentAmount, 'completed', cashAmountGiven);
      setCashAmountGiven(0);
      setShowCashDialog(false);
    }
  };

  // Complete sale when fully paid
  // In PaymentModal.tsx - update handleCompleteSale (line 280)
  const handleCompleteSale = async () => {
  if (remainingAmount <= 0) {
    try {
      // Check if register is open first
      const registerStatus = await checkRegisterStatus(vendorId);
      
      if (!registerStatus.register_open) {
        // Prompt to open register
        const shouldOpen = confirm('Register is not open. Would you like to open it now?');
        if (shouldOpen) {
          const cashierName = prompt('Enter cashier name:') || 'Cashier';
          const openingFloat = parseFloat(prompt('Enter opening float amount:') || '0');
          
          await openRegister(vendorId, cashierName, openingFloat);
          alert('Register opened successfully!');
        } else {
          alert('Cannot process sales without an open register.');
          return;
        }
      }

      // Now proceed with the sale
      const totalAmountGiven = payments.reduce((sum, p) => sum + (p.amountGiven || p.amount), 0);
      const primaryMethod = payments.length > 1 ? 'cash' : (payments[0]?.method || 'cash');
      
      const response = await fetch('http://localhost:8000/api/cashier/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.unit_price * item.quantity
          })),
          customer: Object.keys(customer).length > 0 ? customer : null,
          payment_method: primaryMethod,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          subtotal: subtotal,
          total_amount: amountToPay,
          notes: orderNote
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Payment processing failed');
      }

      const result = await response.json();
      console.log('Sale completed successfully:', result);
      
      onCompleteSale();
      
    } catch (error) {
      console.error('Failed to complete sale:', error);
      alert(`Error saving sale: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
  // Quick amount buttons for partial payments
  const getQuickAmountButtons = () => {
    const suggestions = [];
    const remaining = remainingAmount;
    
    // Add some percentage-based suggestions
    if (remaining > 20) {
      suggestions.push({ label: '₹50', amount: Math.min(50, remaining) });
    }
    if (remaining > 50) {
      suggestions.push({ label: '₹100', amount: Math.min(100, remaining) });
    }
    if (remaining > 100) {
      suggestions.push({ label: 'Half', amount: Math.round(remaining / 2) });
    }
    
    suggestions.push({ label: 'Full', amount: remaining });
    
    return suggestions;
  };

  if (!show) return null;

  // Cash sub-modal - updated for split payments
  if (showCashDialog) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Cash Payment</h3>
            <div className="text-xl font-bold">₹{currentPaymentAmount.toFixed(2)}</div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount given by customer
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={cashAmountGiven || ''}
                  onChange={(e) => setCashAmountGiven(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="0.00"
                  inputMode="decimal"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {generateQuickTenderAmounts(currentPaymentAmount).map((tender, index) => (
                <button
                  key={index}
                  onClick={() => setCashAmountGiven(tender.amount)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200 hover:border-gray-300 min-h-[44px]"
                >
                  {tender.label}
                </button>
              ))}
            </div>

            {cashAmountGiven > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Change due:</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{Math.max(0, cashAmountGiven - currentPaymentAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={() => {
                setShowCashDialog(false);
                setCashAmountGiven(0);
              }}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleCashPayment}
              disabled={cashAmountGiven < currentPaymentAmount}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Add Payment
            </button>
          </div>
        </div>
      </div>
    );
  }
if (showUPIDialog) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">UPI Payment</h3>
          <div className="text-xl font-bold text-blue-600">₹{currentPaymentAmount.toFixed(2)}</div>
        </div>
        
        {/* Show QR Code if payment is created, otherwise show start button */}
        {upiState.status === 'idle' ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <p className="text-gray-700 mb-2">Ready to generate UPI QR code?</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <strong>Amount:</strong> ₹{currentPaymentAmount.toFixed(2)}<br/>
                  <strong>UPI ID:</strong> merchant@paytm
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUPIDialog(false);
                  setSelectedPaymentMethod('cash');
                }}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => createUPIPayment(currentPaymentAmount)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Generate QR Code
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* QR Code Display */}
            {upiState.status === 'pending' && (
              <>
                <div className="text-center">
                  <img 
                    src={upiState.qrCode} 
                    alt="UPI QR Code" 
                    className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                  />
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">UPI ID:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{upiState.upiId}</code>
                    <button
                      onClick={copyUPIId}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-lg font-bold text-blue-600">₹{currentPaymentAmount.toFixed(2)}</div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Waiting for customer payment...
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Ask customer to scan QR code or use UPI ID to pay
                  </p>
                </div>

                {/* Manual Confirmation Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUPIDialog(false);
                      setUpiState({
                        status: 'idle',
                        qrCode: '',
                        upiId: '',
                        intentId: '',
                        pollingCount: 0
                      });
                      setSelectedPaymentMethod('cash');
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setUpiState(prev => ({ ...prev, status: 'paid' }));
                      addPayment('upi', currentPaymentAmount, 'completed');
                      setShowUPIDialog(false);
                    }}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Payment Received
                  </button>
                </div>
                
                <div className="text-xs text-gray-400 text-center">
                  Click "Payment Received" after customer completes the payment
                </div>
              </>
            )}

            {/* Payment Confirmed */}
            {upiState.status === 'paid' && (
              <div className="text-center text-green-600">
                <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="font-medium">Payment Confirmed!</p>
                <p className="text-sm text-gray-600 mb-4">₹{currentPaymentAmount.toFixed(2)} received via UPI</p>
                <button
                  onClick={() => setShowUPIDialog(false)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Lightspeed Style: Two-column layout on desktop, full-screen on mobile */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-3xl sm:rounded-lg shadow-2xl flex flex-col sm:max-h-[90vh]">
        
        {step === 'payment' && (
          <>
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side: Order Summary (Lightspeed Style) */}
              <div className="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
                
                <div className="p-6 flex-1 overflow-y-auto">
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Sale</h3>
                      <button
                        onClick={onClose}
                        className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-all"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
    
                    {cart.map((item, index) => (
                      <div key={item.product.id || index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-6 text-center text-sm font-medium text-gray-600">
                            {item.quantity}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 ml-4">
                          ₹{(item.unit_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-green-600">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                        <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {orderNote && (
                      <div className="border border-gray-200 rounded-lg p-3 bg-yellow-50">
                        <div className="text-xs text-gray-600 font-medium mb-1">Order Note:</div>
                        <div className="text-sm text-gray-800">{orderNote}</div>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                      <span>SALE TOTAL</span>
                      <span>₹{(subtotal - discountAmount + taxAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Sale Summary Footer */}
                <div className="border-t border-gray-200 p-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      <span>Total: ₹{amountToPay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Payment Panel */}
              <div className="w-1/2 flex flex-col">
                {/* Remaining Amount Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {remainingAmount <= 0 ? 'Payment Complete!' : 'Amount to Pay'}
                    </h3>
                    <div className={`text-2xl font-bold ${remainingAmount <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{remainingAmount.toFixed(2)}
                    </div>
                  </div>
                  {payments.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Total: ₹{amountToPay.toFixed(2)} | Paid: ₹{(amountToPay - remainingAmount).toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                  {/* Payment History */}
                  {payments.length > 0 && (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Payments Made
                      </h4>
                      <div className="space-y-2">
                        {payments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-medium">{payment.method}</span>
                              {payment.change && payment.change > 0 && (
                                <span className="text-xs text-green-600">(Change: ₹{payment.change.toFixed(2)})</span>
                              )}
                            </div>
                            <span className="font-bold text-green-700">₹{payment.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-green-200 pt-2 mt-2">
                          <div className="flex justify-between font-bold text-green-800">
                            <span>Total Paid:</span>
                            <span>₹{payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Payment Section */}
                  {remainingAmount > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium flex items-center justify-between">
                        Add Payment
                        <span className="text-sm text-gray-500">Remaining: ₹{remainingAmount.toFixed(2)}</span>
                      </h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            value={currentPaymentAmount || ''}
                            onChange={(e) => setCurrentPaymentAmount(Math.min(parseFloat(e.target.value) || 0, remainingAmount))}
                            max={remainingAmount}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder={remainingAmount.toFixed(2)}
                          />
                        </div>
                        
                        {/* Quick amount buttons */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getQuickAmountButtons().map((btn, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPaymentAmount(btn.amount)}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            if (currentPaymentAmount > 0) {
                              setSelectedPaymentMethod('cash');
                              setShowCashDialog(true);
                            }
                          }}
                          disabled={currentPaymentAmount <= 0}
                          className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <DollarSign className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-sm font-medium">Cash</span>
                        </button>
                        
                        



<button
  onClick={() => {
    console.log('UPI button clicked');
    if (currentPaymentAmount > 0) {
      setSelectedPaymentMethod('upi');
      setShowUPIDialog(true); // Open UPI modal instead of creating payment immediately
    }
  }}
  disabled={currentPaymentAmount <= 0}
  className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
  <QrCode className="h-6 w-6 mx-auto mb-1" />
  <span className="text-sm font-medium">UPI</span>
</button>
                      </div>
                    </div>
                  )}

                  {/* Complete Sale Button */}
                  {remainingAmount <= 0 && (
                    <button
                      onClick={handleCompleteSale}
                      className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Complete Sale
                    </button>
                  )}

                  {/* UPI Payment Flow */}
                  {selectedPaymentMethod === 'upi' && upiState.status !== 'idle' && (
                    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                      {upiState.status === 'pending' && (
                        <>
                          <div className="text-center">
                            <img 
                              src={upiState.qrCode} 
                              alt="UPI QR Code" 
                              className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                            />
                            <div className="mt-4 flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-600">UPI ID:</span>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{upiState.upiId}</code>
                              <button
                                onClick={copyUPIId}
                                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-2 text-lg font-bold text-blue-600">₹{currentPaymentAmount.toFixed(2)}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              Awaiting payment...
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Scan QR code or use UPI ID • {Math.max(0, 90 - upiState.pollingCount * 2)}s remaining
                            </p>
                          </div>
                        </>
                      )}

                      {upiState.status === 'paid' && (
                        <div className="text-center text-green-600">
                          <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                          <p className="font-medium">Payment Received!</p>
                          <p className="text-sm text-gray-600">₹{currentPaymentAmount.toFixed(2)} paid via UPI</p>
                        </div>
                      )}

                      {(upiState.status === 'failed' || upiState.status === 'timeout') && (
                        <div className="text-center space-y-3">
                          <div className="text-red-600">
                            <X className="h-12 w-12 mx-auto mb-2" />
                            <p className="font-medium">
                              {upiState.status === 'timeout' ? 'Payment Timeout' : 'Payment Failed'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {upiState.status === 'timeout' 
                                ? 'No payment received within time limit' 
                                : 'Unable to process payment'}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={retryUPIPayment}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Retry
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPaymentMethod('cash');
                                setShowCashDialog(true);
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              Switch to Cash
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Customer */}
                  <button
                    onClick={onShowCustomerModal}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-sm font-medium min-h-[44px]"
                  >
                    <User className="h-4 w-4" />
                    {customer.name ? `Customer: ${customer.name}` : 'Add a customer to pay with the following options:'}
                  </button>

                  {/* Customer Payment Options (when customer is added) */}
                  {customer.name && (
                    <div className="grid grid-cols-3 gap-2">
                      <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors text-center min-h-[44px]">
                        Layby
                      </button>
                      <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors text-center min-h-[44px]">
                        Store Credit
                      </button>
                      <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors text-center min-h-[44px]">
                        On Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && paymentTransaction && (
          <>
            <div className="p-6 text-center border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-400 text-white">
              <CheckCircle className="h-20 w-20 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Give ₹{change.toFixed(2)} Change</h3>
              <p className="text-green-100 font-medium">Order #{paymentTransaction.order_number}</p>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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
                  className="flex items-center justify-center gap-2 py-4 px-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold min-h-[44px]"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => alert('Gift receipt feature coming soon')}
                  className="flex items-center justify-center gap-2 py-4 px-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold min-h-[44px]"
                >
                  <Gift className="h-4 w-4" />
                  <span>Gift Receipt</span>
                </button>
              </div>

              {customer.email && (
                <button
                  onClick={() => alert('Email receipt sent!')}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold min-h-[44px]"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Receipt to {customer.email}</span>
                </button>
              )}
            </div>

            <div className="p-6 pt-0 flex-shrink-0">
              <button
                onClick={onCompleteSale}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
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