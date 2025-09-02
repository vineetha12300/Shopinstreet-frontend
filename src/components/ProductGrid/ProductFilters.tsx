import React from 'react';
import { Search } from 'lucide-react';
import { ProductFiltersProps } from '../cashier/types/cashier.types';

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Start typing or scanning..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none font-medium transition-all text-base"
        />
      </div>
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none font-medium min-w-[140px] transition-all"
      >
        <option value="all">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );
};

export default ProductFilters;
