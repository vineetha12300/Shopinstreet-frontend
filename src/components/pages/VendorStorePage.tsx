import { useEffect, useState } from 'react';
import Template1 from '../storeTemplates/Template1';


// Define Product type based on API response
interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls: string[]; // API returns array of image URLs
  category: string;
  vendor_id: number;
}

// Define VendorStore type based on API response
interface VendorStore {
  vendor_id: number;
  business_name: string;
  business_logo: string;
  categories: string[];
  filters: {
    priceRange: number[];
    availability: string[];
  };
  products: ApiProduct[];
  template_id: number;
}

// Define the props expected by templates
interface TemplateProps {
  products: ApiProduct[];
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

// Map template numbers to components
const templates: Record<number, React.FC<TemplateProps>> = {
  1: Template1,
   // Placeholder for additional templates
};

interface VendorStorePageProps {
  vendor_id?: number;
  business_name?: string;
}

const VendorStorePage: React.FC<VendorStorePageProps> = ({
  vendor_id: propVendorId,
  business_name: propBusinessName
}) => {
  const getVendorId = (): number | undefined => {
    if (propVendorId) return propVendorId;

    try {
      // Try reading vendor_id directly from localStorage
      const storedVendorId = localStorage.getItem('vendor_id');
      if (storedVendorId) {
        return parseInt(storedVendorId);
      }

      // If not found directly, fallback to extracting from token (optional)
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

  const vendor_id = getVendorId();

  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [storeData, setStoreData] = useState<VendorStore | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null);

  useEffect(() => {
    // Load initial data
    loadVendorStore();
  }, [vendor_id]);

  const loadVendorStore = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have vendor_id
      if (!vendor_id) {
        throw new Error('Vendor ID not found in authentication token. Please ensure you are logged in as a vendor or contact support.');
      }

      // Use the vendor dashboard endpoint
      const response = await fetch(`http://localhost:8000/api/vendor/store?vendor_id=${vendor_id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to load store data (${response.status})`);
      }

      const storeData: VendorStore = await response.json();

      // Validate the response data
      if (!storeData.vendor_id || !storeData.business_name) {
        throw new Error('Invalid store data received from server');
      }

      // Set template from backend data
      setSelectedTemplate(storeData.template_id || 1);
      setStoreData(storeData);

    } catch (err) {
      console.error('Failed to load store data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load store data');

      // Fallback to localStorage if API fails and we have basic data
      if (vendor_id) {
        const storedTemplate = localStorage.getItem('selectedTemplate');
        const template = storedTemplate ? parseInt(storedTemplate) : 1;
        setSelectedTemplate(template);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (templateId: number) => {
    if (!storeData) return;

    try {
      setLoading(true);
      setError(null);

      // Save to backend using the correct endpoint
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

      // Update local state
      setSelectedTemplate(templateId);
      setStoreData(prev => prev ? { ...prev, template_id: templateId } : null);
      localStorage.setItem('selectedTemplate', templateId.toString());
      setViewMode('single');

    } catch (err) {
      console.error('Failed to save template selection:', err);
      setError('Failed to save template selection');

      // Fallback to localStorage only
      setSelectedTemplate(templateId);
      localStorage.setItem('selectedTemplate', templateId.toString());
      setViewMode('single');
    } finally {
      setLoading(false);
    }
  };

  const handleViewGrid = () => {
    setViewMode('grid');
  };

  const handleViewSingle = () => {
    setViewMode('single');
    setPreviewTemplate(null);
  };

  const handleSelectTemplate = (templateId: number) => {
    handleTemplateSelect(templateId);
  };

  const handlePreviewTemplate = (templateId: number) => {
    setPreviewTemplate(templateId);
  };

  const SelectedTemplateComponent = templates[selectedTemplate] || Template1;
  const PreviewTemplateComponent = previewTemplate ? (templates[previewTemplate] || Template1) : null;

  // Show error state if no vendor_id is available
  if (!vendor_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Authentication Issue</div>
          <div className="text-gray-600 mb-4">
            Could not retrieve vendor ID from authentication token.
          </div>
          <div className="text-sm text-gray-500">
            Please try logging out and logging back in, or contact support if the issue persists.
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login'; // Adjust path as needed
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
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
          <div className="text-lg text-red-600 mb-2">
            {error || 'No store data available'}
          </div>
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

  // Full template preview mode
  if (previewTemplate) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Template {previewTemplate} Preview</h1>
            <span className="text-gray-600">
              {storeData.business_name} - {storeData.products.length} products
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectTemplate(previewTemplate)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Selecting...' : 'Select This Template'}
            </button>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Templates
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            {PreviewTemplateComponent && (
              <PreviewTemplateComponent
                products={storeData.products}
                vendorInfo={{
                  business_name: storeData.business_name,
                  business_logo: storeData.business_logo
                }}
                categories={storeData.categories}
                filters={{
                  priceRange: [storeData.filters.priceRange[0], storeData.filters.priceRange[1]],
                  availability: storeData.filters.availability
                }}
              />
            )}
          </div>
        </div>


      </div>
    );
  }

  if (viewMode === 'single') {
    return (
      <div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleViewGrid}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            View All Templates
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            Currently using Template {selectedTemplate}
          </span>
          <span className="px-4 py-2 bg-gray-50 rounded text-sm">
            {storeData.business_name} - {storeData.products.length} products
          </span>
        </div>
        <SelectedTemplateComponent
          products={storeData.products}
          vendorInfo={{
            business_name: storeData.business_name,
            business_logo: storeData.business_logo
          }}
          categories={storeData.categories}
          filters={{
            priceRange: [storeData.filters.priceRange[0], storeData.filters.priceRange[1]],
            availability: storeData.filters.availability
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-0 flex-shrink-0">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Choose a Template</h1>
            <p className="text-gray-600">
              {storeData.business_name} - {storeData.products.length} products available
            </p>
          </div>
          <button
            onClick={handleViewSingle}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={loading}
          >
            Back to Store
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="w-full max-w-screen-xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 pb-6">
          {Object.entries(templates).map(([templateId, TemplateComponent]) => {
          const numericTemplateId = parseInt(templateId);
          const isSelected = selectedTemplate === numericTemplateId;

          return (
            <div
              key={templateId}
              className={`border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${isSelected
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="p-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-lg">Template {templateId}</h3>
                {isSelected && (
                  <span className="text-sm text-blue-600 font-medium">Currently Active</span>
                )}
              </div>

              {/* Template thumbnail/mockup */}
              <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100"></div>
                <div className="relative z-10 text-center">
                  <div className="text-2xl font-bold text-gray-700 mb-2">Template {templateId}</div>
                  <div className="text-sm text-gray-600">
                    {storeData.products.length} products
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-1 opacity-50">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 bg-white rounded border"></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white space-y-2">
                <button
                  onClick={() => handlePreviewTemplate(numericTemplateId)}
                  className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200 mb-2"
                  disabled={loading}
                >
                  Preview Template
                </button>

                <button
                  onClick={() => handleSelectTemplate(numericTemplateId)}
                  className={`w-full py-2 px-4 rounded transition-colors duration-200 ${isSelected
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isSelected ? 'Currently Selected' : 'Select Template'}
                </button>
              </div>
            </div>
          );
        })}
        </div>

        <div className="flex justify-center pb-6">
          <button
            onClick={() => handleSelectTemplate(selectedTemplate)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
            disabled={loading}
          >
            Use Selected Template (Template {selectedTemplate})
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorStorePage;