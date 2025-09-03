// src/components/cashier/CashierDashboard.tsx - Lightspeed Layout Redesign
import React from 'react';
import { Receipt } from 'lucide-react';

// Hooks
import { useCashier } from './hooks/useCashier';

// Components
import RegisterScreen from '../RegisterScreen/RegisterScreen';
import RegisterHeader from '../shared/RegisterHeader';
import ProductFilters from '../ProductGrid/ProductFilters';
import ProductGrid from '../ProductGrid/ProductGrid';

import MobileCart from '../Cart/MobileCart';
import MobileCartButton from '../Cart/MobileCartButton';
import PaymentModal from '../payment/PaymentModal';
import CustomerModal from '../shared/CustomerModal';
import RegisterCloseModal from '../RegisterScreen/RegisterCloseModal';

// Types
import { CashierDashboardProps } from './types/cashier.types';

const CashierDashboard: React.FC<CashierDashboardProps> = ({ vendorId }) => {
  const cashier = useCashier(vendorId);

  // Handle payment processing with error handling
  const handleProcessPayment = async (method: 'cash' | 'card' | 'digital') => {
    const result = await cashier.handleProcessPayment(method);
    
    if (!result.success) {
      alert(`Payment failed: ${result.error}`);
    }
  };

  // Handle register operations with error handling
  const handleOpenRegister = async () => {
    const result = await cashier.openRegister();
    
    if (!result.success) {
      alert(`Failed to open register: ${result.error}`);
    }
  };

  const handleCloseRegister = async () => {
    const result = await cashier.closeRegister();
    
    if (result.success && result.summary) {
      const summary = result.summary;
      alert(`Register closed successfully!\n\nSummary:\nSales: ₹${summary.total_sales.toFixed(2)}\nExpected Cash: ₹${summary.expected_cash.toFixed(2)}\nActual Cash: ₹${summary.actual_cash.toFixed(2)}\nVariance: ₹${summary.variance.toFixed(2)} (${summary.variance_status})`);
    } else {
      alert(`Failed to close register: ${result.error}`);
    }
  };

  // Show register screen if register is not open
  if (!cashier.registerStatus.register_open) {
    return (
      <RegisterScreen
        registerForm={cashier.registerForm}
        isLoadingRegister={cashier.isLoadingRegister}
        onUpdateForm={cashier.updateRegisterForm}
        onOpenRegister={handleOpenRegister}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
     

      {/* Main Content Area - Split into Product Area and Cart */}
      <div className="flex-1 flex">
        {/* Product Search & Listing Area */}
        <div className="flex-1 flex flex-col">
          {/* Compact Header */}
          {/* Compact Header */}
<div className="bg-white border-b p-4">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-6">
      <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-[#1DA1F2]" />
        ShopInStreet POS
      </h1>
      
      {/* Register Status moved from sidebar */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">Register Open</span>
        </div>
        
        <div className="text-gray-600">
          <div className="font-medium">{cashier.registerStatus.session?.cashier_name || 'Cashier'}</div>
        </div>
        
        <div className="text-gray-600">
          <div className="font-bold text-[#1DA1F2]">
            ₹{(cashier.registerStatus.session?.total_sales || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            ({cashier.registerStatus.session?.transaction_count || 0} sales)
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {/* Close Register Button */}
                  <button 
                    onClick={cashier.openCloseRegisterModal}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Close Register
                  </button>
                  
                  {/* Your existing mobile cart button */}
                  {cashier.isMobile && (
                    <button
                      onClick={() => cashier.setShowMobileCart(true)}
                      className="lg:hidden relative p-2 bg-[#1DA1F2] text-white rounded-lg shadow hover:bg-[#0EA5E9]"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cashier.totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {cashier.totalItems}
                        </span>
                      )}
                    </button>
                  )}
              </div>
              {/* Mobile cart button */}
              
      
            </div>

            {/* Compact Filters */}
            <ProductFilters
              searchTerm={cashier.searchTerm}
              selectedCategory={cashier.selectedCategory}
              categories={cashier.categories}
              onSearchChange={cashier.setSearchTerm}
              onCategoryChange={cashier.setSelectedCategory}
            />
          </div>

          {/* Products Grid - Lightspeed Style */}
          <div className="flex-1 overflow-y-auto p-4">
            <LightspeedProductGrid
              products={cashier.products}
              onAddToCart={cashier.handleAddToCart}
              getStockDisplay={cashier.getStockDisplayForProduct}
              currentPage={cashier.currentPage}
              totalPages={cashier.totalPages}
              onPageChange={cashier.setCurrentPage}
              isMobile={cashier.isMobile}
            />
          </div>
        </div>

        {/* Right Cart Panel - Lightspeed Style (Desktop Only) */}
        {!cashier.isMobile && (
          <LightspeedCartPanel
            cart={cashier.cart}
            totalItems={cashier.totalItems}
            subtotal={cashier.subtotal}
            taxAmount={cashier.taxAmount}
            taxEnabled={cashier.taxEnabled}
            taxRate={cashier.taxRate}
            discountAmount={cashier.discountAmount}
            finalTotal={cashier.finalTotal}
            customer={cashier.customer}
            onUpdateQuantity={cashier.updateCartItemQuantity}
            onRemoveItem={cashier.removeFromCart}
            onClearCart={cashier.clearCart}
            onShowCustomerModal={() => cashier.setShowCustomerModal(true)}
            onStartPayment={cashier.handleStartPayment}
            getAvailableStock={cashier.getAvailableStockForProduct}
          />
        )}
      </div>

      {/* Mobile Cart Components */}
      {cashier.isMobile && (
        <>
          <MobileCart
            show={cashier.showMobileCart}
            cart={cashier.cart}
            totalItems={cashier.totalItems}
            subtotal={cashier.subtotal}
            finalTotal={cashier.finalTotal}
            onClose={() => cashier.setShowMobileCart(false)}
            onUpdateQuantity={cashier.updateCartItemQuantity}
            onRemoveItem={cashier.removeFromCart}
            onStartPayment={cashier.handleStartPayment}
            getAvailableStock={cashier.getAvailableStockForProduct}
          />
          
          <MobileCartButton
            show={cashier.totalItems > 0 && !cashier.showMobileCart}
            totalItems={cashier.totalItems}
            finalTotal={cashier.finalTotal}
            onOpenCart={() => cashier.setShowMobileCart(true)}
          />
        </>
      )}

      {/* Modals */}
      <PaymentModal
        show={cashier.showPaymentModal}
        step={cashier.paymentStep}
        amountToPay={cashier.amountToPay}
        amountGiven={cashier.amountGiven}
        change={cashier.change}
        paymentMethod={cashier.paymentMethod}
        paymentTransaction={cashier.paymentTransaction}
        customer={cashier.customer}
        isProcessing={cashier.isProcessing}
        onClose={() => cashier.setShowPaymentModal(false)}
        onSetAmountToPay={cashier.setAmountToPay}
        onSetAmountGiven={cashier.updateAmountGiven}
        onSetPaymentMethod={cashier.setPaymentMethod}
        onQuickTender={cashier.setQuickTender}
        onProcessPayment={handleProcessPayment}
        onCompleteSale={cashier.handleCompleteSale}
        onShowCustomerModal={() => cashier.setShowCustomerModal(true)}
      />

      <CustomerModal
        show={cashier.showCustomerModal}
        customer={cashier.customer}
        onClose={() => cashier.setShowCustomerModal(false)}
        onUpdateCustomer={cashier.handleUpdateCustomer}
      />

      {cashier.showRegisterModal && cashier.registerOperation === 'close' && cashier.registerStatus.session && (
        <RegisterCloseModal
          show={cashier.showRegisterModal}
          registerForm={cashier.registerForm}
          registerSession={cashier.registerStatus.session}
          isLoading={cashier.isLoadingRegister}
          onClose={() => cashier.setShowRegisterModal(false)}
          onUpdateForm={cashier.updateRegisterForm}
          onCloseRegister={handleCloseRegister}
        />
      )}
    </div>
  );
};

// ===== REAL-TIME COMPONENTS =====

// Live Timer Component - Shows running time since register opened
interface LiveTimerProps {
  openedAt?: string;
}

const LiveTimer: React.FC<LiveTimerProps> = ({ openedAt }) => {
  const [elapsedTime, setElapsedTime] = React.useState('0h 0m');

  React.useEffect(() => {
    if (!openedAt) return;

    const updateTimer = () => {
      const now = new Date();
      const opened = new Date(openedAt);
      const diff = Math.floor((now.getTime() - opened.getTime()) / 1000); // seconds
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      
      setElapsedTime(`${hours}h ${minutes}m`);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [openedAt]);

  return <span>{elapsedTime}</span>;
};

// Live Sales Component - Shows real-time sales amount
interface LiveSalesProps {
  totalSales: number;
}

const LiveSales: React.FC<LiveSalesProps> = ({ totalSales }) => {
  const [displaySales, setDisplaySales] = React.useState(totalSales);

  React.useEffect(() => {
    // Animate the change in sales
    if (totalSales !== displaySales) {
      const duration = 500; // 500ms animation
      const steps = 30;
      const stepValue = (totalSales - displaySales) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplaySales(totalSales);
          clearInterval(interval);
        } else {
          setDisplaySales(prev => prev + stepValue);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [totalSales, displaySales]);

  return <span>{displaySales.toFixed(2)}</span>;
};

// Live Transaction Count Component - Shows real-time transaction count
interface LiveTransactionCountProps {
  count: number;
}

const LiveTransactionCount: React.FC<LiveTransactionCountProps> = ({ count }) => {
  const [displayCount, setDisplayCount] = React.useState(count);

  React.useEffect(() => {
    if (count !== displayCount) {
      // Quick animation for transaction count
      setDisplayCount(count);
    }
  }, [count, displayCount]);

  return <span>{displayCount}</span>;
};

// ===== LIGHTSPEED-STYLE COMPONENTS =====

// Lightspeed-Style Product Grid
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { ProductGridProps } from './types/cashier.types';

const LightspeedProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  getStockDisplay,
  currentPage,
  totalPages,
  onPageChange,
  isMobile
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No products found</p>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Products Grid - Lightspeed Style */}
      <div className={`grid gap-3 ${
        isMobile 
          ? 'grid-cols-2' 
          : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      }`}>
        {products.map(product => (
          <LightspeedProductCard
            key={product.id}
            product={product}
            stockInfo={getStockDisplay(product)}
            onAddToCart={onAddToCart}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// Lightspeed-Style Product Card (More Compact)
import { CashierProduct, StockDisplay } from './types/cashier.types';

interface LightspeedProductCardProps {
  product: CashierProduct;
  stockInfo: StockDisplay;
  onAddToCart: (product: CashierProduct) => void;
  isMobile: boolean;
}

const LightspeedProductCard: React.FC<LightspeedProductCardProps> = ({
  product,
  stockInfo,
  onAddToCart,
  isMobile
}) => {
  const handleClick = () => {
    if (!stockInfo.disabled) {
      onAddToCart(product);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-md transition-all duration-150 cursor-pointer group ${
        stockInfo.disabled 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:border-blue-400 hover:shadow-sm'
      }`}
      onClick={handleClick}
      style={{ 
        height: '120px', // More compact than original 140px
        minWidth: isMobile ? '140px' : '160px'
      }}
    >
      <div className="p-3 h-full flex flex-col">
        {/* Stock Indicator & Image Row */}
        <div className="flex items-start justify-between mb-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            stockInfo.stockCount === 0 ? 'bg-red-500' :
            stockInfo.stockCount <= 5 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`} />
          {product.image_url && (
            <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 leading-tight">
          {product.name}
        </h3>
        
        {/* Price & Stock - Bottom */}
        <div className="mt-auto">
          <div className="text-lg font-bold text-blue-600 leading-none">
            ₹{product.price.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stockInfo.stockCount} in stock
          </div>
        </div>
      </div>
    </div>
  );
};

// Lightspeed-Style Cart Panel
import { ShoppingCart, X, Plus, Minus, User, CreditCard, Percent, Tag, StickyNote } from 'lucide-react';
import { CartPanelProps } from './types/cashier.types';

// Updated LightspeedCartPanel component - Replace the existing one in your CashierDashboard.tsx

// Fixed LightspeedCartPanel component - Replace the existing one in your CashierDashboard.tsx

// Ultra-compact LightspeedCartPanel - Matches reference design exactly

// Responsive LightspeedCartPanel with proper spacing and flexibility

// Responsive LightspeedCartPanel with proper spacing and flexibility
const LightspeedCartPanel: React.FC<CartPanelProps> = ({
  cart,
  totalItems,
  subtotal,
  taxAmount,
  taxEnabled,
  taxRate,
  discountAmount,
  finalTotal,
  customer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onShowCustomerModal,
  onStartPayment,
  getAvailableStock
}) => {
  // POS feature states
  const [showDiscountModal, setShowDiscountModal] = React.useState(false);
  const [showPromoModal, setShowPromoModal] = React.useState(false);
  const [showNoteModal, setShowNoteModal] = React.useState(false);
  const [localDiscount, setLocalDiscount] = React.useState({ type: 'percentage', value: 0 });
  const [promoCode, setPromoCode] = React.useState('');
  const [orderNote, setOrderNote] = React.useState('');
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [appliedPromo, setAppliedPromo] = React.useState('');

  const handleApplyDiscount = () => {
    if (localDiscount.value > 0) {
      if (localDiscount.type === 'percentage') {
        const discountValue = (subtotal * localDiscount.value) / 100;
        setAppliedDiscount(discountValue);
      } else {
        setAppliedDiscount(Math.min(localDiscount.value, subtotal));
      }
    }
    setShowDiscountModal(false);
  };

  const handleApplyPromoCode = () => {
    if (promoCode === 'SAVE10') {
      setAppliedDiscount(subtotal * 0.1);
      setAppliedPromo(promoCode);
    } else if (promoCode === 'FLAT50') {
      setAppliedDiscount(50);
      setAppliedPromo(promoCode);
    } else {
      alert('Invalid promo code');
      return;
    }
    setPromoCode('');
    setShowPromoModal(false);
  };

  // Calculate final total with applied discounts
  const calculatedTotal = subtotal - appliedDiscount + taxAmount;

  return (
    <div className="min-w-80 max-w-md w-full lg:w-96 xl:w-[400px] bg-white border-l flex flex-col h-full">
      {/* Compact Header - Just Clear Button */}
      <div className="flex-shrink-0 px-4 py-2 border-b bg-white">
        <div className="flex items-center justify-end">
          {cart.length > 0 && (
            <button 
              onClick={onClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Customer Selection - Responsive */}
      <div className="flex-shrink-0 p-4 border-b bg-blue-50">
        <button
          onClick={onShowCustomerModal}
          className="w-full py-3 px-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-700 hover:border-blue-500 hover:text-blue-800 hover:bg-blue-100 transition-all text-sm flex items-center justify-center gap-2 font-medium"
        >
          <User className="h-4 w-4" />
          <span className="truncate">
            {customer.name ? `Customer: ${customer.name}` : 'Add a customer'}
          </span>
        </button>
      </div>

      {/* Cart Items - Responsive Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No items in cart</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {cart.map((item, index) => (
              <div key={item.product.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all">
                <div className="grid grid-cols-12 gap-3 items-center">
                  
                  {/* Quantity Controls - Clean Design */}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="flex-1 py-2 px-2 text-gray-600 hover:text-white hover:bg-red-500 transition-colors flex items-center justify-center font-bold text-base rounded-l-lg"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      
                      <div className="px-4 py-2 min-w-[3rem] text-center border-x border-gray-200">
                        <span className="text-base font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="flex-1 py-2 px-2 text-gray-600 hover:text-white hover:bg-green-500 transition-colors flex items-center justify-center font-bold text-base rounded-r-lg"
                        disabled={item.quantity >= getAvailableStock(item.product.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Product Details - Responsive */}
                  <div className="col-span-6 sm:col-span-7">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{item.unit_price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Total Price - Responsive */}
                  <div className="col-span-2 text-right">
                    <div className="text-sm font-bold text-gray-900">
                      ₹{(item.unit_price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Remove Button - Responsive */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons - Responsive */}
      {cart.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center justify-center py-2 text-gray-400 text-xs font-medium">
              ADD
            </button>
            <button
              onClick={() => setShowDiscountModal(true)}
              className="flex flex-col items-center justify-center py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
            >
              <Percent className="w-4 h-4 mb-1" />
              Discount
            </button>
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex flex-col items-center justify-center py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded text-xs font-medium transition-colors"
            >
              <Tag className="w-4 h-4 mb-1" />
              Promo Code
            </button>
            <button
              onClick={() => setShowNoteModal(true)}
              className="flex flex-col items-center justify-center py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded text-xs font-medium transition-colors"
            >
              <StickyNote className="w-4 h-4 mb-1" />
              Note
            </button>
          </div>
        </div>
      )}

      {/* Order Summary - Responsive */}
      {cart.length > 0 && (
        <div className="flex-shrink-0 p-4 bg-white border-t">
          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {appliedDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">
                  Discount{appliedPromo && ` (${appliedPromo})`}:
                </span>
                <span className="text-sm font-semibold">-₹{appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            
            {taxEnabled && taxAmount > 0 && (
              <div className="flex justify-between items-center text-blue-600">
                <span className="text-sm">Tax State Tax {(taxRate * 100).toFixed(0)}%:</span>
                <span className="text-sm font-semibold">₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-[#1DA1F2]">
                  ₹{Math.max(0, calculatedTotal).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Button - Full Width Responsive */}
          <button 
            onClick={onStartPayment}
            className="w-full py-4 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-lg font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="truncate">
                Pay {totalItems} item{totalItems !== 1 ? 's' : ''} • ₹{Math.max(0, calculatedTotal).toFixed(2)}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Modals */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Apply Discount</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <select
                  value={localDiscount.type}
                  onChange={(e) => setLocalDiscount({...localDiscount, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (₹)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {localDiscount.type === 'percentage' ? 'Percentage' : 'Amount'}
                </label>
                <input
                  type="number"
                  value={localDiscount.value}
                  onChange={(e) => setLocalDiscount({...localDiscount, value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max={localDiscount.type === 'percentage' ? "100" : subtotal}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Apply Promo Code</h3>
            
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500"
            />
            
            <p className="text-xs text-gray-500 mb-4">Try: SAVE10 or FLAT50</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPromoModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPromoCode}
                disabled={!promoCode}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Order Note</h3>
            
            <textarea
              placeholder="Add a note to this order..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 resize-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CashierDashboard;