import React from 'react';
import { ShoppingCart, User, CreditCard } from 'lucide-react';
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
  return (
    <div className="w-96 bg-white border-l-2 border-gray-100 flex flex-col shadow-xl">
      <div className="flex-shrink-0 p-4 border-b-2 border-gray-100 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({totalItems})
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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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

      {cart.length > 0 && (
        <div className="flex-shrink-0 border-t-2 border-gray-100 bg-white p-4">
          <div className="space-y-4">
            <button
              onClick={onShowCustomerModal}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all flex items-center justify-center gap-2 text-sm font-medium"
              style={{ minHeight: '44px' }}
            >
              <User className="h-4 w-4" />
              {customer.name ? `Customer: ${customer.name}` : 'Add Customer (Optional)'}
            </button>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                {taxEnabled && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                    <span className="font-bold">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Discount:</span>
                    <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
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
    </div>
  );
};

export default CartPanel;