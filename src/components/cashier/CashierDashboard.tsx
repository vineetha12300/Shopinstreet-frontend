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
import CartPanel from '../Cart/CartPanel';
import MobileCart from '../Cart/MobileCart';
import MobileCartButton from '../Cart/MobileCartButton';
import PaymentModal from '../payment/PaymentModal';
import CustomerModal from '../shared/CustomerModal';
import RegisterCloseModal from '../RegisterScreen/RegisterCloseModal';
import { PaymentMethod } from './types/cashier.types';

// Types
import { CashierDashboardProps } from './types/cashier.types';

const CashierDashboard: React.FC<CashierDashboardProps> = ({ vendorId }) => {
  const cashier = useCashier(vendorId);

  // Handle payment processing with error handling
  const handleProcessPayment = async (method: PaymentMethod) => {
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
        {/* Right Cart Panel - Updated Design (Desktop Only) */}
{!cashier.isMobile && (
  <CartPanel
  cart={cashier.cart}
  totalItems={cashier.totalItems}
  subtotal={cashier.subtotal}
  taxAmount={cashier.taxAmount}
  taxEnabled={cashier.taxEnabled}
  taxRate={cashier.taxRate}
  discountAmount={cashier.discountAmount}
  finalTotal={cashier.finalTotal}
  customer={cashier.customer}
  
  // Add these new props:
  appliedDiscount={cashier.appliedDiscount}
  appliedPromo={cashier.appliedPromo}
  taxSettings={cashier.taxSettings}
  orderNote={cashier.orderNote}
  discount={cashier.discount}
  promoCode={cashier.promoCode}
  calculatedTotal={cashier.finalTotal}
  onResetDiscount={cashier.resetDiscount}
  onResetPromo={cashier.resetPromo}
  onResetNote={cashier.resetNote}
  
  // Existing handlers
  onUpdateQuantity={cashier.updateCartItemQuantity}
  onRemoveItem={cashier.removeFromCart}
  onClearCart={cashier.clearCart}
  onShowCustomerModal={() => cashier.setShowCustomerModal(true)}
  onStartPayment={cashier.handleStartPayment}
  getAvailableStock={cashier.getAvailableStockForProduct}
  
  // Add these new handlers:
  onApplyDiscount={cashier.handleApplyDiscount}
  onApplyPromoCode={cashier.handleApplyPromoCode}
  onSetDiscount={cashier.setDiscount}
  onSetPromoCode={cashier.setPromoCode}
  onSetTaxSettings={cashier.setTaxSettings}
  onSetOrderNote={cashier.setOrderNote}
  onResetCartState={cashier.resetCartState}
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
            onClearCart={cashier.clearCart}
            onShowCustomerModal={() => cashier.setShowCustomerModal(true)}
            customer={cashier.customer}
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
  
  // ADD THESE 5 LINES:
  cart={cashier.cart}
  subtotal={cashier.subtotal}
  taxAmount={cashier.taxAmount}
  taxRate={cashier.taxRate}
  discountAmount={cashier.discountAmount}
  orderNote={cashier.orderNote}
  
  onClose={() => cashier.setShowPaymentModal(false)}
  onSetAmountToPay={cashier.setAmountToPay}
  onSetAmountGiven={cashier.updateAmountGiven}
  onSetPaymentMethod={cashier.setPaymentMethod}
  onQuickTender={cashier.setQuickTender}
  onProcessPayment={handleProcessPayment}
  onCompleteSale={cashier.handleCompleteSale}
  onShowCustomerModal={() => cashier.setShowCustomerModal(true)}
  vendorId={vendorId}
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

export default CashierDashboard;