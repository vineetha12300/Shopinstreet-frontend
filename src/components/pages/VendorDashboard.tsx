/**
 * Product Dashboard with Advanced Filters and Redesigned Header
 * - Removed product dashboard header
 * - Added search bar and advanced filters at the top
 * - Added stock status filters (Low Stock, Out of Stock, In Stock)
 * - Added price range filters
 * - Added category filters
 * - Added separate processing modals for each CRUD operation
 * - Added disabled button functionality during processing
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
  ChevronDown,
  RefreshCw,
  Save
} from 'lucide-react';

// Your existing product imports
import { Product } from '../product/IProductTypes';
import ProductDetail from '../product/ProductDetail';
import ProductForm from '../product/ProductForm';
import DeleteConfirmationModal from '../ReUsebleComponents/DeleteConfirmationModal';
import CreateProductProcessingModal from '../ReUsebleComponents/CreateProductProcessingModal';
import UpdateProductProcessingModal from '../ReUsebleComponents/UpdateProductProcessingModal';
import DeleteProductProcessingModal from '../ReUsebleComponents/DeleteProductProcessingModal';
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
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // ===== SORTING STATE =====
  const [sortBy, setSortBy] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // ===== SEPARATE PROCESSING MODALS =====
  const [showCreateProcessingModal, setShowCreateProcessingModal] = useState<boolean>(false);
  const [showUpdateProcessingModal, setShowUpdateProcessingModal] = useState<boolean>(false);
  const [showDeleteProcessingModal, setShowDeleteProcessingModal] = useState<boolean>(false);
  const [processingProductName, setProcessingProductName] = useState<string>('');

  // ===== ADVANCED FILTER STATE =====
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: null, max: null });
  const [categories, setCategories] = useState<string[]>([]);

  // ===== PAGINATION STATE =====
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // ===== GLOBAL PROCESSING STATE =====
  const [globalProcessing, setGlobalProcessing] = useState<boolean>(false);

  // ===== HOOKS =====
  const { fetchProducts, updateProduct, deleteProduct, createProduct } = useProductAPI();
  const toastService = ToastService.getInstance();

  // Helper function to check if any processing is happening
  const isAnyProcessing = () => {
    return isSubmitting || globalProcessing || showCreateProcessingModal || showUpdateProcessingModal || showDeleteProcessingModal;
  };

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

  // ===== BUTTON COMPONENTS =====
  const AddProductButton = () => (
    <button 
      onClick={handleAddProduct}
      disabled={isAnyProcessing()}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ml-auto ${
        isAnyProcessing()
          ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60 shadow-none' 
          : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md transform hover:scale-105'
      }`}
      title={isAnyProcessing() ? 'Please wait for current operation to complete' : 'Add new product'}
    >
      {isAnyProcessing() ? (
        <>
          <RefreshCw size={18} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <PlusCircle size={18} />
          <span>Add Product</span>
        </>
      )}
    </button>
  );

  const ActionButtons = ({ product }: { product: Product }) => (
    <div className="flex space-x-2">
      <button 
        onClick={() => handleSelectProduct(product)} 
        disabled={isAnyProcessing()}
        className={`p-2 rounded transition-all ${
          isAnyProcessing()
            ? 'text-gray-300 cursor-not-allowed bg-gray-100'
            : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
        }`}
        title={isAnyProcessing() ? 'Please wait...' : 'View Details'}
      >
        <Eye size={16} />
      </button>
      
      <button 
        onClick={() => handleEditProduct(product)} 
        disabled={isAnyProcessing()}
        className={`p-2 rounded transition-all ${
          isAnyProcessing()
            ? 'text-gray-300 cursor-not-allowed bg-gray-100'
            : 'text-green-500 hover:text-green-700 hover:bg-green-50'
        }`}
        title={isAnyProcessing() ? 'Please wait...' : 'Edit Product'}
      >
        <Edit size={16} />
      </button>
      
      <button 
        onClick={() => handleDeleteClick(product)}
        disabled={isAnyProcessing()}
        className={`p-2 rounded transition-all ${
          isAnyProcessing()
            ? 'text-gray-300 cursor-not-allowed bg-gray-100'
            : 'text-red-500 hover:text-red-700 hover:bg-red-50'
        }`}
        title={isAnyProcessing() ? 'Please wait...' : 'Delete Product'}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  const ProcessingOverlay = () => {
    const isProcessing = showCreateProcessingModal || showUpdateProcessingModal || showDeleteProcessingModal;
    
    if (!isProcessing) return null;
    
    return (
      <>
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-30 pointer-events-auto" />
        <div className="fixed top-4 right-4 z-40 bg-white rounded-lg shadow-lg p-3 border">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Processing...</span>
          </div>
        </div>
      </>
    );
  };

  // ===== CRUD OPERATIONS WITH PROPER PROCESSING MODAL TIMING =====
  const handleSaveProduct = async (product: Product) => {
    try {
      setIsSubmitting(true);
      setGlobalProcessing(true);
      
      if (isAdding) {
        setProcessingProductName(product.name);
        setShowCreateProcessingModal(true);
        
        try {
          console.log('Creating new product:', product);
          const newProduct = await createProduct(product);
          
          setAllProducts(prev => [newProduct, ...prev]);
          toastService.addToast('Product created successfully!', 'success');
          
          setIsAdding(false);
          setSelectedProduct(null);
          setCurrentPage(1);
          
        } catch (error: any) {
          setShowCreateProcessingModal(false);
          throw error;
        }
        
      } else if (selectedProduct) {
        setProcessingProductName(selectedProduct.name);
        setShowUpdateProcessingModal(true);
        
        try {
          console.log('Updating product:', product);
          const updatedProduct = await updateProduct(selectedProduct.id, product);
          
          setAllProducts(prev => {
            const filtered = prev.filter(p => p.id !== selectedProduct.id);
            return [updatedProduct, ...filtered];
          });
          
          toastService.addToast('Product updated successfully!', 'success');
          setIsEditing(false);
          setSelectedProduct(updatedProduct);
          setCurrentPage(1);
          
        } catch (error: any) {
          setShowUpdateProcessingModal(false);
          throw error;
        }
      }
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      setShowCreateProcessingModal(false);
      setShowUpdateProcessingModal(false);
      
      let errorMessage = 'Failed to save product';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => 
            typeof err === 'object' ? err.msg || err.message || String(err) : String(err)
          ).join(', ');
        } else {
          errorMessage = String(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toastService.addToast(errorMessage, 'error');
      
    } finally {
      setIsSubmitting(false);
      setGlobalProcessing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      setIsSubmitting(true);
      setGlobalProcessing(true);
      
      setProcessingProductName(productToDelete.name);
      setShowDeleteProcessingModal(true);
      
      try {
        console.log('Deleting product:', productToDelete);
        await deleteProduct(productToDelete.id);
        
        setAllProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        toastService.addToast('Product deleted successfully!', 'success');
        
        setShowDeleteModal(false);
        setProductToDelete(null);
        
        if (selectedProduct?.id === productToDelete.id) {
          setSelectedProduct(null);
          setIsEditing(false);
        }
        
      } catch (error: any) {
        setShowDeleteProcessingModal(false);
        throw error;
      }
      
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setShowDeleteProcessingModal(false);
      
      let errorMessage = 'Failed to delete product';
      if (error.response?.data?.detail) {
        errorMessage = String(error.response.data.detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toastService.addToast(errorMessage, 'error');
      
    } finally {
      setIsSubmitting(false);
      setGlobalProcessing(false);
    }
  };

  // ===== UI INTERACTION HANDLERS =====
  const handleSort = (column: SortColumn): void => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleSelectProduct = (product: Product): void => {
    if (isAnyProcessing()) return;
    setSelectedProduct(product);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleAddProduct = (): void => {
    if (isAnyProcessing()) return;
    setIsAdding(true);
    setSelectedProduct(null);
    setIsEditing(false);
  };

  const handleEditProduct = (product: Product): void => {
    if (isAnyProcessing()) return;
    setSelectedProduct(product);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDeleteClick = (product: Product): void => {
    if (isAnyProcessing()) return;
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // ===== PAGINATION FUNCTIONS =====
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

  // ===== PRODUCT LIST COMPONENT =====
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
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionButtons product={product} />
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
              disabled={isAnyProcessing()}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${
                isAnyProcessing()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
              }`}
            />
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isAnyProcessing() ? 'text-gray-300' : 'text-gray-400'
            }`} />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={isAnyProcessing()}
            className={`border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px] transition-all ${
              isAnyProcessing()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
            }`}
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
            disabled={isAnyProcessing()}
            className={`border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[160px] transition-all ${
              isAnyProcessing()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
            }`}
          >
            <option value="all">All Stock ({allProducts.length})</option>
            <option value="out_of_stock">Out of Stock ({stockCounts.outOfStock})</option>
            <option value="low_stock">Low Stock ≤20 ({stockCounts.lowStock})</option>
            <option value="in_stock">In Stock {`>`}20 ({stockCounts.inStock})</option>
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
              disabled={isAnyProcessing()}
              className={`w-20 border rounded px-2 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                isAnyProcessing()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
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
              disabled={isAnyProcessing()}
              className={`w-20 border rounded px-2 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                isAnyProcessing()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>

          {/* Items Per Page */}
          <select
            value={itemsPerPage.toString()}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            disabled={isAnyProcessing()}
            className={`border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[100px] transition-all ${
              isAnyProcessing()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                : 'bg-white text-gray-900 border-gray-300'
            }`}
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
              disabled={isAnyProcessing()}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-lg transition-all border ${
                isAnyProcessing()
                  ? 'text-gray-300 cursor-not-allowed bg-gray-100 border-gray-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-300'
              }`}
              title={isAnyProcessing() ? 'Please wait...' : 'Clear all filters'}
            >
              <X size={16} />
              <span className="text-sm">Clear</span>
            </button>
          )}

          {/* Add Product Button */}
          <AddProductButton />
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
        <div className={`${selectedProduct || isAdding || isEditing ? 'w-2/3' : 'w-full'} overflow-auto transition-all duration-300`}>
          <div className="p-4">
            <ProductListTable />
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-white border-t-2 border-blue-200 px-4 py-4 shadow-lg">
              <div className="flex items-center justify-center space-x-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isAnyProcessing()}
                  className={`px-4 py-2 text-sm font-bold rounded-l-lg border transition-all ${
                    currentPage === 1 || isAnyProcessing()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  }`}
                >
                  First
                </button>

                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || isAnyProcessing()}
                  className={`px-3 py-2 text-sm font-bold border-t border-b transition-all ${
                    currentPage === 1 || isAnyProcessing()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  }`}
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
                      disabled={isAnyProcessing()}
                      className={`px-4 py-2 text-sm font-bold border-t border-b transition-all ${
                        isAnyProcessing()
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                          : currentPage === page
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
                  disabled={currentPage === totalPages || isAnyProcessing()}
                  className={`px-3 py-2 text-sm font-bold border-t border-b transition-all ${
                    currentPage === totalPages || isAnyProcessing()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || isAnyProcessing()}
                  className={`px-4 py-2 text-sm font-bold border rounded-r-lg transition-all ${
                    currentPage === totalPages || isAnyProcessing()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  }`}
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
                product={isAdding ? null : selectedProduct}
                onSave={handleSaveProduct}
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

      {/* Processing Overlay */}
      {ProcessingOverlay()}

      {/* Separate Processing Modals */}
      <CreateProductProcessingModal
        isVisible={showCreateProcessingModal}
        productName={processingProductName}
        onComplete={() => setShowCreateProcessingModal(false)}
      />

      <UpdateProductProcessingModal
        isVisible={showUpdateProcessingModal}
        productName={processingProductName}
        onComplete={() => setShowUpdateProcessingModal(false)}
      />

      <DeleteProductProcessingModal
        isVisible={showDeleteProcessingModal}
        productName={processingProductName}
        onComplete={() => setShowDeleteProcessingModal(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <DeleteConfirmationModal
          productName={productToDelete.name}
          onConfirm={handleDeleteProduct}
          onCancel={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
        isSubmitting={isSubmitting} 
        />
      )}
    </div>
  );
};

export default ProductDashboard;