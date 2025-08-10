// src/components/RegisteVendor/ProfessionalSuccessModal.tsx
/**
 * Professional Success Modal - Clean, Business-Focused Design
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Registration Complete
              </h2>
              <p className="text-slate-300 text-sm">
                Your ShopInStreet account is now active
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          
          {/* Business Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Account Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Business Name</span>
                <span className="text-sm font-medium text-gray-900">{businessName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vendor ID</span>
                <span className="text-sm font-medium text-gray-900">#{vendorId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Verification Pending
                </span>
              </div>
            </div>
          </div>

          {/* Website Information */}
          {websiteInfo && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Your Digital Storefront
              </h3>
              
              {websiteInfo.website_url ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono text-sm">
                        {websiteInfo.website_url}
                      </div>
                      <button
                        onClick={handleCopyUrl}
                        className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Status</span>
                      <span className="text-sm text-gray-900">{websiteInfo.status}</span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Setup Progress</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${websiteInfo.readiness_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{websiteInfo.readiness_score}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleViewWebsite}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Preview Website
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Configuring your digital storefront</p>
                  <p className="text-xs text-gray-500 mt-1">This process typically takes 30-60 seconds</p>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          {websiteInfo?.next_steps && websiteInfo.next_steps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Recommended Actions
              </h3>
              <div className="space-y-2">
                {websiteInfo.next_steps.slice(0, 4).map((step, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Important</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Account verification is required to activate payment processing and go live. 
                  Please check your email for verification instructions.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-4 flex flex-col space-y-2">
          <button
            onClick={handleAccessDashboard}
            className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            Access Dashboard
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            Close
          </button>
        </div>

        {/* Footer Note */}
        <div className="px-8 py-3 bg-gray-100 border-t">
          <p className="text-xs text-gray-500 text-center">
            Need assistance? Contact our support team at support@shopinstreet.com
          </p>
        </div>

      </div>
    </div>
  );
};

