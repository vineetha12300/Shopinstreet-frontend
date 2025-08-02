export type OrderStatus = 'new' | 'accepted' | 'label_ready' | 'in_transit' | 'delivered';

export interface Product {
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  imageUrl?: string;
}

export interface Customer {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  location: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  product: Product;
  customer: Customer;
  total: number;
  tax?: number;
  shippingCost?: number;
  trackingId?: string;
  courier?: string;
  labelCreated?: string;
  deliveredDate?: string;
}

export interface NavigationStep {
  id: number;
  title: string;
  icon: string;
}