
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

  const handleProcessPayment = async (method: 'cash' | 'card' | 'digital') => {
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

  const handleCompleteSale = () => {
    cart.clearCart();
    payment.completeSale();
  };

  const handleUpdateCustomer = (customer: Customer) => {
    cart.setCustomer(customer);
    setShowCustomerModal(false);
  };

  return {
    // State
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

    // Cart
    ...cart,

    // Register
    ...register,

    // Payment
    ...payment,

    // Setters
    setSearchTerm,
    setSelectedCategory,
    setCurrentPage,
    setShowCustomerModal,
    setShowMobileCart,

    // Handlers
    handleAddToCart,
    handleStartPayment,
    handleProcessPayment,
    handleCompleteSale,
    handleUpdateCustomer,
    loadCashierProducts,
    getAvailableStockForProduct,
    getStockDisplayForProduct
  };
};