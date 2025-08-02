/**
 * Product Dashboard with Advanced Filters and Redesigned Header
 * - Removed product dashboard header
 * - Added search bar and advanced filters at the top
 * - Added stock status filters (Low Stock, Out of Stock, In Stock)
 * - Added price range filters
 * - Added category filters
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  PlusCircle, 
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';

// Your existing product imports
import { Product } from '../product/IProductTypes';
import ProductDetail from '../product/ProductDetail';
import ProductForm from '../product/ProductForm';
import DeleteConfirmationModal from '../ReUsebleComponents/DeleteConfirmationModal';
import ProductProcessingModal from '../ReUsebleComponents/ProductProcessingModal';
import { useProductAPI } from '../../hooks/useProductAPI';
import ToastService from '../../utils/ToastService';

type SortColumn = 'name' | 'category' | 'stock' | 'price';
type SortDirection = 'asc' | 'desc';
type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

interface PriceRange {
  min: number | null;
  max: number | null;
}

const ProductDashboard: React.FC = () => {
  // ===== PRODUCT STATE =====
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showProcessingModal, setShowProcessingModal] = useState<boolean>(false);
  const [processingProductName, setProcessingProductName] = useState<string>('');

  // ===== ADVANCED FILTER STATE =====
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: null, max: null });
  const [categories, setCategories] = useState<string[]>([]);

  // ===== PAGINATION STATE =====
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // ===== HOOKS =====
  const { fetchProducts, updateProduct, deleteProduct, createProduct } = useProductAPI();
  const toastService = ToastService.getInstance();

  // ===== FILTER LOGIC =====
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(product => {
        // Search filter
        const searchLower = search.toLowerCase();
        const matchesSearch = search === "" || 
          product.name.toLowerCase().includes(searchLower) || 
          product.description?.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.id.toString().includes(searchLower);
        
        // Category filter
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        
        // Stock filter
        let matchesStock = true;
        if (stockFilter === 'out_of_stock') {
          matchesStock = product.stock === 0;
        } else if (stockFilter === 'low_stock') {
          matchesStock = product.stock > 0 && product.stock <= 20;
        } else if (stockFilter === 'in_stock') {
          matchesStock = product.stock > 20;
        }
        
        // Price range filter
        const matchesPrice = 
          (priceRange.min === null || product.price >= priceRange.min) &&
          (priceRange.max === null || product.price <= priceRange.max);
        
        return matchesSearch && matchesCategory && matchesStock && matchesPrice;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'category') {
          comparison = a.category.localeCompare(b.category);
        } else if (sortBy === 'stock') {
          comparison = a.stock - b.stock;
        } else if (sortBy === 'price') {
          comparison = a.price - b.price;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [allProducts, search, categoryFilter, stockFilter, priceRange, sortBy, sortDirection]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageProducts = filteredProducts.slice(startIndex, endIndex);

  // ===== EFFECTS =====
  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter, priceRange]);

  // ===== FUNCTIONS =====
  const loadAllProducts = async (): Promise<void> => {
    try {
      console.log('🔄 Loading ALL products...');
      const productsResponse = await fetchProducts(1, 1000);
      
      if (productsResponse.data && Array.isArray(productsResponse.data)) {
        console.log(`✅ Loaded ${productsResponse.data.length} total products`);
        setAllProducts(productsResponse.data);
        
        const uniqueCategories: string[] = [...new Set(productsResponse.data.map((product: Product) => product.category))];
        setCategories(uniqueCategories);
      } else {
        console.error("Failed to fetch products:", productsResponse.error);
        toastService.addToast("Failed to fetch products", "error");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toastService.addToast("Error loading products", "error");
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
    setPriceRange({ min: null, max: null });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (categoryFilter !== 'all') count++;
    if (stockFilter !== 'all') count++;
    if (priceRange.min !== null || priceRange.max !== null) count++;
    return count;
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Out of Stock</span>;
    if (stock <= 20) return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Low Stock</span>;
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">In Stock</span>;
  };

  const getStockFilterCounts = () => {
    const outOfStock = allProducts.filter(p => p.stock === 0).length;
    const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= 20).length;
    const inStock = allProducts.filter(p => p.stock > 20).length;
    return { outOfStock, lowStock, inStock };
  };

  const stockCounts = getStockFilterCounts();

  // Placeholder functions for CRUD operations
  const handleSort = (column: SortColumn): void => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleSelectProduct = (product: Product): void => {
    if (isSubmitting) return;
    setSelectedProduct(product);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleAddProduct = (): void => {
    if (isSubmitting) return;
    setIsAdding(true);
    setSelectedProduct(null);
    setIsEditing(false);
  };

  const handleEditProduct = (product: Product): void => {
    if (isSubmitting) return;
    setSelectedProduct(product);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDeleteClick = (product: Product): void => {
    if (isSubmitting) return;
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Pagination functions
  const handlePageChange = (page: number): void => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const goToNextPage = (): void => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const goToPrevPage = (): void => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Product list component
  const ProductListTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name
                <ArrowUpDown size={14} className="ml-1" />
                {sortBy === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center">
                Category
                <ArrowUpDown size={14} className="ml-1" />
                {sortBy === 'category' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('stock')}
            >
              <div className="flex items-center">
                Stock
                <ArrowUpDown size={14} className="ml-1" />
                {sortBy === 'stock' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center">
                Price
                <ArrowUpDown size={14} className="ml-1" />
                {sortBy === 'price' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentPageProducts.map(product => (
            <tr 
              key={product.id}
              className={`hover:bg-gray-50 cursor-pointer ${selectedProduct?.id === product.id ? 'bg-blue-50' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <img 
                  src={product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/api/placeholder/50/50'} 
                  alt={product.name} 
                  className="h-12 w-12 rounded-md object-cover cursor-pointer" 
                  onClick={() => handleSelectProduct(product)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectProduct(product)}>
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">ID: {product.id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectProduct(product)}>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{product.category}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectProduct(product)}>
                <div>
                  <span className={`${product.stock > 100 ? 'text-green-600' : product.stock > 20 ? 'text-yellow-600' : 'text-red-600'} font-medium`}>
                    {product.stock} units
                  </span>
                  <div className="mt-1">
                    {getStockBadge(product.stock)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectProduct(product)}>
                <span className="font-medium">₹{product.price?.toFixed(2)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSelectProduct(product)} 
                    className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditProduct(product)} 
                    className="text-green-500 hover:text-green-700 p-2 rounded hover:bg-green-50"
                    title="Edit Product"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(product)}
                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                    title="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {currentPageProducts.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* NEW HEADER with Inline Search and Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        {/* Main Filter Row */}
        <div className="flex items-center gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2.5 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px]"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className="border rounded-lg px-3 py-2.5 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[160px]"
          >
            <option value="all">All Stock ({allProducts.length})</option>
            <option value="out_of_stock">Out of Stock ({stockCounts.outOfStock})</option>
            <option value="low_stock">Low Stock &le;20 ({stockCounts.lowStock})</option>
            <option value="in_stock">In Stock &gt;20 ({stockCounts.inStock})</option>
          </select>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={priceRange.min || ''}
              onChange={(e) => setPriceRange({
                ...priceRange,
                min: e.target.value ? Number(e.target.value) : null
              })}
              className="w-20 border rounded px-2 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-gray-500 text-sm">-</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={priceRange.max || ''}
              onChange={(e) => setPriceRange({
                ...priceRange,
                max: e.target.value ? Number(e.target.value) : null
              })}
              className="w-20 border rounded px-2 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Items Per Page */}
          <select
            value={itemsPerPage.toString()}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2.5 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[100px]"
          >
            <option value="5">5/page</option>
            <option value="10">10/page</option>
            <option value="20">20/page</option>
            <option value="50">50/page</option>
            <option value="100">100/page</option>
          </select>

          {/* Clear Filters Button */}
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all border"
              title="Clear all filters"
            >
              <X size={16} />
              <span className="text-sm">Clear</span>
            </button>
          )}

          {/* Add Product Button */}
          <button 
            onClick={handleAddProduct}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ml-auto ${
              isSubmitting 
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-60' 
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
            }`}
          >
            <PlusCircle size={18} />
            <span>{isSubmitting ? 'Processing...' : 'Add Product'}</span>
          </button>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center gap-4">
            <span>
              Showing {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalItems)} of {totalItems} products
              {getActiveFilterCount() > 0 && ` (filtered from ${allProducts.length} total)`}
            </span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
              </span>
            )}
          </div>
          {totalItems > 0 && (
            <span className="text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products List */}
        <div className={`${selectedProduct || isAdding ? 'w-2/3' : 'w-full'} overflow-auto transition-all duration-300`}>
          <div className="p-4">
            <ProductListTable />
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-white border-t-2 border-blue-200 px-4 py-4 shadow-lg">
              <div className="flex items-center justify-center space-x-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 border border-blue-600 rounded-l-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  First
                </button>

                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-bold text-white bg-blue-600 border-t border-b border-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: Math.min(7, totalPages) }, (_, index) => {
                  const startPage = Math.max(1, currentPage - 3);
                  const page = startPage + index;
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 text-sm font-bold border-t border-b transition-all ${
                        currentPage === page
                          ? 'bg-yellow-400 text-black border-yellow-400 transform scale-110 shadow-lg'
                          : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-bold text-white bg-blue-600 border-t border-b border-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 border border-blue-600 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Product Details/Form */}
        {(selectedProduct || isAdding || isEditing) && (
          <div className="w-1/3 bg-white border-l p-4 overflow-auto">
            {selectedProduct && !isEditing && !isAdding && (
              <ProductDetail 
                product={selectedProduct}
                onEdit={() => handleEditProduct(selectedProduct)} 
                onDelete={() => handleDeleteClick(selectedProduct)}
                onClose={() => setSelectedProduct(null)}
              />
            )}

            {(isEditing || isAdding) && (
              <ProductForm 
                product={isEditing ? selectedProduct : null}
                onSave={async (product) => {
                  // Handle save logic here
                  console.log('Saving product:', product);
                }}
                onCancel={() => {
                  setIsEditing(false);
                  if (isAdding) {
                    setIsAdding(false);
                    setSelectedProduct(null);
                  }
                }}
                isAdding={isAdding}
              />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductProcessingModal
        isVisible={showProcessingModal}
        productName={processingProductName}
        onComplete={() => setShowProcessingModal(false)}
      />

      {showDeleteModal && productToDelete && (
        <DeleteConfirmationModal
          productName={productToDelete.name}
          onConfirm={async () => {
            // Handle delete logic here
            console.log('Deleting product:', productToDelete);
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductDashboard;