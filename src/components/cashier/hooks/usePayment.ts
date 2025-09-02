import { useState } from 'react';
import { 
  PaymentMethod, 
  PaymentStep, 
  PaymentTransaction, 
  CheckoutData,
  Customer,
  CartItem
} from '../types/cashier.types';
import { calculateChange } from '../utils/paymentUtils';

export const usePayment = (vendorId: number) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountToPay, setAmountToPay] = useState(0);
  const [amountGiven, setAmountGiven] = useState(0);
  const [change, setChange] = useState(0);
  const [paymentTransaction, setPaymentTransaction] = useState<PaymentTransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startPayment = (finalTotal: number) => {
    setAmountToPay(finalTotal);
    setAmountGiven(0);
    setChange(0);
    setPaymentStep('payment');
    setShowPaymentModal(true);
  };

  const setQuickTender = (amount: number) => {
    setAmountGiven(amount);
    setChange(calculateChange(amount, amountToPay));
  };

  const updateAmountGiven = (amount: number) => {
    setAmountGiven(amount);
    setChange(calculateChange(amount, amountToPay));
  };

  const processPaymentFlow = async (
    method: PaymentMethod,
    cart: CartItem[],
    customer: Customer,
    taxAmount: number,
    taxRate: number,
    taxEnabled: boolean,
    discountAmount: number,
    subtotal: number
  ) => {
    if (cart.length === 0) return { success: false, error: 'Cart is empty' };

    if (method === 'cash' && amountGiven < amountToPay) {
      return { 
        success: false, 
        error: `Insufficient amount. Need ₹${(amountToPay - amountGiven).toFixed(2)} more.` 
      };
    }

    setIsProcessing(true);
    
    try {
      const checkoutData: CheckoutData = {
        vendor_id: vendorId,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        })),
        customer: Object.keys(customer).length > 0 ? customer : null,
        payment_method: method,
        tax_amount: taxEnabled ? taxAmount : 0,
        tax_rate: taxEnabled ? taxRate : 0,
        tax_enabled: taxEnabled,
        discount_amount: discountAmount,
        subtotal: subtotal,
        total_amount: amountToPay
      };

      const response = await fetch('http://localhost:8000/api/cashier/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });

      const result = await response.json();

      if (response.ok) {
        const transaction = {
          ...result,
          amount_given: amountGiven,
          change_due: change,
          payment_method: method
        };
        
        setPaymentTransaction(transaction);
        
        if (method === 'cash') {
          setPaymentStep('success');
        }
        
        return { success: true, transaction };
      } else {
        return { success: false, error: result.detail };
      }
    } catch (error) {
      console.error('Payment error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsProcessing(false);
    }
  };

  const completeSale = () => {
    setShowPaymentModal(false);
    setPaymentStep('payment');
    setPaymentTransaction(null);
    setAmountGiven(0);
    setChange(0);
  };

  return {
    showPaymentModal,
    paymentStep,
    paymentMethod,
    amountToPay,
    amountGiven,
    change,
    paymentTransaction,
    isProcessing,
    setShowPaymentModal,
    setPaymentMethod,
    setAmountToPay,
    startPayment,
    setQuickTender,
    updateAmountGiven,
    processPaymentFlow,
    completeSale
  };
};
