/**
 * Fixed Order Type Definitions
 * Resolves TypeScript errors and ensures proper type safety
 */

// Core order types that match your backend exactly
export interface BackendOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  vendor_id: number;
  order_id: number;
}

export interface BackendOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  total_amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  created_at: string;
  vendor_id: number;
  order_items: BackendOrderItem[];
}

// Frontend optimized types
export interface OrderProduct {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  vendorId: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface OrderAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone?: string;
  address: OrderAddress;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: OrderPriority;
  customer: OrderCustomer;
  products: OrderProduct[];
  pricing: OrderPricing;
  vendorId: string;
  createdAt: string;
  
  // Optional fields
  trackingId?: string;
  labelGenerated?: boolean;
  estimatedDelivery?: string;
  notes?: string;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<OrderStatus, number>;
  priorityBreakdown: Record<OrderPriority, number>;
  recentOrders: Order[];
  topProducts: Array<OrderProduct & { totalQuantity: number; totalRevenue: number }>;
  performanceMetrics: {
    averageProcessingTime: number;
    averageShippingTime: number;
    fulfillmentRate: number;
  };
}

export interface OrderFilters {
  status?: OrderStatus[];
  priority?: OrderPriority[];
  dateRange?: { start: string; end: string };
  amountRange?: { min: number; max: number };
  customer?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch?: number;
  fromCache?: boolean;
}

// API request/response types
export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: number;
  shipping_address: string;
  total_amount: number;
  order_items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface BulkOperationResult {
  successful: number[];
  failed: Array<{ id: number; error: string }>;
  total: number;
}