import { useEffect, useState } from 'react';
import { useMemo } from "react";
import Template1 from "../storeTemplates/Template1";
import Template2 from "../storeTemplates/Template2";
import Template3 from "../storeTemplates/Template3";
import Template4 from "../storeTemplates/Template4";
import Template5 from "../storeTemplates/Template5";
import Template6 from "../storeTemplates/Template6";
import ClothingTemplate from "../storeTemplates/ClothingTemplate";
import RestaurantTemplate from "../storeTemplates/RestaurantTemplate";

// Define Product type - ensure it matches Template3's Product interface
interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  vendor_id: number;
  stock?: number;
  rating?: number;
  reviews?: number;
  // Clothing-specific fields
  sizes?: string[];
  clothing_type?: string;
  material?: string;
  // Restaurant-specific fields
  ingredients?: string[];
  dietary_restrictions?: string[];
  spice_level?: string;
  preparation_time?: number;
}

// Unified Product interface (what templates expect)
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  vendor_id: number;
  stock: number | { [size: string]: number }; // Can be number or object for clothing
  rating: number;
  reviews: number;
  // Clothing-specific fields
  sizes?: string[];
  clothing_type?: string;
  material?: string;
  // Restaurant-specific fields
  ingredients?: string[];
  dietary_restrictions?: string[];
  spice_level?: string;
  preparation_time?: number;
}

// Define VendorStore type
interface VendorStore {
  vendor_id: number;
  business_name: string;
  business_logo: string;
  business_category: string;
  categories: string[];
  filters: {
    priceRange: number[];
    availability: string[];
  };
  products: ApiProduct[];
  template_id: number;
}

interface TemplateProps {
  products: Product[];
  vendorInfo: {
    business_name: string;
    business_logo: string;
    vendor_id: number;
  };
  categories?: string[];
  filters?: {
    priceRange: [number, number];
    availability: string[];
  };
}

const templates: Record<number, React.FC<any>> = {
  1: Template1,
  2: Template2,
  3: Template3,
  4: Template4,
  5: Template5,
  6: Template6,
  7: ClothingTemplate,
  8: RestaurantTemplate,
};

// Template layout mockup images - these should represent actual template layouts
const templateImages: Record<number, string> = {
  1: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <rect x="20" y="20" width="360" height="40" fill="#e2e8f0" rx="4"/>
      <rect x="20" y="80" width="110" height="80" fill="#cbd5e1" rx="4"/>
      <rect x="145" y="80" width="110" height="80" fill="#cbd5e1" rx="4"/>
      <rect x="270" y="80" width="110" height="80" fill="#cbd5e1" rx="4"/>
      <rect x="20" y="180" width="110" height="80" fill="#cbd5e1" rx="4"/>
      <rect x="145" y="180" width="110" height="80" fill="#cbd5e1" rx="4"/>
      <rect x="270" y="180" width="110" height="80" fill="#cbd5e1" rx="4"/>
      <text x="200" y="25" font-family="Arial" font-size="12" fill="#64748b" text-anchor="middle">Clean Grid Layout</text>
    </svg>
  `)}`,
  2: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fefefe"/>
      <rect x="10" y="15" width="380" height="30" fill="#3b82f6" rx="4"/>
      <rect x="20" y="60" width="170" height="100" fill="#dbeafe" rx="8"/>
      <rect x="210" y="60" width="170" height="100" fill="#dbeafe" rx="8"/>
      <rect x="20" y="180" width="170" height="100" fill="#dbeafe" rx="8"/>
      <rect x="210" y="180" width="170" height="100" fill="#dbeafe" rx="8"/>
      <text x="200" y="30" font-family="Arial" font-size="11" fill="white" text-anchor="middle">Modern Cards</text>
    </svg>
  `)}`,
  3: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <rect x="10" y="10" width="80" height="280" fill="#e2e8f0" rx="4"/>
      <rect x="100" y="10" width="290" height="35" fill="#475569" rx="4"/>
      <rect x="110" y="60" width="85" height="70" fill="#cbd5e1" rx="4"/>
      <rect x="205" y="60" width="85" height="70" fill="#cbd5e1" rx="4"/>
      <rect x="300" y="60" width="85" height="70" fill="#cbd5e1" rx="4"/>
      <rect x="110" y="140" width="85" height="70" fill="#cbd5e1" rx="4"/>
      <rect x="205" y="140" width="85" height="70" fill="#cbd5e1" rx="4"/>
      <rect x="300" y="140" width="85" height="70" fill="#cbd5e1" rx="4"/>
      <text x="15" y="25" font-family="Arial" font-size="8" fill="#64748b">Filters</text>
      <text x="245" y="25" font-family="Arial" font-size="10" fill="white" text-anchor="middle">Feature Rich</text>
    </svg>
  `)}`,
  4: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fff7ed"/>
      <rect x="20" y="15" width="360" height="25" fill="#ea580c" rx="4"/>
      <rect x="20" y="50" width="60" height="15" fill="#fed7aa" rx="2"/>
      <rect x="90" y="50" width="60" height="15" fill="#fed7aa" rx="2"/>
      <rect x="160" y="50" width="60" height="15" fill="#fed7aa" rx="2"/>
      <rect x="230" y="50" width="60" height="15" fill="#fed7aa" rx="2"/>
      <rect x="20" y="80" width="175" height="200" fill="#fdba74" rx="6"/>
      <rect x="205" y="80" width="175" height="95" fill="#fdba74" rx="6"/>
      <rect x="205" y="185" width="175" height="95" fill="#fdba74" rx="6"/>
      <text x="200" y="30" font-family="Arial" font-size="11" fill="white" text-anchor="middle">Category Navigation</text>
    </svg>
  `)}`,
  5: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <rect x="15" y="15" width="370" height="45" fill="#1e293b" rx="4"/>
      <rect x="25" y="80" width="120" height="90" fill="#334155" rx="4"/>
      <rect x="155" y="80" width="120" height="90" fill="#334155" rx="4"/>
      <rect x="285" y="80" width="100" height="90" fill="#334155" rx="4"/>
      <rect x="25" y="190" width="360" height="25" fill="#64748b" rx="4"/>
      <rect x="25" y="225" width="360" height="25" fill="#64748b" rx="4"/>
      <rect x="25" y="260" width="180" height="25" fill="#64748b" rx="4"/>
      <text x="200" y="35" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Professional Showcase</text>
    </svg>
  `)}`,
  6: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <rect x="30" y="30" width="340" height="40" fill="rgba(255,255,255,0.9)" rx="8"/>
      <rect x="50" y="90" width="90" height="80" fill="rgba(255,255,255,0.8)" rx="6"/>
      <rect x="155" y="90" width="90" height="80" fill="rgba(255,255,255,0.8)" rx="6"/>
      <rect x="260" y="90" width="90" height="80" fill="rgba(255,255,255,0.8)" rx="6"/>
      <rect x="50" y="190" width="300" height="60" fill="rgba(255,255,255,0.7)" rx="6"/>
      <text x="200" y="50" font-family="Arial" font-size="14" fill="#1f2937" text-anchor="middle">Contemporary Design</text>
    </svg>
  `)}`,
  7: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fdf2f8"/>
      <rect x="20" y="20" width="360" height="30" fill="#ec4899" rx="4"/>
      <rect x="30" y="70" width="70" height="90" fill="#f9a8d4" rx="4"/>
      <rect x="110" y="70" width="70" height="90" fill="#f9a8d4" rx="4"/>
      <rect x="190" y="70" width="70" height="90" fill="#f9a8d4" rx="4"/>
      <rect x="270" y="70" width="70" height="90" fill="#f9a8d4" rx="4"/>
      <rect x="30" y="175" width="150" height="15" fill="#be185d" rx="2"/>
      <rect x="30" y="200" width="100" height="12" fill="#be185d" rx="2"/>
      <rect x="190" y="175" width="150" height="15" fill="#be185d" rx="2"/>
      <rect x="190" y="200" width="100" height="12" fill="#be185d" rx="2"/>
      <text x="200" y="35" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Clothing Store</text>
      <text x="65" y="190" font-family="Arial" font-size="8" fill="#be185d">Sizes: S M L XL</text>
      <text x="255" y="190" font-family="Arial" font-size="8" fill="#be185d">Cotton Material</text>
    </svg>
  `)}`,
  8: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fef3c7"/>
      <rect x="20" y="15" width="360" height="35" fill="#d97706" rx="4"/>
      <rect x="30" y="65" width="160" height="20" fill="#f59e0b" rx="3"/>
      <rect x="30" y="95" width="340" height="25" fill="#fbbf24" rx="3"/>
      <rect x="30" y="130" width="340" height="25" fill="#fbbf24" rx="3"/>
      <rect x="30" y="165" width="340" height="25" fill="#fbbf24" rx="3"/>
      <rect x="30" y="200" width="160" height="20" fill="#f59e0b" rx="3"/>
      <rect x="30" y="230" width="340" height="25" fill="#fbbf24" rx="3"/>
      <rect x="30" y="265" width="340" height="25" fill="#fbbf24" rx="3"/>
      <text x="200" y="33" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Restaurant Menu</text>
      <text x="35" y="78" font-family="Arial" font-size="9" fill="#92400e">APPETIZERS</text>
      <text x="35" y="213" font-family="Arial" font-size="9" fill="#92400e">MAIN COURSES</text>
      <circle cx="350" cy="107" r="8" fill="#dc2626"/>
      <text x="350" y="110" font-family="Arial" font-size="8" fill="white" text-anchor="middle">HOT</text>
    </svg>
  `)}`,
};

// Template descriptions
const templateDescriptions: Record<number, string> = {
  1: 'Clean and minimal design with card-based layout',
  2: 'Modern grid layout with hover effects',
  3: 'Feature-rich template with filtering options',
  4: 'Elegant design with category navigation',
  5: 'Professional layout with product showcase',
  6: 'Contemporary design with visual emphasis',
  7: 'Specialized clothing store template',
  8: 'Restaurant-focused template with menu styling',
};

// Custom Hook to manage vendor ID retrieval
const useVendorId = (propVendorId?: number): number | undefined => {
  const [vendorId, setVendorId] = useState<number | undefined>(propVendorId);

  useEffect(() => {
    if (propVendorId) return;

    const fetchVendorId = () => {
      try {
        const storedVendorId = localStorage.getItem('vendor_id');
        if (storedVendorId) {
          return parseInt(storedVendorId);
        }

        const token = localStorage.getItem('auth_token') ||
          localStorage.getItem('authToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('accessToken');

        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const vendorId = payload.vendor_id || payload.vendorId || payload.vendor || payload.id || payload.sub;
            if (vendorId) {
              return typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
            }
          }
        }
      } catch (error) {
        console.warn('Error getting vendor_id:', error);
      }
      return undefined;
    };

    setVendorId(fetchVendorId());
  }, [propVendorId]);

  return vendorId;
};

interface VendorStorePageProps {
  vendor_id?: number;
  business_name?: string;
}

const VendorStorePage: React.FC<VendorStorePageProps> = ({
  vendor_id: propVendorId
}) => {
  const vendorId = useVendorId(propVendorId);

  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [storeData, setStoreData] = useState<VendorStore | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null);
  const [savingTemplateId, setSavingTemplateId] = useState<number | null>(null);

  const loadVendorStore = async () => {
    if (!vendorId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/api/vendor/store?vendor_id=${vendorId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to load store data (${response.status})`);
      }

      const storeData: VendorStore = await response.json();
      console.log("STORE DATA FROM API", storeData);

      if (!storeData.vendor_id || !storeData.business_name) {
        throw new Error('Invalid store data received from server');
      }

      setSelectedTemplate(storeData.template_id || 1);
      setStoreData(storeData);

    } catch (err) {
      console.error('Failed to load store data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load store data');

      const storedTemplate = localStorage.getItem('selectedTemplate');
      const template = storedTemplate ? parseInt(storedTemplate) : 1;
      setSelectedTemplate(template);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorStore();
  }, [vendorId]);

  const handleTemplateSelect = async (templateId: number) => {
    if (!storeData) return;

    try {
      setSavingTemplateId(templateId);
      setError(null);

      const response = await fetch(`http://localhost:8000/api/vendor/${storeData.vendor_id}/template`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to save template selection');
      }

      setSelectedTemplate(templateId);
      setStoreData(prev => prev ? { ...prev, template_id: templateId } : null);
      localStorage.setItem('selectedTemplate', templateId.toString());
      setViewMode('single');

    } catch (err) {
      console.error('Failed to save template selection:', err);
      setError('Template selected locally, but failed to save to server.');
      setSelectedTemplate(templateId);
      localStorage.setItem('selectedTemplate', templateId.toString());
      setViewMode('single');
    } finally {
      setSavingTemplateId(null);
    }
  };

  // Convert ApiProduct to Product with default values
  const convertApiProductToProduct = (apiProduct: ApiProduct, businessCategory?: string): Product => {
    const baseProduct = {
      ...apiProduct,
      rating: apiProduct.rating ?? 0,
      reviews: apiProduct.reviews ?? 0,
      // Clothing-specific defaults
      sizes: apiProduct.sizes ?? [],
      clothing_type: apiProduct.clothing_type ?? '',
      material: apiProduct.material ?? '',
      // Restaurant-specific defaults
      ingredients: apiProduct.ingredients ?? [],
      dietary_restrictions: apiProduct.dietary_restrictions ?? [],
      spice_level: apiProduct.spice_level ?? 'mild',
      preparation_time: apiProduct.preparation_time ?? 15,
    };

    // Handle different stock formats based on business category
    if (businessCategory?.toLowerCase() === 'clothing') {
      // For clothing, stock should be an object with sizes
      const stockBySizes: { [size: string]: number } = {};
      const sizes = baseProduct.sizes.length > 0 ? baseProduct.sizes : ['S', 'M', 'L', 'XL'];
      sizes.forEach(size => {
        stockBySizes[size] = typeof apiProduct.stock === 'number' ? Math.floor(apiProduct.stock / sizes.length) : 10;
      });
      return {
        ...baseProduct,
        stock: stockBySizes as any, // For clothing templates
        sizes: sizes,
      };
    } else {
      // For other categories, stock is a number
      return {
        ...baseProduct,
        stock: apiProduct.stock ?? 0,
      };
    }
  };

  // Create properly typed template props to avoid interface mismatches
  const createTemplateProps = (data: VendorStore): TemplateProps => {
    return {
      products: data.products.map(product => convertApiProductToProduct(product, data.business_category)),
      vendorInfo: {
        business_name: data.business_name,
        business_logo: data.business_logo,
        vendor_id: data.vendor_id,
      },
      categories: data.categories.length > 0 ? data.categories : undefined,
      filters: {
        priceRange: [
          data.filters.priceRange[0] || 0,
          data.filters.priceRange[1] || 10000
        ] as [number, number],
        availability: data.filters.availability || []
      }
    };
  };

  // Create template-specific props based on business category
  const createTemplatePropsForCategory = (data: VendorStore, templateId?: number): TemplateProps => {
    const baseProps = createTemplateProps(data);
    
    // For clothing templates, ensure clothing-specific fields are properly set
    if (data.business_category === "Clothing" || templateId === 7) {
      return {
        ...baseProps,
        products: baseProps.products.map(product => ({
          ...product,
          sizes: product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL'],
          clothing_type: product.clothing_type || 'casual',
          material: product.material || 'cotton',
          // Ensure stock is in the right format for clothing templates
          stock: typeof product.stock === 'object' ? product.stock : 
            (() => {
              const sizes = product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL'];
              const stockBySizes: { [size: string]: number } = {};
              const totalStock = typeof product.stock === 'number' ? product.stock : 0;
              sizes.forEach(size => {
                stockBySizes[size] = Math.floor(totalStock / sizes.length) || 10;
              });
              return stockBySizes;
            })(),
        }))
      };
    }
    
    // For restaurant templates, ensure restaurant-specific fields are properly set
    if (data.business_category === "Food" || templateId === 8) {
      return {
        ...baseProps,
        products: baseProps.products.map(product => ({
          ...product,
          ingredients: product.ingredients?.length ? product.ingredients : ['Fresh ingredients'],
          dietary_restrictions: product.dietary_restrictions || [],
          spice_level: product.spice_level || 'mild',
          preparation_time: product.preparation_time || 15,
        }))
      };
    }
    
    return baseProps;
  };

  const SelectedTemplateComponent = useMemo(() => {
    if (!storeData) return Template1;

    if (storeData.business_category === "Food") {
      return RestaurantTemplate;
    } else if (storeData.business_category === "Clothing") {
      return ClothingTemplate;
    }

    return templates[storeData.template_id] || Template1;
  }, [storeData]);

  const PreviewTemplateComponent = useMemo(() => {
    if (!previewTemplate || !storeData) return null;

    if (storeData.business_category === "Food") {
      return RestaurantTemplate;
    } else if (storeData.business_category === "Clothing") {
      return ClothingTemplate;
    }

    return templates[previewTemplate] || Template1;
  }, [previewTemplate, storeData]);

  if (!vendorId) {
    return (
      <div className="flex items-center justify-center h-64 overflow-y-auto">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Authentication Issue</div>
          <div className="text-gray-600 mb-4">
            Could not retrieve vendor ID.
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && !storeData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">{error || 'No store data available'}</div>
          <button
            onClick={loadVendorStore}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Create template props once to avoid recreation on each render
  const templateProps = createTemplatePropsForCategory(storeData);
  const previewTemplateProps = previewTemplate ? createTemplatePropsForCategory(storeData, previewTemplate) : templateProps;

  if (previewTemplate) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="sticky top-0 z-50 bg-white shadow p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Template {previewTemplate} Preview</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTemplateSelect(previewTemplate)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={savingTemplateId === previewTemplate}
            >
              {savingTemplateId === previewTemplate ? 'Selecting...' : 'Select This Template'}
            </button>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back
            </button>
          </div>
        </div>

        <div className="overflow-y-auto">
          {PreviewTemplateComponent && (
            <PreviewTemplateComponent {...previewTemplateProps as any} />
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'single') {
    const isRestrictedCategory =
      storeData.business_category?.toLowerCase() === 'food' ||
      storeData.business_category?.toLowerCase() === 'clothing';

    return (
      <div
        className="overflow-y-auto"
        style={{
          maxHeight: '100vh',
          scrollbarWidth: 'thin', // For Firefox
          scrollbarColor: '#888 #f1f1f1', // For Firefox
        }}
      >
        <style>
          {`
      div::-webkit-scrollbar {
        width: 8px;
      }
      div::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      div::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      div::-webkit-scrollbar-thumb:hover {
        background-color: #555;
      }
    `}
        </style>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Only show "View All Templates" and current template indicator if not restricted */}
        {!isRestrictedCategory ? (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              View All Templates
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded">
              Currently using Template {selectedTemplate}
            </span>
          </div>
        ) : (
          <div className="mb-4 px-4 py-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
            This category uses a fixed template and cannot be changed.
          </div>
        )}
        <div className='overflow-y-auto'>
          {/* Render the selected template component */}
          {SelectedTemplateComponent && (
            <SelectedTemplateComponent {...templateProps as any} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-0 flex-shrink-0">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Choose a Template</h1>
          <button
            onClick={() => setViewMode('single')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={loading}
          >
            Back to Store
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 pb-6">
          {Object.entries(templates)
            .filter(([templateId]) => {
              const numericTemplateId = parseInt(templateId);
              // Hide clothing template (7) if not clothing category
              if (numericTemplateId === 7 && storeData.business_category?.toLowerCase() !== 'clothing') {
                return false;
              }
              // Hide restaurant template (8) if not food category
              if (numericTemplateId === 8 && storeData.business_category?.toLowerCase() !== 'food') {
                return false;
              }
              return true;
            })
            .map(([templateId, TemplateComponent]) => {
            const numericTemplateId = parseInt(templateId);
            const isSelected = selectedTemplate === numericTemplateId;
            const isSaving = savingTemplateId === numericTemplateId;

            return (
              <div
                key={templateId}
                className={`border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'} ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="p-3 bg-gray-50 border-b">
                  <div className="font-semibold text-black">Template {templateId}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {templateDescriptions[numericTemplateId] || 'Custom template layout'}
                  </div>
                </div>

                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={templateImages[numericTemplateId]}
                    alt={`Template ${templateId} layout preview`}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-4 bg-white space-y-3">
                  <button
                    onClick={() => setPreviewTemplate(numericTemplateId)}
                    className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    disabled={loading}
                  >
                    Preview Template
                  </button>

                  <button
                    onClick={() => handleTemplateSelect(numericTemplateId)}
                    className={`w-full py-2 px-4 rounded transition-colors ${
                      isSelected 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : isSelected ? 'Currently Selected' : 'Select Template'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VendorStorePage;