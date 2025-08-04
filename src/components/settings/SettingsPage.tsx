// src/components/settings/SettingsPage.tsx
// FIXED: Input focus issue - Professional Settings Page

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, 
  Bell, 
  CreditCard, 
  Users, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ChevronRight, 
  Shield,
  Globe,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  Settings as SettingsIcon,
  Edit3
} from 'lucide-react';
import PageHeader from '../layout/PageHeader';
import FloatingInput from '../ReUsebleComponents/FloatingInput';
import axios from 'axios';

interface VendorProfile {
  business_name: string;
  business_category: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  website_url: string;
  linkedin_url: string;
  business_description: string;
  timezone: string;
  currency: string;
  business_hours: string;
  bank_name: string;
  account_number: string;
  routing_code: string;
  account_holder_name: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  order_updates: boolean;
  low_stock_alerts: boolean;
  marketing_emails: boolean;
  weekly_reports: boolean;
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<VendorProfile>({
    business_name: '',
    business_category: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'Canada',
    website_url: '',
    linkedin_url: '',
    business_description: '',
    timezone: 'America/Toronto',
    currency: 'CAD',
    business_hours: '9:00 AM - 6:00 PM',
    bank_name: '',
    account_number: '',
    routing_code: '',
    account_holder_name: ''
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
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

  // FIXED: Memoized handlers to prevent re-renders and focus loss
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setProfile(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: '' 
      }));
    }
  }, [errors]);

  const handleNotificationToggle = useCallback((key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/vendor/profile`, {
        headers: getAuthHeaders()
      });
      
      if (response.data) {
        setProfile(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/vendor/notifications`, {
        headers: getAuthHeaders()
      });
      
      if (response.data) {
        setNotifications(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const saveProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/vendor/profile`, profile, {
        headers: getAuthHeaders()
      });
      
      showSuccessMessage('Profile updated successfully!');
      setEditMode(null);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [profile, showSuccessMessage]);

  const saveBankingInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const bankingData = {
        bank_name: profile.bank_name,
        account_number: profile.account_number,
        routing_code: profile.routing_code,
        account_holder_name: profile.account_holder_name
      };
      
      await axios.put(`${API_URL}/vendor/banking`, bankingData, {
        headers: getAuthHeaders()
      });
      
      showSuccessMessage('Banking information saved securely!');
      setEditMode(null);
    } catch (error: any) {
      console.error('Failed to save banking info:', error);
      let errorMessage = 'Failed to save banking information.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [profile.bank_name, profile.account_number, profile.routing_code, profile.account_holder_name, showSuccessMessage]);

  const saveNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/vendor/notifications`, notifications, {
        headers: getAuthHeaders()
      });
      
      showSuccessMessage('Notification preferences saved!');
    } catch (error: any) {
      console.error('Failed to save notifications:', error);
      let errorMessage = 'Failed to save notification preferences.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [notifications, showSuccessMessage]);

  // FIXED: Memoized constants to prevent re-renders
  const sidebarItems = useMemo(() => [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'banking', label: 'Banking & Payments', icon: CreditCard },
    { id: 'team', label: 'Team Management', icon: Users }
  ], []);

  const businessCategories = useMemo(() => [
    'Retail', 'Wholesale', 'Manufacturing', 'Services', 'Technology',
    'Food & Beverage', 'Healthcare', 'Education', 'Real Estate', 'Other'
  ], []);

  const countries = useMemo(() => [
    { value: 'Canada', label: 'Canada' },
    { value: 'USA', label: 'United States' },
    { value: 'India', label: 'India' }
  ], []);

  const getNotificationDescription = useCallback((key: string): string => {
    const descriptions: Record<string, string> = {
      email_notifications: 'Receive email notifications for important updates',
      order_updates: 'Get notified when order status changes',
      low_stock_alerts: 'Alert when product inventory runs low',
      marketing_emails: 'Receive promotional content and feature updates',
      weekly_reports: 'Get weekly summary of your business performance'
    };
    return descriptions[key] || '';
  }, []);

  // FIXED: Memoized sections to prevent unnecessary re-renders
  const ProfileSection = useMemo(() => (
    <div className="space-y-6">
      {/* Basic Business Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DA1F2] rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Business Information</h3>
                <p className="text-sm text-gray-500">Core business details from registration</p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(editMode === 'business' ? null : 'business')}
              className="p-2 text-gray-400 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {editMode === 'business' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Business Name"
                  name="business_name"
                  value={profile.business_name}
                  onChange={handleInputChange}
                  error={errors.business_name}
                />
                
                <div className="relative">
                  <select
                    name="business_category"
                    value={profile.business_category}
                    onChange={handleInputChange}
                    className="peer w-full border-b-2 border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-[#1DA1F2]"
                  >
                    <option value="">Select Category</option>
                    {businessCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <label className="absolute left-0 top-4 text-sm text-gray-500 transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#1DA1F2] peer-valid:top-1 peer-valid:text-xs">
                    Business Category
                  </label>
                </div>
              </div>

              <div className="relative">
                <textarea
                  name="business_description"
                  value={profile.business_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="peer w-full border-b-2 border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-[#1DA1F2] resize-none"
                  placeholder=""
                />
                <label className="absolute left-0 top-4 text-sm text-gray-500 transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#1DA1F2] peer-valid:top-1 peer-valid:text-xs">
                  Business Description
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveProfile}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditMode(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Business Name</label>
                <p className="font-medium text-gray-900">{profile.business_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <p className="font-medium text-gray-900">{profile.business_category || 'Not set'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500">Description</label>
                <p className="font-medium text-gray-900">{profile.business_description || 'No description provided'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                <p className="text-sm text-gray-500">Owner and business contact details</p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(editMode === 'contact' ? null : 'contact')}
              className="p-2 text-gray-400 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {editMode === 'contact' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Owner Name"
                  name="owner_name"
                  value={profile.owner_name}
                  onChange={handleInputChange}
                  error={errors.owner_name}
                />
                
                <FloatingInput
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                />

                <FloatingInput
                  label="Website URL (Optional)"
                  name="website_url"
                  type="url"
                  value={profile.website_url}
                  onChange={handleInputChange}
                  error={errors.website_url}
                />
              </div>

              <FloatingInput
                label="LinkedIn URL (Optional)"
                name="linkedin_url"
                type="url"
                value={profile.linkedin_url}
                onChange={handleInputChange}
                error={errors.linkedin_url}
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveProfile}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditMode(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Owner Name</label>
                <p className="font-medium text-gray-900">{profile.owner_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {profile.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  {profile.phone}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Website</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Globe size={16} className="text-gray-400" />
                  {profile.website_url || 'Not provided'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500">LinkedIn</label>
                <p className="font-medium text-gray-900">
                  {profile.linkedin_url || 'Not provided'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <MapPin size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Business Address</h3>
                <p className="text-sm text-gray-500">Registered business location</p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(editMode === 'address' ? null : 'address')}
              className="p-2 text-gray-400 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {editMode === 'address' ? (
            <>
              <FloatingInput
                label="Business Address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                error={errors.address}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="City"
                  name="city"
                  value={profile.city}
                  onChange={handleInputChange}
                  error={errors.city}
                />

                <FloatingInput
                  label="State/Province"
                  name="state"
                  value={profile.state}
                  onChange={handleInputChange}
                  error={errors.state}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Postal Code"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleInputChange}
                  error={errors.pincode}
                />

                <div className="relative">
                  <select
                    name="country"
                    value={profile.country}
                    onChange={handleInputChange}
                    className="peer w-full border-b-2 border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-[#1DA1F2]"
                  >
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>{country.label}</option>
                    ))}
                  </select>
                  <label className="absolute left-0 top-4 text-sm text-gray-500 transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#1DA1F2] peer-valid:top-1 peer-valid:text-xs">
                    Country
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveProfile}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditMode(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{profile.address}</p>
              <p className="text-gray-600">
                {profile.city}, {profile.state} {profile.pincode}
              </p>
              <p className="text-gray-600">{profile.country}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  ), [profile, editMode, errors, isLoading, handleInputChange, saveProfile, businessCategories, countries]);

  const NotificationsSection = useMemo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500">Manage how you receive updates</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div>
              <p className="font-medium text-gray-900 capitalize">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-sm text-gray-500">
                {getNotificationDescription(key)}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleNotificationToggle(key as keyof NotificationSettings)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DA1F2]"></div>
            </label>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={saveNotifications}
            disabled={isLoading}
            className="w-full bg-[#1DA1F2] text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Save size={16} />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  ), [notifications, isLoading, handleNotificationToggle, saveNotifications, getNotificationDescription]);

  const BankingSection = useMemo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Banking Information</h3>
              <p className="text-sm text-gray-500">Secure payment details</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Shield size={16} />
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {editMode === 'banking' ? (
          <>
            <FloatingInput
              label="Bank Name"
              name="bank_name"
              value={profile.bank_name}
              onChange={handleInputChange}
              error={errors.bank_name}
            />

            <FloatingInput
              label="Account Holder Name"
              name="account_holder_name"
              value={profile.account_holder_name}
              onChange={handleInputChange}
              error={errors.account_holder_name}
            />

            <div className="relative">
              <FloatingInput
                label="Account Number"
                name="account_number"
                type={showBankingDetails ? "text" : "password"}
                value={profile.account_number}
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
              label={profile.country === 'India' ? 'IFSC Code' : 'Routing Number'}
              name="routing_code"
              type={showBankingDetails ? "text" : "password"}
              value={profile.routing_code}
              onChange={handleInputChange}
              error={errors.routing_code}
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveBankingInfo}
                disabled={isLoading}
                className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Banking Info'}
              </button>
              <button
                onClick={() => setEditMode(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Bank Name</label>
                <p className="font-medium text-gray-900">{profile.bank_name || 'Not configured'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Holder</label>
                <p className="font-medium text-gray-900">{profile.account_holder_name || 'Not configured'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Number</label>
                <p className="font-medium text-gray-900">
                  {profile.account_number ? '••••••••••••' + profile.account_number.slice(-4) : 'Not configured'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  {profile.country === 'India' ? 'IFSC Code' : 'Routing Number'}
                </label>
                <p className="font-medium text-gray-900">
                  {profile.routing_code ? '••••••••' + profile.routing_code.slice(-4) : 'Not configured'}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => setEditMode('banking')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Edit3 size={16} />
                {profile.bank_name ? 'Update Banking Info' : 'Add Banking Info'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  ), [profile, editMode, showBankingDetails, errors, isLoading, handleInputChange, saveBankingInfo]);

  const TeamSection = useMemo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Team Management</h3>
            <p className="text-sm text-gray-500">Invite and manage team members</p>
          </div>
        </div>
      </div>

      <div className="p-12 text-center">
        <Users size={48} className="mx-auto text-gray-300 mb-4" />
        <h4 className="font-medium text-gray-900 mb-2">Team Management</h4>
        <p className="text-sm text-gray-500 mb-6">
          Invite team members, assign roles, and manage permissions for your business.
        </p>
        <div className="inline-flex items-center gap-2 text-[#1DA1F2] text-sm font-medium">
          Coming Soon <ChevronRight size={16} />
        </div>
      </div>
    </div>
  ), []);

  const renderContent = useCallback(() => {
    switch (activeSection) {
      case 'profile':
        return ProfileSection;
      case 'notifications':
        return NotificationsSection;
      case 'banking':
        return BankingSection;
      case 'team':
        return TeamSection;
      default:
        return ProfileSection;
    }
  }, [activeSection, ProfileSection, NotificationsSection, BankingSection, TeamSection]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Settings">
        {showSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}
      </PageHeader>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1DA1F2] rounded-lg flex items-center justify-center">
                    <SettingsIcon size={16} className="text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">Settings</h2>
                </div>
              </div>
              
              <nav className="p-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#1DA1F2] text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          {errors.general}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;