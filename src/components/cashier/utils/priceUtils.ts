import { CashierProduct, CartItem, StockDisplay } from '../types/cashier.types';
// src/components/cashier/utils/priceUtils.ts
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const calculateSubtotal = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.total_price, 0);
};

export const calculateTaxAmount = (subtotal: number, taxRate: number, taxEnabled: boolean): number => {
  return taxEnabled ? subtotal * taxRate : 0;
};

export const calculateFinalTotal = (
  subtotal: number,
  taxAmount: number,
  discountAmount: number
): number => {
  return subtotal + taxAmount - discountAmount;
};

export const calculateTotalItems = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};