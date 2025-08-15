// orderUtils.ts - Utility functions for order prioritization

// Define the Order type if not imported from elsewhere
export interface Order {
  status: OrderStatus | string;
  createdAt: string;
  total: number;
  // Add other fields as needed
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Define priority levels (lower number = higher priority)
export const getStatusPriority = (status: OrderStatus): number => {
  const priorityMap: Record<OrderStatus, number> = {
    [OrderStatus.PENDING]: 1,      // Highest priority - needs immediate attention
    [OrderStatus.PROCESSING]: 2,   // Second priority - being worked on
    [OrderStatus.SHIPPED]: 3,      // Third priority - in transit
    [OrderStatus.DELIVERED]: 4,    // Lower priority - completed
    [OrderStatus.CANCELLED]: 5     // Lowest priority - archived
  };
  
  return priorityMap[status] || 999;
};

// Sort orders by priority
export const sortOrdersByPriority = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    const priorityA = getStatusPriority(a.status as OrderStatus);
    const priorityB = getStatusPriority(b.status as OrderStatus);
    
    // Primary sort: by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Secondary sort: by creation date (newest first for same priority)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// Alternative: Sort with custom priority configuration
export interface PriorityConfig {
  statusOrder: OrderStatus[];
  sortWithinStatus: 'newest' | 'oldest' | 'amount_high' | 'amount_low';
}

export const sortOrdersWithConfig = (orders: Order[], config: PriorityConfig): Order[] => {
  return [...orders].sort((a, b) => {
    const indexA = config.statusOrder.indexOf(a.status as OrderStatus);
    const indexB = config.statusOrder.indexOf(b.status as OrderStatus);
    
    // Primary sort: by configured status order
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    
    // Secondary sort: within same status
    switch (config.sortWithinStatus) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount_high':
        return b.total - a.total;
      case 'amount_low':
        return a.total - b.total;
      default:
        return 0;
    }
  });
};

// Group orders by status with priority ordering
export const groupOrdersByStatus = (orders: Order[]): Record<string, Order[]> => {
  const grouped = orders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);
  
  // Sort within each group by creation date
  Object.keys(grouped).forEach(status => {
    grouped[status].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
  
  return grouped;
};