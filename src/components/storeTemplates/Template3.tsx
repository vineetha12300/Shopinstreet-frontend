const productsPerPage = 12;import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart, Heart, Plus, X,
  ChevronLeft, ChevronRight,
  Search, Tag, Package, DollarSign,
  Menu, Grid, List, Minus, Filter,
  Eye, Star
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls?: string[];
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

const Template3: React.FC<TemplateProps> = ({
  products = [],
  vendorInfo = { business_name: "Sample Store", business_logo: "" },
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
  const [showCart, setShowCart] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange, selectedCategory, searchTerm, sortBy]);

  const availableCategories = useMemo(() => {
    const cats = categories.length > 0 ? categories : [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [products, categories]);

  // Filtering products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      let matchesPrice = true;
      if (priceFilter === 'low') matchesPrice = product.price < 500;
      else if (priceFilter === 'medium') matchesPrice = product.price >= 500 && product.price < 1500;
      else if (priceFilter === 'high') matchesPrice = product.price >= 1500;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);

  // Handlers and helpers
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

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getProductImage = (product: Product) => {
    return product.image_urls?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange({ min: filters.priceRange[0], max: filters.priceRange[1] });
    setSearchTerm('');
    setSortBy('name');
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.image_urls) {
      setSelectedImageIndex((prev) =>
        prev === selectedProduct.image_urls!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.image_urls) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? selectedProduct.image_urls!.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-gray-50 to-gray-100 font-sans">
      {/* Top Nav */}
      <nav className="bg-gray-800 text-gray-100 px-5 py-4 flex items-center justify-center shadow-md">
        <div className="flex items-center space-x-3">
          {business_logo && (
            <img
              src={business_logo}
              alt={business_name}
              className="h-10 w-10 rounded-md object-cover shadow"
            />
          )}
          <h1 className="text-2xl font-semibold tracking-wide">{business_name}</h1>
        </div>
      </nav>

      {/* Search & Filter Bar */}
      <section className="bg-white shadow py-4 sticky top-0 z-30 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 md:hidden rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle Filters"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 flex-1 md:w-80">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-gray-700 w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-300'
                  }`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-300'
                  }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Filters</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside
          className="bg-white rounded-lg shadow p-6 space-y-8 overflow-y-auto"
          style={{
            boxShadow: '0 10px 15px rgba(0,0,0,0.07)',
            width: '288px',
            flexShrink: 0,
            position: isDesktop ? 'static' : 'fixed',
            top: isDesktop ? 'auto' : 0,
            left: isDesktop ? 'auto' : 0,
            height: isDesktop ? 'auto' : '100vh',
            zIndex: isDesktop ? 'auto' : 50,
            transform: isDesktop ? 'translateX(0)' : showFilters ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            display: isDesktop ? 'block' : showFilters ? 'block' : 'none'
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="flex items-center text-xl font-bold text-gray-800 gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filters
            </h2>
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" /> Categories
            </p>
            <div className="flex flex-col space-y-2">
              <label className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'All'}
                  onChange={() => setSelectedCategory('All')}
                  className="accent-blue-600"
                />
                <span className="text-gray-700">All Categories</span>
              </label>
              {availableCategories.filter(cat => cat !== 'All').map(cat => (
                <label
                  key={cat}
                  className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="accent-blue-600"
                  />
                  <span className="text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              Price Bracket
            </p>
            <select
              value={priceFilter}
              onChange={e => setPriceFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
              className="w-full rounded border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹500</option>
              <option value="medium">₹500 - ₹1,500</option>
              <option value="high">Above ₹1,500</option>
            </select>
          </div>

          <div>
            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              Sort By
            </p>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="mt-6 w-full bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 transition font-semibold"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-900">Products</h2>
            <p className="text-gray-600 mt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-200 text-blue-900 font-semibold">
                {filteredAndSortedProducts.length}
              </span>{' '}
              products found
            </p>
          </div>

          {/* No products */}
          {currentProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-8xl mb-5 select-none">🔍</div>
              <h3 className="mb-3 text-2xl font-semibold">No products found</h3>
              <p className="mb-6">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white py-3 px-8 rounded hover:bg-blue-700 transition font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid/List */}
              <div
                style={
                  viewMode === 'grid'
                    ? {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '24px',
                        width: '100%'
                      }
                    : {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                      }
                }
              >
                {currentProducts.map(product => (
                  viewMode === 'grid' ? (
                    <article
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition group"
                    >
                      <div
                        className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer"
                        onClick={() => openProductDetail(product)}
                      >
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow hover:scale-110 transform transition ${favoriteProducts.has(product.id)
                            ? 'text-red-600'
                            : 'text-gray-400 hover:text-red-600'
                            }`}
                          aria-label={favoriteProducts.has(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart fill={favoriteProducts.has(product.id) ? 'currentColor' : 'none'} className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <h3
                          className="text-lg font-semibold text-gray-900 mb-1 truncate cursor-pointer hover:text-blue-600"
                          onClick={() => openProductDetail(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        {product.rating && (
                          <div className="flex items-center space-x-1 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">({product.reviews || 0})</span>
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-xl font-bold text-blue-700">₹{product.price}</span>
                          <button
                            onClick={() => addToCart(product)}
                            className="border border-blue-600 rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"
                            aria-label="Add to cart"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ) : (
                    // List Mode: entire article clickable, except buttons (stopping propagation)
                    <article
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-6 hover:shadow-md transition cursor-pointer"
                      onClick={() => openProductDetail(product)}
                    >
                      <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>

                        {product.rating && (
                          <div className="flex items-center space-x-1 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating!)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">({product.reviews || 0})</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xl font-bold text-blue-700">₹{product.price}</span>
                          <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => toggleFavorite(product.id)}
                              className={`p-2 rounded-full transition ${favoriteProducts.has(product.id)
                                ? 'text-red-600'
                                : 'text-gray-400 hover:text-red-600'
                                }`}
                              aria-label="Toggle favorite"
                            >
                              <Heart fill={favoriteProducts.has(product.id) ? 'currentColor' : 'none'} className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => addToCart(product)}
                              className="border border-blue-600 rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"
                              aria-label="Add to cart"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center space-x-3">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-3 h-3 rounded-full transition ${currentPage === page ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        aria-label={`Go to page ${page}`}
                      />
                    );
                  })}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={closeProductDetail}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close product detail"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.image_urls?.[selectedImageIndex] || getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                  />
                  {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {selectedProduct.image_urls.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                      >
                        <img
                          src={img}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                  <p className="text-gray-600 text-lg">{selectedProduct.description}</p>
                </div>

                {selectedProduct.rating && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {selectedProduct.rating} ({selectedProduct.reviews || 0} reviews)
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-4xl font-bold text-blue-700">₹{selectedProduct.price}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-semibold ${selectedProduct.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of stock'}
                  </span>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      closeProductDetail();
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className={`p-3 rounded-lg border-2 transition ${favoriteProducts.has(selectedProduct.id)
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                      }`}
                  >
                    <Heart
                      fill={favoriteProducts.has(selectedProduct.id) ? 'currentColor' : 'none'}
                      className="w-6 h-6"
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <span className="text-gray-600">Category: </span>
                  <span className="font-semibold text-gray-900">{selectedProduct.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile filters */}
      {showFilters && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          style={{ zIndex: 40 }}
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default Template3;