// src/components/domain/PurchaseModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Shield, 
  Zap, 
  Clock, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';

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

interface PurchaseModalProps {
  domain: DomainSuggestion;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (domain: string, contactInfo: ContactInfo) => Promise<void>;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  domain,
  isOpen,
  onClose,
  onPurchase
}) => {
  const [step, setStep] = useState(1); // 1: Review, 2: Contact Info, 3: Payment, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    cardholder_name: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateContactInfo = () => {
    const required = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'postal_code'];
    const missing = required.filter(field => !contactInfo[field as keyof ContactInfo].trim());
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ').replace(/_/g, ' ')}`);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 2 && !validateContactInfo()) {
      return;
    }
    setStep(step + 1);
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      await onPurchase(domain.suggested_domain, contactInfo);
      setStep(4); // Success step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setError(null);
    setContactInfo({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      organization: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    });
    setPaymentInfo({
      card_number: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
      cardholder_name: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Purchase Domain</h2>
              <p className="text-sm text-slate-600">{domain.suggested_domain}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Review' },
              { num: 2, label: 'Contact Info' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Complete' }
            ].map((stepItem, index) => (
              <div key={stepItem.num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepItem.num 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > stepItem.num ? <Check className="w-4 h-4" /> : stepItem.num}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepItem.num ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {stepItem.label}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    step > stepItem.num ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Review */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  {domain.suggested_domain}
                </h3>
                <p className="text-slate-600">Perfect domain for your business</p>
              </div>

              {/* Pricing */}
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-slate-900">Domain Registration</span>
                  <span className="text-2xl font-bold text-slate-900">${domain.registration_price}</span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Registration (1 year)</span>
                    <span>${domain.registration_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renewal price</span>
                    <span>${domain.renewal_price}/year</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${domain.registration_price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">What's included:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-700">Free SSL Certificate</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-700">Instant Setup</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-slate-700">Professional Hosting</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Information</h3>
                <p className="text-slate-600">This information is required for domain registration</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactInfo.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={contactInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Country *
                </label>
                <select
                  value={contactInfo.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment (Simulated) */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Information</h3>
                <p className="text-slate-600">Secure payment processing</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payment</h4>
                  <p className="text-blue-700 text-sm">Your payment information is encrypted and secure</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.cardholder_name}
                    onChange={(e) => handlePaymentChange('cardholder_name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.card_number}
                    onChange={(e) => handlePaymentChange('card_number', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Month
                    </label>
                    <select
                      value={paymentInfo.expiry_month}
                      onChange={(e) => handlePaymentChange('expiry_month', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Year
                    </label>
                    <select
                      value={paymentInfo.expiry_year}
                      onChange={(e) => handlePaymentChange('expiry_year', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={2024 + i}>
                          {2024 + i}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      value={paymentInfo.cvv}
                      onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{domain.suggested_domain} (1 year)</span>
                    <span className="text-slate-900">${domain.registration_price}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-900">Total</span>
                      <span className="text-slate-900">${domain.registration_price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Purchase Domain
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  Domain Purchased Successfully!
                </h3>
                <p className="text-slate-600">
                  Your domain <strong>{domain.suggested_domain}</strong> has been registered
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                <div className="text-green-800 text-sm space-y-1">
                  <p>✅ Domain registration confirmed</p>
                  <p>✅ SSL certificate being issued</p>
                  <p>✅ Hosting environment being set up</p>
                  <p>⏳ Your website will be live within 5-10 minutes</p>
                </div>
              </div>

              <div className="text-sm text-slate-600">
                <p>We've sent confirmation and setup details to <strong>{contactInfo.email}</strong></p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;