import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Target,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  Star,
  Users,
  Package,
  Eye
} from 'lucide-react';

type AnalyticsData = {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  from_cache?: boolean;
};

const ProfessionalAnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/analytics/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatMoney = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const getBusinessStatus = (revenue: number) => {
    if (revenue >= 1000000) return { status: "Excellent Performance", color: "bg-green-600", message: "Business is thriving" };
    if (revenue >= 500000) return { status: "Strong Growth", color: "bg-blue-600", message: "Very good progress" };
    if (revenue >= 100000) return { status: "Good Progress", color: "bg-indigo-600", message: "Building momentum" };
    if (revenue >= 50000) return { status: "Steady Growth", color: "bg-purple-600", message: "Moving in right direction" };
    if (revenue >= 10000) return { status: "Getting Started", color: "bg-orange-600", message: "Good foundation" };
    if (revenue > 0) return { status: "First Sales", color: "bg-green-500", message: "Successfully launched" };
    return { status: "Ready to Launch", color: "bg-gray-600", message: "Setup phase" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-48 bg-white rounded-lg shadow">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-700">Loading Analytics...</p>
              <p className="text-gray-500 text-sm mt-1">Fetching your business data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-48 bg-white rounded-lg shadow">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-red-700 mb-2">Unable to Load Data</p>
              <p className="text-gray-600 mb-4 text-sm">{error}</p>
              <button 
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const revenue = data?.total_revenue || 0;
  const orders = data?.total_orders || 0;
  const aov = data?.average_order_value || 0;
  const businessStatus = getBusinessStatus(revenue);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
              <p className="text-gray-600 mt-1">Real-time performance overview</p>
            </div>
            {data?.from_cache && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Cached Data</span>
            )}
          </div>
        </div>

        {/* Status Banner */}
        <div className={`${businessStatus.color} rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">{businessStatus.status}</h2>
              <p className="opacity-90">{businessStatus.message}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatMoney(revenue)}</div>
              <p className="text-sm opacity-80">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(revenue)}</p>
                <p className="text-xs text-gray-500 mt-1">All sales combined</p>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders}</p>
                <p className="text-xs text-gray-500 mt-1">Customers served</p>
              </div>
            </div>
          </div>

          {/* Average Order */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Average Order</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(aov)}</p>
                <p className="text-xs text-gray-500 mt-1">Per transaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h3>
          
          {revenue === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">Ready to Start Selling</h4>
              <p className="text-gray-600 mb-4">Add your products to begin earning revenue</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Add Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Performance Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
                <div className="space-y-3">
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenue Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      revenue > 100000 ? 'bg-green-100 text-green-700' :
                      revenue > 50000 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {revenue > 100000 ? 'Strong' : revenue > 50000 ? 'Good' : 'Building'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer Base</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      orders > 50 ? 'bg-green-100 text-green-700' :
                      orders > 10 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {orders > 50 ? 'Established' : orders > 10 ? 'Growing' : 'Starting'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Value</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      aov > 2000 ? 'bg-green-100 text-green-700' :
                      aov > 1000 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {aov > 2000 ? 'High Value' : aov > 1000 ? 'Good Value' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-2 text-sm">
                  
                  {revenue < 50000 && (
                    <div className="flex items-start">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Focus on adding more products to increase sales</span>
                    </div>
                  )}
                  
                  {orders < 20 && (
                    <div className="flex items-start">
                      <Users className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Promote your business to reach more customers</span>
                    </div>
                  )}
                  
                  {aov < 1500 && orders > 5 && (
                    <div className="flex items-start">
                      <Star className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Consider bundling products to increase order value</span>
                    </div>
                  )}
                  
                  {revenue > 100000 && (
                    <div className="flex items-start">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Excellent progress! Focus on customer retention</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600 text-sm">Manage your business efficiently</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Manage Products
              </button>
              
              <button 
                onClick={() => window.location.href = '/orders'}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                View Orders
              </button>
              
              <button 
                onClick={fetchData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfessionalAnalyticsDashboard;