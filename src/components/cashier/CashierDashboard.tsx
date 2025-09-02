// src/components/cashier/CashierDashboard.tsx - Refactored Main Container
import React from 'react';
import { Receipt, ShoppingCart } from 'lucide-react';

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
    <div className="flex h-screen bg-gray-50 relative">
      {/* Main Content Area */}
      <div className={`${cashier.isMobile ? 'w-full' : 'flex-1'} flex flex-col`}>
        {/* Register Status Header */}
        <RegisterHeader
          registerStatus={cashier.registerStatus}
          onCloseRegister={cashier.openCloseRegisterModal}
        />
        
        {/* Header with Filters */}
        <div className="bg-white border-b-2 border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {cashier.isMobile && (
                <button
                  onClick={() => cashier.setShowMobileCart(true)}
                  className="lg:hidden relative p-2 bg-[#1DA1F2] text-white rounded-xl shadow-lg hover:bg-[#0EA5E9] transition-all"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cashier.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {cashier.totalItems}
                    </span>
                  )}
                </button>
              )}
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-[#1DA1F2]" />
                ShopInStreet POS
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600 font-medium">
              <span>{cashier.filteredProductsCount} Products</span>
              <span>•</span>
              <span>{cashier.totalItems} Items</span>
            </div>
          </div>

          <ProductFilters
            searchTerm={cashier.searchTerm}
            selectedCategory={cashier.selectedCategory}
            categories={cashier.categories}
            onSearchChange={cashier.setSearchTerm}
            onCategoryChange={cashier.setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductGrid
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

      {/* Desktop Cart Panel */}
      {!cashier.isMobile && (cashier.cart.length > 0 || cashier.totalItems > 0) && (
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
          onUpdateQuantity={cashier.updateCartItemQuantity}
          onRemoveItem={cashier.removeFromCart}
          onClearCart={cashier.clearCart}
          onShowCustomerModal={() => cashier.setShowCustomerModal(true)}
          onStartPayment={cashier.handleStartPayment}
          getAvailableStock={cashier.getAvailableStockForProduct}
        />
      )}

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

      {/* Payment Modal */}
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

      {/* Customer Modal */}
      <CustomerModal
        show={cashier.showCustomerModal}
        customer={cashier.customer}
        onClose={() => cashier.setShowCustomerModal(false)}
        onUpdateCustomer={cashier.handleUpdateCustomer}
      />

      {/* Register Close Modal */}
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

export default CashierDashboard;