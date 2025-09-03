import React from 'react';
import { ShoppingCart, X } from 'lucide-react';
import CartItem from './CartItem';
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
  getAvailableStock
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({totalItems})
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="h-5 w-5" />
            </button>
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
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-[#1DA1F2]">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartPayment}
              className="w-full py-4 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95"
              style={{ minHeight: '44px' }}
            >
              Pay ₹{finalTotal.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCart;