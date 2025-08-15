import React from 'react';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import { Product } from './IProductTypes';

interface ProductListProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  selectedProductId?: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: any) => void;
  isSubmitting?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  selectedProductId,
  sortBy,
  sortDirection,
  onSort,
  isSubmitting = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center">
                Name
                <ArrowUpDown size={14} className="ml-1" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('category')}
            >
              <div className="flex items-center">
                Category
                <ArrowUpDown size={14} className="ml-1" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('quantity')}
            >
              <div className="flex items-center">
                Stock
                <ArrowUpDown size={14} className="ml-1" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('price')}
            >
              <div className="flex items-center">
                Base Price
                <ArrowUpDown size={14} className="ml-1" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map(product => (
            <tr 
              key={product.id}
              className={`hover:bg-gray-50 cursor-pointer ${selectedProductId === product.id ? 'bg-blue-50' : ''}`}
              onClick={() => onSelectProduct(product)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <img 
                  src={product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/api/placeholder/50/50'} 
                  alt={product.name} 
                  className="h-12 w-12 rounded-md object-cover" 
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{product.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{product.category}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${product.stock > 100 ? 'text-green-600' : product.stock > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {product.stock}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs rounded-full bg-black text-white font-medium">
                  ${product.price?.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-4" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => onEditProduct(product)} 
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    <Edit size={18} className="mr-1" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => onDeleteProduct(product)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <Trash2 size={18} className="mr-1" />
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                No products found matching your criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;