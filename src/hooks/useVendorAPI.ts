// src/hooks/useVendorAPI.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface VendorProfile {
  id: number;
  email: string;
  business_name: string;
  business_category: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  owner_name: string;
  phone: string;
  website_url?: string;
  linkedin_url?: string;
  business_logo?: string;
  is_verified: boolean;
  created_at: string;
}

export const useVendorAPI = () => {
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      console.log('[VendorAPI] Fetching vendor profile...');
      
      const response = await axios.get<VendorProfile>('http://localhost:8000/api/vendor/profile', {
        headers: getAuthHeaders()
      });
      
      console.log('[VendorAPI] Vendor profile received:', response.data);
      setVendorProfile(response.data);
      setError(null);
    } catch (err: any) {
      console.error('[VendorAPI] Failed to fetch vendor profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  return {
    vendorProfile,
    loading,
    error,
    fetchVendorProfile
  };
};