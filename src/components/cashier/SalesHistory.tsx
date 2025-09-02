// src/components/cashier/SalesHistory.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  RefreshCw,
  Calendar,
  User,
  CreditCard,
  DollarSign,
  Receipt,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Clock,
  Package,
  Mail
} from 'lucide-react';

interface Transaction {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_type: string;
  items_count: number;
  created_at: string;
  register_session_id?: number;
  cashier_name?: string;
  notes?: string;
}

interface TransactionItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

interface SalesHistoryProps {
  vendorId: number;
}

const TRANSACTIONS_PER_PAGE = 20;

const SalesHistory: React.FC<SalesHistoryProps> = ({ vendorId }) => {
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Transaction details modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, [vendorId, dateFilter, statusFilter, paymentFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `http://localhost:8000/api/cashier/recent-transactions/${vendorId}?limit=100`;
      
      // Add filters to URL
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('payment_method', paymentFilter);
      if (dateFilter !== 'all') {
        const dates = getDateRange(dateFilter);
        if (dates.start) params.append('start_date', dates.start);
        if (dates.end) params.append('end_date', dates.end);
      }
      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }
      
      if (params.toString()) {
        url += `&${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        setError(data.detail || 'Failed to load transactions');
      }
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (filter: string) => {
    const today = new Date();
    const start = new Date();
    
    switch (filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return { start: start.toISOString(), end: null };
      case 'yesterday':
        start.setDate(today.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const endYesterday = new Date(start);
        endYesterday.setHours(23, 59, 59, 999);
        return { start: start.toISOString(), end: endYesterday.toISOString() };
      case 'week':
        start.setDate(today.getDate() - 7);
        return { start: start.toISOString(), end: null };
      case 'month':
        start.setDate(today.getDate() - 30);
        return { start: start.toISOString(), end: null };
      default:
        return { start: null, end: null };
    }
  };

  const loadTransactionDetails = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
    
    try {
      // Fetch transaction items - you may need to create this endpoint
      const response = await fetch(`http://localhost:8000/api/orders/${transaction.id}/items`);
      if (response.ok) {
        const items = await response.json();
        setTransactionItems(items);
      }
    } catch (error) {
      console.error('Error loading transaction details:', error);
    }
  };

  // Filter transactions based on search term
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.order_number.toLowerCase().includes(term) ||
        transaction.customer_name.toLowerCase().includes(term) ||
        transaction.customer_email?.toLowerCase().includes(term) ||
        transaction.customer_phone?.includes(term) ||
        transaction.notes?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [transactions, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'digital': return <Receipt className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': 
        return 'bg-green-100 text-green-800';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800';
      case 'failed': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Order Number', 'Customer', 'Amount', 'Payment Method', 'Status', 'Date', 'Items'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.order_number,
        t.customer_name,
        t.total_amount,
        t.payment_method,
        t.payment_status,
        formatDate(t.created_at),
        t.items_count
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={loadTransactions}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={exportTransactions}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by order number, customer, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital">Digital</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Loading transactions...
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-600">{error}</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Receipt className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">No transactions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Transactions Table */}
              <div className="bg-white mx-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Order</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{transaction.order_number}</div>
                            {transaction.notes && (
                              <div className="text-xs text-gray-500 truncate">{transaction.notes}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{transaction.customer_name}</div>
                            {transaction.customer_email && (
                              <div className="text-xs text-gray-500">{transaction.customer_email}</div>
                            )}
                            {transaction.customer_phone && (
                              <div className="text-xs text-gray-500">{transaction.customer_phone}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900">₹{transaction.total_amount.toFixed(2)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getPaymentIcon(transaction.payment_method)}
                              <span className="capitalize text-sm">{transaction.payment_method}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.payment_status)}`}>
                              {transaction.payment_status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {transaction.payment_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {transaction.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{transaction.items_count}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => loadTransactionDetails(transaction)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => window.print()}
                                className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
                                title="Print Receipt"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              {transaction.customer_email && (
                                <button
                                  onClick={() => alert('Email receipt sent!')}
                                  className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                  title="Email Receipt"
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mx-6 mt-6 mb-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(startIndex + TRANSACTIONS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Transaction Details - {selectedTransaction.order_number}
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Summary */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedTransaction.customer_name}</div>
                    {selectedTransaction.customer_email && (
                      <div><strong>Email:</strong> {selectedTransaction.customer_email}</div>
                    )}
                    {selectedTransaction.customer_phone && (
                      <div><strong>Phone:</strong> {selectedTransaction.customer_phone}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Amount:</strong> ₹{selectedTransaction.total_amount.toFixed(2)}</div>
                    <div><strong>Method:</strong> {selectedTransaction.payment_method}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.payment_status)}`}>
                        {selectedTransaction.payment_status}
                      </span>
                    </div>
                    <div><strong>Date:</strong> {formatDate(selectedTransaction.created_at)}</div>
                  </div>
                </div>
              </div>

              {/* Transaction Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Items Purchased</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Product</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Qty</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Price</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactionItems.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-4 text-sm">{item.product_name}</td>
                          <td className="py-2 px-4 text-sm">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm">₹{item.price.toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm font-medium">₹{item.total_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedTransaction.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedTransaction.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </button>
                {selectedTransaction.customer_email && (
                  <button
                    onClick={() => alert('Email receipt sent!')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4" />
                    Email Receipt
                  </button>
                )}
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;