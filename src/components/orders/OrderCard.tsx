// OrderCard.tsx - Card component for displaying order in the list
import React from 'react';
import { Printer } from 'lucide-react';
import { Order, getStatusColor, getStatusLabel } from './types';

interface OrderCardProps {
  order: Order;
  onSelect: () => void;
  onUpdateStatus: (orderId: string, newStatus: any) => void;
  onGenerateLabel: (orderId: string) => void;
  onMarkAsShipped: (orderId: string) => void;
  isSelected: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onSelect,
  onUpdateStatus,
  onGenerateLabel,
  onMarkAsShipped,
  isSelected
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="font-bold text-lg mr-2">{order.id}</span>
            <span className={`${getStatusColor(order.status)} text-white text-xs py-1 px-2 rounded-full`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <span className="text-gray-500 text-sm">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-gray-500 text-sm">{order.customer.city}, {order.customer.state}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">₹{order.total.toFixed(2)}</p>
            <p className="text-gray-500 text-xs">{order.products.reduce((total, p) => total + p.quantity, 0)} items</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {order.products.map(product => (
              <img 
                key={product.id}
                src={product.imageUrl} 
                alt={product.name} 
                className="h-8 w-8 rounded-full border border-white"
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            {order.status === 'pending' && (
              <button 
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(order.id, 'processing');
                }}
              >
                Accept
              </button>
            )}
            
            {(order.status === 'pending' || order.status === 'processing') && (
              <button 
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateLabel(order.id);
                }}
              >
                <Printer size={14} className="mr-1" />
                {order.labelGenerated ? 'Print Label' : 'Generate Label'}
              </button>
            )}
            
            {order.labelGenerated && order.status === 'processing' && (
              <button 
                className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsShipped(order.id);
                }}
              >
                Mark Shipped
              </button>
            )}
            
            {order.status === 'shipped' && (
              <button 
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(order.id, 'delivered');
                }}
              >
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;