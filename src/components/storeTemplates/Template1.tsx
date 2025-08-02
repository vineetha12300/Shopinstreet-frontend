import React, { useState, useMemo } from 'react';
import { ShoppingCart, Eye, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  vendor_id: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface VendorStoreData {
  vendor_id: number;
  business_name: string;
  business_logo: string;
  categories: string[];
  filters: {
    priceRange: [number, number];
    availability: string[];
  };
  products: Product[];
  template_id: number;
}

interface TemplateProps {
  products: Product[];
  vendorInfo: {
    business_name: string;
    business_logo: string;
  };
  categories?: string[];
  filters?: {
    priceRange: [number, number];
    availability: string[];
  };
}

const Template1: React.FC<TemplateProps> = ({
  products,
  vendorInfo,
  categories = [],
  filters = { priceRange: [0, 1000], availability: [] }
}) => {
  const { business_name, business_logo } = vendorInfo;

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange[0],
    max: filters.priceRange[1]
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(16); // Increased for 4x4 grid

  // Calculate price bounds from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) {
      return { min: 0, max: 1000 };
    }
    const prices = products.map(p => p.price).filter(p => p != null);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Extract categories from products if not provided
  const availableCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products, categories]);

  // Filter products based on price range and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesPrice && matchesCategory;
    });
  }, [products, priceRange, selectedCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [priceRange, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const resetFilters = () => {
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });
    setSelectedCategory('');
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Helper function to get product image
  const getProductImage = (product: Product): string => {
    if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls[0];
    }
    return '/placeholder-image.jpg';
  };

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {business_logo && (
          <img
            src={business_logo}
            alt={`${business_name} logo`}
            className="w-10 h-10 rounded-lg object-cover"
          />
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-800">{business_name}</h1>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button
          onClick={() => setShowCart(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart ({getCartItemCount()})
        </button>
      </div>
    </header>

    <main className="flex">
      {/* Sidebar Filters */}
      {showFilters && (
        <aside className="w-72 bg-white shadow-md p-6 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto hidden lg:block">
          {/* Category Filter */}
          <div className="mb-6">
            <label className="text-sm font-semibold block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="text-sm font-semibold block mb-1">Price Range</label>
            <div className="flex gap-2 mb-1">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: +e.target.value }))}
                className="w-1/2 border rounded px-2 py-1"
              />
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: +e.target.value }))}
                className="w-1/2 border rounded px-2 py-1"
              />
            </div>
            <p className="text-xs text-gray-500">₹{priceBounds.min} - ₹{priceBounds.max}</p>
          </div>

          <button onClick={resetFilters} className="w-full bg-gray-200 rounded py-2 hover:bg-gray-300">
            Reset Filters
          </button>
        </aside>
      )}

      {/* Main Product Grid */}
      <section className="flex-1 p-6">
        {/* Product Stats */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600 text-sm">
              Showing {startIndex + 1}–{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
            </p>
            {selectedCategory && <p className="text-blue-600 text-xs">Category: {selectedCategory}</p>}
          </div>
          <div className="text-sm text-gray-500">Page {currentPage} of {totalPages}</div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map(product => (
            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                <p className="text-green-600 font-bold mt-2 mb-3">₹{product.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedProduct(product)} className="flex-1 bg-blue-600 text-white rounded py-1 text-sm hover:bg-blue-700">
                    View
                  </button>
                  <button onClick={() => addToCart(product)} className="flex-1 bg-green-600 text-white rounded py-1 text-sm hover:bg-green-700">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            <button onClick={goToPrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </main>

    {/* Cart Modal */}
    {showCart && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6 overflow-y-auto max-h-[80vh] relative">
          <button onClick={() => setShowCart(false)} className="absolute top-2 right-2 text-gray-600 hover:text-black">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={getProductImage(item)} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-green-600 text-sm">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded bg-gray-200">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded bg-gray-200">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <button className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    {/* Product Modal */}
    {selectedProduct && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
          <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 text-gray-600 hover:text-black">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
          <img src={getProductImage(selectedProduct)} className="w-full h-60 object-cover rounded mb-4" />
          <p className="text-sm text-gray-700 mb-4">{selectedProduct.description}</p>
          <p className="text-xl text-green-600 font-bold mb-4">₹{selectedProduct.price}</p>
          <button
            onClick={() => {
              addToCart(selectedProduct);
              setSelectedProduct(null);
            }}
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          >
            <ShoppingCart className="inline w-4 h-4 mr-1" />
            Add to Cart
          </button>
        </div>
      </div>
    )}
  </div>
);
}

export default Template1;