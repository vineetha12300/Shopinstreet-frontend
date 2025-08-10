import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Eye, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Crown,
  Zap,
  Gift,
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Server,
  Wifi,
  RotateCcw
} from 'lucide-react';

interface Domain {
  id: number;
  domain_name: string;
  type: 'free' | 'purchased' | 'custom';
  status: 'draft' | 'preview' | 'live' | 'failed';
  website_url: string;
  ssl_enabled: boolean;
  hosting_active: boolean;
  dns_configured: boolean;
  purchase_price_inr?: number;
  renewal_price_inr?: number;
  expiry_date?: string;
  created_at: string;
  template_id?: number;
}

interface DomainOrder {
  id: number;
  order_number: string;
  domain_name: string;
  status: string;
  completion_percentage: number;
  current_step: string;
  total_amount_inr: number;
  payment_status: string;
  error_message?: string;
}

interface DomainSuggestion {
  suggested_domain: string;
  is_available: boolean;
  price_inr: number;
  tld: string;
  registrar: string;
}

const DomainPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [orders, setOrders] = useState<DomainOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'domains' | 'orders' | 'search'>('domains');
  const [businessName, setBusinessName] = useState('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendorDomains();
    fetchDomainOrders();
  }, []);

  const fetchVendorDomains = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/domains/my-domains', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDomains(data.domains || []);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      setDomains([]);
    }
  };

  const fetchDomainOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/domains/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const searchDomains = async () => {
    if (!businessName.trim()) {
      setError('Please enter a business name');
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/domains/search/${encodeURIComponent(businessName.trim())}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search domains');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusBadge = (status: 'draft' | 'preview' | 'live' | 'failed') => {
    const statusConfig = {
      draft: { 
        color: 'bg-slate-100 text-slate-700 border-slate-200', 
        icon: Clock
      },
      preview: { 
        color: 'bg-amber-100 text-amber-700 border-amber-200', 
        icon: Eye
      },
      live: { 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        icon: CheckCircle
      },
      failed: { 
        color: 'bg-rose-100 text-rose-700 border-rose-200', 
        icon: AlertCircle
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${config.color}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'free':
        return { 
          icon: Gift, 
          color: 'text-emerald-600 bg-emerald-50',
          label: 'Free Subdomain',
          accent: 'border-emerald-200'
        };
      case 'purchased':
        return { 
          icon: Crown, 
          color: 'bg-blue-50',
          label: 'Premium Domain',
          accent: 'border-blue-200'
        };
      case 'custom':
        return { 
          icon: Zap, 
          color: 'text-orange-600 bg-orange-50',
          label: 'Custom Domain',
          accent: 'border-orange-200'
        };
      default:
        return { 
          icon: Globe, 
          color: 'text-slate-600 bg-slate-50',
          label: 'Domain',
          accent: 'border-slate-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{background: 'linear-gradient(to right, #3b82f6, #2563eb)'}}>
                <Globe className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Domain Manager</h1>
                <p className="text-slate-600 text-sm">Manage your websites and domains</p>
              </div>
            </div>
            
            <button 
              onClick={() => setActiveTab('search')}
              className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-sm font-medium"
              style={{background: 'linear-gradient(to right, #3b82f6, #2563eb)'}}
            >
              <Search size={16} />
              Search Domains
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Domains</p>
                <p className="text-2xl font-bold text-slate-900">{domains.length}</p>
              </div>
              <div className="p-2.5 rounded-lg" style={{background: '#3b82f620'}}>
                <Globe style={{color: '#3b82f6'}} size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Live Sites</p>
                <p className="text-2xl font-bold text-slate-900">
                  {domains.filter(d => d.status === 'live').length}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Premium</p>
                <p className="text-2xl font-bold text-slate-900">
                  {domains.filter(d => d.type === 'purchased').length}
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Crown className="text-amber-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.filter(o => o.status !== 'completed').length}
                </p>
              </div>
              <div className="p-2.5 bg-orange-50 rounded-lg">
                <Clock className="text-orange-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
          {[
            { key: 'domains', label: 'My Domains', count: domains.length },
            { key: 'orders', label: 'Orders', count: orders.length },
            { key: 'search', label: 'Search', count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={activeTab === tab.key ? {color: '#3b82f6'} : {}}
            >
              {tab.label} {tab.count !== null && tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'domains' && (
          <>
            {domains.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {domains.map((domain) => {
                  const typeConfig = getTypeConfig(domain.type);
                  const Icon = typeConfig.icon;
                  
                  return (
                    <div key={domain.id} className={`bg-white rounded-xl shadow-sm border-2 ${typeConfig.accent} hover:shadow-md transition-all`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg ${typeConfig.color}`} style={domain.type === 'purchased' ? {color: '#3b82f6'} : {}}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">{domain.domain_name}</h3>
                              <p className="text-slate-600 text-sm">{typeConfig.label}</p>
                            </div>
                          </div>
                        </div>

                        {/* Status and Technical Info Side by Side */}
                        <div className="flex items-center justify-between mb-4">
                          {getStatusBadge(domain.status)}
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Shield className={`${domain.ssl_enabled ? 'text-emerald-500' : 'text-slate-400'}`} size={14} />
                              <span className={`text-xs font-medium ${domain.ssl_enabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                                SSL
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Server className={`${domain.hosting_active ? 'text-emerald-500' : 'text-slate-400'}`} size={14} />
                              <span className={`text-xs font-medium ${domain.hosting_active ? 'text-emerald-700' : 'text-slate-500'}`}>
                                Host
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Wifi className={`${domain.dns_configured ? 'text-emerald-500' : 'text-slate-400'}`} size={14} />
                              <span className={`text-xs font-medium ${domain.dns_configured ? 'text-emerald-700' : 'text-slate-500'}`}>
                                DNS
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        {domain.type === 'purchased' && domain.purchase_price_inr && (
                          <div className="bg-slate-50 p-3 rounded-lg mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Purchase Price</span>
                              <span className="font-semibold text-slate-900">₹{domain.purchase_price_inr}</span>
                            </div>
                            {domain.renewal_price_inr && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-slate-600">Annual Renewal</span>
                                <span className="font-medium text-slate-700">₹{domain.renewal_price_inr}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {domain.status === 'live' && (
                            <button 
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm"
                              style={{background: 'linear-gradient(to right, #3b82f6, #2563eb)'}}
                              onClick={() => window.open(domain.website_url, '_blank')}
                            >
                              <ExternalLink size={14} />
                              Visit Site
                            </button>
                          )}
                          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm">
                            <Eye size={14} />
                            Preview
                          </button>
                          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm">
                            <Settings size={14} />
                            Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4" style={{background: '#3b82f620'}}>
                  <Globe style={{color: '#3b82f6'}} className="w-8 h-8 mx-auto mt-2" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No domains found</h3>
                <p className="text-slate-600 mb-4 max-w-md mx-auto">Get started by searching for your first domain name.</p>
                <button 
                  onClick={() => setActiveTab('search')}
                  className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-all font-medium"
                  style={{background: 'linear-gradient(to right, #3b82f6, #2563eb)'}}
                >
                  <Search size={16} />
                  Search Domains
                </button>
              </div>
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                          <Globe style={{color: '#3b82f6'}} size={18} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{order.domain_name}</h3>
                          <p className="text-sm text-slate-600">Order #{order.order_number}</p>
                          <p className="text-sm font-semibold text-slate-900">₹{order.total_amount_inr}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-xs text-slate-600 mt-1">{order.current_step.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress</span>
                        <span>{order.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${order.completion_percentage}%`,
                            background: 'linear-gradient(to right, #3b82f6, #2563eb)'
                          }}
                        ></div>
                      </div>
                    </div>

                    {order.error_message && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <p className="text-sm text-rose-700">{order.error_message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-orange-50 rounded-full w-16 h-16 mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mt-2" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
                <p className="text-slate-600 max-w-md mx-auto">Your domain purchase history will appear here.</p>
              </div>
            )}
          </>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{background: 'linear-gradient(to right, #3b82f6, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Search Domains
                </h2>
                <p className="text-slate-600 max-w-lg mx-auto">
                  Find and register the perfect domain name for your business
                </p>
              </div>
              
              <div className="flex gap-3 max-w-lg mx-auto">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium placeholder-slate-400"
                  onKeyPress={(e) => e.key === 'Enter' && searchDomains()}
                />
                <button
                  onClick={searchDomains}
                  disabled={searchLoading}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
                  style={{background: 'linear-gradient(to right, #3b82f6, #2563eb)'}}
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Search size={16} />
                  )}
                  Search
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg max-w-lg mx-auto">
                  <p className="text-sm text-rose-700 text-center">{error}</p>
                </div>
              )}
            </div>

            {/* Search Results */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Domains</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-xl p-4 transition-all ${
                        suggestion.is_available 
                          ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300' 
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">{suggestion.suggested_domain}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          suggestion.is_available 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {suggestion.is_available ? 'Available' : 'Taken'}
                        </span>
                      </div>
                      
                      {suggestion.is_available && (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-600">.{suggestion.tld}</span>
                            <span className="text-lg font-bold text-slate-900">₹{suggestion.price_inr}</span>
                          </div>
                          
                          <button className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 font-medium text-sm">
                            <Plus size={14} />
                            Purchase
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainPage;