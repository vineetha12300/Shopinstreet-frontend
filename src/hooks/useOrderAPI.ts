/**
 * Fixed Order API Hook - Resolved useRef TypeScript errors
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { OrderApiClient } from '../api/orderApiClient';
import { OrderService } from '../components/services/orderService';
import { AppConfig, safeLog, safeError } from '../utils/simpleConfig';
import { 
  Order, 
  OrderStatus, 
  OrderFilters, 
  OrderAnalytics, 
  ApiResponse 
} from '../types/order.types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseOrderAPIOptions {
  autoFetch?: boolean;
  cacheTimeout?: number;
  enableOptimisticUpdates?: boolean;
}

export const useOrderAPI = (options: UseOrderAPIOptions = {}) => {
  const {
    autoFetch = true,
    cacheTimeout = AppConfig.CACHE_TTL,
    enableOptimisticUpdates = true
  } = options;

  // Fixed: API client instance with proper initial value
  const apiClientRef = useRef<OrderApiClient | null>(null);
  
  // Fixed: Cache with proper initial value
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  // Fixed: Performance tracking with proper initial value
  const performanceRef = useRef({
    fetchCount: 0,
    cacheHits: 0,
    averageResponseTime: 0
  });

  // Initialize API client
  const getApiClient = (): OrderApiClient => {
    if (!apiClientRef.current) {
      apiClientRef.current = new OrderApiClient({
        baseURL: AppConfig.API_URL,
        timeout: AppConfig.API_TIMEOUT,
        retryAttempts: AppConfig.RETRY_ATTEMPTS,
        retryDelay: AppConfig.RETRY_DELAY
      });
    }
    return apiClientRef.current;
  };

  // State management
  const [orders, setOrders] = useState<ApiResponse<Order[]>>({
    data: null,
    loading: false,
    error: null
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (apiClientRef.current) {
        apiClientRef.current.clearRequestQueue();
      }
    };
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch]);

  // Cache management utilities
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      performanceRef.current.cacheHits++;
      return entry.data;
    }
    cacheRef.current.delete(key);
    return null;
  }, []);

  const setCachedData = useCallback(<T,>(key: string, data: T): void => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTimeout
    });
  }, [cacheTimeout]);

  const invalidateCache = useCallback((pattern?: string): void => {
    if (pattern) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      for (const key of cacheRef.current.keys()) {
        if (regex.test(key)) {
          cacheRef.current.delete(key);
        }
      }
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const fetchOrders = useCallback(async (forceRefresh: boolean = false) => {
    const startTime = Date.now();
    const cacheKey = 'vendor_orders';
    
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedOrders = getCachedData<Order[]>(cacheKey);
        if (cachedOrders) {
          setOrders({
            data: cachedOrders,
            loading: false,
            error: null,
            fromCache: true,
            lastFetch: Date.now()
          });
          return { data: cachedOrders, loading: false, error: null };
        }
      }

      setOrders(prev => ({ ...prev, loading: true, error: null }));

      // Fetch from your backend API
      const apiClient = getApiClient();
      const backendOrders = await apiClient.fetchVendorOrders();
      
      // Transform backend data to frontend format
      const transformedOrders = backendOrders.map(OrderService.transformBackendOrder);
      
      // Cache the results
      setCachedData(cacheKey, transformedOrders);
      
      // Update performance metrics
      const responseTime = Date.now() - startTime;
      performanceRef.current.fetchCount++;
      performanceRef.current.averageResponseTime = 
        (performanceRef.current.averageResponseTime + responseTime) / 2;

      const result = {
        data: transformedOrders,
        loading: false,
        error: null,
        lastFetch: Date.now(),
        fromCache: false
      };
      
      setOrders(result);
      
      // Calculate analytics
      const analyticsData = OrderService.calculateAnalytics(transformedOrders);
      setAnalytics(analyticsData);
      
      safeLog('Orders fetched successfully', { count: transformedOrders.length });
      
      return result;
      
    } catch (error) {
      safeError('Failed to fetch orders:', error);
      
      const result = {
        data: null,
        loading: false,
        error: error as Error,
        lastFetch: Date.now(),
        fromCache: false
      };
      
      setOrders(result);
      return result;
    }
  }, [getCachedData, setCachedData]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const orderIdNumber = parseInt(orderId);
    
    try {
      // Optimistic update if enabled
      if (enableOptimisticUpdates && orders.data) {
        const optimisticOrders = orders.data.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        
        setOrders(prev => ({ ...prev, data: optimisticOrders }));

        // Update selected order if needed
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }

      // Backend update using your API
      const backendStatus = OrderService.mapFrontendStatus(newStatus);
      const apiClient = getApiClient();
      await apiClient.updateOrderStatus(orderIdNumber, backendStatus);
      
      // Invalidate cache to ensure consistency
      invalidateCache('vendor_orders');
      
      safeLog('Order status updated', { orderId, newStatus });
      
      return true;
      
    } catch (error) {
      safeError('Failed to update order status:', error);
      
      // Revert optimistic update on error
      if (enableOptimisticUpdates) {
        await fetchOrders(true);
      }
      
      throw error;
    }
  }, [orders.data, selectedOrder, enableOptimisticUpdates, invalidateCache, fetchOrders]);

  const bulkUpdateOrderStatus = useCallback(async (
    orderIds: string[], 
    newStatus: OrderStatus
  ) => {
    const orderIdNumbers = orderIds.map(id => parseInt(id));
    
    try {
      // Optimistic updates
      if (enableOptimisticUpdates && orders.data) {
        const optimisticOrders = orders.data.map(order =>
          orderIds.includes(order.id) ? { ...order, status: newStatus } : order
        );
        setOrders(prev => ({ ...prev, data: optimisticOrders }));
      }

      // Backend bulk update
      const backendStatus = OrderService.mapFrontendStatus(newStatus);
      const apiClient = getApiClient();
      const result = await apiClient.bulkUpdateOrderStatus(
        orderIdNumbers, 
        backendStatus
      );
      
      // Invalidate cache
      invalidateCache('vendor_orders');
      
      safeLog('Bulk order status updated', { 
        orderIds, 
        newStatus, 
        successful: result.successful.length,
        failed: result.failed.length
      });
      
      return {
        successful: result.successful.map(id => id.toString()),
        failed: result.failed.map(item => ({ ...item, id: item.id.toString() })),
        total: orderIds.length
      };
      
    } catch (error) {
      safeError('Bulk update failed:', error);
      
      // Revert optimistic updates on error
      if (enableOptimisticUpdates) {
        await fetchOrders(true);
      }
      
      throw error;
    }
  }, [orders.data, enableOptimisticUpdates, invalidateCache, fetchOrders]);

  const searchOrders = useCallback((query: string, filters: OrderFilters = {}) => {
    if (!orders.data) return [];
    
    let results = [...orders.data];
    
    // Apply text search
    if (query) {
      results = OrderService.searchOrders(results, query);
    }
    
    // Apply filters
    results = OrderService.filterOrders(results, filters);
    
    return results;
  }, [orders.data]);

  const getOrdersRequiringAttention = useCallback(() => {
    if (!orders.data) return [];
    return OrderService.getOrdersRequiringAttention(orders.data);
  }, [orders.data]);

  const getOrderInsights = useCallback(() => {
    if (!orders.data) return [];
    return OrderService.generateInsights(orders.data);
  }, [orders.data]);

  const getPerformanceMetrics = useCallback(() => {
    return {
      ...performanceRef.current,
      cacheSize: cacheRef.current.size,
      hitRate: performanceRef.current.fetchCount > 0 ? 
        (performanceRef.current.cacheHits / performanceRef.current.fetchCount) * 100 : 0
    };
  }, []);

  const healthCheck = useCallback(async () => {
    try {
      const apiClient = getApiClient();
      return await apiClient.healthCheck();
    } catch (error) {
      return { status: 'unhealthy' as const, timestamp: new Date().toISOString() };
    }
  }, []);

  return {
    // Core data
    orders,
    selectedOrder,
    analytics,
    
    // Core operations
    fetchOrders,
    updateOrderStatus,
    bulkUpdateOrderStatus,
    
    // Search and filtering
    searchOrders,
    getOrdersRequiringAttention,
    getOrderInsights,
    
    // Order management
    setSelectedOrder,
    
    // Cache management
    refreshCache: () => fetchOrders(true),
    clearCache: () => invalidateCache(),
    invalidateCache,
    
    // Performance and monitoring
    getPerformanceMetrics,
    healthCheck,
    
    // Utilities
    isLoading: orders.loading,
    hasError: !!orders.error,
    isEmpty: !orders.loading && (!orders.data || orders.data.length === 0),
    fromCache: orders.fromCache || false,
    lastFetch: orders.lastFetch,
    
    // Analytics refresh
    refreshAnalytics: () => {
      if (orders.data) {
        setAnalytics(OrderService.calculateAnalytics(orders.data));
      }
    }
  };
};