import React, { useState, useEffect } from 'react';
import { 
  Search, Globe, Star, Check, AlertCircle, Clock, 
  CreditCard, Shield, Zap, RefreshCw, ExternalLink,
  ChevronRight, MapPin, Smartphone, Wifi, Lock, Building2
} from 'lucide-react';

interface DomainSuggestion {
  suggested_domain: string;
  tld: string;
  registration_price_inr: number;
  renewal_price_inr: number;
  is_popular_tld: boolean;
  recommendation_score: number;
  is_available: boolean;
  is_premium: boolean;
  hosting_included: boolean;
  ssl_included: boolean;
  setup_time: string;
  registrar: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  preview_url: string;
  features: string[];
  suitable_for: string[];
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  organization: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

const EnhancedDomainPage: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'search' | 'existing'>('search');
  const [businessName, setBusinessName] = useState('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Purchase flow
  const [selectedDomain, setSelectedDomain] = useState<DomainSuggestion | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '', email: '', phone: '', organization: '',
    address: '', city: '', state: 'Karnataka', country: 'India', postal_code: ''
  });
  
  // Order tracking
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/domains/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  // Search domain suggestions
  const searchDomainSuggestions = async () => {
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/domains/search/${encodeURIComponent(businessName.trim())}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Search failed');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainSelect = (domain: DomainSuggestion) => {
    setSelectedDomain(domain);
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId);
    setShowTemplateModal(false);
    setShowContactModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedDomain || !contactInfo.name || !contactInfo.email) {
      setError('Please fill in all required contact information');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/domains/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain_name: selectedDomain.suggested_domain,
          template_id: selectedTemplate,
          contact_info: contactInfo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed');
      }

      const result = await response.json();
      
      // For testing, simulate payment confirmation
      await confirmPayment(result.order_id);
      
    } catch (error) {
      console.error('Purchase error:', error);
      setError(error instanceof Error ? error.message : 'Purchase failed');
    } finally {
      setLoading(false);
      setShowContactModal(false);
    }
  };

  const confirmPayment = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/domains/confirm-payment/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_id: 'test_payment_123',
          status: 'completed'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOrderStatus({
          order_id: orderId,
          domain_name: selectedDomain?.suggested_domain || '',
          status: 'processing_started',
          completion_percentage: 5,
          current_step: 'payment_confirmed'
        });
        
        setShowProgressModal(true);
        startOrderTracking(orderId);
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
    }
  };

  const startOrderTracking = (orderId: number) => {
    const trackOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/domains/status/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setOrderStatus(data);
          
          if (data.completion_percentage < 100 && data.status !== 'failed') {
            setTimeout(trackOrder, 3000);
          }
        }
      } catch (error) {
        console.error('Order tracking failed:', error);
      }
    };

    trackOrder();
  };

  const formatIndianPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
                <p className="text-sm text-gray-600">Professional domains for Indian businesses</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>🇮🇳 India Pricing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get Your Perfect Domain
          </h2>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Professional domains starting at ₹599/year with free hosting, SSL, and automatic website setup
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchDomainSuggestions()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={searchDomainSuggestions}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Domain Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Domains</h3>
            <div className="grid gap-4">
              {suggestions.slice(0, 8).map((domain, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleDomainSelect(domain)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-semibold text-gray-900">
                          {domain.suggested_domain}
                        </span>
                        {domain.is_popular_tld && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Popular
                          </span>
                        )}
                        {domain.is_premium && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            Premium
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          domain.is_available 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {domain.is_available ? 'Available' : 'Taken'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Free SSL
                        </span>
                        <span className="flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          Free Hosting
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Template Included
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatIndianPrice(domain.registration_price_inr)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Renews at {formatIndianPrice(domain.renewal_price_inr)}/year
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Setup: {domain.setup_time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here - Template Selection, Contact Info, Progress */}
      {/* (Implementation continues with modals...) */}
      
    </div>
  );
};

export default EnhancedDomainPage;