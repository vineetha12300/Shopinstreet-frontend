/**
 * Production Order Service - Clean Version with Error Handling
 * Transforms backend order data to frontend format with proper null/undefined handling
 */

import { 
  BackendOrder, 
  BackendOrderItem,
  Order,
  OrderProduct,
  OrderStatus,
  OrderPriority,
  OrderAddress,
  OrderCustomer,
  OrderPricing,
  OrderAnalytics,
  OrderFilters
} from '../../types/order.types';

export class OrderService {
  
  static transformBackendOrder(backendOrder: BackendOrder): Order {
    // Validate required fields
    if (!backendOrder) {
      throw new Error('Backend order is null or undefined');
    }
    
    if (!backendOrder.id) {
      throw new Error('Backend order ID is missing');
    }
    
    if (!backendOrder.customer_name) {
      throw new Error('Backend order customer_name is missing');
    }
    
    if (!backendOrder.order_items) {
      throw new Error('Backend order order_items is missing');
    }

    // Transform with proper null/undefined handling
    const customer = OrderService.parseCustomerInfo(
      backendOrder.customer_name,
      backendOrder.customer_email || '',
      backendOrder.shipping_address || '',
      backendOrder.customer_phone
    );

    const products = OrderService.transformOrderItems(backendOrder.order_items);
    const pricing = OrderService.calculatePricing(products, backendOrder.total_amount || 0);

    // Handle optional vendor_id field safely
    const vendorId = backendOrder.vendor_id ? backendOrder.vendor_id.toString() : 'unknown';

    return {
      id: backendOrder.id.toString(),
      orderNumber: OrderService.generateOrderNumber(backendOrder.id),
      status: OrderService.mapBackendStatus(backendOrder.status),
      priority: OrderService.calculatePriority(products, pricing.total),
      customer,
      products,
      pricing,
      vendorId: vendorId,
      createdAt: backendOrder.created_at || new Date().toISOString(),
      estimatedDelivery: OrderService.calculateEstimatedDelivery(),
      labelGenerated: false
    };
  }

  private static parseCustomerInfo(
    name: string,
    email: string,
    shippingAddress: string,
    phone?: string | null
  ): OrderCustomer {
    const address = OrderService.parseShippingAddress(shippingAddress);
    
    return {
      name: name || 'Unknown Customer',
      email: email || 'no-email@example.com',
      phone: phone || undefined,
      address
    };
  }

  private static parseShippingAddress(addressString: string): OrderAddress {
    if (!addressString || addressString.trim() === '') {
      return {
        name: '',
        street: 'Address not provided',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      };
    }

    const parts = addressString.split(',').map(p => p.trim());
    const pincodeMatch = addressString.match(/\b(\d{6})\b/);
    const pincode = pincodeMatch ? pincodeMatch[1] : '';
    const statePostalMatch = addressString.match(/([^,]+?)\s*-\s*(\d{6})/);
    
    let street = '';
    let city = '';
    let state = '';
    
    if (statePostalMatch) {
      state = statePostalMatch[1].trim();
      const beforeState = addressString.split(statePostalMatch[0])[0];
      const beforeStateParts = beforeState.split(',').map(p => p.trim()).filter(p => p);
      
      if (beforeStateParts.length >= 2) {
        city = beforeStateParts[beforeStateParts.length - 1];
        street = beforeStateParts.slice(0, -1).join(', ');
      } else {
        street = beforeState.trim();
      }
    } else {
      if (parts.length >= 3) {
        street = parts.slice(0, -2).join(', ');
        city = parts[parts.length - 2];
        state = parts[parts.length - 1].replace(/\s*-?\s*\d{6}/, '').trim();
      } else {
        street = addressString;
      }
    }

    return {
      name: '',
      street: street || addressString,
      city: city || '',
      state: state || '',
      postalCode: pincode,
      country: 'India'
    };
  }

  private static transformOrderItems(items: BackendOrderItem[]): OrderProduct[] {
    if (!items || !Array.isArray(items)) {
      return [];
    }

    return items.map(item => ({
      id: item.product_id || 0,
      name: item.product_name || 'Unknown Product',
      quantity: item.quantity || 1,
      price: item.price || 0,
      vendorId: item.vendor_id || 0,
      imageUrl: OrderService.generateProductImageUrl(item.product_id || 0)
    }));
  }

  private static calculatePricing(products: OrderProduct[], totalAmount: number): OrderPricing {
    const subtotal = products.reduce((sum, product) => 
      sum + (product.price * product.quantity), 0
    );

    const taxRate = 0.18;
    const calculatedTax = Math.round(subtotal * taxRate);
    const shippingCost = OrderService.calculateShipping(subtotal);
    const calculatedTotal = subtotal + calculatedTax + shippingCost;
    const actualTax = calculatedTotal - totalAmount > 0 ?
      calculatedTax - (calculatedTotal - totalAmount) : calculatedTax;

    return {
      subtotal,
      tax: Math.max(0, actualTax),
      shippingCost,
      total: totalAmount || subtotal + calculatedTax + shippingCost,
      currency: 'INR'
    };
  }

  private static calculateShipping(subtotal: number): number {
    if (subtotal >= 499) return 0;
    if (subtotal >= 250) return 40;
    return 80;
  }

  private static mapBackendStatus(status: BackendOrder['status']): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'Pending': 'pending',
      'Processing': 'processing',
      'Shipped': 'shipped',
      'Delivered': 'delivered'
    };
    
    return statusMap[status] || 'pending';
  }

  static mapFrontendStatus(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return statusMap[status];
  }

  private static calculatePriority(products: OrderProduct[], total: number): OrderPriority {
    if (total > 25000) return 'urgent';
    if (total > 10000) return 'high';
    
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    if (totalQuantity > 15) return 'high';
    
    const hasExpensiveItems = products.some(p => p.price > 5000);
    if (hasExpensiveItems) return 'high';
    
    return 'normal';
  }

  private static generateOrderNumber(id: number): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const paddedId = id.toString().padStart(5, '0');
    return `ORD${year}${month}${paddedId}`;
  }

  private static calculateEstimatedDelivery(): string {
    const deliveryDays = 7;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
    return estimatedDate.toISOString();
  }

  private static generateProductImageUrl(productId: number): string {
    return `/api/placeholder/50/50?id=${productId}`;
  }

  static filterOrders(orders: Order[], filters: OrderFilters): Order[] {
    return orders.filter(order => {
      if (filters.status?.length && !filters.status.includes(order.status)) {
        return false;
      }
      
      if (filters.priority?.length && !filters.priority.includes(order.priority)) {
        return false;
      }
      
      if (filters.dateRange) {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (orderDate < startDate || orderDate > endDate) {
          return false;
        }
      }
      
      if (filters.amountRange) {
        if (order.pricing.total < filters.amountRange.min || 
            order.pricing.total > filters.amountRange.max) {
          return false;
        }
      }
      
      if (filters.customer) {
        const customerMatch = order.customer.name.toLowerCase()
          .includes(filters.customer.toLowerCase()) ||
          order.customer.email.toLowerCase()
          .includes(filters.customer.toLowerCase());
        
        if (!customerMatch) return false;
      }
      
      return true;
    });
  }

  static searchOrders(orders: Order[], query: string): Order[] {
    if (!query.trim()) return orders;
    
    const searchTerm = query.toLowerCase();
    
    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm) ||
      order.customer.email.toLowerCase().includes(searchTerm) ||
      order.products.some(product => 
        product.name.toLowerCase().includes(searchTerm)
      ) ||
      order.id.includes(searchTerm)
    );
  }

  static sortOrders(
    orders: Order[], 
    sortBy: 'created' | 'amount' | 'status' | 'priority' | 'customer',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Order[] {
    const sorted = [...orders].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.pricing.total - b.pricing.total;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'customer':
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }

  static calculateAnalytics(orders: Order[]): OrderAnalytics {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc; // FIXED: Return the accumulator
    }, {} as Record<OrderStatus, number>);

    const priorityBreakdown = orders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc; // FIXED: Return the accumulator
    }, {} as Record<OrderPriority, number>);

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const topProducts = OrderService.calculateTopProducts(orders, 5);
    const performanceMetrics = OrderService.calculatePerformanceMetrics(orders);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
      priorityBreakdown,
      recentOrders,
      topProducts,
      performanceMetrics
    };
  }

  private static calculateTopProducts(orders: Order[], limit: number) {
    const productMap = new Map<number, OrderProduct & { totalQuantity: number; totalRevenue: number }>();
    
    orders.forEach(order => {
      order.products.forEach(product => {
        const existing = productMap.get(product.id);
        if (existing) {
          existing.totalQuantity += product.quantity;
          existing.totalRevenue += product.price * product.quantity;
        } else {
          productMap.set(product.id, {
            ...product,
            totalQuantity: product.quantity,
            totalRevenue: product.price * product.quantity
          });
        }
      });
    });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  private static calculatePerformanceMetrics(orders: Order[]) {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const fulfillmentRate = orders.length > 0 ? 
      (deliveredOrders.length / orders.length) * 100 : 0;

    return {
      averageProcessingTime: 2,
      averageShippingTime: 5,
      fulfillmentRate: Math.round(fulfillmentRate * 100) / 100
    };
  }

  static getOrdersRequiringAttention(orders: Order[]): Order[] {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    return orders.filter(order => {
      if (order.status === 'pending' && new Date(order.createdAt) < twoDaysAgo) {
        return true;
      }
      
      if ((order.priority === 'urgent' || order.priority === 'high') && 
          order.status === 'pending') {
        return true;
      }
      
      return false;
    });
  }

  static generateInsights(orders: Order[]): string[] {
    const insights: string[] = [];
    const analytics = OrderService.calculateAnalytics(orders);
    
    if (analytics.averageOrderValue > 1500) {
      insights.push(`Excellent! Your average order value of ₹${Math.round(analytics.averageOrderValue)} is above industry average.`);
    }
    
    const pendingOrders = analytics.statusBreakdown.pending || 0;
    const pendingPercentage = (pendingOrders / analytics.totalOrders) * 100;
    
    if (pendingPercentage > 25) {
      insights.push(`${Math.round(pendingPercentage)}% of orders are pending. Consider reviewing your processing workflow.`);
    }
    
    const urgentOrders = analytics.priorityBreakdown.urgent || 0;
    if (urgentOrders > 0) {
      insights.push(`You have ${urgentOrders} urgent orders that need immediate attention.`);
    }
    
    if (analytics.performanceMetrics.fulfillmentRate < 75) {
      insights.push(`Your fulfillment rate is ${analytics.performanceMetrics.fulfillmentRate}%. Focus on improving delivery processes.`);
    } else if (analytics.performanceMetrics.fulfillmentRate > 95) {
      insights.push(`Outstanding! Your ${analytics.performanceMetrics.fulfillmentRate}% fulfillment rate is excellent.`);
    }
    
    return insights;
  }
}