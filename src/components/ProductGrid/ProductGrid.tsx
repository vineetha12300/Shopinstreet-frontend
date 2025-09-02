
// src/components/cashier/components/ProductGrid/ProductGrid.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductGridProps } from '../cashier/types/cashier.types';

const ProductGrid: React.FC<ProductGridProps> = ({
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
        <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No products found</p>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-2' 
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      }`}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            stockInfo={getStockDisplay(product)}
            onAddToCart={onAddToCart}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-600">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;