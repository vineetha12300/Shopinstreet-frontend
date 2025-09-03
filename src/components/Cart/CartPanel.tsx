import React, { useState } from 'react';
import { ShoppingCart, User, CreditCard, Tag, Percent, StickyNote } from 'lucide-react';
import CartItem from './CartItem';
import { CartPanelProps } from '../cashier/types/cashier.types';

const CartPanel: React.FC<CartPanelProps> = ({
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
  // New POS feature states
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [promoCode, setPromoCode] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const handleApplyDiscount = () => {
    // This would integrate with your backend discount logic
    setShowDiscountModal(false);
  };

  const handleApplyPromoCode = () => {
    // This would integrate with your backend promo code validation
    setShowPromoModal(false);
  };

  return (
    <div className="w-96 bg-white border-l-2 border-gray-100 flex flex-col shadow-xl">
      <div className="flex-shrink-0 p-4 border-b-2 border-gray-100 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Order
          </h2>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-white/80 hover:text-white text-sm font-bold hover:bg-white/10 px-3 py-1 rounded-lg transition-all"
            >
              Clear All
            </button>
          )}
        </div>
        <p className="text-white/80 text-sm mt-1">
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Customer Selection */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={onShowCustomerModal}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <User className="h-4 w-4" />
            {customer.name ? `Customer: ${customer.name}` : 'Add a customer'}
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-4">
          <div className="space-y-3">
            {cart.map(item => (
              <CartItem
                key={item.product.id}
                item={item}
                availableStock={getAvailableStock(item.product.id)}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
              />
            ))}
            
            {cart.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Your cart is empty</p>
                <p className="text-sm">Add products to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* POS Action Buttons - New Feature */}
        {cart.length > 0 && (
          <div className="px-4 pb-4 border-b border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => setShowDiscountModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <Percent className="w-4 h-4" />
                Discount
              </button>
              <button
                onClick={() => setShowPromoModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <Tag className="w-4 h-4" />
                Promo Code
              </button>
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <StickyNote className="w-4 h-4" />
                Note
              </button>
            </div>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="flex-shrink-0 border-t-2 border-gray-100 bg-white p-4">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Discount:</span>
                    <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxEnabled && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                    <span className="font-bold">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-[#1DA1F2]">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartPayment}
              className="w-full py-4 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pay ₹{finalTotal.toFixed(2)}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Apply Discount</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <select
                  value={discount.type}
                  onChange={(e) => setDiscount({...discount, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {discount.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                </label>
                <input
                  type="number"
                  value={discount.value}
                  onChange={(e) => setDiscount({...discount, value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max={discount.type === 'percentage' ? "100" : undefined}
                  placeholder={discount.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Apply Promo Code</h3>
            
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowPromoModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPromoCode}
                disabled={!promoCode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Apply Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Order Note</h3>
            
            <textarea
              placeholder="Add a note to this order..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPanel;