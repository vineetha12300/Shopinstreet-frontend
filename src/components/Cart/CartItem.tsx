// src/components/cashier/components/Cart/CartItem.tsx
import React from 'react';
import { Minus, Plus, X, AlertTriangle } from 'lucide-react';
import { CartItem as CartItemType } from '../cashier/types/cashier.types';

interface CartItemProps {
  item: CartItemType;
  availableStock: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  availableStock,
  onUpdateQuantity,
  onRemoveItem
}) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm flex-1 leading-tight pr-2 line-clamp-2">
          {item.product.name}
        </h3>
        <button
          onClick={() => onRemoveItem(item.product.id)}
          className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 hover:bg-red-100 rounded-lg transition-all"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all font-bold"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <div className="font-bold text-[#1DA1F2] text-lg">
            ₹{item.total_price.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            ₹{item.unit_price.toFixed(2)} each
          </div>
        </div>
      </div>
      
      {availableStock < item.quantity && (
        <div className="text-xs text-red-600 mt-2 flex items-center gap-1 bg-red-50 p-2 rounded-lg">
          <AlertTriangle className="h-3 w-3" />
          Only {availableStock} left in stock
        </div>
      )}
    </div>
  );
};

export default CartItem;