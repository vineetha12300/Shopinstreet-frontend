// src/components/cashier/components/ProductGrid/ProductCard.tsx - Lightspeed Style
import React from 'react';
import { Package } from 'lucide-react';
import { CashierProduct, StockDisplay } from '../cashier/types/cashier.types';

interface ProductCardProps {
  product: CashierProduct;
  stockInfo: StockDisplay;
  onAddToCart: (product: CashierProduct) => void;
  isMobile: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
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
      className={`bg-white border border-gray-200 transition-all duration-150 cursor-pointer group ${
        stockInfo.disabled 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:border-[#1DA1F2] hover:shadow-md active:scale-98'
      }`}
      onClick={handleClick}
      style={{ 
        minHeight: '140px',
        minWidth: isMobile ? '160px' : '180px'
      }}
    >
      {/* Product Image */}
      <div className="relative h-20 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package className="h-10 w-10 text-gray-300" />
        )}
        
        {/* Stock Status Indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${
            stockInfo.stockCount === 0 ? 'bg-red-500' :
            stockInfo.stockCount <= 5 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`} />
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="text-lg font-bold text-[#1DA1F2]">
          ₹{product.price.toFixed(2)}
        </div>
        
        {/* Stock Count - Lightspeed Style */}
        <div className={`text-xs font-medium ${
          stockInfo.stockCount === 0 ? 'text-red-600' :
          stockInfo.stockCount <= 5 ? 'text-yellow-600' : 
          'text-gray-600'
        }`}>
          {stockInfo.stockCount === 0 ? 'Out of Stock' : `${stockInfo.stockCount} in stock`}
        </div>
        
        {/* SKU */}
        {product.sku && (
          <div className="text-xs text-gray-500 font-mono">
            {product.sku}
          </div>
        )}
      </div>
      
      {/* Hover Add Effect */}
      {/* {!stockInfo.disabled && (
        <div className="absolute inset-0 bg-[#FFFFFF] bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-150 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="text-white px-3 py-1 rounded-full text-xs font-semibold">
              Tap to add
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ProductCard;