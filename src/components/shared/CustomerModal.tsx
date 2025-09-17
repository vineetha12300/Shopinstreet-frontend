import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CustomerModalProps } from '../cashier/types/cashier.types';

const CustomerModal: React.FC<CustomerModalProps> = ({
  show,
  customer,
  onClose,
  onUpdateCustomer
}) => {
  const [activeTab, setActiveTab] = useState('Contact');
  const [formData, setFormData] = useState({
    firstName: customer.name?.split(' ')[0] || '',
    lastName: customer.name?.split(' ').slice(1).join(' ') || '',
    phone: customer.phone || '',
    email: customer.email || '',
    customerGroup: 'All Customers',
    optIn: false,
    // Details tab fields
    customerType: 'Individual',
    preferredPayment: 'Card',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    taxId: '',
    creditLimit: '',
    shoppingPreference: 'In-store',
    language: 'English',
    birthday: '',
    referralSource: 'Walk-in',
    taxExempt: false,
    loyaltyMember: false,
    notes: ''
  });

  const handleSave = () => {
    // Combine first and last name back to single name for your existing interface
    const updatedData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      email: formData.email
    };
    onUpdateCustomer(updatedData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add customer</h2>
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors p-2 rounded-md"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className=" border-gray-200">
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200 px-4 sm:px-6">
            <button 
              onClick={() => setActiveTab('Contact')}
              className={`flex-1 sm:flex-none sm:px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === 'Contact' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contact
            </button>
            <button 
              onClick={() => setActiveTab('Details')}
              className={`flex-1 sm:flex-none sm:px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === 'Details' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Details
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {activeTab === 'Contact' && (
            <>
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Email and Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact number
                  </label>
                  <div className="flex">
                    <div className="relative">
                      <select className="appearance-none bg-white border border-gray-300 rounded-l-md px-2 sm:px-3 py-2.5 sm:py-2 pr-6 sm:pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm">
                        <option>Mobile</option>
                      </select>
                      <ChevronDown className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="flex-1 px-3 py-2.5 sm:py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer group
                </label>
                <div className="relative">
                  <select 
                    value={formData.customerGroup}
                    onChange={(e) => handleChange('customerGroup', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  >
                    <option>All Customers</option>
                    <option>VIP Customers</option>
                    <option>Regular Customers</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              {/* Opt-in Toggle */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-700 flex-1">
                  Opt-in to marketing and promotional emails
                </span>
                <button
                  onClick={() => handleChange('optIn', !formData.optIn)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    formData.optIn ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.optIn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Add an email address to this profile so you can send your customer digital receipts and promotional emails.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Details' && (
            <>
              {/* Customer Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer type
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.customerType}
                      onChange={(e) => handleChange('customerType', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                    >
                      <option>Individual</option>
                      <option>Business</option>
                      <option>VIP</option>
                      <option>Wholesale</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred payment
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.preferredPayment}
                      onChange={(e) => handleChange('preferredPayment', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                    >
                      <option>Card</option>
                      <option>Cash</option>
                      <option>Mobile Pay</option>
                      <option>Store Credit</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm mb-2"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Tax identification number"
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit limit ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.creditLimit}
                    onChange={(e) => handleChange('creditLimit', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shopping preference
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.shoppingPreference}
                      onChange={(e) => handleChange('shoppingPreference', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                    >
                      <option>In-store</option>
                      <option>Online</option>
                      <option>Curbside pickup</option>
                      <option>Delivery</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language preference
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              {/* Special Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birthday (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleChange('birthday', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did they find us?
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.referralSource}
                      onChange={(e) => handleChange('referralSource', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                    >
                      <option>Walk-in</option>
                      <option>Social Media</option>
                      <option>Friend Referral</option>
                      <option>Google Search</option>
                      <option>Advertisement</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    Tax exempt status
                  </span>
                  <button
                    onClick={() => handleChange('taxExempt', !formData.taxExempt)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      formData.taxExempt ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.taxExempt ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    Loyalty program member
                  </span>
                  <button
                    onClick={() => handleChange('loyaltyMember', !formData.loyaltyMember)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      formData.loyaltyMember ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.loyaltyMember ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Additional notes about the customer..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 sm:pb-6">
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 sm:py-3 px-4 rounded-md transition-colors text-base sm:text-sm"
          >
            Create new customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;