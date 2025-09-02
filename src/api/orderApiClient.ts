/**
 * Fixed Order API Client - Environment Safe
 * Resolves process.env TypeScript errors
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { AppConfig, safeLog, safeError } from '../utils/simpleConfig';
import { 
  BackendOrder, 
  CreateOrderRequest, 
  UpdateOrderStatusRequest,
  BulkOperationResult 
} from '../types/order.types';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: number;
}

export class OrderApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      baseURL: config?.baseURL || AppConfig.API_URL,
      timeout: config?.timeout || AppConfig.API_TIMEOUT,
      retryAttempts: config?.retryAttempts || AppConfig.RETRY_ATTEMPTS,
      retryDelay: config?.retryDelay || AppConfig.RETRY_DELAY
    };
    
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': AppConfig.APP_VERSION
      }
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    // In setupInterceptors method, update the request interceptor:
this.axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔍 DEBUG: Token from localStorage:', token ? 'Found' : 'Not found');
    console.log('🔍 DEBUG: Token length:', token?.length || 0);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ DEBUG: Authorization header set');
    } else {
      console.log('❌ DEBUG: No token, no Authorization header');
    }
    
    config.headers['X-Request-ID'] = this.generateRequestId();
    return config;
  },
  (error) => Promise.reject(this.handleError(error))
);

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (AppConfig.IS_DEVELOPMENT) {
          safeLog(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      (error) => Promise.reject(this.handleError(error))
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: AxiosError): Error {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new Error('Request timeout - please check your connection');
      }
      return new Error('Network error - please check your connection');
    }

    const { status, data } = error.response;
    const message = (data as any)?.detail || error.message;

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return new Error('Authentication required');
      case 403:
        return new Error('Access denied');
      case 404:
        return new Error('Resource not found');
      case 422:
        return new Error(`Validation error: ${message}`);
      case 500:
        return new Error('Server error occurred');
      default:
        return new Error(message || 'An unexpected error occurred');
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryConfig: RetryConfig = {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay,
      backoff: 2
    }
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.message.includes('Authentication required')) {
          throw lastError;
        }

        if (attempt === retryConfig.attempts) break;

        const delay = retryConfig.delay * Math.pow(retryConfig.backoff, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private async dedupe<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }

    const promise = operation().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  async fetchVendorOrders(): Promise<BackendOrder[]> {
    const dedupeKey = 'vendor_orders';
    
    return this.dedupe(dedupeKey, async () => {
      return this.retryWithBackoff(async () => {
        const response = await this.axiosInstance.get<BackendOrder[]>('/orders/mine');
        return response.data;
      });
    });
  }

  async createOrder(orderData: CreateOrderRequest): Promise<BackendOrder> {
    return this.retryWithBackoff(async () => {
      const response = await this.axiosInstance.post<BackendOrder>('/orders/', orderData);
      return response.data;
    });
  }

  async updateOrderStatus(orderId: number, status: string): Promise<BackendOrder> {
    return this.retryWithBackoff(async () => {
      const payload: UpdateOrderStatusRequest = { status };
      const response = await this.axiosInstance.put<BackendOrder>(
        `/orders/${orderId}`,
        payload
      );
      return response.data;
    });
  }

  async bulkUpdateOrderStatus(
    orderIds: number[], 
    status: string
  ): Promise<BulkOperationResult> {
    const BATCH_SIZE = 3;
    const results: BulkOperationResult = {
      successful: [],
      failed: [],
      total: orderIds.length
    };

    for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
      const batch = orderIds.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (orderId) => {
        try {
          await this.updateOrderStatus(orderId, status);
          return { success: true, orderId };
        } catch (error) {
          return { 
            success: false, 
            orderId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.successful.push(result.orderId);
        } else {
          results.failed.push({ 
            id: result.orderId, 
            error: (result as any).error 
          });
        }
      });

      if (i + BATCH_SIZE < orderIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; timestamp: string }> {
    try {
      await this.axiosInstance.get('/orders/mine', { timeout: 5000 });
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', timestamp: new Date().toISOString() };
    }
  }

  clearRequestQueue(): void {
    this.requestQueue.clear();
  }

  getPendingRequestsCount(): number {
    return this.requestQueue.size;
  }

  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.baseURL) {
      this.axiosInstance.defaults.baseURL = newConfig.baseURL;
    }
    if (newConfig.timeout) {
      this.axiosInstance.defaults.timeout = newConfig.timeout;
    }
  }
}