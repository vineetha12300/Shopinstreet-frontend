// ShippingLabelModal.tsx - Modal for shipping label preview and actions
import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Order, OrderAddress } from './types';

interface ShippingLabelModalProps {
  order: Order;
  vendorAddress: OrderAddress;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ 
  order, 
  vendorAddress, 
  onClose, 
  onPrint, 
  onDownload 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Shipping Label</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {/* Label Preview */}
        <div className="border-2 border-gray-800 p-4 my-4 bg-white">
          <div className="border-b-2 border-gray-800 pb-4 mb-4 flex justify-between">
            <div>
              <h4 className="font-bold text-lg">ShopInStreet</h4>
              <p className="text-sm">Order #{order.id}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">SHIP TO:</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* From (Vendor) */}
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 mb-1">FROM:</p>
              <p className="font-bold">{vendorAddress.name}</p>
              <p>{vendorAddress.street}</p>
              <p>{vendorAddress.city}, {vendorAddress.state} {vendorAddress.postalCode}</p>
              <p>{vendorAddress.country}</p>
              <p>Phone: {vendorAddress.phone}</p>
            </div>
            
            {/* To (Customer) */}
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 mb-1">TO:</p>
              <p className="font-bold">{order.customer.name}</p>
              <p>{order.customer.street}</p>
              <p>{order.customer.city}, {order.customer.state} {order.customer.postalCode}</p>
              <p>{order.customer.country}</p>
              <p>Phone: {order.customer.phone}</p>
            </div>
          </div>
          
          {/* Barcode Placeholder */}
          <div className="mt-6 border border-gray-300 p-3 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Tracking Number: {order.trackingId || 'TRK-' + Math.floor(10000000 + Math.random() * 90000000)}
            </p>
            <div className="bg-gray-200 h-20 flex items-center justify-center">
              <p className="text-gray-500">Barcode/QR Placeholder</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onDownload}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </button>
          <button 
            onClick={onPrint}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Printer size={18} className="mr-2" />
            Print Label
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelModal;