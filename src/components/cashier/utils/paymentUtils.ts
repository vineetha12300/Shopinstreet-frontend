import { PaymentMethod } from '../types/cashier.types';

export const calculateChange = (amountGiven: number, amountToPay: number): number => {
  return Math.max(0, amountGiven - amountToPay);
};

export const generateQuickTenderAmounts = (amountToPay: number) => {
  return [
    { label: 'Exact', amount: amountToPay },
    { label: `+₹${Math.ceil(amountToPay / 10) * 10 - amountToPay}`, amount: Math.ceil(amountToPay / 10) * 10 },
    { label: `+₹${Math.ceil(amountToPay / 50) * 50 - amountToPay}`, amount: Math.ceil(amountToPay / 50) * 50 },
  ];
};

export const validateCashPayment = (amountGiven: number, amountToPay: number): boolean => {
  return amountGiven >= amountToPay;
};

export const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'cash':
      return 'DollarSign';
    case 'card':
      return 'CreditCard';
    case 'digital':
      return 'Receipt';
    default:
      return 'CreditCard';
  }
};
