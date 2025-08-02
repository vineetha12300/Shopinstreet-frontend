// src/components/settings/SettingsPage.tsx
// Mobile-first, compact Twitter/X styled Settings page

import React, { useState, useEffect } from 'react';
import { Building2, Bell, CreditCard, Users, Save, Eye, EyeOff, CheckCircle, ChevronRight } from 'lucide-react';
import PageHeader from '../layout/PageHeader';
import FloatingInput from '../ReUsebleComponents/FloatingInput';
import axios from 'axios';

interface BusinessProfileData {
  // Basic Business Information
  business_name: string;
  business_type: string;
  business_category: string;
  business_description: string;
  
  // Contact Information
  owner_name: string;
  email: string;
  phone: string;
  alternate_email: string;
  alternate_phone: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  
  // Tax & Legal Information
  gst_number: string;
  hst_pst_number: string;
  pan_card: string;
  business_registration_number: string;
  tax_exemption_status: boolean;
  
  // Banking Information
  bank_name: string;
  account_number: string;
  routing_code: string;
  account_holder_name: string;
  
  // Optional Information
  website_url: string;
  linkedin_url: string;
  
  // Business Operations
  timezone: string;
  currency: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  low_stock_alerts: boolean;
  marketing_emails: boolean;
  weekly_reports: boolean;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [isLoading, setIsLoading] = useState(false);
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [businessData, setBusinessData] = useState<BusinessProfileData>({
    business_name: '',
    business_type: '',
    business_category: '',
    business_description: '',
    owner_name: '',
    email: '',
    phone: '',
    alternate_email: '',
    alternate_phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    gst_number: '',
    hst_pst_number: '',
    pan_card: '',
    business_registration_number: '',
    tax_exemption_status: false,
    bank_name: '',
    account_number: '',
    routing_code: '',
    account_holder_name: '',
    website_url: '',
    linkedin_url: '',
    timezone: 'UTC',
    currency: 'USD'
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    order_updates: true,
    low_stock_alerts: true,
    marketing_emails: false,
    weekly_reports: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // API configuration
  const API_URL = 'http://localhost:8000/api';
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/business-profile/`, {
        headers: getAuthHeaders()
      });
      
      if (response.data) {
        setBusinessData(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Failed to load business profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setBusinessData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveBusinessProfile = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      await axios.put(`${API_URL}/business-profile/`, businessData, {
        headers: getAuthHeaders()
      });
      
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error: any) {
      console.error('Failed to save:', error);
      setSaveMessage('Save failed. Try again.');
      setTimeout(() => setSaveMessage(''), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBankingInfo = async () => {
    setIsLoading(true);
    
    try {
      const bankingData = {
        bank_name: businessData.bank_name,
        account_number: businessData.account_number,
        routing_code: businessData.routing_code,
        account_holder_name: businessData.account_holder_name
      };
      
      await axios.put(`${API_URL}/business-profile/banking`, bankingData, {
        headers: getAuthHeaders()
      });
      
      setSaveMessage('Banking info saved securely!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('Failed to save banking info:', error);
      setSaveMessage('Save failed. Try again.');
      setTimeout(() => setSaveMessage(''), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile-friendly tabs
  const tabs = [
    { id: 'business', label: 'Business', icon: <Building2 size={16} /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell size={16} /> },
    { id: 'banking', label: 'Banking', icon: <CreditCard size={16} /> },
    { id: 'team', label: 'Team', icon: <Users size={16} /> }
  ];

  const renderBusinessProfile = () => (
    <div className="space-y-4">
      {/* Basic Info Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-[#1DA1F2]" />
          Basic Information
        </h3>
        
        <div className="space-y-4">
          <FloatingInput
            label="Business Name"
            name="business_name"
            value={businessData.business_name}
            onChange={handleInputChange}
            error={errors.business_name}
          />
          
          <FloatingInput
            label="Owner Name"
            name="owner_name"
            value={businessData.owner_name}
            onChange={handleInputChange}
            error={errors.owner_name}
          />

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Email"
              name="email"
              type="email"
              value={businessData.email}
              onChange={handleInputChange}
              error={errors.email}
            />

            <FloatingInput
              label="Phone"
              name="phone"
              value={businessData.phone}
              onChange={handleInputChange}
              error={errors.phone}
            />
          </div>

          <div className="relative w-full mt-6">
            <select
              name="business_type"
              value={businessData.business_type}
              onChange={handleInputChange}
              className="peer w-full border-b-2 bg-transparent pt-6 pb-2 text-sm focus:outline-none border-gray-300 focus:border-[#1DA1F2]"
            >
              <option value="">Select Type</option>
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="private_limited">Private Limited</option>
              <option value="corporation">Corporation</option>
            </select>
            <label className="absolute left-0 top-1 text-gray-500 text-sm transition-all duration-200 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#1DA1F2] pointer-events-none">
              Business Type
            </label>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-800 mb-4">Address</h4>
        
        <div className="space-y-4">
          <FloatingInput
            label="Address"
            name="address"
            value={businessData.address}
            onChange={handleInputChange}
            error={errors.address}
          />

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="City"
              name="city"
              value={businessData.city}
              onChange={handleInputChange}
              error={errors.city}
            />

            <FloatingInput
              label="State"
              name="state"
              value={businessData.state}
              onChange={handleInputChange}
              error={errors.state}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Pin/Postal Code"
              name="pincode"
              value={businessData.pincode}
              onChange={handleInputChange}
              error={errors.pincode}
            />

            <div className="relative w-full mt-6">
              <select
                name="country"
                value={businessData.country}
                onChange={handleInputChange}
                className="peer w-full border-b-2 bg-transparent pt-6 pb-2 text-sm focus:outline-none border-gray-300 focus:border-[#1DA1F2]"
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
              </select>
              <label className="absolute left-0 top-1 text-gray-500 text-sm transition-all duration-200 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#1DA1F2] pointer-events-none">
                Country
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Info Section */}
      {(businessData.country === 'India' || businessData.country === 'Canada') && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-4">Tax Information</h4>
          
          <div className="space-y-4">
            {businessData.country === 'India' && (
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="GST Number"
                  name="gst_number"
                  value={businessData.gst_number}
                  onChange={handleInputChange}
                  error={errors.gst_number}
                />
                <FloatingInput
                  label="PAN Card"
                  name="pan_card"
                  value={businessData.pan_card || ''}
                  onChange={handleInputChange}
                  error={errors.pan_card}
                />
              </div>
            )}

            {businessData.country === 'Canada' && (
              <FloatingInput
                label="HST/PST Number"
                name="hst_pst_number"
                value={businessData.hst_pst_number}
                onChange={handleInputChange}
                error={errors.hst_pst_number}
              />
            )}
          </div>
        </div>
      )}

      {/* Optional Info */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-800 mb-4">Additional Information</h4>
        
        <div className="space-y-4">
          <FloatingInput
            label="Website URL"
            name="website_url"
            value={businessData.website_url}
            onChange={handleInputChange}
            error={errors.website_url}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              name="business_description"
              value={businessData.business_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DA1F2] focus:border-transparent text-sm"
              placeholder="Describe your business..."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
        <button
          onClick={saveBusinessProfile}
          disabled={isLoading}
          className="w-full bg-[#1DA1F2] text-white py-3 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Save size={16} />
          {isLoading ? 'Saving...' : 'Save Business Profile'}
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-[#1DA1F2]" />
          Notification Settings
        </h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Get notified about {key.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange(key as keyof NotificationSettings)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-[#1DA1F2]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBanking = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-sm text-yellow-800">
          🔒 Banking info is encrypted and secure
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-[#1DA1F2]" />
          Banking Details
        </h3>
        
        <div className="space-y-4">
          <FloatingInput
            label="Bank Name"
            name="bank_name"
            value={businessData.bank_name}
            onChange={handleInputChange}
            error={errors.bank_name}
          />

          <FloatingInput
            label="Account Holder Name"
            name="account_holder_name"
            value={businessData.account_holder_name}
            onChange={handleInputChange}
            error={errors.account_holder_name}
          />

          <div className="relative">
            <FloatingInput
              label="Account Number"
              name="account_number"
              type={showBankingDetails ? "text" : "password"}
              value={businessData.account_number}
              onChange={handleInputChange}
              error={errors.account_number}
            />
            <button
              type="button"
              onClick={() => setShowBankingDetails(!showBankingDetails)}
              className="absolute right-3 top-6 text-gray-400 hover:text-[#1DA1F2]"
            >
              {showBankingDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <FloatingInput
            label={businessData.country === 'India' ? 'IFSC Code' : 'Routing Number'}
            name="routing_code"
            type={showBankingDetails ? "text" : "password"}
            value={businessData.routing_code}
            onChange={handleInputChange}
            error={errors.routing_code}
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
        <button
          onClick={saveBankingInfo}
          disabled={isLoading}
          className="w-full bg-[#1DA1F2] text-white py-3 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Save size={16} />
          {isLoading ? 'Saving...' : 'Save Banking Info'}
        </button>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <Users size={48} className="mx-auto text-[#1DA1F2] mb-4" />
      <h4 className="font-medium text-gray-900 mb-2">Team Management</h4>
      <p className="text-sm text-gray-600 mb-4">
        Invite team members and manage permissions.
      </p>
      <button className="text-[#1DA1F2] text-sm font-medium flex items-center justify-center gap-1 mx-auto">
        Coming Soon <ChevronRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Settings">
        {saveMessage && (
          <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            <CheckCircle size={12} />
            {saveMessage}
          </div>
        )}
      </PageHeader>

      {/* Mobile-friendly tab navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1DA1F2] text-[#1DA1F2]'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 pb-20">
        {activeTab === 'business' && renderBusinessProfile()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'banking' && renderBanking()}
        {activeTab === 'team' && renderTeam()}
      </div>
    </div>
  );
};

export default SettingsPage;