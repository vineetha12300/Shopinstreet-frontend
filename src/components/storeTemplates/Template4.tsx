import React, { useState, useMemo } from 'react';
import { 
  Eye, Search, Star, Heart, Plus, Filter, Grid, List, ChevronRight, 
  Award, Shield, Truck, Sparkles, Zap, TrendingUp, ArrowRight, Play, Volume2 
} from 'lucide-react';

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
  calculatePrice?: (product: Product) => number;
  getMinOrderQuantity?: (product: Product) => number;
  isAuthenticated?: boolean;
}

const Template4: React.FC<TemplateProps> = ({
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
  searchTerm = "",
  setSearchTerm = () => {},
  selectedProduct,
  setSelectedProduct = () => {},
  closeProductModal = () => {},
  selectedQuantity = {},
  handleQuantityChange = () => {},
  addToCart = () => {},
  calculatePrice = (product: Product) => product.price,
  getMinOrderQuantity = () => 1,
  isAuthenticated = true
}) => {
  const { business_name, business_logo } = vendorInfo;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('creative');
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  // Creative Background Component
  const CreativeBackground = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-fuchsia-900/10 to-cyan-900/20"></div>
      
      {/* Floating geometric shapes */}
      <div 
        className="absolute top-20 left-10 w-32 h-32 border-2 border-violet-300/30 rounded-full" 
        style={{
          animation: 'spin 20s linear infinite'
        }}
      ></div>
      <div 
        className="absolute bottom-32 right-20 w-24 h-24 bg-gradient-to-r from-fuchsia-400/20 to-violet-400/20 rotate-45" 
        style={{
          animation: 'float 15s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/4 w-16 h-16 border border-cyan-400/40 transform rotate-12" 
        style={{
          animation: 'pulse 8s ease-in-out infinite'
        }}
      ></div>
      
      {/* Dynamic lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d="M0,100 Q250,50 500,100 T1000,100" stroke="url(#line-gradient)" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M0,300 Q300,250 600,300 T1200,300" stroke="url(#line-gradient)" strokeWidth="1" fill="none" opacity="0.4" />
      </svg>
    </div>
  );

  // Memoized available categories
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

  const toggleFavorite = (productId: number) => {
    setFavoriteProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  const getProductImage = (product: Product) => product.image_urls?.[0] || '/api/placeholder/400/400';

  // Unique Floating Navigation
  const FloatingNavigation = () => (
    <div className="fixed top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-50 px-4 w-full max-w-6xl">
      <div className="bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-full px-4 sm:px-8 py-3 sm:py-4 shadow-2xl">
        <div className="flex items-center justify-between sm:justify-center sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <h1 className="text-white font-bold text-sm sm:text-lg">{business_name}</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-3 h-3 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full pl-6 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-white placeholder-white/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/30 w-24 sm:w-48"
            />
          </div>
          
          <button className="lg:hidden text-white p-2">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Magazine-style Hero Section
  const MagazineHero = () => (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center w-full">
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-300/30 rounded-full px-3 sm:px-4 py-2">
              <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-pulse"></div>
              <span className="text-violet-800 font-medium text-xs sm:text-sm">New Collection 2025</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-none">
              <span className="bg-gradient-to-r from-violet-900 via-fuchsia-700 to-cyan-700 bg-clip-text text-transparent">
                UNIQUE
              </span>
              <br />
              <span className="text-gray-900">FINDS</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0">
              Discover extraordinary products that tell a story. Each piece carefully curated for the modern explorer.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button 
              onClick={() => {
                const productsSection = document.getElementById('products-showcase');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold flex items-center justify-center gap-3 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-xl hover:shadow-2xl text-sm sm:text-base"
            >
              Explore Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative order-first lg:order-last">
          <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] max-w-lg mx-auto lg:max-w-none">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-200 via-fuchsia-200 to-cyan-200 rounded-2xl sm:rounded-3xl transform rotate-3 sm:rotate-6"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-fuchsia-100 to-cyan-100 rounded-2xl sm:rounded-3xl transform rotate-1.5 sm:rotate-3"></div>
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-full">
              {filteredAndSortedProducts.length > 0 && (
                <img
                  src={getProductImage(filteredAndSortedProducts[activeProductIndex])}
                  alt="Featured Product"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/600/600')}
                />
              )}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 bg-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
                <h3 className="font-bold text-sm sm:text-lg mb-1">
                  {filteredAndSortedProducts[activeProductIndex]?.name || "Featured Product"}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm">
                  ₹{filteredAndSortedProducts[activeProductIndex]?.price.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Creative Product Showcase
  const CreativeProductShowcase = () => (
    <section id="products-showcase" className="py-12 sm:py-16 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-violet-900 to-fuchsia-700 bg-clip-text text-transparent">
              PRODUCT
            </span>
            <br />
            <span className="text-gray-900">GALLERY</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-4">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-violet-300 text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Creative Grid Layout */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">No Products Found</h3>
            <p className="text-gray-600 px-4">Try adjusting your search or category selection</p>
          </div>
        ) : (
          <div 
            className="gap-4 sm:gap-6"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gridAutoRows: 'minmax(300px, auto)',
            }}
          >
            {filteredAndSortedProducts.map((product, index) => (
              <CreativeProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  // Creative Product Card with unique layouts
  const CreativeProductCard = ({ product, index }: { product: Product; index: number }) => {
    const [isDesktop, setIsDesktop] = useState(false);
    
    React.useEffect(() => {
      const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
      checkDesktop();
      window.addEventListener('resize', checkDesktop);
      return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const isLarge = index % 7 === 0 && isDesktop;
    const isTall = index % 5 === 0 && index % 7 !== 0 && isDesktop;
    const randomRotation = Math.random() * 4 - 2;
    
    return (
      <div
        className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
        style={{
          transform: isDesktop ? `rotate(${randomRotation}deg)` : 'rotate(0deg)',
          gridColumn: isLarge ? 'span 2' : 'span 1',
          gridRow: isLarge ? 'span 2' : isTall ? 'span 2' : 'span 1',
        }}
        onMouseEnter={(e) => {
          if (isDesktop) {
            (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (isDesktop) {
            (e.currentTarget as HTMLElement).style.transform = `rotate(${randomRotation}deg) scale(1)`;
          }
        }}
      >
        {/* Product Image */}
        <div 
          className="relative overflow-hidden"
          style={{
            height: isLarge ? '320px' : isTall ? '400px' : '256px'
          }}
        >
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Quick Actions */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-2 transform translate-x-8 sm:translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`p-2 sm:p-3 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 ${
                favoriteProducts.has(product.id)
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setSelectedProduct(product)}
              className="p-2 sm:p-3 bg-white/90 text-gray-700 rounded-full backdrop-blur-md shadow-lg hover:bg-violet-50 hover:text-violet-600 transition-all duration-300"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 group-hover:text-violet-600 transition-colors" style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1
          }}>
            {product.name}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed" style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2
          }}>
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                ₹{product.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-current" />
                ))}
                <span className="text-xs text-gray-500 ml-1">(4.8)</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (addToCart && typeof addToCart === 'function') {
                  addToCart(product);
                } else {
                  alert('Added to cart: ' + product.name);
                }
              }}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-2.5 sm:p-3 rounded-full hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Immersive Product Modal
  const ImmersiveProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
          <button
            onClick={closeProductModal}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 p-2 sm:p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-45" />
          </button>
          
          <div className="grid lg:grid-cols-2">
            {/* Left: Product Image */}
            <div className="relative h-72 sm:h-96 lg:h-full bg-gradient-to-br from-violet-100 to-fuchsia-100">
              <img
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/600/600')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            {/* Right: Product Details */}
            <div className="p-6 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
              <div>
                <span className="bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                  {selectedProduct.category}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-3 sm:mt-4 mb-3 sm:mb-4 leading-tight">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current" />
                  ))}
                  <span className="text-gray-500 ml-2 text-sm sm:text-base">(4.8 • 127 reviews)</span>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                {selectedProduct.description}
              </p>
              
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                ₹{selectedProduct.price.toLocaleString()}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  className={`flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    favoriteProducts.has(selectedProduct.id)
                      ? 'bg-rose-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Favorite</span>
                  <span className="sm:hidden">♡</span>
                </button>
                
                <button
                  onClick={() => {
                    if (addToCart && typeof addToCart === 'function') {
                      addToCart(selectedProduct);
                    } else {
                      alert('Added to cart: ' + selectedProduct.name);
                    }
                    closeProductModal();
                  }}
                  className="flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl sm:rounded-2xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-xl flex-1 font-semibold text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add to Cart
                </button>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-100">
                <div className="text-center p-3 sm:p-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-violet-500 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800 text-xs sm:text-sm">Premium</div>
                </div>
                <div className="text-center p-3 sm:p-4">
                  <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-violet-500 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800 text-xs sm:text-sm">Free Ship</div>
                </div>
                <div className="text-center p-3 sm:p-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-violet-500 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800 text-xs sm:text-sm">Authentic</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 relative overflow-hidden">
      <CreativeBackground />
      <FloatingNavigation />
      <MagazineHero />
      <CreativeProductShowcase />
      {selectedProduct && <ImmersiveProductModal />}
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .rotate-effect {
            transform: rotate(0deg) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Template4;