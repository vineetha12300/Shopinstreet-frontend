// src/components/RegisteVendor/ProfessionalSuccessModal.tsx
/**
 * Professional Success Modal - Mobile-Friendly with Scrolling Support
 */

import React, { useState, useEffect } from 'react';

interface WebsiteInfo {
  subdomain: string | null;
  website_url: string | null;
  status: string;
  readiness_score: number;
  next_steps: string[];
}

interface ProfessionalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteInfo?: WebsiteInfo;
  vendorId?: number;
  businessName?: string;
}

export const ProfessionalSuccessModal: React.FC<ProfessionalSuccessModalProps> = ({
  isOpen,
  onClose,
  websiteInfo,
  vendorId,
  businessName
}) => {
  const [copied, setCopied] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    if (websiteInfo?.website_url) {
      try {
        await navigator.clipboard.writeText(websiteInfo.website_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL');
      }
    }
  };

  const handleAccessDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleViewWebsite = () => {
    if (websiteInfo?.website_url) {
      window.open(websiteInfo.website_url, '_blank');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      {/* Modal Container with proper sizing and scrolling */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                  Registration Complete
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm truncate">
                  Your ShopInStreet account is now active
                </p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="ml-3 text-slate-300 hover:text-white transition-colors p-1 flex-shrink-0"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
          
          {/* Business Overview */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
              Account Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Business Name</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate ml-2">{businessName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Vendor ID</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">#{vendorId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Account Status</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Verification Pending
                </span>
              </div>
            </div>
          </div>

          {/* Website Information */}
          {websiteInfo && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                Your Digital Storefront
              </h3>
              
              {websiteInfo.website_url ? (
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Website Address
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono text-xs sm:text-sm break-all">
                        {websiteInfo.website_url}
                      </div>
                      <button
                        onClick={handleCopyUrl}
                        className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="block text-xs sm:text-sm font-medium text-gray-700">Status</span>
                      <span className="text-xs sm:text-sm text-gray-900 capitalize">{websiteInfo.status}</span>
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-medium text-gray-700">Setup Progress</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${websiteInfo.readiness_score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{websiteInfo.readiness_score}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleViewWebsite}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                  >
                    Preview Website
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-xs sm:text-sm text-gray-600">Configuring your digital storefront</p>
                  <p className="text-xs text-gray-500 mt-1">This process typically takes 30-60 seconds</p>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          {websiteInfo?.next_steps && websiteInfo.next_steps.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {websiteInfo.next_steps.slice(0, 4).map((step, index) => (
                  <div key={index} className="flex items-start space-x-3 text-xs sm:text-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-xs sm:text-sm font-medium text-blue-800">Important</h4>
                <p className="text-xs sm:text-sm text-blue-700 mt-1 leading-relaxed">
                  Account verification is required to activate payment processing and go live. 
                  Please check your email for verification instructions.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile spacing for footer */}
          <div className="h-2 sm:hidden"></div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col space-y-2 border-t flex-shrink-0">
          <button
            onClick={handleAccessDashboard}
            className="w-full bg-slate-800 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-slate-700 transition-colors text-sm sm:text-base"
          >
            Access Dashboard
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white text-gray-700 py-2 sm:py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
          >
            Close
          </button>
        </div>

        {/* Footer Note */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-gray-100 border-t flex-shrink-0">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Need assistance? Contact our support team at{' '}
            <a href="mailto:support@shopinstreet.com" className="text-blue-600 hover:text-blue-800">
              support@shopinstreet.com
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};