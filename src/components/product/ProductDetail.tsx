import React, { useState } from 'react';
import { Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from './IProductTypes';

interface ProductDetailProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onEdit, onDelete, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const nextImage = () => {
    if (product.image_urls.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.image_urls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product.image_urls.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.image_urls.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{product.name}</h2>
        <div className="flex space-x-2">
          <button 
            onClick={onEdit} 
            className="flex items-center text-blue-500 hover:text-blue-700 px-3 py-1 border border-blue-500 rounded-md hover:bg-blue-50"
          >
            <Edit size={18} className="mr-1" />
            <span>Edit</span>
          </button>
          <button 
            onClick={onDelete} 
            className="flex items-center text-red-500 hover:text-red-700 px-3 py-1 border border-red-500 rounded-md hover:bg-red-50"
          >
            <Trash2 size={18} className="mr-1" />
            <span>Delete</span>
          </button>
          {onClose && (
            <button 
              onClick={onClose} 
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X size={18} className="mr-1" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Image gallery with navigation */}
      <div className="relative">
        <img 
          src={product.image_urls[currentImageIndex] || '/api/placeholder/200/200'} 
          alt={product.name} 
          className="w-full h-48 object-contain rounded-lg bg-gray-50"
        />
        
        {product.image_urls.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="flex justify-center mt-2">
              {product.image_urls.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-medium">{product.category}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Available Stock</p>
          <p className="font-medium">{product.stock}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Base Price</p>
          <p className="font-medium">${product.price?.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Created</p>
          <p className="font-medium">{formatDate(product.created_at)}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-gray-700">{product.description}</p>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Pricing Tiers</h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity (MOQ)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.pricing_tiers.map(tier => (
                <tr key={tier.id}>
                  <td className="px-4 py-2">{tier.moq}+</td>
                  <td className="px-4 py-2">${tier.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;