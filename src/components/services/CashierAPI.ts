// src/services/cashierAPI.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface CashierProduct {
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

interface CashierDashboardResponse {
  products: CashierProduct[];
  categories: string[];
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface CashierItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CashierCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

interface CashierCheckout {
  vendor_id: number;
  items: CashierItem[];
  customer?: CashierCustomer;
  payment_method: string;
  tax_amount: number;
  discount_amount: number;
  subtotal: number;
  total_amount: number;
  notes?: string;
}

interface CheckoutResponse {
  success: boolean;
  order_id: number;
  order_number: string;
  total_amount: number;
  payment_method: string;
  items_count: number;
  created_at: string;
}

interface RecentTransaction {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  items_count: number;
}

class CashierAPIService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get cashier dashboard data
  async getCashierDashboard(vendorId: number): Promise<CashierDashboardResponse> {
    return this.fetchWithAuth(`/cashier/dashboard/${vendorId}`);
  }

  // Search products for cashier
  async searchCashierProducts(
    vendorId: number,
    filters: {
      search?: string;
      category?: string;
      barcode?: string;
    } = {}
  ): Promise<CashierProduct[]> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.barcode) params.append('barcode', filters.barcode);

    const query = params.toString() ? `?${params}` : '';
    return this.fetchWithAuth(`/cashier/products/${vendorId}${query}`);
  }

  // Get product pricing based on quantity
  async getProductPricing(productId: number, quantity: number) {
    return this.fetchWithAuth(`/cashier/product/${productId}/pricing?quantity=${quantity}`);
  }

  // Process cashier checkout
  async processCheckout(checkoutData: CashierCheckout): Promise<CheckoutResponse> {
    return this.fetchWithAuth('/cashier/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  // Get recent POS transactions
  async getRecentTransactions(vendorId: number, limit: number = 10): Promise<RecentTransaction[]> {
    return this.fetchWithAuth(`/cashier/recent-transactions/${vendorId}?limit=${limit}`);
  }

  // Barcode scanning helper
  async searchByBarcode(vendorId: number, barcode: string): Promise<CashierProduct | null> {
    try {
      const products = await this.searchCashierProducts(vendorId, { barcode });
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error searching by barcode:', error);
      return null;
    }
  }

  // Bulk stock validation (useful for large carts)
  async validateStock(items: { product_id: number; quantity: number }[]): Promise<{
    valid: boolean;
    errors: { product_id: number; available: number; requested: number }[];
  }> {
    // This would be implemented as a separate endpoint if needed
    // For now, we'll handle validation on checkout
    return { valid: true, errors: [] };
  }
}

// Export singleton instance
export const cashierAPI = new CashierAPIService();

// Export types for use in components
export type {
  CashierProduct,
  CashierDashboardResponse,
  CashierItem,
  CashierCustomer,
  CashierCheckout,
  CheckoutResponse,
  RecentTransaction,
};

// React hook for cashier data
import { useState, useEffect } from 'react';

export const useCashierDashboard = (vendorId: number) => {
  const [data, setData] = useState<CashierDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await cashierAPI.getCashierDashboard(vendorId);
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cashier data');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      loadData();
    }
  }, [vendorId]);

  const refetch = () => {
    if (vendorId) {
      const loadData = async () => {
        try {
          const dashboardData = await cashierAPI.getCashierDashboard(vendorId);
          setData(dashboardData);
        } catch (err) {
          console.error('Error refetching data:', err);
        }
      };
      loadData();
    }
  };

  return { data, loading, error, refetch };
};

// React hook for recent transactions
export const useRecentTransactions = (vendorId: number, limit: number = 10) => {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cashierAPI.getRecentTransactions(vendorId, limit);
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      loadTransactions();
    }
  }, [vendorId, limit]);

  return { transactions, loading, error };
};