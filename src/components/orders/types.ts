// types.ts - Order related type definitions

export interface OrderProduct {
    id: number;
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
  }
  
  export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
  
  export interface OrderAddress {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  }
  
  export interface Order {
    id: string;
    status: OrderStatus;
    customer: OrderAddress;
    products: OrderProduct[];
    total: number;
    tax: number;
    shippingCost: number;
    trackingId?: string;
    createdAt: string;
    labelGenerated?: boolean;
  }
  
  // Helper functions for order status
  export const getStatusColor = (status: OrderStatus): string => {
    switch(status) {
      case 'pending': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  export const getStatusLabel = (status: OrderStatus): string => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };