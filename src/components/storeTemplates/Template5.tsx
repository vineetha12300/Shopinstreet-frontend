import React, { useState, useMemo } from 'react';
import { ShoppingCart, Eye, Search, Star, Heart, Plus, Minus, X, Filter, Grid, List, ChevronRight, Award, Shield, Truck } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  vendor_id: number;
  rating?: number;
  reviews?: number;
  stock?: number;
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
  store?: VendorStoreData;
  products?: Product[];
  vendorInfo?: {
    business_name: string;
    business_logo: string;
  };
  categories?: string[];
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  selectedProduct?: Product | null;
  setSelectedProduct?: (product: Product | null) => void;
  closeProductModal?: () => void;
  selectedQuantity?: { [key: number]: number };
  handleQuantityChange?: (productId: number, quantity: number) => void;
  addToCart?: (product: Product) => void;
  calculatePrice?: (product: Product, quantity?: number) => number;
  getMinOrderQuantity?: (product: Product) => number;
  isAuthenticated?: boolean;
}

const Template5: React.FC<TemplateProps> = ({ 
  store,
  products = [
    { id: 1, name: "Premium Wireless Headphones", description: "High-quality audio with noise cancellation", price: 1299, category: "Electronics", image_urls: ["/api/placeholder/400/400"], vendor_id: 1 },
    { id: 2, name: "Luxury Watch Collection", description: "Elegant timepiece with premium materials", price: 2999, category: "Accessories", image_urls: ["/api/placeholder/400/400"], vendor_id: 1 },
    { id: 3, name: "Designer Handbag", description: "Crafted with finest leather and attention to detail", price: 1899, category: "Fashion", image_urls: ["/api/placeholder/400/400"], vendor_id: 1 },
    { id: 4, name: "Smart Home Device", description: "Advanced technology for modern living", price: 899, category: "Electronics", image_urls: ["/api/placeholder/400/400"], vendor_id: 1 },
    { id: 5, name: "Artisan Coffee Set", description: "Premium coffee experience with elegant design", price: 599, category: "Lifestyle", image_urls: ["/api/placeholder/400/400"], vendor_id: 1 },
    { id: 6, name: "Professional Camera", description: "Capture moments with exceptional clarity", price: 3499, category: "Electronics", image_urls: ["/api/placeholder/400/400"], vendor_id: 1 }
  ],
  vendorInfo = { business_name: "Luxe Store", business_logo: "/api/placeholder/100/100" },
  categories = [],
  searchTerm: externalSearchTerm = "",
  setSearchTerm: externalSetSearchTerm,
  selectedProduct: externalSelectedProduct,
  setSelectedProduct: externalSetSelectedProduct,
  closeProductModal,
  selectedQuantity = {},
  handleQuantityChange,
  addToCart: externalAddToCart,
  calculatePrice = (product: Product, quantity?: number) => product.price,
  getMinOrderQuantity = () => 1,
  isAuthenticated = true
}) => {
  const { business_name, business_logo } = vendorInfo;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalSelectedProduct, setInternalSelectedProduct] = useState<Product | null>(null);

  // Use external props when available, otherwise use internal state
  const searchTerm = externalSearchTerm || internalSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setInternalSearchTerm;
  const selectedProduct = externalSelectedProduct || internalSelectedProduct;
  const setSelectedProduct = externalSetSelectedProduct || setInternalSelectedProduct;

  // Memoized available categories (including 'All')
  const availableCategories = useMemo(() => {
    const cats = categories.length > 0 ? categories : [...new Set(products.map((p) => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [products, categories]);

  // Memoized filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
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

  // Add product to cart helper
  const addToCartLocal = (product: Product) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart.');
      return;
    }

    if (externalAddToCart) {
      externalAddToCart(product);
    }
  };



  // Favorite toggle
  const toggleFavorite = (productId: number) => {
    setFavoriteProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  // Product image helper
  const getProductImage = (product: Product) =>
    product.image_urls?.[0] || '/api/placeholder/400/400';

  // --- CHILD COMPONENTS ---

  // Premium Features Banner
  const PremiumFeatures = () => (
    <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
      <div className="flex flex-wrap justify-center items-center gap-8 text-center">
        <div className="flex items-center gap-3 text-amber-800">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold">Premium Quality</div>
            <div className="text-sm opacity-70">Handpicked Collection</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-amber-800">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
            <Truck className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold">Free Shipping</div>
            <div className="text-sm opacity-70">On orders above ₹2000</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-amber-800">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold">Authentic Products</div>
            <div className="text-sm opacity-70">100% Genuine</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Product Card UI for grid or list view
  const ProductCard = ({ product, isListView = false }: { product: Product; isListView?: boolean }) => {
    const quantity = selectedQuantity[product.id] || getMinOrderQuantity(product);
    const price = calculatePrice(product, quantity);

    if (isListView)
      return (
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 backdrop-blur-sm">
          <div className="flex gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
                />
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`absolute -top-2 -right-2 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  favoriteProducts.has(product.id)
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white scale-110'
                    : 'bg-white/90 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
                }`}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 
                    className="text-xl font-bold text-gray-900 pr-4 group-hover:text-amber-600 transition-colors"
                    style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 1
                    }}
                  >
                    {product.name}
                  </h3>
                  <span className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm">
                    {product.category}
                  </span>
                </div>
                <p 
                  className="text-gray-600 text-base mb-4 leading-relaxed"
                  style={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2
                  }}
                >
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                    ₹{price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2 font-medium">(4.8)</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-3 text-gray-600 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                    <button
                      onClick={() => addToCartLocal(product)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">Add to Cart</span>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // Grid card view
    return (
      <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 backdrop-blur-sm transform hover:-translate-y-2">
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                favoriteProducts.has(product.id)
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white scale-110'
                  : 'bg-white/90 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedProduct(product)}
              className="p-2.5 bg-white/90 text-gray-600 rounded-full hover:bg-amber-50 hover:text-amber-600 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {product.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 
            className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors"
            style={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1
            }}
          >
            {product.name}
          </h3>
          <p 
            className="text-gray-600 mb-4 text-base leading-relaxed"
            style={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2
            }}
          >
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                ₹{price.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
                <span className="text-sm text-gray-500 ml-2 font-medium">(4.8)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => addToCartLocal(product)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  // --- LAYOUT COMPONENTS ---

  // Header component
  const Header = () => (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-6 mb-6">
          {/* Brand */}
          <div className="flex items-center gap-4">
            {business_logo && (
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-2 shadow-sm">
                <img
                  src={business_logo}
                  alt={`${business_name} logo`}
                  className="w-full h-full rounded-xl object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {business_name}
              </h1>
              <p className="text-amber-600 font-medium">{products.length} Luxury Products</p>
            </div>
          </div>

          {/* Cart Button - Removed */}
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 text-gray-400 w-5 h-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search luxury products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-300 text-lg"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all duration-300 border border-gray-200 font-medium"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>

            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-amber-600' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-amber-600' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Sidebar Filters
  const FiltersSidebar = () => (
    <div
      className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 transition-all duration-500 ${
        showFilters ? 'w-80 opacity-100 p-8' : 'w-0 opacity-0 overflow-hidden p-0'
      } lg:w-80 lg:opacity-100 lg:p-8`}
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-8">Refine Selection</h3>

      {/* Categories */}
      <section className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Collections
          <ChevronRight className="w-4 h-4 text-amber-500" />
        </h4>
        <div className="space-y-3">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 font-semibold shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Price Filter */}
      <section className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Price Range
          <ChevronRight className="w-4 h-4 text-amber-500" />
        </h4>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50/50 transition-all duration-300"
        >
          <option value="all">All Prices</option>
          <option value="low">Under ₹500</option>
          <option value="medium">₹500 - ₹1,500</option>
          <option value="high">Above ₹1,500</option>
        </select>
      </section>

      {/* Sort By */}
      <section>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Sort By
          <ChevronRight className="w-4 h-4 text-amber-500" />
        </h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50/50 transition-all duration-300"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </section>
    </div>
  );

  // Products Section: Title and list/grid of products or no results
  const ProductsSection = () => (
    <main className="flex-1">
      <PremiumFeatures />
      
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {selectedCategory === 'All' ? 'Curated Collection' : selectedCategory}
        </h2>
        <p className="text-gray-600 text-lg">{filteredAndSortedProducts.length} exquisite pieces available</p>
      </header>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-600 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="text-8xl mb-6">🔍</div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">No Products Found</h3>
          <p className="text-lg">Try adjusting your search criteria or filters</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} isListView />
          ))}
        </div>
      ) : (
        <div className="grid gap-8" style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );



  // Product Modal for product detail
  const ProductModal = () => {
    if (!selectedProduct) return null;

    const handleCloseModal = () => {
      if (closeProductModal) {
        closeProductModal();
      } else {
        setSelectedProduct(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-4xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={handleCloseModal}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Images */}
              <div>
                <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-6">
                  <img
                    src={selectedProduct.image_urls?.[activeImageIndex] || '/api/placeholder/400/400'}
                    alt={`${selectedProduct.name} ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
                  />
                </div>
                
                {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setActiveImageIndex((idx) =>
                          idx === 0 ? selectedProduct.image_urls!.length - 1 : idx - 1
                        )
                      }
                      className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                      {selectedProduct.image_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`${selectedProduct.name} ${idx + 1}`}
                          className={`w-20 h-20 object-cover rounded-2xl cursor-pointer border-3 transition-all duration-300 ${
                            activeImageIndex === idx 
                              ? 'border-amber-500 scale-110 shadow-lg' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          onClick={() => setActiveImageIndex(idx)}
                          onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setActiveImageIndex((idx) =>
                          idx === selectedProduct.image_urls!.length - 1 ? 0 : idx + 1
                        )
                      }
                      className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 px-6 py-3 rounded-full text-base font-semibold shadow-sm">
                    {selectedProduct.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    ))}
                    <span className="text-base text-gray-600 ml-2 font-medium">(4.8 • 127 reviews)</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">{selectedProduct.description}</p>

                <div className="space-y-6">
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                    ₹{selectedProduct.price.toLocaleString()}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 font-semibold text-lg ${
                        favoriteProducts.has(selectedProduct.id)
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      <Heart className="w-6 h-6" />
                      {favoriteProducts.has(selectedProduct.id) ? 'Added to Favorites' : 'Add to Favorites'}
                    </button>

                    <button
                      onClick={() => {
                        addToCartLocal(selectedProduct);
                        handleCloseModal();
                      }}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex-1 justify-center font-semibold text-lg"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      Add to Cart
                    </button>
                  </div>

                  {/* Premium Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                    <div className="text-center p-4">
                      <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-800">Premium Quality</div>
                      <div className="text-sm text-gray-600">Handcrafted Excellence</div>
                    </div>
                    <div className="text-center p-4">
                      <Truck className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-800">Free Delivery</div>
                      <div className="text-sm text-gray-600">Express Shipping</div>
                    </div>
                    <div className="text-center p-4">
                      <Shield className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-800">Authentic</div>
                      <div className="text-sm text-gray-600">100% Genuine</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8 flex-1 min-h-0">
        <FiltersSidebar />
        <ProductsSection />
      </div>

      {selectedProduct && <ProductModal />}
    </div>
  );
};

export default Template5;