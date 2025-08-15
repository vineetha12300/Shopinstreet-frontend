// EnhancedOrderCard.tsx - OrderCard with priority indicators
import React from 'react';
import { Printer, Clock, AlertCircle, Package } from 'lucide-react';
import { Order, getStatusColor, getStatusLabel } from './types';
import { getStatusPriority, OrderStatus } from './OrderUtils';

interface OrderCardProps {
  order: Order;
  onSelect: () => void;
  onUpdateStatus: (orderId: string, newStatus: any) => void;
  onGenerateLabel: (orderId: string) => void;
  onMarkAsShipped: (orderId: string) => void;
  isSelected: boolean;
  showPriorityIndicator?: boolean;
}

const getPriorityIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case OrderStatus.PROCESSING:
      return <Clock className="w-4 h-4 text-orange-500" />;
    case OrderStatus.SHIPPED:
      return <Package className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
};

const getPriorityBorder = (status: OrderStatus): string => {
  const priority = getStatusPriority(status);
  if (priority === 1) return 'border-l-4 border-red-500'; // High priority
  if (priority === 2) return 'border-l-4 border-orange-500'; // Medium priority
  if (priority === 3) return 'border-l-4 border-blue-500'; // Normal priority
  return 'border-l-4 border-gray-300'; // Low priority
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onSelect,
  onUpdateStatus,
  onGenerateLabel,
  onMarkAsShipped,
  isSelected,
  showPriorityIndicator = true
}) => {
  const priorityClass = showPriorityIndicator ? getPriorityBorder(order.status as OrderStatus) : '';
  const priorityIcon = showPriorityIndicator ? getPriorityIcon(order.status as OrderStatus) : null;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 ${priorityClass} ${
        isSelected ? 'ring-2 ring-blue-500 transform scale-[1.02]' : ''
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-black">
            {priorityIcon && (
              <div className="mr-2 flex items-center">
                {priorityIcon}
              </div>
            )}
            <span className="font-bold text-lg mr-2">{order.id}</span>
            <span className={`${getStatusColor(order.status)} text-white text-xs py-1 px-2 rounded-full`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-sm">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
            {showPriorityIndicator && (
              <div className="text-xs text-gray-400 mt-1">
                Priority: {getStatusPriority(order.status as OrderStatus)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-3 text-black">
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
                className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            {order.status === 'pending' && (
              <button 
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
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
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center transition-colors"
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
                className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors"
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
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
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