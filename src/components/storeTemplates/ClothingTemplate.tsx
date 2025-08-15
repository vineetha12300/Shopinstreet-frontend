import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Eye, X, Search, Star, Heart, Plus, Minus, Menu, Grid, List, Award, Shield, Truck, Filter } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image_urls: string[];
  category: string;
  vendor_id: number;
  stock: {
    [size: string]: number;
  };
  sizes: string[];
  clothing_type: 'shirt' | 'pants' | 'dress' | 'jacket' | 'shoes' | 'accessories';
  material: string;
  care_instructions?: string;
  color_variants?: string[];
  is_new?: boolean;
  is_sale?: boolean;
  rating?: number;
  reviews_count?: number;
}

interface CartItem extends Product {
  quantity: number;
  selected_size: string;
}

interface TemplateProps {
  products?: Product[];
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

// Enhanced fallback products with luxury focus
const fallbackProducts: Product[] = [
    {
        id: 1,
        name: "Cashmere Blend Sweater",
        description: "Ultra-soft cashmere blend in a relaxed silhouette. Timeless elegance meets contemporary comfort.",
        price: 8900,
        sale_price: 6900,
        image_urls: [
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop",
            "https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=400&h=600&fit=crop"
        ],
        category: "Knitwear",
        vendor_id: 1,
        stock: { "XS": 5, "S": 12, "M": 8, "L": 15, "XL": 3 },
        sizes: ["XS", "S", "M", "L", "XL"],
        clothing_type: "shirt",
        material: "70% Cashmere, 30% Silk",
        care_instructions: "Dry clean only",
        color_variants: ["Cream", "Charcoal", "Camel"],
        is_new: true,
        is_sale: true,
        rating: 4.8,
        reviews_count: 127
    },
    {
        id: 2,
        name: "Tailored Wool Trousers",
        description: "Precision-cut trousers in premium wool. Contemporary fit with classic appeal.",
        price: 12900,
        image_urls: [
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop",
            "https://images.unsplash.com/photo-1506629905150-eb53010095bc?w=400&h=600&fit=crop"
        ],
        category: "Trousers",
        vendor_id: 1,
        stock: { "28": 3, "30": 7, "32": 12, "34": 9, "36": 5 },
        sizes: ["28", "30", "32", "34", "36"],
        clothing_type: "pants",
        material: "100% Virgin Wool",
        care_instructions: "Dry clean only",
        color_variants: ["Navy", "Charcoal", "Black"],
        is_new: false,
        rating: 4.6,
        reviews_count: 89
    },
    {
        id: 3,
        name: "Silk Midi Dress",
        description: "Flowing silk dress with minimalist design. Effortless sophistication for any occasion.",
        price: 15900,
        image_urls: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop",
            "https://images.unsplash.com/photo-1566479179817-c0a0f8ed0da7?w=400&h=600&fit=crop"
        ],
        category: "Dresses",
        vendor_id: 1,
        stock: { "XS": 4, "S": 8, "M": 6, "L": 10, "XL": 2 },
        sizes: ["XS", "S", "M", "L", "XL"],
        clothing_type: "dress",
        material: "100% Mulberry Silk",
        care_instructions: "Dry clean recommended",
        color_variants: ["Ivory", "Midnight", "Sage"],
        is_new: true,
        rating: 4.9,
        reviews_count: 203
    },
    {
        id: 4,
        name: "Merino Wool Coat",
        description: "Architectural coat in finest merino wool. Modern minimalism with exceptional warmth.",
        price: 24900,
        image_urls: [
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=600&fit=crop"
        ],
        category: "Outerwear",
        vendor_id: 1,
        stock: { "S": 6, "M": 9, "L": 7, "XL": 4 },
        sizes: ["S", "M", "L", "XL"],
        clothing_type: "jacket",
        material: "100% Merino Wool",
        care_instructions: "Professional cleaning only",
        color_variants: ["Camel", "Black", "Grey"],
        rating: 4.7,
        reviews_count: 156
    },
    {
        id: 5,
        name: "Leather Chelsea Boots",
        description: "Handcrafted leather boots with elastic side panels. Timeless design meets modern comfort.",
        price: 18900,
        sale_price: 14900,
        image_urls: [
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop"
        ],
        category: "Footwear",
        vendor_id: 1,
        stock: { "38": 3, "39": 5, "40": 8, "41": 6, "42": 4, "43": 2 },
        sizes: ["38", "39", "40", "41", "42", "43"],
        clothing_type: "shoes",
        material: "Italian Leather",
        care_instructions: "Polish regularly with leather cream",
        color_variants: ["Black", "Cognac"],
        is_sale: true,
        rating: 4.5,
        reviews_count: 67
    }
];

const ClothingTemplate: React.FC<TemplateProps> = ({
    products = fallbackProducts,
    vendorInfo = {
        business_name: "ATELIER",
        business_logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop"
    },
    categories = [],
    filters = { priceRange: [0, 50000], availability: [] }
}) => {
    const { business_name, business_logo } = vendorInfo;

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [priceFilter, setPriceFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('new');
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
    const [showCart, setShowCart] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const productsPerPage = 8;

    // Close product modal handler
    const closeProductModal = (): void => {
        setSelectedProduct(null);
        setSelectedSize('');
        setCurrentImageIndex(0);
    };

    // Pagination reset when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, priceFilter, searchTerm]);

    const availableCategories = useMemo(() => {
        const cats = categories.length > 0 ? categories : [...new Set(products.map(p => p.category).filter(Boolean))];
        return ['All', ...cats];
    }, [products, categories]);

    // Main product filtering
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesPriceFilter = priceFilter === 'all'
                || (priceFilter === 'under5000' && product.price < 5000)
                || (priceFilter === '5000-15000' && product.price >= 5000 && product.price <= 15000)
                || (priceFilter === 'over15000' && product.price > 15000);
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesCategory && matchesPriceFilter && matchesSearch;
        }).sort((a, b) => {
            if (sortBy === 'price-low') return (a.sale_price || a.price) - (b.sale_price || b.price);
            if (sortBy === 'price-high') return (b.sale_price || b.price) - (a.sale_price || a.price);
            if (sortBy === 'new') return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0);
            return a.name.localeCompare(b.name);
        });
    }, [products, selectedCategory, priceFilter, searchTerm, sortBy]);

    // Pagination slice
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    const addToCart = (product: Product, size: string): void => {
        if (!size || !product.stock[size] || product.stock[size] === 0) return;
        setCart(prevCart => {
            const existing = prevCart.find(p => p.id === product.id && p.selected_size === size);
            if (existing) {
                return prevCart.map(p =>
                    p.id === product.id && p.selected_size === size
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            }
            return [...prevCart, { ...product, quantity: 1, selected_size: size }];
        });
    };

    const updateQuantity = (productId: number, size: string, newQuantity: number): void => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => !(item.id === productId && item.selected_size === size));
            }
            return prevCart.map(item =>
                item.id === productId && item.selected_size === size
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
    };

    const removeFromCart = (productId: number, size: string): void => {
        setCart(prevCart => prevCart.filter(item => !(item.id === productId && item.selected_size === size)));
    };

    const toggleFavorite = (productId: number): void => {
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

    const getProductImage = (product: Product): string => {
        return product.image_urls?.[0] || '/api/placeholder/300/400';
    };

    const getTotalPrice = (): number => {
        return cart.reduce((total, item) => total + (item.sale_price || item.price) * item.quantity, 0);
    };

    const getCartItemCount = (): number => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const getTotalStock = (product: Product): number => {
        return Object.values(product.stock).reduce((total, stock) => total + stock, 0);
    };

    // Premium Header Component
    const Header: React.FC = () => (
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
            {/* Top announcement bar */}
            <div className="bg-black text-white text-center py-2 text-sm font-light tracking-wide">
                Complimentary shipping on orders over ₹5,000
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden p-2 -ml-2"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-black flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{business_name.charAt(0)}</span>
                            </div>
                            <h1 className="text-xl lg:text-2xl font-light tracking-[0.2em] text-black">
                                {business_name}
                            </h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {availableCategories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`text-sm font-light tracking-wide transition-colors duration-300 ${
                                    selectedCategory === category 
                                        ? 'text-black border-b border-black pb-1' 
                                        : 'text-neutral-600 hover:text-black'
                                }`}
                            >
                                {category.toUpperCase()}
                            </button>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 px-4 py-2 text-sm border-b border-neutral-200 focus:border-black focus:outline-none bg-transparent placeholder-neutral-400"
                            />
                            <Search className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                        
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="hidden lg:block p-2 hover:bg-neutral-50 transition-colors"
                        >
                            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => setShowCart(true)}
                            className="relative p-2 hover:bg-neutral-50 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {getCartItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-light">
                                    {getCartItemCount()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile search */}
                <div className="md:hidden pb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:outline-none placeholder-neutral-400"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>
                </div>
            </div>
        </header>
    );

    // Minimal Filters Component
    const FilterBar: React.FC = () => (
        <div className="border-b border-neutral-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 overflow-x-auto">
                        <div className="lg:hidden">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="text-sm border-none bg-transparent focus:outline-none font-light"
                            >
                                {availableCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className="text-sm border-none bg-transparent focus:outline-none font-light"
                        >
                            <option value="all">All Prices</option>
                            <option value="under5000">Under ₹5,000</option>
                            <option value="5000-15000">₹5,000 - ₹15,000</option>
                            <option value="over15000">Above ₹15,000</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border-none bg-transparent focus:outline-none font-light"
                        >
                            <option value="new">New Arrivals</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Alphabetical</option>
                        </select>
                    </div>

                    <span className="text-sm text-neutral-500 font-light">
                        {filteredProducts.length} items
                    </span>
                </div>
            </div>
        </div>
    );

    // Product Card Props Interface
    interface ProductCardProps {
        product: Product;
    }

    // Minimal Product Card
    const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
        <div className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
            <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden mb-4">
                <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/300/400'; 
                    }}
                />
                
                {/* Minimal overlay for new/sale */}
                {(product.is_new || product.is_sale) && (
                    <div className="absolute top-4 left-4">
                        {product.is_new && (
                            <span className="bg-white text-black text-xs px-2 py-1 font-light tracking-wide">
                                NEW
                            </span>
                        )}
                        {product.is_sale && (
                            <span className="bg-black text-white text-xs px-2 py-1 font-light tracking-wide mt-1 block">
                                SALE
                            </span>
                        )}
                    </div>
                )}

                {/* Heart icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                    }}
                    className={`absolute top-4 right-4 p-2 transition-colors ${
                        favoriteProducts.has(product.id) 
                            ? 'text-black' 
                            : 'text-neutral-400 hover:text-black'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${favoriteProducts.has(product.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-end justify-center pb-6">
                    <button className="bg-white text-black px-6 py-2 text-sm font-light tracking-wide opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        QUICK VIEW
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-light text-black tracking-wide">
                    {product.name}
                </h3>
                
                <div className="flex items-center space-x-3">
                    {product.sale_price ? (
                        <>
                            <span className="text-sm font-light text-red-600">₹{product.sale_price.toLocaleString()}</span>
                            <span className="text-sm font-light text-neutral-400 line-through">₹{product.price.toLocaleString()}</span>
                        </>
                    ) : (
                        <span className="text-sm font-light text-black">₹{product.price.toLocaleString()}</span>
                    )}
                </div>

                {product.color_variants && product.color_variants.length > 1 && (
                    <div className="flex space-x-2 pt-1">
                        {product.color_variants.slice(0, 3).map((color, idx) => (
                            <div
                                key={idx}
                                className="w-3 h-3 border border-neutral-200"
                                style={{ 
                                    backgroundColor: color.toLowerCase() === 'white' || color.toLowerCase() === 'ivory' ? '#ffffff' : 
                                                   color.toLowerCase() === 'black' || color.toLowerCase() === 'midnight' ? '#000000' :
                                                   color.toLowerCase() === 'grey' || color.toLowerCase() === 'charcoal' ? '#6b7280' :
                                                   color.toLowerCase() === 'navy' ? '#1e40af' :
                                                   color.toLowerCase() === 'camel' ? '#d2b48c' :
                                                   color.toLowerCase() === 'sage' ? '#9ca3af' :
                                                   color.toLowerCase() === 'cognac' ? '#8b4513' : '#e5e7eb'
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Enhanced Product Modal
    const ProductModal: React.FC = () => {
        if (!selectedProduct) return null;

        return (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                <div className="min-h-screen">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-white border-b border-neutral-100 px-4 sm:px-6 lg:px-8 py-4">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <h2 className="text-lg font-light tracking-wide">{selectedProduct.name}</h2>
                            <button
                                onClick={closeProductModal}
                                className="p-2 hover:bg-neutral-50 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Images */}
                            <div>
                                <div className="aspect-[3/4] bg-neutral-50 mb-6">
                                    <img
                                        src={selectedProduct.image_urls?.[currentImageIndex] || getProductImage(selectedProduct)}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/api/placeholder/400/600';
                                        }}
                                    />
                                </div>

                                {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                                    <div className="flex space-x-4">
                                        {selectedProduct.image_urls.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`${selectedProduct.name} ${idx + 1}`}
                                                className={`w-20 h-24 object-cover cursor-pointer border-2 transition-colors ${
                                                    idx === currentImageIndex ? 'border-black' : 'border-transparent hover:border-neutral-300'
                                                }`}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/api/placeholder/400/600';
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center space-x-4 mb-4">
                                        {selectedProduct.sale_price ? (
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl font-light text-red-600">₹{selectedProduct.sale_price.toLocaleString()}</span>
                                                <span className="text-xl font-light text-neutral-400 line-through">₹{selectedProduct.price.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <span className="text-2xl font-light text-black">₹{selectedProduct.price.toLocaleString()}</span>
                                        )}

                                        {selectedProduct.rating && (
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating!) ? 'text-black fill-current' : 'text-neutral-300'}`} 
                                                    />
                                                ))}
                                                <span className="text-sm text-neutral-500 ml-2">({selectedProduct.reviews_count})</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-neutral-600 font-light leading-relaxed mb-6">{selectedProduct.description}</p>
                                    
                                    <div className="space-y-2 text-sm font-light text-neutral-600">
                                        <p><span className="text-black">Material:</span> {selectedProduct.material}</p>
                                        {selectedProduct.care_instructions && (
                                            <p><span className="text-black">Care:</span> {selectedProduct.care_instructions}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Size Selection */}
                                <div>
                                    <h4 className="text-sm font-light tracking-wide text-black mb-4">SIZE</h4>
                                    <div className="grid grid-cols-5 gap-2">
                                        {selectedProduct.sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                disabled={selectedProduct.stock[size] === 0}
                                                className={`py-3 text-sm border transition-colors font-light ${
                                                    selectedSize === size
                                                        ? 'border-black bg-black text-white'
                                                        : selectedProduct.stock[size] === 0
                                                        ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                                                        : 'border-neutral-300 hover:border-black'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedSize && selectedProduct.stock[selectedSize] > 0 && (
                                        <p className="text-sm text-neutral-500 mt-2 font-light">
                                            {selectedProduct.stock[selectedSize]} items available
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="space-y-4">
                                    <button
                                        onClick={() => {
                                            if (selectedSize) {
                                                addToCart(selectedProduct, selectedSize);
                                                closeProductModal();
                                            }
                                        }}
                                        disabled={!selectedSize || selectedProduct.stock[selectedSize] === 0}
                                        className="w-full bg-black text-white py-4 font-light tracking-wide disabled:bg-neutral-300 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
                                    >
                                        {!selectedSize ? 'SELECT SIZE' : 'ADD TO BAG'}
                                    </button>

                                    <button
                                        onClick={() => toggleFavorite(selectedProduct.id)}
                                        className={`w-full py-4 font-light tracking-wide border transition-colors ${
                                            favoriteProducts.has(selectedProduct.id)
                                                ? 'bg-neutral-50 border-black text-black'
                                                : 'border-neutral-300 hover:border-black'
                                        }`}
                                    >
                                        <Heart className="w-5 h-5 inline mr-2" />
                                        {favoriteProducts.has(selectedProduct.id) ? 'SAVED' : 'SAVE ITEM'}
                                    </button>
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-neutral-100">
                                    <div className="text-center">
                                        <Truck className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                                        <div className="text-xs font-light text-neutral-600">Free Shipping</div>
                                    </div>
                                    <div className="text-center">
                                        <Shield className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                                        <div className="text-xs font-light text-neutral-600">Authentic</div>
                                    </div>
                                    <div className="text-center">
                                        <Award className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                                        <div className="text-xs font-light text-neutral-600">Premium Quality</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Minimal Cart Modal
    const CartModal: React.FC = () => {
        if (!showCart) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end lg:items-center lg:justify-end">
                <div className="bg-white w-full lg:w-96 h-full lg:h-screen overflow-y-auto">
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-light tracking-wide">BAG ({getCartItemCount()})</h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="p-2 hover:bg-neutral-50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="text-center py-16 px-6">
                                <h3 className="text-lg font-light text-black mb-2">Your bag is empty</h3>
                                <p className="text-neutral-500 font-light mb-8">Add items to get started</p>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="bg-black text-white px-8 py-3 font-light tracking-wide hover:bg-neutral-800 transition-colors"
                                >
                                    CONTINUE SHOPPING
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {cart.map((item) => (
                                    <div key={`${item.id}-${item.selected_size}`} className="flex space-x-4 pb-6 border-b border-neutral-100 last:border-b-0">
                                        <img
                                            src={getProductImage(item)}
                                            alt={item.name}
                                            className="w-20 h-24 object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/api/placeholder/300/400';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-light text-black mb-1">{item.name}</h4>
                                            <p className="text-sm text-neutral-500 font-light mb-1">Size: {item.selected_size}</p>
                                            <div className="flex items-center space-x-2 mb-3">
                                                {item.sale_price ? (
                                                    <>
                                                        <span className="font-light text-red-600">₹{item.sale_price.toLocaleString()}</span>
                                                        <span className="text-neutral-400 line-through text-sm font-light">₹{item.price.toLocaleString()}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-light">₹{item.price.toLocaleString()}</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.selected_size, item.quantity - 1)}
                                                        className="w-8 h-8 border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="font-light min-w-[2rem] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.selected_size, item.quantity + 1)}
                                                        className="w-8 h-8 border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.selected_size)}
                                                    className="text-neutral-400 hover:text-black text-sm font-light"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-light tracking-wide">TOTAL</span>
                                <span className="text-lg font-light">₹{getTotalPrice().toLocaleString()}</span>
                            </div>
                            
                            <button className="w-full bg-black text-white py-4 font-light tracking-wide hover:bg-neutral-800 transition-colors mb-3">
                                CHECKOUT
                            </button>
                            
                            <p className="text-xs text-neutral-500 text-center font-light">
                                Complimentary shipping on orders over ₹5,000
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Mobile Filters
    const MobileFilters: React.FC = () => {
        if (!showFilters) return null;

        return (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div className="bg-white w-80 h-full overflow-y-auto">
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-light tracking-wide">FILTER</h2>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-8">
                        <div>
                            <h3 className="font-light tracking-wide mb-4">CATEGORY</h3>
                            <div className="space-y-3">
                                {availableCategories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setShowFilters(false);
                                        }}
                                        className={`block w-full text-left py-2 font-light ${
                                            selectedCategory === category ? 'text-black' : 'text-neutral-500'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-light tracking-wide mb-4">PRICE</h3>
                            <div className="space-y-3">
                                {[
                                    { value: 'all', label: 'All Prices' },
                                    { value: 'under5000', label: 'Under ₹5,000' },
                                    { value: '5000-15000', label: '₹5,000 - ₹15,000' },
                                    { value: 'over15000', label: 'Above ₹15,000' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setPriceFilter(option.value)}
                                        className={`block w-full text-left py-2 font-light ${
                                            priceFilter === option.value ? 'text-black' : 'text-neutral-500'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <FilterBar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-24">
                        <h3 className="text-xl font-light text-black mb-4">No items found</h3>
                        <p className="text-neutral-500 font-light mb-8">Try adjusting your filters</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('All');
                                setPriceFilter('all');
                            }}
                            className="bg-black text-white px-8 py-3 font-light tracking-wide hover:bg-neutral-800 transition-colors"
                        >
                            CLEAR FILTERS
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                        {currentProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-16 space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-neutral-200 disabled:opacity-30 hover:border-black transition-colors font-light"
                        >
                            Previous
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`px-4 py-2 border transition-colors font-light ${
                                    currentPage === idx + 1 
                                        ? 'bg-black text-white border-black' 
                                        : 'border-neutral-200 hover:border-black'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-neutral-200 disabled:opacity-30 hover:border-black transition-colors font-light"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {selectedProduct && <ProductModal />}
            <CartModal />
            <MobileFilters />
        </div>
    );
};

export default ClothingTemplate;