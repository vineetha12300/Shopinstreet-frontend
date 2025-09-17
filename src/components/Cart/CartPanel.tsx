import React, { useState } from 'react';
import { User, X } from 'lucide-react';
import { CartPanelProps } from '../cashier/types/cashier.types';

interface UpdatedCartPanelProps extends CartPanelProps {
  // Discount and tax state from useCashier
  appliedDiscount: number;
  appliedPromo: string;
  taxSettings: Array<{name: string; rate: number}>;
  orderNote: string;
  discount: {type: string; value: number};
  promoCode: string;
  
  // Calculated values
  calculatedTotal: number;
  
  // Handlers from useCashier
  onApplyDiscount: () => void;
  onApplyPromoCode: () => void;
  onSetDiscount: (discount: {type: string; value: number}) => void;
  onSetPromoCode: (code: string) => void;
  onSetTaxSettings: (settings: Array<{name: string; rate: number}>) => void;
  onSetOrderNote: (note: string) => void;
  onResetCartState: () => void;
  onResetDiscount: () => void;  
  onResetPromo: () => void;
  onResetNote: () => void;   
}

const CartPanel: React.FC<UpdatedCartPanelProps> = ({
  cart,
  totalItems,
  subtotal,
  taxAmount,
  taxEnabled,
  taxRate,
  discountAmount,
  finalTotal,
  customer,
  
  // New props from useCashier
  appliedDiscount,
  appliedPromo,
  taxSettings,
  orderNote,
  discount,
  promoCode,
  calculatedTotal,
  
  // Handlers
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onShowCustomerModal,
  onStartPayment,
  getAvailableStock,
  onApplyDiscount,
  onApplyPromoCode,
  onSetDiscount,
  onSetPromoCode,
  onSetTaxSettings,
  onSetOrderNote,
  onResetCartState,
  onResetDiscount,  // Make sure this is here
  onResetPromo,
  onResetNote   // Make sure this is here
  
}) => {
  // Only modal visibility state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [currentTax, setCurrentTax] = useState({ name: '', rate: 0 });

  const handleClearCart = () => {
    onClearCart();
    onResetCartState();
  };
  // Add this import at the top if not already there

// Add this useEffect after your state declarations
React.useEffect(() => {
  if (cart.length === 0) {
    onResetCartState();
  }
}, [cart.length]);

  return (
    <div className="w-96 h-screen bg-gray-200 flex flex-col">
      <div className="p-4">
        {/* Main cart white container */}
        <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
          {/* Customer section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <button
              onClick={onShowCustomerModal}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">
                {customer?.name ? `Customer: ${customer.name}` : 'Add a customer'}
              </span>
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p className="text-sm">No items in cart</p>
              </div>
            ) : (
              <div className="px-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-800 mr-3">{item.quantity}</span>
                    <span className="text-gray-800 flex-1">{item.product.name}</span>
                    <span className="text-gray-800 mr-2">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                    <button 
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom section */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4">
              {/* Action buttons row */}
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setShowTaxModal(true)}
                    className={`text-sm py-2 px-3 rounded ${taxSettings.length > 0 ? 'text-blue-600 font-medium bg-blue-50' : 'text-black font-medium hover:bg-gray-50'}`}
                  >
                    {taxSettings.length > 0 ? `Tax (${taxSettings.length})` : 'Tax'}
                  </button>
                  <button 
                    onClick={() => setShowDiscountModal(true)}
                    className="text-blue-500 hover:text-blue-700 text-sm py-2 px-3 rounded hover:bg-blue-50"
                  >
                    Discount
                  </button>
                  <button 
                    onClick={() => setShowPromoModal(true)}
                    className="text-gray-600 hover:text-gray-800 text-sm py-2 px-3 rounded hover:bg-gray-50"
                  >
                    Promo Code
                  </button>
                  <button 
                    onClick={() => setShowNoteModal(true)}
                    className={`text-sm py-2 px-3 rounded ${orderNote ? 'text-purple-600 font-medium bg-purple-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                  >
                    {orderNote ? 'Note ✓' : 'Note'}
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleClearCart}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 border border-red-200 rounded hover:bg-red-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between mb-3">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Applied discount */}
              {appliedDiscount > 0 && (
                <div className="flex justify-between mb-3">
                  <span className="text-green-600">
                    Discount{appliedPromo && ` (${appliedPromo})`}
                  </span>
                  <span className="text-gray-900">-₹{appliedDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Multiple Taxes */}
              {taxSettings.map((tax, index) => (
                <div key={index} className="flex justify-between mb-3">
                  <span className="text-blue-500">{tax.name} {tax.rate}%</span>
                  <span className="text-gray-900">₹{(subtotal * tax.rate / 100).toFixed(2)}</span>
                </div>
              ))}

              {/* Pay Button */}
              <button 
                onClick={onStartPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition-colors"
              >
                Pay {totalItems} item{totalItems !== 1 ? 's' : ''} ₹{calculatedTotal.toFixed(2)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tax Modal */}
      {showTaxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Custom Tax</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tax Name</label>
                <input
                  type="text"
                  value={currentTax.name}
                  onChange={(e) => setCurrentTax({...currentTax, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., GST, VAT, Sales Tax"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={currentTax.rate}
                  onChange={(e) => setCurrentTax({...currentTax, rate: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Enter tax rate"
                />
              </div>

              {/* Show existing taxes */}
              {taxSettings.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Current Taxes</label>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {taxSettings.map((tax, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">{tax.name} ({tax.rate}%)</span>
                        <button
                          onClick={() => {
                            const newTaxes = taxSettings.filter((_, i) => i !== index);
                            onSetTaxSettings(newTaxes);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowTaxModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (currentTax.name && currentTax.rate > 0) {
                    onSetTaxSettings([...taxSettings, currentTax]);
                    setCurrentTax({ name: '', rate: 0 });
                  }
                  setShowTaxModal(false);
                }}
                disabled={!currentTax.name || currentTax.rate <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Add Tax
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
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
            onChange={(e) => onSetDiscount({...discount, type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            onChange={(e) => onSetDiscount({...discount, value: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            max={discount.type === 'percentage' ? "100" : undefined}
            placeholder={discount.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
          />
        </div>

        {/* Show current applied discount */}
        {appliedDiscount > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Current Discount</label>
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {appliedPromo ? `${appliedPromo}` : 'Manual Discount'} (-₹{appliedDiscount.toFixed(2)})
                </span>
                <button
                  onClick={() => {
                    onResetDiscount(); // Add this function to reset discount
                  }}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setShowDiscountModal(false)}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onApplyDiscount();
            setShowDiscountModal(false);
          }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Promo Code</label>
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => onSetPromoCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <p className="text-xs text-gray-500 mb-4">Try: SAVE10 or FLAT50</p>

        {/* Show current applied promo */}
        {appliedPromo && (
          <div>
            <label className="block text-sm font-medium mb-2">Current Promo Code</label>
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm">{appliedPromo} (-₹{appliedDiscount.toFixed(2)})</span>
                <button
  onClick={() => onResetPromo()}
  className="text-red-500 hover:text-red-700 text-xs"
>
  Remove
</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setShowPromoModal(false)}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onApplyPromoCode();
            setShowPromoModal(false);
          }}
          disabled={!promoCode}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
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
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Add Note</label>
          <textarea
            placeholder="Add a note to this order..."
            value={orderNote}
            onChange={(e) => onSetOrderNote(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Show current applied note */}
        {orderNote && (
          <div>
            <label className="block text-sm font-medium mb-2">Current Note</label>
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex justify-between items-start">
                <span className="text-sm flex-1 pr-2">{orderNote}</span>
                <button
                  onClick={() => onResetNote()}
                  className="text-red-500 hover:text-red-700 text-xs flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setShowNoteModal(false)}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => setShowNoteModal(false)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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