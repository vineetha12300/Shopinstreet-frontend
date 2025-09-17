
// src/components/cashier/hooks/useCashier.ts
import { useState, useEffect, useMemo } from 'react';
import { CashierProduct, Customer } from '../types/cashier.types';
import { filterProducts, paginateProducts } from '../utils/searchUtils';
import { getAvailableStock, getStockDisplay } from '../utils/stockUtils';
import { useCart } from './useCart';
import { useRegister } from './useRegister';
import { usePayment } from './usePayment';

const PRODUCTS_PER_PAGE = 12;

export const useCashier = (vendorId: number) => {
  // State
  const [products, setProducts] = useState<CashierProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  // Advanced cart calculations state (add after existing state)
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [taxSettings, setTaxSettings] = useState<{name: string; rate: number}[]>([]);
  const [orderNote, setOrderNote] = useState('');
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [promoCode, setPromoCode] = useState('');
  // Mobile state
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Custom hooks
  const cart = useCart();
  const register = useRegister(vendorId);
  const payment = usePayment(vendorId);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load initial data
  useEffect(() => {
    register.checkRegisterStatus();
  }, [vendorId]);

  useEffect(() => {
    loadCashierProducts();
  }, [vendorId]);

  const loadCashierProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/cashier/dashboard/${vendorId}`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products);
        setCategories(data.categories);
      } else {
        console.error('Failed to load products:', data.detail);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Filtered and paginated products
  const { filteredProducts, paginatedProducts, totalPages } = useMemo(() => {
    const filtered = filterProducts(products, searchTerm, selectedCategory);
    const paginated = paginateProducts(filtered, currentPage, PRODUCTS_PER_PAGE);
    
    return {
      filteredProducts: filtered,
      paginatedProducts: paginated.products,
      totalPages: paginated.totalPages
    };
  }, [products, searchTerm, selectedCategory, currentPage]);

  // Advanced cart calculations
const advancedCartCalculations = useMemo(() => {
  const baseSubtotal = cart.subtotal;
  const calculatedDiscountAmount = appliedDiscount;
  const discountedSubtotal = baseSubtotal - calculatedDiscountAmount;
  
  // Calculate custom taxes
  const calculatedTaxAmount = taxSettings.reduce((sum, tax) => 
    sum + (discountedSubtotal * tax.rate / 100), 0
  );
  
  const calculatedFinalTotal = baseSubtotal - calculatedDiscountAmount + calculatedTaxAmount;
  
  return {
    calculatedSubtotal: baseSubtotal,
    calculatedDiscountAmount,
    calculatedTaxAmount,
    calculatedFinalTotal
  };
}, [cart.subtotal, appliedDiscount, taxSettings]);

// Discount and tax management functions
const handleApplyDiscount = () => {
  if (discount.value > 0) {
    setAppliedPromo('');
    
    if (discount.type === 'percentage') {
      const discountValue = (cart.subtotal * discount.value) / 100;
      setAppliedDiscount(discountValue);
    } else {
      setAppliedDiscount(Math.min(discount.value, cart.subtotal));
    }
  }
};

const handleApplyPromoCode = () => {
  if (promoCode === 'SAVE10') {
    setAppliedDiscount(cart.subtotal * 0.1);
    setAppliedPromo(promoCode);
    setDiscount({ type: 'percentage', value: 0 });
  } else if (promoCode === 'FLAT50') {
    setAppliedDiscount(50);
    setAppliedPromo(promoCode);
    setDiscount({ type: 'percentage', value: 0 });
  }
  setPromoCode('');
};

const resetCartState = () => {
  setAppliedDiscount(0);
  setAppliedPromo('');
  setDiscount({ type: 'percentage', value: 0 });
  setPromoCode('');
  setOrderNote('');
  setTaxSettings([]);
};

  // Helper functions
  const getAvailableStockForProduct = (productId: number) => {
    return getAvailableStock(productId, products, cart.cart);
  };

  const getStockDisplayForProduct = (product: CashierProduct) => {
    const availableStock = getAvailableStockForProduct(product.id);
    return getStockDisplay(product, availableStock);
  };

  const handleAddToCart = (product: CashierProduct) => {
    const availableStock = getAvailableStockForProduct(product.id);
    cart.addToCart(product, availableStock);
  };

  const handleStartPayment = () => {
    payment.startPayment(cart.finalTotal);
    if (isMobile) setShowMobileCart(false);
  };

  const handleProcessPayment = async (method: 'cash' | 'card' | 'digital' | 'upi') => {
    const result = await payment.processPaymentFlow(
      method,
      cart.cart,
      cart.customer,
      cart.taxAmount,
      cart.taxRate,
      cart.taxEnabled,
      cart.discountAmount,
      cart.subtotal
    );

    if (result.success) {
      loadCashierProducts();
      await register.checkRegisterStatus();
      return result;
    }

    return result;
  };

 // In useCashier.ts - replace handleCompleteSale
const handleCompleteSale = async (transactionData?: any) => {
  try {
    if (transactionData) {
      // Use the new transaction processor
      const result = await payment.processTransactionData(
        transactionData,
        cart.cart,
        cart.customer,
        advancedCartCalculations.calculatedTaxAmount,
        0, // taxRate - get from your tax settings
        false, // taxEnabled - determine based on your logic
        advancedCartCalculations.calculatedDiscountAmount,
        advancedCartCalculations.calculatedSubtotal,
        vendorId,
        orderNote
      );
      
      if (!result.success) {
        console.error('Failed to process payment:', result.error);
        alert(`Error processing payment: ${result.error}`);
        return;
      }

      // Reload data after successful transaction
      await loadCashierProducts();
      await register.checkRegisterStatus();
    }

    // Clear frontend state
    cart.clearCart();
    payment.completeSale();
    resetCartState();
    
  } catch (error) {
    console.error('Error completing sale:', error);
    alert('Error saving sale. Please try again.');
  }
};

  const resetDiscount = () => {
  setAppliedDiscount(0);
  setAppliedPromo('');
  setDiscount({ type: 'percentage', value: 0 });
};

const resetPromo = () => {
  setAppliedDiscount(0);
  setAppliedPromo('');
  setPromoCode('');
};
  const handleUpdateCustomer = (customer: Customer) => {
    cart.setCustomer(customer);
    setShowCustomerModal(false);
  };

  const resetNote = () => {
  setOrderNote('');
};

  return {
  // Existing state
  products: paginatedProducts,
  categories,
  searchTerm,
  selectedCategory,
  currentPage,
  totalPages,
  showCustomerModal,
  showMobileCart,
  isMobile,
  filteredProductsCount: filteredProducts.length,

  // Cart (original)
  ...cart,

  // Advanced cart calculations (override basic ones)
  subtotal: advancedCartCalculations.calculatedSubtotal,
  taxAmount: advancedCartCalculations.calculatedTaxAmount,
  discountAmount: advancedCartCalculations.calculatedDiscountAmount,
  finalTotal: advancedCartCalculations.calculatedFinalTotal,

  // Discount and tax state
  appliedDiscount,
  appliedPromo,
  taxSettings,
  orderNote,
  discount,
  promoCode,
  resetDiscount,
  resetPromo,
  resetNote,
  // Register
  ...register,

  // Payment
  ...payment,

  // Existing setters
  setSearchTerm,
  setSelectedCategory,
  setCurrentPage,
  setShowCustomerModal,
  setShowMobileCart,

  // New setters
  setAppliedDiscount,
  setAppliedPromo,
  setTaxSettings,
  setOrderNote,
  setDiscount,
  setPromoCode,

  // Handlers
  handleAddToCart,
  handleStartPayment,
  handleProcessPayment,
  handleCompleteSale,
  handleUpdateCustomer,
  loadCashierProducts,
  getAvailableStockForProduct,
  getStockDisplayForProduct,
  handleApplyDiscount,
  handleApplyPromoCode,
  resetCartState
};

};