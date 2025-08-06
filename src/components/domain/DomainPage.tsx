// src/components/domain/DomainPage.tsx - With Purchase Modal Integration
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
  Check
} from 'lucide-react';
import PageHeader from '../layout/PageHeader';
import PurchaseModal from './PurchaseModal';

interface DomainSuggestion {
  suggested_domain: string;
  tld: string;
  registration_price: number;
  renewal_price: number;
  is_available: boolean;
  is_premium: boolean;
  is_popular_tld: boolean;
  recommendation_score: number;
}

interface DomainSuggestionResponse {
  suggestions: DomainSuggestion[];
  business_name: string;
  total_suggestions: number;
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

      const response = await fetch(
        `http://localhost:8000/api/domains/suggestions/${encodeURIComponent(businessName.trim())}`,
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
      setSuggestions(data.suggestions);
      setSearchPerformed(true);
      
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

  const handlePurchaseDomain = async (domainName: string, contactInfo: ContactInfo) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to purchase domains');
      }

      // Simulate API call for domain purchase
      const response = await fetch('http://localhost:8000/api/domains/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: domainName,
          contact_info: contactInfo,
          template_id: 1, // Default template
          years: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Purchase failed');
      }

      const result = await response.json();
      console.log('Purchase successful:', result);
      
      // Close modal and refresh domain list if needed
      setShowPurchaseModal(false);
      
    } catch (error) {
      console.error('Purchase error:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleConnectCustomDomain = async () => {
    if (!customDomain.trim()) {
      alert('Please enter your domain name');
      return;
    }

    setCustomDomainLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Success! Custom domain "${customDomain}" setup initiated.\n\nNext steps:\n1. We'll send DNS instructions to your email\n2. Update your domain's DNS settings\n3. We'll verify and activate hosting\n\nEstimated setup time: 24-48 hours`);
      
      setCustomDomain('');
      setRegistrar('');
    } catch (error) {
      alert('Failed to setup custom domain. Please try again.');
    } finally {
      setCustomDomainLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'search') {
        searchDomainSuggestions();
      } else {
        handleConnectCustomDomain();
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

  return (
    <div className="min-h-screen bg-white">
      {/* Stripe-style Header */}
      <PageHeader title="Domains">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Globe className="w-4 h-4" />
          <span>Professional web addresses</span>
        </div>
      </PageHeader>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Hero Section - Mobile Optimized */}
        <div className="text-center py-12 sm:py-16 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-slate-900 mb-4 sm:mb-6 tracking-tight px-4">
            Get your perfect domain
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            Professional web addresses starting at $12.99/year. 
            Includes hosting, SSL, and setup in minutes.
          </p>
        </div>

        {/* Tab Navigation - Mobile Optimized */}
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
            {/* Search Section - Mobile Optimized */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter your business name"
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
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Searching</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchPerformed && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                    Available domains for "{businessName}"
                  </h2>
                  <p className="text-slate-600">
                    {suggestions.length} domains found
                  </p>
                </div>
                
                {suggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No domains available</h3>
                    <p className="text-slate-600">Try a different business name</p>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-3 px-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 sm:p-6 hover:border-slate-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="text-lg sm:text-xl font-medium text-slate-900 break-all">
                                {suggestion.suggested_domain}
                              </span>
                              {suggestion.is_popular_tld && (
                                <span title="Popular TLD" className="inline-flex">
                                  <Crown className="w-4 h-4 text-amber-500" />
                                </span>
                              )}
                              {suggestion.is_premium && (
                                <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md font-medium border border-amber-200">
                                  Premium
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-600">
                              <span>Renews at ${suggestion.renewal_price}/year</span>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border w-fit ${getScoreColor(suggestion.recommendation_score)}`}>
                                {getScoreIcon(suggestion.recommendation_score)}
                                <span>{getScoreLabel(suggestion.recommendation_score)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-4">
                            <div className="text-left sm:text-right">
                              <div className="text-xl sm:text-2xl font-semibold text-slate-900">
                                ${suggestion.registration_price}
                              </div>
                              <div className="text-sm text-slate-500">per year</div>
                            </div>
                            <button
                              onClick={() => handleDomainSelect(suggestion)}
                              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <span>Select</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Features Section - Mobile Optimized */}
            {!searchPerformed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 py-12 px-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Free SSL certificate</h3>
                  <p className="text-slate-600 text-sm">Secure your site with HTTPS encryption, included at no extra cost.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Instant setup</h3>
                  <p className="text-slate-600 text-sm">Your website goes live within minutes of domain registration.</p>
                </div>
                
                <div className="text-center sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Professional hosting</h3>
                  <p className="text-slate-600 text-sm">Fast, reliable hosting with 99.9% uptime included.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connect Existing Domain Tab */}
        {activeTab === 'connect' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                Connect your existing domain
              </h2>
              <p className="text-slate-600">
                Use a domain you already own with our professional hosting and SSL.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Domain name
                </label>
                <input
                  type="text"
                  placeholder="yourdomain.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  disabled={customDomainLoading}
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Enter without http:// or https://
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Current registrar (optional)
                </label>
                <select
                  value={registrar}
                  onChange={(e) => setRegistrar(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  disabled={customDomainLoading}
                >
                  <option value="">Select registrar</option>
                  <option value="godaddy">GoDaddy</option>
                  <option value="namecheap">Namecheap</option>
                  <option value="cloudflare">Cloudflare</option>
                  <option value="google">Google Domains</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={handleConnectCustomDomain}
                disabled={customDomainLoading || !customDomain.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {customDomainLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Setting up domain...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Connect domain
                  </>
                )}
              </button>
            </div>

            {/* Setup Process */}
            <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                What happens next
              </h4>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                  <span>We'll send DNS setup instructions to your email</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                  <span>Update your domain's DNS settings with your registrar</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                  <span>We'll verify the connection and activate hosting</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                  <span>Your website goes live on your custom domain</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Typical setup time: 24-48 hours after DNS changes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedDomain && (
        <PurchaseModal
          domain={selectedDomain}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handlePurchaseDomain}
        />
      )}
    </div>
  );
};

export default DomainPage;