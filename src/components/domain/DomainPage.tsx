import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Clock, 
  Crown, 
  AlertCircle, 
  CheckCircle, 
  Star,
  Plus,
  ExternalLink,
  Shield,
  Zap,
  ArrowRight,
  Check,
  RefreshCw,
  IndianRupee
} from 'lucide-react';

// Updated interfaces to match your real API response
interface DomainSuggestion {
  suggested_domain: string;
  tld: string;
  registration_price_inr: number;
  renewal_price_inr: number;
  registration_price_display: string;
  renewal_price_display: string;
  is_available: boolean;
  is_premium: boolean;
  is_popular_tld: boolean;
  recommendation_score: number;
  hosting_included: boolean;
  ssl_included: boolean;
  setup_time: string;
  registrar: string;
}

interface DomainSuggestionResponse {
  success: boolean;
  suggestions: DomainSuggestion[];
  business_name: string;
  total_suggestions: number;
  currency: string;
  market: string;
  cheapest_price_inr: number;
}

interface ContactInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const DomainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'connect'>('search');
  const [businessName, setBusinessName] = useState('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Custom domain connection state
  const [customDomain, setCustomDomain] = useState('');
  const [registrar, setRegistrar] = useState('');
  const [customDomainLoading, setCustomDomainLoading] = useState(false);

  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainSuggestion | null>(null);

  // Clear results when search input is cleared
  useEffect(() => {
    if (!businessName.trim()) {
      setSuggestions([]);
      setSearchPerformed(false);
      setError(null);
    }
  }, [businessName]);

  const searchDomainSuggestions = async () => {
    if (!businessName.trim()) {
      setError('Please enter a business name');
      return;
    }

    if (businessName.trim().length < 2) {
      setError('Business name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to search for domains');
      }

      // Updated to match your real API endpoint
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
        if (response.status === 401) {
          throw new Error('Please log in again');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get domain suggestions');
      }

      const data: DomainSuggestionResponse = await response.json();
      
      // Validate response structure
      if (!data.success || !data.suggestions) {
        throw new Error('Invalid response format');
      }

      setSuggestions(data.suggestions);
      setSearchPerformed(true);
      
      console.log(`✅ Found ${data.suggestions.length} domain suggestions`);
      console.log(`💰 Cheapest price: ₹${data.cheapest_price_inr}`);
      
    } catch (err) {
      console.error('Domain search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainSelect = (domain: DomainSuggestion) => {
    setSelectedDomain(domain);
    setShowPurchaseModal(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'search') {
        searchDomainSuggestions();
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <Check className="w-3 h-3" />;
    if (score >= 0.6) return <Star className="w-3 h-3" />;
    return <Globe className="w-3 h-3" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Perfect match';
    if (score >= 0.6) return 'Great match';
    return 'Good match';
  };

  const getAvailabilityIcon = (domain: DomainSuggestion) => {
    if (domain.is_available) {
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Domains</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <Globe className="w-4 h-4" />
                <span>Professional web addresses with real GoDaddy API</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
              <Zap className="w-4 h-4" />
              <span>Real-time availability</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Hero Section */}
        <div className="text-center py-12 sm:py-16 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-slate-900 mb-4 sm:mb-6 tracking-tight px-4">
            Get your perfect domain
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            Professional web addresses starting at ₹599/year. Real-time availability check with GoDaddy API.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>SSL included</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Instant setup</span>
            </div>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              <span>Indian pricing</span>
            </div>
          </div>
        </div>

        

        {/* Tab Navigation */}
        <div className="flex justify-center py-8 sm:py-12 px-4">
          <div className="flex bg-slate-100 p-1 rounded-lg w-full max-w-sm">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 sm:px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find new domain
            </button>
            <button
              onClick={() => setActiveTab('connect')}
              className={`flex-1 px-4 sm:px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
                activeTab === 'connect'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Connect existing
            </button>
          </div>
        </div>

        {/* Search Tab Content */}
        {activeTab === 'search' && (
          <div className="space-y-12">
            {/* Search Section */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter your business name (e.g., 'mahi')"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base placeholder-slate-400 transition-colors"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={searchDomainSuggestions}
                  disabled={loading || !businessName.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Checking availability...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search domains
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Search hint */}
              {!searchPerformed && !loading && (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Enter your business name to see available domains</p>
                  <p className="text-sm text-slate-400 mt-1">Real-time results from GoDaddy API</p>
                </div>
              )}
            </div>

            {/* Results Section */}
            {suggestions.length > 0 && (
              <div className="px-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Available domains for "{businessName}"
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">
                      Found {suggestions.length} suggestions • Prices in INR
                    </p>
                  </div>
                  <button
                    onClick={searchDomainSuggestions}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                <div className="grid gap-4">
                  {suggestions.map((domain, index) => (
                    <div
                      key={domain.suggested_domain}
                      className={`p-6 border rounded-lg transition-all hover:shadow-md ${
                        domain.is_available 
                          ? 'border-slate-200 hover:border-blue-300 bg-white' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {domain.suggested_domain}
                            </h3>
                            
                            {/* Availability Status */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              domain.is_available 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {getAvailabilityIcon(domain)}
                              {domain.is_available ? 'Available' : 'Taken'}
                            </div>

                            {/* Premium Badge */}
                            {domain.is_premium && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                                <Crown className="w-3 h-3" />
                                Premium
                              </div>
                            )}

                            {/* Popular TLD Badge */}
                            {domain.is_popular_tld && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                <Star className="w-3 h-3" />
                                Popular
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            {/* Pricing */}
                            <div>
                              <span className="font-medium text-slate-900">
                                {domain.registration_price_display}
                              </span>
                              <span className="text-slate-500">/year</span>
                              {domain.renewal_price_inr !== domain.registration_price_inr && (
                                <span className="ml-1 text-xs text-slate-400">
                                  (renews at {domain.renewal_price_display})
                                </span>
                              )}
                            </div>

                            {/* Features */}
                            {domain.hosting_included && (
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Hosting included
                              </div>
                            )}

                            {domain.ssl_included && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                SSL included
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {domain.setup_time}
                            </div>

                            {/* Recommendation Score */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getScoreColor(domain.recommendation_score)}`}>
                              {getScoreIcon(domain.recommendation_score)}
                              {getScoreLabel(domain.recommendation_score)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {domain.is_available ? (
                            <button
                              onClick={() => handleDomainSelect(domain)}
                              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Register
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-6 py-2 bg-slate-100 text-slate-400 rounded-md font-medium cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Not available
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show powered by */}
                <div className="text-center mt-8 text-sm text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <span>Powered by</span>
                    <strong>GoDaddy API</strong>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Real-time data</span>
                  </div>
                </div>
              </div>
            )}

            {/* No results */}
            {searchPerformed && !loading && suggestions.length === 0 && !error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No domain suggestions found</p>
                <p className="text-sm text-slate-400 mt-1">Try a different business name</p>
              </div>
            )}
          </div>
        )}

        {/* Connect Tab Content */}
        {activeTab === 'connect' && (
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <ExternalLink className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Connect your existing domain</h2>
              <p className="text-slate-600">
                Already own a domain? Connect it to get started with your website.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your domain name
                </label>
                <input
                  type="text"
                  placeholder="yourdomain.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current registrar (optional)
                </label>
                <select
                  value={registrar}
                  onChange={(e) => setRegistrar(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your registrar</option>
                  <option value="godaddy">GoDaddy</option>
                  <option value="namecheap">Namecheap</option>
                  <option value="cloudflare">Cloudflare</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={() => alert('Domain connection feature coming soon!')}
                disabled={!customDomain.trim() || customDomainLoading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {customDomainLoading ? 'Connecting...' : 'Connect domain'}
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• We'll verify domain ownership via DNS</li>
                <li>• Update nameservers to Vision hosting</li>
                <li>• Deploy selected template automatically</li>
                <li>• Your website will be live in 24-48 hours</li>
              </ul>
            </div>
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && selectedDomain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Register {selectedDomain.suggested_domain}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Registration (1 year)</span>
                  <span className="font-medium">{selectedDomain.registration_price_display}</span>
                </div>
                
                {selectedDomain.hosting_included && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Hosting included</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                )}
                
                {selectedDomain.ssl_included && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">SSL certificate</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>{selectedDomain.registration_price_display}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => alert('Purchase flow coming soon!')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainPage;