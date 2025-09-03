import React from 'react';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { MobileCartButtonProps } from '../cashier/types/cashier.types';

const MobileCartButton: React.FC<MobileCartButtonProps> = ({
  show,
  totalItems,
  finalTotal,
  onOpenCart
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-2xl p-4 shadow-2xl z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-bold">{totalItems} Items</span>
          </div>
          <div className="font-bold text-lg">
            ₹{finalTotal.toFixed(2)}
          </div>
        </div>
        <button
          onClick={onOpenCart}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-bold transition-all"
          style={{ minHeight: '44px' }}
        >
          View Cart
        </button>
      </div>
    </div>
  );
};

export default MobileCartButton;