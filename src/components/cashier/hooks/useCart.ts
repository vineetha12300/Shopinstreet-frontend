// src/components/cashier/hooks/useCart.ts
import { useState, useMemo } from 'react';
import { CartItem, CashierProduct, Customer } from '../types/cashier.types';
import { 
  calculateSubtotal, 
  calculateTaxAmount, 
  calculateFinalTotal, 
  calculateTotalItems 
} from '../utils/priceUtils';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(0.1);

  const cartCalculations = useMemo(() => {
    const subtotal = calculateSubtotal(cart);
    const taxAmount = calculateTaxAmount(subtotal, taxRate, taxEnabled);
    const finalTotal = calculateFinalTotal(subtotal, taxAmount, discountAmount);
    const totalItems = calculateTotalItems(cart);

    return { subtotal, taxAmount, finalTotal, totalItems };
  }, [cart, taxRate, taxEnabled, discountAmount]);

  const addToCart = (product: CashierProduct, availableStock: number) => {
    if (product.stock <= 0 || availableStock <= 0) return;
    
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        updateCartItemQuantity(product.id, existingItem.quantity + 1);
      }
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          total_price: item.unit_price * newQuantity
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer({});
    setDiscountAmount(0);
  };

  return {
    cart,
    customer,
    discountAmount,
    taxEnabled,
    taxRate,
    ...cartCalculations,
    setCustomer,
    setDiscountAmount,
    setTaxEnabled,
    setTaxRate,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart
  };
};