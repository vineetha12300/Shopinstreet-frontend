import React, { useState, useMemo } from 'react';
import { ShoppingCart, Eye, Search, Heart, Plus, Minus, X, Filter, ArrowRight, Star } from 'lucide-react';

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

const Template2: React.FC<TemplateProps> = ({
  products,
  vendorInfo,
  categories = [],
  filters = { priceRange: [0, 1000], availability: [] }
}) => {
  const { business_name, business_logo } = vendorInfo;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

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
      if (priceFilter === 'low') matchesPrice = product.price < 1000;
      else if (priceFilter === 'medium') matchesPrice = product.price >= 1000 && product.price < 10000;
      else if (priceFilter === 'high') matchesPrice = product.price >= 10000;

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

  const toggleFavorite = (productId: number) => {
    setFavoriteProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const getProductImage = (product: Product): string => {
    if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls[0];
    }
    return '/api/placeholder/400/400';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              {business_logo ? (
                <img
                  src={business_logo}
                  alt={business_name}
                  className="h-8 w-8 md:h-10 md:w-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-8 w-8 md:h-10 md:w-10 bg-black rounded-sm"></div>
              )}
              <h1 className="text-xl md:text-2xl font-light tracking-wide text-gray-900">
                {business_name}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {availableCategories.slice(0, 5).map(category => {
                const normalizedCategory = category.toLowerCase();
                const isActive = selectedCategory.toLowerCase() === normalizedCategory;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(normalizedCategory)}
                    className={`text-sm font-light tracking-wide transition-colors duration-300 ${
                      isActive
                        ? 'text-black border-b border-black pb-1'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-600 hover:text-black transition-colors md:hidden"
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-0 rounded-none focus:bg-white focus:ring-1 focus:ring-gray-300 focus:outline-none text-sm transition-all duration-300"
                />
              </div>

              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-black transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-gray-300 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden border-t border-gray-100 px-4 py-4 bg-white">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => {
                  const normalizedCategory = category.toLowerCase();
                  const isActive = selectedCategory.toLowerCase() === normalizedCategory;

                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(normalizedCategory);
                        setShowFilters(false);
                      }}
                      className={`px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-4">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="flex-1 px-3 py-2 bg-gray-50 border-0 text-sm focus:bg-white focus:ring-1 focus:ring-gray-300 focus:outline-none"
                >
                  <option value="all">All Prices</option>
                  <option value="low">Under ₹1,000</option>
                  <option value="medium">₹1,000 - ₹10,000</option>
                  <option value="high">Above ₹10,000</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 bg-gray-50 border-0 text-sm focus:bg-white focus:ring-1 focus:ring-gray-300 focus:outline-none"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Filters */}
      <div className="block border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="px-0 py-2 bg-transparent border-0 text-sm font-light text-gray-600 focus:outline-none focus:text-black cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="low">Under ₹1,000</option>
                <option value="medium">₹1,000 - ₹10,000</option>
                <option value="high">Above ₹10,000</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-0 py-2 bg-transparent border-0 text-sm font-light text-gray-600 focus:outline-none focus:text-black cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="text-sm font-light text-gray-500">
              {filteredAndSortedProducts.length} Products
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-8 max-w-screen-2xl">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-gray-300 text-6xl mb-6">∅</div>
            <h3 className="text-xl font-light text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-400 font-light">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '32px',
              padding: '24px',
              maxWidth: '1600px',
              margin: '0 auto',
            }}
          >
            {filteredAndSortedProducts.map((product) => {
              return (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    transform: 'translateY(0)',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '280px',
                        objectFit: 'cover',
                        transition: 'transform 0.7s',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Stock Badge */}
                    {product.stock !== undefined && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
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
                    
                    {/* Overlay Actions */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        display: 'flex',
                        gap: '8px',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                      }}
                      className="group-hover:opacity-100"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = '1';
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        style={{
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '9999px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                      >
                        <Heart 
                          style={{
                            width: '20px',
                            height: '20px',
                            color: favoriteProducts.has(product.id) ? '#ef4444' : '#6b7280'
                          }}
                        />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={product.stock === 0}
                        style={{
                          padding: '12px',
                          backgroundColor: product.stock === 0 ? '#d1d5db' : '#000000',
                          color: product.stock === 0 ? '#9ca3af' : '#ffffff',
                          borderRadius: '9999px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: 'none',
                          cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s',
                        }}
                      >
                        <Plus style={{ width: '20px', height: '20px' }} />
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '300',
                        letterSpacing: '0.1em',
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                      }}
                    >
                      {product.category}
                    </div>
                    
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: '300',
                        color: '#111827',
                        marginBottom: '12px',
                        lineHeight: '1.4',
                        transition: 'color 0.3s',
                      }}
                    >
                      {product.name}
                    </h3>
                    
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: '300',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        marginBottom: '16px',
                        height: '42px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {product.description}
                    </p>
                    
                    <div style={{ paddingTop: '8px' }}>
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: '300',
                          color: '#111827',
                        }}
                      >
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)}></div>
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-light">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-300 text-5xl mb-4">○</div>
                    <h3 className="text-lg font-light text-gray-600 mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 font-light text-sm">Add some beautiful products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex space-x-4">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-20 h-20 object-cover bg-gray-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder/100/100';
                          }}
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-light text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500 font-light">{item.category}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-light min-w-[2rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-light text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-light">Total</span>
                    <span className="text-xl font-light">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  
                  <button className="w-full bg-black text-white py-4 font-light tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedProduct(null)}></div>
            
            <div className="bg-white max-w-4xl w-full relative rounded-none shadow-2xl">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Product Image */}
                <div className="aspect-square bg-gray-50">
                  <img
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/600/600';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                  <div>
                    <div className="text-xs font-light tracking-wider text-gray-500 uppercase mb-2">
                      {selectedProduct.category}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-gray-600 font-light leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Stock Info */}
                  {selectedProduct.stock !== undefined && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className={`font-medium ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} items in stock` : 'Out of stock'}
                      </span>
                    </div>
                  )}

                  <div className="text-2xl md:text-3xl font-light text-gray-900">
                    {formatPrice(selectedProduct.price)}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`flex-1 py-4 border transition-colors duration-300 flex items-center justify-center space-x-2 ${
                        favoriteProducts.has(selectedProduct.id)
                          ? 'border-red-500 text-red-500'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-light">
                        {favoriteProducts.has(selectedProduct.id) ? 'Favorited' : 'Add to Favorites'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={selectedProduct.stock === 0}
                      className={`flex-1 py-4 font-light tracking-wide transition-colors duration-300 flex items-center justify-center space-x-2 ${
                        selectedProduct.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      <span>{selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
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

export default Template2;