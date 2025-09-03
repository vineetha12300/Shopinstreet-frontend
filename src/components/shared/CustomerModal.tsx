import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CustomerModalProps } from '../cashier/types/cashier.types';

const CustomerModal: React.FC<CustomerModalProps> = ({
  show,
  customer,
  onClose,
  onUpdateCustomer
}) => {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || ''
  });

  const handleSave = () => {
    onUpdateCustomer(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Customer Information</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none font-medium transition-all"
              placeholder="Customer name"
              style={{ minHeight: '44px' }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none font-medium transition-all"
              placeholder="Phone number"
              style={{ minHeight: '44px' }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] focus:outline-none font-medium transition-all"
              placeholder="Email address"
              style={{ minHeight: '44px' }}
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-all"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-4 bg-gradient-to-r from-[#1DA1F2] to-[#0EA5E9] text-white rounded-xl hover:shadow-lg font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ minHeight: '44px' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;