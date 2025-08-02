import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';
import Toast from './Toast';
import OrderCard from './OrderCard';
import OrderDetail from './OrderDetail';
import ShippingLabelModal from './ShippingLabelModal';
import { OrderStatus } from './types';
import PageHeader from '../layout/PageHeader';

// Import real API hook and types
import { useOrderAPI } from '../../hooks/useOrderAPI';
import { Order } from '../../types/order.types';
import { useVendorAPI } from '../../hooks/useVendorAPI';

const VendorOrdersDashboard: React.FC = () => {
  // FIXED: Proper hook usage inside component
  const { 
    orders, 
    fetchOrders, 
    updateOrderStatus, 
    isLoading,
    hasError 
  } = useOrderAPI({ autoFetch: true });

  // Real vendor API hook usage
  const { vendorProfile, loading: vendorLoading, error: vendorError } = useVendorAPI();

  // Convert vendor profile to required format
  const vendorAddress = vendorProfile ? {
    name: vendorProfile.business_name,
    street: vendorProfile.address,
    city: vendorProfile.city,
    state: vendorProfile.state,
    postalCode: vendorProfile.pincode,
    country: vendorProfile.country,
    phone: vendorProfile.phone
  } : null;

  // State management
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [showLabelModal, setShowLabelModal] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Filter real orders from backend
  const filteredOrders = (orders.data || []).filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      searchText === '' ||
      order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
      order.id.toLowerCase().includes(searchText.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Handle API errors (both orders and vendor)
  useEffect(() => {
    if (orders.error) {
      console.error('[Dashboard] Order error:', orders.error);
      showToast(`Failed to fetch orders: ${orders.error.message}`, 'error');
    }
  }, [orders.error]);

  useEffect(() => {
    if (vendorError) {
      console.error('[Dashboard] Vendor error:', vendorError);
      showToast(`Failed to fetch vendor profile: ${vendorError.message}`, 'error');
    }
  }, [vendorError]);

  // Handle order selection
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Real API status update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update selected order if it matches
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      showToast('Order status updated successfully!', 'success');
      await fetchOrders(true); // Refresh from backend
    } catch (error: any) {
      showToast(`Error updating status: ${error.message}`, 'error');
    }
  };

  // Handle label generation
  const handleGenerateLabel = (orderId: string) => {
    const order = (orders.data || []).find((o) => o.id === orderId);
    if (order) {
      // Generate a tracking ID if not exists
      if (!order.trackingId) {
        order.trackingId =
          'TRK-' + Math.floor(10000000 + Math.random() * 90000000);
      }

      setSelectedOrder(order);
      setShowLabelModal(true);
    }
  };

  // Handle print label
  const handlePrintLabel = () => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, labelGenerated: true });
      setShowLabelModal(false);
      showToast('Shipping label printed successfully!', 'success');
    }
  };

  // Handle download label
  const handleDownloadLabel = () => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, labelGenerated: true });
      setShowLabelModal(false);
      showToast('Shipping label downloaded successfully!', 'success');
    }
  };

  // Handle mark as shipped
  const handleMarkAsShipped = (orderId: string) => {
    handleUpdateStatus(orderId, 'shipped');
    showToast('Order marked as shipped! Drop-off completed.', 'success');
  };

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Close order detail panel
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  // Handle refresh from backend
  const handleRefresh = async () => {
    try {
      await fetchOrders(true);
      showToast('Orders refreshed successfully!', 'success');
    } catch (error: any) {
      showToast(`Failed to refresh: ${error.message}`, 'error');
    }
  };

  // Save status changes
  const handleSaveStatus = () => {
    if (selectedOrder) {
      showToast('Order status saved successfully!', 'success');
    }
  };

  // FIXED: Helper function to convert Order to legacy format
  const convertOrderToLegacyFormat = (order: Order) => ({
    ...order,
    total: order.pricing.total,
    tax: order.pricing.tax,
    shippingCost: order.pricing.shippingCost,
    customer: {
      name: order.customer.name,
      street: order.customer.address.street,
      city: order.customer.address.city,
      state: order.customer.address.state,
      postalCode: order.customer.address.postalCode,
      country: order.customer.address.country,
      phone: order.customer.phone || order.customer.address.phone || 'N/A'
    },
    products: order.products.map(p => ({
      ...p,
      imageUrl: p.imageUrl || '/api/placeholder/50/50'
    }))
  });

  // Loading state - check both orders and vendor loading
  if ((isLoading && !orders.data) || (vendorLoading && !vendorProfile)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 animate-bounce" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Loading {isLoading && !orders.data ? 'orders' : 'vendor profile'}...
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {isLoading && !orders.data 
              ? 'Fetching orders from your backend...'
              : 'Fetching vendor information...'
            }
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError && !orders.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Failed to load orders</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md">
            {orders.error?.message || 'Error connecting to backend'}
          </p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no orders from backend
  if (!isLoading && (!orders.data || orders.data.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md">
            Orders will appear here once customers start placing them.
          </p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Refresh Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <PageHeader title={`Orders Dashboard (${orders.data?.length || 0})`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <select
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>

          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </PageHeader>

      {/* Quick Stats from Backend Data */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {orders.data?.filter(o => o.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Processing</p>
                <p className="text-2xl font-bold text-blue-800">
                  {orders.data?.filter(o => o.status === 'processing').length || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Shipped</p>
                <p className="text-2xl font-bold text-purple-800">
                  {orders.data?.filter(o => o.status === 'shipped').length || 0}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Delivered</p>
                <p className="text-2xl font-bold text-green-800">
                  {orders.data?.filter(o => o.status === 'delivered').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Orders List */}
        <div
          className={`${
            isDetailOpen ? 'w-1/5' : 'w-2/3'
          } overflow-y-auto p-4 transition-all duration-300`}
        >
          <h3 className="text-lg font-bold mb-4">Orders ({filteredOrders.length})</h3>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchText ? 'Try adjusting your search criteria.' : 'No orders match the selected filter.'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={convertOrderToLegacyFormat(order)}
                  onSelect={() => handleSelectOrder(order)}
                  onUpdateStatus={handleUpdateStatus}
                  onGenerateLabel={handleGenerateLabel}
                  onMarkAsShipped={handleMarkAsShipped}
                  isSelected={selectedOrder?.id === order.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Order Detail Side Panel */}
        {isDetailOpen && selectedOrder ? (
          <div className="w-4/5 bg-white border-l overflow-y-auto transition-all duration-300">
            <OrderDetail
              order={convertOrderToLegacyFormat(selectedOrder)}
              onClose={handleCloseDetail}
              onUpdateStatus={handleUpdateStatus}
              onGenerateLabel={handleGenerateLabel}
              onMarkAsShipped={handleMarkAsShipped}
              onSaveStatus={handleSaveStatus}
            />
          </div>
        ) : (
          <div className="w-1/3 bg-white border-l flex items-center justify-center transition-all duration-300">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Select an order to view details
              </h3>
              <p className="text-gray-500 text-sm">
                Click on any order from the list to view its details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Shipping Label Modal */}
      {showLabelModal && selectedOrder && vendorAddress && (
        <ShippingLabelModal
          order={convertOrderToLegacyFormat(selectedOrder)}
          vendorAddress={vendorAddress}
          onClose={() => setShowLabelModal(false)}
          onPrint={handlePrintLabel}
          onDownload={handleDownloadLabel}
        />
      )}

      {/* Toast */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </>
  );
};

export default VendorOrdersDashboard;