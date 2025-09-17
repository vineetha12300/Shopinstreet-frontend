// src/components/cashier/types/cashier.types.ts
import React from 'react';

export interface RegisterSession {
  id: number;
  vendor_id: number;
  register_name: string;
  cashier_name: string;
  opening_float: number;
  total_sales: number;
  total_cash_sales: number;
  total_card_sales: number;
  total_digital_sales: number;
  transaction_count: number;
  status: string;
  opened_at: string;
  closed_at?: string;
  session_duration_minutes: number;
}

export interface RegisterStatus {
  register_open: boolean;
  session: RegisterSession | null;
}

export interface CashierProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  sku?: string;
  barcode?: string;
}

export interface CartItem {
  product: CashierProduct;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

export interface RegisterForm {
  opening_float: number;
  cashier_name: string;
  register_name: string;
  opening_notes: string;
  closing_amount: number;
  closing_notes: string;
}

export interface PaymentTransaction {
  order_id: number;
  order_number: string;
  total_amount: number;
  payment_method: string;
  items_count: number;
  register_session_id: number;
  created_at: string;
  amount_given: number;
  change_due: number;
}

export interface CheckoutData {
  vendor_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  customer: Customer | null;
  payment_method: string;
  tax_amount: number;
  tax_rate: number;
  tax_enabled: boolean;
  discount_amount: number;
  subtotal: number;
  total_amount: number;
  notes: string;
}

export interface StockDisplay {
  badgeType: 'out-of-stock' | 'low-stock' | 'in-stock';
  badgeText: string;
  stockCount: number;
  disabled: boolean;
}

export type PaymentMethod = 'cash' | 'card' | 'digital' | 'upi';
export type PaymentStep = 'payment' | 'success';
export type RegisterOperation = 'open' | 'close';

export interface CashierDashboardProps {
  vendorId: number;
}

export interface ProductGridProps {
  products: CashierProduct[];
  onAddToCart: (product: CashierProduct) => void;
  getStockDisplay: (product: CashierProduct) => StockDisplay;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile: boolean;
}

export interface CartPanelProps {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  taxAmount: number;
  taxEnabled: boolean;
  taxRate: number;
  discountAmount: number;
  finalTotal: number;
  customer: Customer;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onShowCustomerModal: () => void;
  onStartPayment: () => void;
  getAvailableStock: (productId: number) => number;
}

// Update this interface in your cashier.types.ts file:

export interface PaymentModalProps {
  show: boolean;
  step: PaymentStep;
  amountToPay: number;
  amountGiven: number;
  change: number;
  paymentMethod: PaymentMethod;
  paymentTransaction: PaymentTransaction | null;
  customer: Customer;
  isProcessing: boolean;
  
  // ADD THESE 5 NEW LINES:
  cart?: CartItem[];
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  orderNote?: string;
  vendorId: number;
  
  onClose: () => void;
  onSetAmountToPay: (amount: number) => void;
  onSetAmountGiven: (amount: number) => void;
  onSetPaymentMethod: (method: PaymentMethod) => void;
  onQuickTender: (amount: number) => void;
  onProcessPayment: (method: PaymentMethod) => void;
  onCompleteSale: () => void;
  onShowCustomerModal: () => void;

}

export interface RegisterScreenProps {
  registerForm: RegisterForm;
  isLoadingRegister: boolean;
  onUpdateForm: (form: Partial<RegisterForm>) => void;
  onOpenRegister: () => void;
}

export interface CustomerModalProps {
  show: boolean;
  customer: Customer;
  onClose: () => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export interface ProductFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  categories: string[];
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export interface MobileCartProps {
  show: boolean;
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  finalTotal: number;
  onClose: () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onStartPayment: () => void;
  getAvailableStock: (productId: number) => number;
  onClearCart: () => void;
  onShowCustomerModal: () => void;
  customer: any;
}

export interface RegisterHeaderProps {
  registerStatus: RegisterStatus;
  onCloseRegister: () => void;
}

export interface MobileCartButtonProps {
  show: boolean;
  totalItems: number;
  finalTotal: number;
  onOpenCart: () => void;
}

export interface RegisterCloseModalProps {
  show: boolean;
  registerForm: RegisterForm;
  registerSession: RegisterSession;
  isLoading: boolean;
  onClose: () => void;
  onUpdateForm: (form: Partial<RegisterForm>) => void;
  onCloseRegister: () => void;
}

// API Response Types
export interface CashierDashboardResponse {
  products: CashierProduct[];
  categories: string[];
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface CheckoutResponse {
  success: boolean;
  order_id: number;
  order_number: string;
  total_amount: number;
  payment_method: string;
  items_count: number;
  register_session_id: number;
  created_at: string;
  
}

export interface RegisterOpenResponse {
  success: boolean;
  message: string;
  session_id: number;
  opened_at: string;
  opening_float: number;
}

export interface RegisterCloseResponse {
  success: boolean;
  message: string;
  session_id: number;
  summary: {
    session_duration_minutes: number;
    opening_float: number;
    total_sales: number;
    cash_sales: number;
    expected_cash: number;
    actual_cash: number;
    variance: number;
    variance_status: 'over' | 'short' | 'exact';
    transaction_count: number;
  };
}