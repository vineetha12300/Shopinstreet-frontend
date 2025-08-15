import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Eye, X, Search, Star, Heart, Plus, Minus, Menu, Grid, List, Truck, Shield, Timer, Clock, Flame, Leaf } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image_urls: string[];
  category: string;
  vendor_id: number;
  stock: number;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  is_sale?: boolean;
  created_at?: string;
  food_details?: string | {
    cuisine_type?: string;
    food_category?: string;
    dietary_type?: string[];
    spice_level?: string;
    ingredients?: string[];
    allergens?: string[];
    preparation_time?: number;
    shelf_life?: number;
    storage_instructions?: string;
    nutritional_info?: {
      calories?: number;
      protein?: string;
      carbs?: string;
      fat?: string;
    };
    serving_size?: string;
  };
  pricing_tiers?: string | {
    min_quantity: number;
    max_quantity: number | null;
    price: number;
  }[];
}

interface ProcessedProduct extends Product {
  cuisine_type: string;
  food_category: string;
  dietary_type: string[];
  spice_level: string;
  ingredients: string[];
  allergens: string[];
  preparation_time: number;
  shelf_life: number;
  storage_instructions: string;
  nutritional_info: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  serving_size: string;
  pricing_tiers: {
    min_quantity: number;
    max_quantity: number | null;
    price: number;
  }[];
  current_price: number;
  original_price: number;
}

interface CartItem extends ProcessedProduct {
  quantity: number;
}

interface TemplateProps {
  products?: Product[];
  vendorInfo?: {
    business_name: string;
    business_logo: string;
    vendor_id?: number;};
  categories?: string[];
  filters?: {
    priceRange: [number, number];
    availability: string[];
  };
  isAuthenticated?: boolean;
  addToCart?: (product: ProcessedProduct, quantity: number, priceTier: any, metadata: any) => Promise<boolean>;
  calculatePrice?: (product: ProcessedProduct, quantity: number) => number;
  getMinOrderQuantity?: (product: ProcessedProduct) => number;
  cartItems?: CartItem[];
  cartItemCount?: number;
}

// Enhanced fallback products with restaurant menu items
const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Butter Chicken",
    description: "Tender chicken in rich, creamy tomato-based curry with aromatic spices. Served with basmati rice.",
    price: 450,
    sale_price: 399,
    image_urls: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop"
    ],
    category: "Main Course",
    vendor_id: 1,
    stock: 50,
    food_details: JSON.stringify({
      cuisine_type: "Indian",
      food_category: "Main Course",
      dietary_type: ["Non-Vegetarian"],
      spice_level: "Medium",
      ingredients: ["Chicken", "Tomatoes", "Cream", "Butter", "Garam Masala", "Ginger", "Garlic"],
      allergens: ["Dairy", "Nuts"],
      preparation_time: 25,
      shelf_life: 2,
      storage_instructions: "Keep refrigerated at 4°C",
      nutritional_info: {
        calories: 380,
        protein: "28g",
        carbs: "12g",
        fat: "26g"
      },
      serving_size: "1 portion (300g)"
    }),
    pricing_tiers: JSON.stringify([
      { min_quantity: 1, max_quantity: 2, price: 450 },
      { min_quantity: 3, max_quantity: 5, price: 420 },
      { min_quantity: 6, max_quantity: null, price: 399 }
    ]),
    is_new: false,
    is_sale: true,
    rating: 4.8,
    reviews_count: 234,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Classic wood-fired pizza with fresh mozzarella, basil, and San Marzano tomatoes on crispy thin crust.",
    price: 520,
    image_urls: [
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop"
    ],
    category: "Main Course",
    vendor_id: 1,
    stock: 30,
    food_details: JSON.stringify({
      cuisine_type: "Italian",
      food_category: "Main Course",
      dietary_type: ["Vegetarian"],
      spice_level: "Mild",
      ingredients: ["Pizza Dough", "Mozzarella", "Tomato Sauce", "Fresh Basil", "Olive Oil"],
      allergens: ["Gluten", "Dairy"],
      preparation_time: 15,
      shelf_life: 1,
      storage_instructions: "Best consumed fresh",
      nutritional_info: {
        calories: 290,
        protein: "12g",
        carbs: "36g",
        fat: "11g"
      },
      serving_size: "1 pizza (250g)"
    }),
    pricing_tiers: JSON.stringify([
      { min_quantity: 1, max_quantity: 1, price: 520 },
      { min_quantity: 2, max_quantity: 4, price: 480 },
      { min_quantity: 5, max_quantity: null, price: 450 }
    ]),
    is_new: true,
    rating: 4.6,
    reviews_count: 189,
    created_at: "2024-01-20T14:20:00Z"
  },
  {
    id: 3,
    name: "Green Smoothie Bowl",
    description: "Nutrient-packed smoothie bowl with spinach, mango, banana, topped with granola, berries, and chia seeds.",
    price: 280,
    image_urls: [
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop"
    ],
    category: "Breakfast",
    vendor_id: 1,
    stock: 25,
    food_details: JSON.stringify({
      cuisine_type: "Continental",
      food_category: "Breakfast",
      dietary_type: ["Vegan", "Gluten-Free"],
      spice_level: null,
      ingredients: ["Spinach", "Mango", "Banana", "Coconut Milk", "Granola", "Berries", "Chia Seeds"],
      allergens: ["Nuts"],
      preparation_time: 10,
      shelf_life: 1,
      storage_instructions: "Consume immediately",
      nutritional_info: {
        calories: 320,
        protein: "8g",
        carbs: "52g",
        fat: "12g"
      },
      serving_size: "1 bowl (350g)"
    }),
    pricing_tiers: JSON.stringify([
      { min_quantity: 1, max_quantity: 2, price: 280 },
      { min_quantity: 3, max_quantity: null, price: 250 }
    ]),
    is_new: true,
    rating: 4.9,
    reviews_count: 156,
    created_at: "2024-01-22T09:15:00Z"
  }
];

const RestaurantTemplate: React.FC<TemplateProps> = ({
  products = fallbackProducts,
  vendorInfo = {
    business_name: "SPICE GARDEN",
    business_logo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop",
    vendor_id: 1
  },
  categories = [],
  filters = { priceRange: [0, 2000], availability: [] },
  isAuthenticated = false,
  addToCart: addToCartProp = null,
  calculatePrice,
  getMinOrderQuantity,
  cartItems = [],
  cartItemCount = 0
}) => {
  const { business_name, business_logo, vendor_id } = vendorInfo;

  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ProcessedProduct | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, any>>({});
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [spiceFilter, setSpiceFilter] = useState<string>('all');
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const productsPerPage = 8;

  // Enhanced product processing for food-specific data
  const processedProducts = useMemo((): ProcessedProduct[] => {
    console.log('Raw food products from API:', products);

    return products.map(product => {
      console.log('Processing food product:', product.id, 'Raw product data:', product);

      // Handle food_details
      let foodDetails: any = {};
      if (product.food_details) {
        try {
          foodDetails = typeof product.food_details === 'string'
            ? JSON.parse(product.food_details)
            : product.food_details;
        } catch (error) {
          console.warn('Failed to parse food_details for product:', product.id, error);
          foodDetails = {};
        }
      } else {
        // Provide fallback food details
        foodDetails = {
          cuisine_type: 'Continental',
          food_category: product.category || 'Main Course',
          dietary_type: ['Vegetarian'],
          spice_level: 'Medium',
          ingredients: ['Mixed ingredients'],
          allergens: [],
          preparation_time: 15,
          shelf_life: 2,
          storage_instructions: 'Store properly',
          nutritional_info: {
            calories: 300,
            protein: "15g",
            carbs: "30g",
            fat: "10g"
          },
          serving_size: '1 portion'
        };
      }

      // Handle pricing_tiers
      let pricingTiers: any[] = [];
      if (product.pricing_tiers) {
        try {
          pricingTiers = typeof product.pricing_tiers === 'string'
            ? JSON.parse(product.pricing_tiers)
            : Array.isArray(product.pricing_tiers)
              ? product.pricing_tiers
              : [];
        } catch (error) {
          console.warn('Failed to parse pricing_tiers for product:', product.id, error);
          pricingTiers = [];
        }
      }

      if (pricingTiers.length === 0) {
        pricingTiers = [
          { min_quantity: 1, max_quantity: null, price: product.price }
        ];
      }

      const processedProduct: ProcessedProduct = {
        ...product,
        // Extract food details safely
        cuisine_type: foodDetails.cuisine_type || 'Continental',
        food_category: foodDetails.food_category || product.category || 'Main Course',
        dietary_type: Array.isArray(foodDetails.dietary_type) ? foodDetails.dietary_type : ['Vegetarian'],
        spice_level: foodDetails.spice_level || 'Medium',
        ingredients: Array.isArray(foodDetails.ingredients) ? foodDetails.ingredients : ['Mixed ingredients'],
        allergens: Array.isArray(foodDetails.allergens) ? foodDetails.allergens : [],
        preparation_time: foodDetails.preparation_time || 15,
        shelf_life: foodDetails.shelf_life || 2,
        storage_instructions: foodDetails.storage_instructions || 'Store properly',
        nutritional_info: foodDetails.nutritional_info || { calories: 300, protein: "15g", carbs: "30g", fat: "10g" },
        serving_size: foodDetails.serving_size || '1 portion',
        // Store parsed pricing tiers
        pricing_tiers: pricingTiers,
        // Calculate best price
        current_price: product.sale_price || product.price,
        original_price: product.price
      };

      return processedProduct;
    });
  }, [products]);

  // Get unique filter options from products
  const filterOptions = useMemo(() => {
    return {
      dietary_types: [...new Set(processedProducts.flatMap(p => p.dietary_type))],
      spice_levels: [...new Set(processedProducts.map(p => p.spice_level).filter(Boolean))],
      cuisines: [...new Set(processedProducts.map(p => p.cuisine_type).filter(Boolean))],
      allergens: [...new Set(processedProducts.flatMap(p => p.allergens || []))]
    };
  }, [processedProducts]);

  const availableCategories = useMemo(() => {
    const cats = categories.length > 0 ? categories : [...new Set(processedProducts.map(p => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [processedProducts, categories]);

  // Enhanced filtering logic for food
  const filteredProducts = useMemo(() => {
    return processedProducts.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPriceFilter = priceFilter === 'all'
        || (priceFilter === 'under300' && product.current_price < 300)
        || (priceFilter === '300-600' && product.current_price >= 300 && product.current_price <= 600)
        || (priceFilter === 'over600' && product.current_price > 600);
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDietary = dietaryFilter === 'all' || product.dietary_type.includes(dietaryFilter);
      const matchesSpice = spiceFilter === 'all' || product.spice_level === spiceFilter;
      const matchesCuisine = cuisineFilter === 'all' || product.cuisine_type === cuisineFilter;

      return matchesCategory && matchesPriceFilter && matchesSearch && matchesDietary && matchesSpice && matchesCuisine;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.current_price - b.current_price;
      if (sortBy === 'price-high') return b.current_price - a.current_price;
      if (sortBy === 'popular') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'prep-time') return (a.preparation_time || 0) - (b.preparation_time || 0);
      if (sortBy === 'new') return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      return 0;
    });
  }, [processedProducts, selectedCategory, priceFilter, searchTerm, dietaryFilter, spiceFilter, cuisineFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceFilter, searchTerm, dietaryFilter, spiceFilter, cuisineFilter]);

  // Enhanced cart functionality for food
  const getBestPrice = (product: ProcessedProduct, qty = 1): number => {
    if (!product.pricing_tiers || product.pricing_tiers.length === 0) {
      return product.sale_price || product.price;
    }

    const tier = product.pricing_tiers
      .filter(tier => qty >= tier.min_quantity && (tier.max_quantity === null || qty <= tier.max_quantity))
      .sort((a, b) => a.price - b.price)[0];

    return tier ? tier.price : (product.sale_price || product.price);
  };

  const addToCart = async (product: ProcessedProduct, customizations: Record<string, any> = {}, qty = 1, instructions = ''): Promise<boolean> => {
    console.log('=== RestaurantTemplate addToCart called ===');
    console.log('Product:', product?.name, 'ID:', product?.id);
    console.log('Customizations:', customizations, 'Quantity:', qty, 'Instructions:', instructions);

    if (!product) {
      console.error('No product provided to addToCart');
      return false;
    }

    if (product.stock <= 0) {
      console.error('Product out of stock:', product.stock);
      return false;
    }

    if (!isAuthenticated) {
      alert("Please log in to add items to your cart.");
      return false;
    }

    const bestPrice = calculatePrice ? calculatePrice(product, qty) : getBestPrice(product, qty);
    console.log('Best price calculated:', bestPrice);

    const item_metadata = {
      customizations: customizations,
      special_instructions: instructions,
      unit_price: bestPrice,
      cuisine_type: product.cuisine_type,
      dietary_type: product.dietary_type,
      spice_level: product.spice_level,
      allergens: product.allergens,
      preparation_time: product.preparation_time,
      nutritional_info: product.nutritional_info,
      serving_size: product.serving_size
    };

    console.log('Prepared item_metadata:', item_metadata);

    try {
      if (addToCartProp && typeof addToCartProp === 'function') {
        console.log('Calling main component addToCart function...');

        const selectedPriceTier = {
          price: bestPrice
        };

        const success = await addToCartProp(product, qty, selectedPriceTier, item_metadata);
        console.log('Main component addToCart result:', success);

        if (success) {
          console.log('=== addToCart completed successfully ===');
          return true;
        } else {
          console.error('Main component addToCart returned false');
          return false;
        }
      } else {
        console.warn('No addToCart function provided from main component');
        return false;
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      return false;
    }
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

  const getCartItemCount = (): number => {
    return cartItemCount || 0;
  };

  const getProductImage = (product: ProcessedProduct): string => {
    return product?.image_urls?.[0] || '/api/placeholder/300/300';
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setSelectedCustomizations({});
    setCurrentImageIndex(0);
    setQuantity(1);
    setSpecialInstructions('');
  };

  // Helper function to get dietary icon
  const getDietaryIcon = (dietaryTypes: string[]) => {
    if (dietaryTypes.includes('Vegan')) return <Leaf className="w-4 h-4 text-green-600" />;
    if (dietaryTypes.includes('Vegetarian')) return <div className="w-4 h-4 border-2 border-green-600 rounded-sm bg-green-100"></div>;
    return <div className="w-4 h-4 border-2 border-red-600 rounded-sm bg-red-100"></div>;
  };

  // Helper function to get spice level indicator
  const getSpiceIndicator = (level: string) => {
    const spiceCount = level === 'Mild' ? 1 : level === 'Medium' ? 2 : level === 'Hot' ? 3 : level === 'Extra Hot' ? 4 : 0;
    return (
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <Flame key={i} className={`w-3 h-3 ${i < spiceCount ? 'text-red-500' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  // Enhanced Header for restaurant
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white border-b border-orange-100">
      <div className="bg-orange-600 text-white text-center py-2 text-sm font-medium">
        Free delivery on orders over ₹500 • Fresh ingredients daily
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 -ml-2"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              {business_logo ? (
                <img
                  src={business_logo}
                  alt={business_name}
                  className="w-10 h-10 object-cover rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-600 flex items-center justify-center rounded-full">
                  <span className="text-white font-bold text-sm">{business_name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-orange-800">
                  {business_name}
                </h1>
                <p className="text-xs text-orange-600 font-medium">Fresh • Fast • Delicious</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search dishes, cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 text-sm border border-orange-200 rounded-full focus:border-orange-400 focus:outline-none bg-white placeholder-orange-400"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="hidden lg:block p-2 hover:bg-orange-50 rounded-full transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5 text-orange-600" /> : <Grid className="w-5 h-5 text-orange-600" />}
            </button>

            <button
              onClick={() => {
                // Cart functionality handled by main component
              }}
              className="relative p-2 hover:bg-orange-50 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-orange-600" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search dishes, cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-orange-200 rounded-full focus:border-orange-400 focus:outline-none placeholder-orange-400"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
          </div>
        </div>
      </div>
    </header>
  );

  // Enhanced Filter Bar for food
  const FilterBar = () => (
    <div className="border-b border-orange-100 bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 overflow-x-auto">
            <div className="lg:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border-none bg-transparent focus:outline-none font-medium text-orange-800"
              >
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="text-sm border-none bg-transparent focus:outline-none font-medium text-orange-800"
            >
              <option value="all">All Prices</option>
              <option value="under300">Under ₹300</option>
              <option value="300-600">₹300 - ₹600</option>
              <option value="over600">Above ₹600</option>
            </select>

            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="text-sm border-none bg-transparent focus:outline-none font-medium text-orange-800"
            >
              <option value="all">All Diets</option>
              {filterOptions.dietary_types.map(diet => (
                <option key={diet} value={diet}>{diet}</option>
              ))}
            </select>

            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="text-sm border-none bg-transparent focus:outline-none font-medium text-orange-800"
            >
              <option value="all">All Cuisines</option>
              {filterOptions.cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border-none bg-transparent focus:outline-none font-medium text-orange-800"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="prep-time">Fastest First</option>
              <option value="new">New Items</option>
            </select>
          </div>

          <span className="text-sm text-orange-600 font-medium">
            {filteredProducts.length} dishes
          </span>
        </div>
      </div>
    </div>
  );

  // Enhanced Product Card for food items
  const ProductCard: React.FC<{ product: ProcessedProduct }> = ({ product }) => (
    <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-orange-100" onClick={() => setSelectedProduct(product)}>
      <div className="relative aspect-[4/3] bg-orange-50 overflow-hidden">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/300/300'; }}
        />

        {(product.is_new || product.is_sale) && (
          <div className="absolute top-3 left-3 space-y-1">
            {product.is_new && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 font-medium rounded">
                NEW
              </span>
            )}
            {product.is_sale && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 font-medium rounded">
                SALE
              </span>
            )}
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {getDietaryIcon(product.dietary_type)}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`p-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-colors ${favoriteProducts.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
          >
            <Heart className={`w-4 h-4 ${favoriteProducts.has(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <div className="bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3 text-orange-600" />
            <span className="text-xs font-medium text-orange-800">{product.preparation_time}min</span>
          </div>
          {product.spice_level && (
            <div className="bg-white bg-opacity-90 px-2 py-1 rounded-full">
              {getSpiceIndicator(product.spice_level)}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs text-orange-600 font-medium uppercase tracking-wide bg-orange-100 px-2 py-0.5 rounded">
                {product.cuisine_type}
              </span>
              {product.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
                </div>
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mb-2">
              {product.name}
            </h3>

            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {product.sale_price ? (
              <>
                <span className="text-lg font-bold text-orange-600">₹{product.current_price}</span>
                <span className="text-sm font-medium text-gray-400 line-through">₹{product.original_price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-orange-600">₹{product.current_price}</span>
            )}
          </div>
          <button className="bg-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-orange-700 transition-colors">
            Add +
          </button>
        </div>

        {product.allergens && product.allergens.length > 0 && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            Contains: {product.allergens.join(', ')}
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced Product Modal for food items
  const ProductModal = () => {
    if (!selectedProduct) return null;

    const currentPrice = getBestPrice(selectedProduct, quantity);

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="min-h-screen">
          <div className="sticky top-0 z-10 bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <h2 className="text-lg font-bold text-orange-800">{selectedProduct.name}</h2>
              <button
                onClick={closeProductModal}
                className="p-2 hover:bg-orange-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-orange-600" />
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <div className="aspect-[4/3] bg-orange-50 rounded-lg overflow-hidden mb-6 relative">
                  <img
                    src={selectedProduct.image_urls?.[currentImageIndex] || getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target as HTMLImageElement).src = '/api/placeholder/400/300'}
                  />

                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    {getDietaryIcon(selectedProduct.dietary_type)}
                    <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">{selectedProduct.preparation_time} min</span>
                    </div>
                  </div>
                </div>

                {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                  <div className="flex space-x-4 overflow-x-auto">
                    {selectedProduct.image_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`${selectedProduct.name} ${idx + 1}`}
                        className={`flex-shrink-0 w-20 h-16 object-cover cursor-pointer rounded border-2 transition-colors ${idx === currentImageIndex ? 'border-orange-500' : 'border-transparent hover:border-orange-300'
                          }`}
                        onClick={() => setCurrentImageIndex(idx)}
                        onError={(e) => (e.target as HTMLImageElement).src = '/api/placeholder/400/300'}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-600 font-medium uppercase tracking-wide bg-orange-100 px-3 py-1 rounded-full">
                      {selectedProduct.cuisine_type}
                    </span>
                    {selectedProduct.rating && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating!) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({selectedProduct.reviews_count} reviews)</span>
                      </div>
                    )}
                  </div>

                  <h1 className="text-2xl font-bold text-gray-800 mb-4">{selectedProduct.name}</h1>

                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-3xl font-bold text-orange-600">₹{currentPrice}</span>
                    {selectedProduct.sale_price && (
                      <span className="text-xl font-medium text-gray-400 line-through">₹{selectedProduct.original_price}</span>
                    )}
                    {quantity > 1 && (
                      <span className="text-sm text-green-600 font-medium">
                        (₹{(currentPrice * quantity)} total)
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">{selectedProduct.description}</p>

                  {/* Nutritional Information */}
                  <div className="bg-orange-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-bold text-orange-800 mb-3">Nutritional Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="font-medium">Calories:</span> {selectedProduct.nutritional_info?.calories}</div>
                      <div><span className="font-medium">Protein:</span> {selectedProduct.nutritional_info?.protein}</div>
                      <div><span className="font-medium">Carbs:</span> {selectedProduct.nutritional_info?.carbs}</div>
                      <div><span className="font-medium">Fat:</span> {selectedProduct.nutritional_info?.fat}</div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Serving Size:</span> {selectedProduct.serving_size}
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Ingredients</h4>
                    <p className="text-sm text-gray-600">{selectedProduct.ingredients?.join(', ')}</p>
                  </div>

                  {/* Allergens */}
                  {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-red-600 mb-2">Allergen Information</h4>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Contains: {selectedProduct.allergens.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Spice Level */}
                  {selectedProduct.spice_level && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-800 mb-2">Spice Level</h4>
                      <div className="flex items-center space-x-2">
                        {getSpiceIndicator(selectedProduct.spice_level)}
                        <span className="text-sm font-medium">{selectedProduct.spice_level}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Quantity</h4>
                  <div className="flex items-center space-x-4 mb-6">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-orange-300 rounded-full flex items-center justify-center hover:bg-orange-50 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-orange-600" />
                    </button>
                    <span className="font-bold min-w-[3rem] text-center text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      className="w-10 h-10 border border-orange-300 rounded-full flex items-center justify-center hover:bg-orange-50 transition-colors"
                      disabled={quantity >= selectedProduct.stock}
                    >
                      <Plus className="w-4 h-4 text-orange-600" />
                    </button>
                    <span className="text-sm text-gray-500">
                      ({selectedProduct.stock} available)
                    </span>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Special Instructions</h4>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests or dietary modifications..."
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      if (selectedProduct.stock === 0) {
                        alert('This item is currently out of stock');
                        return;
                      }

                      if (quantity <= 0) {
                        alert('Please select a valid quantity');
                        return;
                      }

                      try {
                        const success = await addToCart(
                          selectedProduct,
                          selectedCustomizations,
                          quantity,
                          specialInstructions
                        );
                        if (success) {
                          alert(`Added ${quantity} ${selectedProduct.name} to cart!`);
                          closeProductModal();
                        } else {
                          alert('Failed to add item to cart. Please try again.');
                        }
                      } catch (error) {
                        console.error('Error adding to cart:', error);
                        alert('Error adding to cart. Please try again.');
                      }
                    }}
                    disabled={selectedProduct.stock === 0 || quantity <= 0}
                    className="w-full bg-orange-600 text-white py-4 font-bold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
                  >
                    {selectedProduct.stock === 0 ? 'OUT OF STOCK' :
                      quantity <= 0 ? 'INVALID QUANTITY' :
                        `ADD TO CART - ₹${(currentPrice * quantity)}`}
                  </button>

                  <button
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className={`w-full py-3 font-medium border rounded-lg transition-colors flex items-center justify-center space-x-2 ${favoriteProducts.has(selectedProduct.id)
                      ? 'bg-orange-50 border-orange-300 text-orange-600'
                      : 'border-orange-300 hover:border-orange-400 text-orange-600'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${favoriteProducts.has(selectedProduct.id) ? 'fill-current' : ''}`} />
                    <span>{favoriteProducts.has(selectedProduct.id) ? 'SAVED TO FAVORITES' : 'SAVE TO FAVORITES'}</span>
                  </button>
                </div>

                {/* Service Information */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-orange-100">
                  <div className="text-center">
                    <Truck className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-xs font-medium text-gray-600">Free Delivery</div>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-xs font-medium text-gray-600">Fresh Guarantee</div>
                  </div>
                  <div className="text-center">
                    <Timer className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-xs font-medium text-gray-600">{selectedProduct.preparation_time} Min</div>
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
    <div className="min-h-screen bg-orange-25">
      <Header />
      <FilterBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-xl font-bold text-gray-800 mb-4">No dishes found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setPriceFilter('all');
                setDietaryFilter('all');
                setSpiceFilter('all');
                setCuisineFilter('all');
              }}
              className="bg-orange-600 text-white px-8 py-3 font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' 
                ? 'repeat(auto-fill, minmax(280px, 1fr))' 
                : 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '24px',
              padding: '0'
            }}
          >
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-orange-200 rounded disabled:opacity-30 hover:border-orange-400 transition-colors font-medium"
            >
              Previous
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
              const pageNum = currentPage <= 3 ? idx + 1 :
                currentPage >= totalPages - 2 ? totalPages - 4 + idx :
                  currentPage - 2 + idx;

              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 border rounded transition-colors font-medium ${currentPage === pageNum
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'border-orange-200 hover:border-orange-400'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-orange-200 rounded disabled:opacity-30 hover:border-orange-400 transition-colors font-medium"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {selectedProduct && <ProductModal />}
    </div>
  );
};

export default RestaurantTemplate;