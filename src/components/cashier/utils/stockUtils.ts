// src/components/cashier/utils/stockUtils.ts
import { CashierProduct, CartItem, StockDisplay } from '../types/cashier.types';

export const getAvailableStock = (
  productId: number,
  products: CashierProduct[],
  cart: CartItem[]
): number => {
  const product = products.find(p => p.id === productId);
  const cartItem = cart.find(item => item.product.id === productId);
  const reservedQuantity = cartItem ? cartItem.quantity : 0;
  return (product?.stock || 0) - reservedQuantity;
};

export const getStockDisplay = (
  product: CashierProduct,
  availableStock: number
): StockDisplay => {
  if (availableStock === 0) {
    return {
      badgeType: 'out-of-stock',
      badgeText: 'Out of Stock',
      stockCount: 0,
      disabled: true
    };
  }
  
  if (availableStock <= 5) {
    return {
      badgeType: 'low-stock',
      badgeText: 'Low Stock',
      stockCount: availableStock,
      disabled: false
    };
  }
  
  // Default case - in stock
  return {
    badgeType: 'in-stock',
    badgeText: 'In Stock',
    stockCount: availableStock,
    disabled: false
  };
};

