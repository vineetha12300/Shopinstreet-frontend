import React, { useState, useMemo } from 'react';
import { X, Eye, Search, Star, Heart, Plus, Filter, Grid, List, ChevronRight, Award, Shield, Truck, Sparkles, Zap, TrendingUp } from 'lucide-react';

// TypeScript Interfaces
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
  filters?: {
    priceRange: [number, number];
    availability: string[];
  };
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

type PriceFilterType = 'all' | 'low' | 'medium' | 'high';
type SortByType = 'name' | 'price-low' | 'price-high';
type ViewModeType = 'grid' | 'list';

const Template6: React.FC<TemplateProps> = ({ 
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
  filters = { priceRange: [0, 1000], availability: [] },
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
  
  // State Management
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<PriceFilterType>('all');
  const [sortBy, setSortBy] = useState<SortByType>('name');
  const [internalSelectedProduct, setInternalSelectedProduct] = useState<Product | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewModeType>('grid');

  // Use external props when available, otherwise use internal state
  const searchTerm = externalSearchTerm || internalSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setInternalSearchTerm;
  const selectedProduct = externalSelectedProduct || internalSelectedProduct;
  const setSelectedProduct = externalSetSelectedProduct || setInternalSelectedProduct;

  // Extract categories from products if not provided
  const availableCategories = useMemo(() => {
    const cats = categories.length > 0 ? categories : [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [products, categories]);

  // Filter and sort products
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

  const addToCart = (product: Product): void => {
    if (externalAddToCart) {
      externalAddToCart(product);
    }
    // Show some feedback
    console.log(`Added ${product.name} to cart`);
  };

  const toggleFavorite = (productId: number): void => {
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

  const closeProductModalHandler = (): void => {
    if (closeProductModal) {
      closeProductModal();
    } else {
      setSelectedProduct(null);
    }
    setActiveImageIndex(0);
  };

  // Hero Section Component
  const HeroSection: React.FC = () => (
    <section className="relative pt-20 pb-24 mb-16 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(147, 51, 234, 0.8) 50%, rgba(219, 39, 119, 0.9) 100%)'
        }}
      ></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white/30 transform rotate-45"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/50 rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white/30 rounded-full"></div>
      </div>
      
      <div className="relative container mx-auto px-6 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-full mb-8">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-sm font-medium">Premium Collection 2025</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span 
            style={{
              background: 'linear-gradient(to right, #ffffff, #e0e7ff, #fce7f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Discover Luxury
          </span>
        </h1>
        
        <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
          Curated collection of premium products designed for the modern lifestyle. 
          Experience excellence in every detail.
        </p>
        
        <button 
          onClick={() => {
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
              productsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg border-none cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:from-purple-700 hover:to-pink-700"
        >
          Explore Collection
        </button>
      </div>
    </section>
  );

  // Modern Stats Component
  const StatsSection: React.FC = () => (
    <section className="py-16 mb-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Award, value: `${products.length}+`, label: "Premium Products", color: "purple" },
            { icon: Shield, value: "100%", label: "Authentic Guarantee", color: "blue" },
            { icon: Truck, value: "24h", label: "Express Delivery", color: "emerald" },
            { icon: Star, value: "4.9", label: "Customer Rating", color: "amber" }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div 
                className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 cursor-pointer`}
                style={{
                  background: stat.color === 'purple' ? 'linear-gradient(135deg, #9333ea, #ec4899)' :
                             stat.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                             stat.color === 'emerald' ? 'linear-gradient(135deg, #10b981, #14b8a6)' :
                             'linear-gradient(135deg, #f59e0b, #fb923c)'
                }}
              >
                <stat.icon className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-base text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Product Card Component
  interface ProductCardProps {
    product: Product;
    isListView?: boolean;
  }

  const ProductCard: React.FC<ProductCardProps> = ({ product, isListView = false }) => {
    if (isListView) {
      return (
        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/50 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, transparent 50%, rgba(236, 72, 153, 0.05) 100%)'
            }}
          ></div>
          
          <div className="relative flex items-center gap-6">
            {/* Image Section */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                  {product.category}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                {/* Price and Rating */}
                <div className="flex items-center gap-4">
                  <span 
                    className="text-2xl font-bold"
                    style={{
                      background: 'linear-gradient(to right, #9333ea, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    ₹{product.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      favoriteProducts.has(product.id)
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 shadow-lg text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50 transform hover:-translate-y-2 relative">
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, transparent 50%, rgba(236, 72, 153, 0.05) 100%)'
          }}
        ></div>
        
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`p-3 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 ${
                favoriteProducts.has(product.id)
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white scale-110'
                  : 'bg-white/90 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedProduct(product)}
              className="p-3 bg-white/90 text-gray-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 shadow-xl backdrop-blur-sm"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-xl">
              {product.category}
            </span>
          </div>
        </div>

        <div className="relative p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 mb-6 text-base leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-6">
            <div>
              <span 
                className="text-3xl font-bold"
                style={{
                  background: 'linear-gradient(to right, #9333ea, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                ₹{product.price.toLocaleString()}
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
            onClick={() => addToCart(product)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 font-semibold text-base"
          >
            <Plus className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  // Modern Header
  const Header: React.FC = () => (
    <header className="bg-white/95 backdrop-blur-2xl shadow-2xl border-b border-white/20 sticky top-0 z-40 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(147, 51, 234, 0.05), transparent, rgba(236, 72, 153, 0.05))'
        }}
      ></div>
      
      <div className="relative container mx-auto px-6 py-6">
        {/* Top Bar with Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            {business_logo && (
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-3 shadow-2xl">
                <img
                  src={business_logo}
                  alt={`${business_name} logo`}
                  className="w-full h-full rounded-xl object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              </div>
            )}
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{
                  background: 'linear-gradient(to right, #581c87, #9d174d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {business_name}
              </h1>
              <p className="text-purple-600 font-medium flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4" />
                {products.length} Premium Products
              </p>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 text-gray-400 w-6 h-6 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search premium products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 rounded-2xl border border-purple-200 bg-purple-50/50 text-lg font-medium transition-all duration-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-3 px-8 py-5 text-gray-700 bg-purple-50/50 rounded-2xl transition-all duration-300 border border-purple-200 font-medium hover:bg-purple-100"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>

              <div className="flex bg-purple-100 rounded-2xl p-2 shadow-inner">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-lg font-semibold' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-lg font-semibold' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Modern Filters Sidebar
  const FiltersSidebar: React.FC = () => (
    <div className={`transition-all duration-500 ${
      showFilters 
        ? 'block mb-8 lg:mb-0' 
        : 'hidden'
    } lg:block lg:w-80`}>
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05))'
          }}
        ></div>
        
        <div className="relative">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Refine Selection
          </h3>

          <section className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              Collections
              <ChevronRight className="w-4 h-4 text-purple-500" />
            </h4>
            <div className="space-y-3">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-base transition-all duration-300 font-medium ${
                    selectedCategory === cat 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-semibold shadow-lg border border-purple-200' 
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              Price Range
              <ChevronRight className="w-4 h-4 text-purple-500" />
            </h4>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilterType)}
              className="w-full px-6 py-4 rounded-2xl border border-purple-200 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50/50 transition-all duration-300 font-medium"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹500</option>
              <option value="medium">₹500 - ₹1,500</option>
              <option value="high">Above ₹1,500</option>
            </select>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              Sort By
              <ChevronRight className="w-4 h-4 text-purple-500" />
            </h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByType)}
              className="w-full px-6 py-4 rounded-2xl border border-purple-200 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50/50 transition-all duration-300 font-medium"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </section>
        </div>
      </div>
    </div>
  );

  // Modern Products Section
  const ProductsSection: React.FC = () => (
    <main id="products-section" className="flex-1 w-full">
      <header className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {selectedCategory === 'All' ? 'Curated Collection' : selectedCategory}
            </h2>
            <p className="text-gray-600 text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              {filteredAndSortedProducts.length} exquisite pieces available
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Trending Now</span>
            </div>
          </div>
        </div>
      </header>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-24 text-gray-600 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'
            }}
          ></div>
          <div className="relative px-4">
            <div className="text-8xl mb-8">🔍</div>
            <h3 className="text-3xl font-bold mb-6 text-gray-800">No Products Found</h3>
            <p className="text-xl mb-8">Try adjusting your search criteria or filters</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setPriceFilter('all');
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="w-full">
          <div 
            className="grid gap-6 sm:gap-8"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}
          >
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8 w-full">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} isListView />
          ))}
        </div>
      )}
    </main>
  );

  // Modern Product Modal
  const ProductModal: React.FC = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 relative">
          <div 
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, transparent 50%, rgba(236, 72, 153, 0.05) 100%)'
            }}
          ></div>
          
          <div className="relative p-8">
            <div className="flex justify-between items-start mb-8">
              <h2 
                className="text-4xl font-bold pr-4"
                style={{
                  background: 'linear-gradient(to right, #581c87, #9d174d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {selectedProduct.name}
              </h2>
              <button
                onClick={closeProductModalHandler}
                className="p-3 hover:bg-purple-50 rounded-2xl transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 mb-8 shadow-inner">
                  <img
                    src={selectedProduct.image_urls?.[activeImageIndex] || getProductImage(selectedProduct)}
                    alt={`${selectedProduct.name} ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    onError={(e) => ((e.target as HTMLImageElement).src = '/api/placeholder/400/400')}
                  />
                </div>
                
                {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() =>
                        setActiveImageIndex((idx) =>
                          idx === 0 ? selectedProduct.image_urls!.length - 1 : idx - 1
                        )
                      }
                      className="px-6 py-3 bg-purple-100 rounded-2xl hover:bg-purple-200 transition-colors font-medium"
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-3 overflow-x-auto">
                      {selectedProduct.image_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`${selectedProduct.name} ${idx + 1}`}
                          className={`w-20 h-20 object-cover rounded-2xl cursor-pointer border-3 transition-all duration-300 flex-shrink-0 ${
                            activeImageIndex === idx 
                              ? 'border-purple-500 scale-110 shadow-xl' 
                              : 'border-transparent hover:border-purple-300'
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
                      className="px-6 py-3 bg-purple-100 rounded-2xl hover:bg-purple-200 transition-colors font-medium"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-6 py-3 rounded-2xl text-base font-semibold shadow-lg border border-purple-200">
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

                <div className="space-y-8">
                  <div 
                    className="text-5xl font-bold"
                    style={{
                      background: 'linear-gradient(to right, #9333ea, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    ₹{selectedProduct.price.toLocaleString()}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 font-semibold text-lg ${
                        favoriteProducts.has(selectedProduct.id)
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl'
                          : 'bg-purple-50 text-purple-700 hover:bg-rose-50 hover:text-rose-600 border border-purple-200'
                      }`}
                    >
                      <Heart className="w-6 h-6" />
                      {favoriteProducts.has(selectedProduct.id) ? 'Added to Favorites' : 'Add to Favorites'}
                    </button>

                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        closeProductModalHandler();
                      }}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex-1 font-semibold text-lg"
                    >
                      <Plus className="w-6 h-6" />
                      Add to Cart
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-purple-100">
                    {[
                      { icon: Award, title: "Premium Quality", subtitle: "Handcrafted Excellence", bgColor: "from-purple-50 to-pink-50", iconColor: "text-purple-500" },
                      { icon: Truck, title: "Free Delivery", subtitle: "Express Shipping", bgColor: "from-blue-50 to-cyan-50", iconColor: "text-blue-500" },
                      { icon: Shield, title: "Authentic", subtitle: "100% Genuine", bgColor: "from-emerald-50 to-teal-50", iconColor: "text-emerald-500" }
                    ].map((feature, index) => (
                      <div key={index} className={`text-center p-6 bg-gradient-to-br ${feature.bgColor} rounded-2xl`}>
                        <feature.icon className={`w-10 h-10 ${feature.iconColor} mx-auto mb-3`} />
                        <div className="font-semibold text-gray-800 mb-1">{feature.title}</div>
                        <div className="text-sm text-gray-600">{feature.subtitle}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, rgba(168, 85, 247, 0.1) 25%, rgba(236, 72, 153, 0.1) 75%, #f8fafc 100%)'
      }}
    >
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)' }}
        ></div>
        <div 
          className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}
        ></div>
        <div 
          className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(251, 146, 60, 0.2) 100%)' }}
        ></div>
        
        {/* Geometric Shapes */}
        <div 
          className="absolute top-20 left-1/4 w-4 h-4 transform rotate-45"
          style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
        ></div>
        <div 
          className="absolute top-1/2 right-20 w-6 h-6 rounded-full"
          style={{ background: 'linear-gradient(to right, #3b82f6, #06b6d4)' }}
        ></div>
        <div 
          className="absolute bottom-1/3 left-10 w-3 h-3 transform rotate-12"
          style={{ background: 'linear-gradient(to right, #10b981, #14b8a6)' }}
        ></div>
        
        {/* Floating Icons */}
        <div className="absolute top-32 right-1/3 text-purple-300/30">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-40 left-1/3 text-blue-300/30">
          <Zap className="w-6 h-6" />
        </div>
        <div className="absolute top-2/3 right-16 text-emerald-300/30">
          <TrendingUp className="w-7 h-7" />
        </div>
      </div>
      
      <Header />
      <HeroSection />
      <StatsSection />

      <div className="relative container mx-auto px-6 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSidebar />
          <ProductsSection />
        </div>
      </div>

      {selectedProduct && <ProductModal />}
    </div>
  );
};

export default Template6;