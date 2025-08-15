import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Eye, Filter, X, ChevronLeft, ChevronRight, Search, Star, Heart, Plus, Minus, Package, Tag, DollarSign } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  vendor_id: number;
  stock: number;
  rating?: number;
  reviews?: number;
  pricing_tiers?: {
    quantity: number;
    price: number;
  }[];
}

interface CartItem extends Product {
  quantity: number;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
  const [showCart, setShowCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Close product modal handler
  const closeProductModal = () => setSelectedProduct(null);

  // Pagination reset when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange, selectedCategory, priceFilter, searchTerm]);

  // Auto-advance carousel
  useEffect(() => {
    if (selectedProduct && selectedProduct.image_urls && selectedProduct.image_urls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev =>
          prev === selectedProduct.image_urls.length - 1 ? 0 : prev + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedProduct]);

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProduct]);

  // Extract categories from products if not provided
  const availableCategories = useMemo(() => {
    let finalCategories: string[] = [];

    if (Array.isArray(categories) && categories.length > 0) {
      finalCategories = categories
        .map(cat => (typeof cat === 'string' ? cat.trim() : ''))
        .filter(cat => cat !== '');
    } else {
      finalCategories = products
        .map(product => (typeof product.category === 'string' ? product.category.trim() : ''))
        .filter(cat => cat !== '');
    }

    // Remove case-based duplicates
    const uniqueCategories = Array.from(
      new Set(finalCategories.map(cat => cat.toLowerCase()))
    );

    return ['All', ...uniqueCategories];
  }, [categories, products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const productCategory = typeof product.category === 'string'
        ? product.category.trim().toLowerCase()
        : '';

      const selectedCategoryNormalized = selectedCategory.trim().toLowerCase();

      const matchesCategory =
        selectedCategoryNormalized === 'all' ||
        selectedCategoryNormalized === productCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesPrice = true;
      if (priceFilter === 'low') matchesPrice = product.price < 500;
      else if (priceFilter === 'medium') matchesPrice = product.price >= 500 && product.price < 1500;
      else if (priceFilter === 'high') matchesPrice = product.price >= 1500;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceFilter, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(p => p.id === product.id);
      if (existing) {
        return prevCart.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Update quantity of a cart item
  const updateQuantity = (productId: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const toggleFavorite = (productId: number) => {
    setFavoriteProducts(prev => {
      const updated = new Set(prev);
      if (updated.has(productId)) {
        updated.delete(productId);
      } else {
        updated.add(productId);
      }
      return updated;
    });
  };

  // Remove item from cart by id
  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getProductImage = (product: Product) => {
    if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls[0];
    }
    return '/api/placeholder/300/200';
  };

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  // Calculate total price of items in cart
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Image carousel navigation for product modal
  const prevImage = () => {
    if (!selectedProduct || !selectedProduct.image_urls) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProduct.image_urls.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    if (!selectedProduct || !selectedProduct.image_urls) return;
    setCurrentImageIndex((prev) =>
      prev === selectedProduct.image_urls.length - 1 ? 0 : prev + 1
    );
  };

  // Get total number of items in cart
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getPricingTierDisplay = (pricingTiers: { quantity: number; price: number; }[]) => {
    if (!pricingTiers || pricingTiers.length === 0) return null;

    return pricingTiers.map((tier, index) => (
      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">
          {tier.quantity}+ items
        </span>
        <span className="font-bold text-purple-600">₹{tier.price}</span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white shadow-xl border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {business_logo && (
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-1">
                  <img
                    src={business_logo}
                    alt={`${business_name} logo`}
                    className="w-full h-full rounded-xl object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{business_name}</h1>
                <p className="text-gray-600">{products.length} Products Available</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800 bg-gray-50"
              />
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Cart</span>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableCategories.map(category => {
                const normalizedCategory = category.toLowerCase();
                const isActive = selectedCategory.toLowerCase() === normalizedCategory;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(normalizedCategory)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹500</option>
              <option value="medium">₹500 - ₹1500</option>
              <option value="high">Above ₹1500</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="mx-auto px-4 py-8 max-w-screen-2xl">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px',
            padding: '24px',
            maxWidth: '1600px',
            margin: '0 auto',
          }}
        >
          {currentProducts.map((product) => {
            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  transform: 'translateY(0)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      transition: 'transform 0.3s',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      style={{
                        backgroundColor: favoriteProducts.has(product.id) ? '#ef4444' : '#ffffff',
                        color: favoriteProducts.has(product.id) ? '#ffffff' : '#4b5563',
                        padding: '8px',
                        borderRadius: '9999px',
                        border: 'none',
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedProduct(product)}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#4b5563',
                        padding: '8px',
                        borderRadius: '9999px',
                        border: 'none',
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {product.stock !== undefined && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: product.stock > 0 ? '#dcfce7' : '#fee2e2',
                          color: product.stock > 0 ? '#166534' : '#dc2626',
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    {product.category}
                  </div>

                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      color: '#1f2937',
                      height: '40px',
                      overflow: 'hidden',
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      height: '36px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                    }}
                  >
                    {product.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '18px' }}>
                      ₹{product.price}
                    </span>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      style={{
                        backgroundColor: product.stock === 0 ? '#e5e7eb' : '#7c3aed',
                        color: product.stock === 0 ? '#9ca3af' : 'white',
                        borderRadius: '9999px',
                        padding: '8px',
                        border: 'none',
                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end lg:items-center lg:justify-center">
          <div className="bg-white w-full lg:w-3/4 lg:max-w-2xl max-h-[80vh] lg:rounded-2xl overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500">Add some amazing products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{item.name}</h4>
                        <p className="text-purple-600 font-bold">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">Total: ₹{getTotalPrice().toFixed(2)}</span>
                  <span className="text-gray-600">{getCartItemCount()} items</span>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal with Carousel */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{selectedProduct.name}</h2>
                <button
                  onClick={() => closeProductModal()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Image Carousel */}
                <div>
                  <div className="relative mb-4">
                    <img
                      src={selectedProduct.image_urls && selectedProduct.image_urls.length > 0
                        ? selectedProduct.image_urls[currentImageIndex]
                        : '/api/placeholder/400/300'}
                      alt={selectedProduct.name}
                      className="w-full h-96 object-cover rounded-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                      }}
                    />

                    {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Carousel indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {selectedProduct.image_urls.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto">
                      {selectedProduct.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className={`w-20 h-20 object-cover rounded-xl flex-shrink-0 cursor-pointer transition-all ${index === currentImageIndex ? 'ring-2 ring-purple-500' : 'opacity-70 hover:opacity-100'
                            }`}
                          onClick={() => setCurrentImageIndex(index)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder/80/80';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {selectedProduct.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">(4.5)</span>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>

                  {/* Stock Info */}
                  {selectedProduct.stock !== undefined && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Package className="w-5 h-5 text-gray-500" />
                      <span className={`font-medium ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} items in stock` : 'Out of stock'}
                      </span>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                      <span className="text-4xl font-bold text-purple-600">₹{selectedProduct.price}</span>
                    </div>

                    {/* Pricing Tiers */}
                    {selectedProduct.pricing_tiers && selectedProduct.pricing_tiers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800">Bulk Pricing</h4>
                        <div className="space-y-2">
                          {getPricingTierDisplay(selectedProduct.pricing_tiers)}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleFavorite(selectedProduct.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${favoriteProducts.has(selectedProduct.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-red-50'
                          }`}
                      >
                        <Heart className="w-5 h-5" />
                        {favoriteProducts.has(selectedProduct.id) ? 'Favorited' : 'Add to Favorites'}
                      </button>

                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          closeProductModal();
                        }}
                        disabled={selectedProduct.stock === 0}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all shadow-lg flex-1 ${selectedProduct.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                          }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Template1;