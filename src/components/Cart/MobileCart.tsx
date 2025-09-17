import React, { useState } from 'react';
import { User, X } from 'lucide-react';
import { MobileCartProps } from '../cashier/types/cashier.types';

const MobileCart: React.FC<MobileCartProps> = ({
  show,
  cart,
  totalItems,
  subtotal,
  finalTotal,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onStartPayment,
  getAvailableStock,
  onClearCart, // Add this prop
  onShowCustomerModal, // Add this prop
  customer // Add this prop
}) => {
  // POS feature states for mobile
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [promoCode, setPromoCode] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [taxSettings, setTaxSettings] = useState<{ name: string; rate: number }[]>([]);
  const [currentTax, setCurrentTax] = useState({ name: '', rate: 0 });

  const resetCartState = () => {
    setAppliedDiscount(0);
    setAppliedPromo('');
    setDiscount({ type: 'percentage', value: 0 });
    setPromoCode('');
    setOrderNote('');
    setTaxSettings([]);
  };

  const handleClearCart = () => {
    onClearCart();
    resetCartState();
  };

  const handleApplyDiscount = () => {
    if (discount.value > 0) {
      setAppliedPromo('');
      
      if (discount.type === 'percentage') {
        const discountValue = (subtotal * discount.value) / 100;
        setAppliedDiscount(discountValue);
      } else {
        setAppliedDiscount(Math.min(discount.value, subtotal));
      }
    }
    setShowDiscountModal(false);
  };

  const handleApplyPromoCode = () => {
    if (promoCode === 'SAVE10') {
      setAppliedDiscount(subtotal * 0.1);
      setAppliedPromo(promoCode);
      setDiscount({ type: 'percentage', value: 0 });
    } else if (promoCode === 'FLAT50') {
      setAppliedDiscount(50);
      setAppliedPromo(promoCode);
      setDiscount({ type: 'percentage', value: 0 });
    } else {
      alert('Invalid promo code');
      return;
    }
    setPromoCode('');
    setShowPromoModal(false);
  };

  // Calculate taxes and final total
  const totalTaxAmount = taxSettings.reduce((sum, tax) => sum + (subtotal * tax.rate / 100), 0);
  const calculatedTotal = subtotal - appliedDiscount + totalTaxAmount;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cart ({totalItems})</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Customer section */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
          <button 
            onClick={onShowCustomerModal}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 w-full"
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
                  <span className="text-gray-800 mr-3 text-sm">{item.quantity}</span>
                  <span className="text-gray-800 flex-1 text-sm">{item.product.name}</span>
                  <span className="text-gray-800 mr-2 text-sm">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
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
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
            {/* Action buttons - 2x2 grid for mobile */}
            <div className="space-y-3 mb-4">
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
                  Promo
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

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Subtotal</span>
                <span className="text-sm text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">
                    Discount{appliedPromo && ` (${appliedPromo})`}
                  </span>
                  <span className="text-sm text-gray-900">-₹{appliedDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Multiple Taxes */}
              {taxSettings.map((tax, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-blue-500">{tax.name} {tax.rate}%</span>
                  <span className="text-sm text-gray-900">₹{(subtotal * tax.rate / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Pay Button */}
            <button 
              onClick={onStartPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg text-lg transition-colors"
            >
              Pay {totalItems} item{totalItems !== 1 ? 's' : ''} ₹{Math.max(0, calculatedTotal).toFixed(2)}
            </button>
          </div>
        )}
      </div>

      {/* Tax Modal */}
      {showTaxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
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
                  <div className="space-y-2 max-h-20 overflow-y-auto">
                    {taxSettings.map((tax, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">{tax.name} ({tax.rate}%)</span>
                        <button
                          onClick={() => {
                            const newTaxes = taxSettings.filter((_, i) => i !== index);
                            setTaxSettings(newTaxes);
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
                    setTaxSettings([...taxSettings, currentTax]);
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
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Apply Discount</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <select
                  value={discount.type}
                  onChange={(e) => setDiscount({...discount, type: e.target.value})}
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
                  onChange={(e) => setDiscount({...discount, value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Apply Promo Code</h3>
            
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            
            <p className="text-xs text-gray-500 mb-4">Try: SAVE10 or FLAT50</p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPromoModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPromoCode}
                disabled={!promoCode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Order Note</h3>
            
            <textarea
              placeholder="Add a note to this order..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 resize-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-2">
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCart;