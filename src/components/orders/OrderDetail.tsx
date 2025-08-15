// OrderDetail.tsx - Component for displaying order details
import React from 'react';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import { Order, OrderStatus } from './types';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onGenerateLabel: (orderId: string) => void;
  onMarkAsShipped: (orderId: string) => void;
  onSaveStatus: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onGenerateLabel,
  onMarkAsShipped,
  onSaveStatus,
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          className="flex items-center text-blue-500"
          onClick={onClose}
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back to Orders</span>
        </button>
        
        <div className="flex space-x-3">
          {(order.status === 'pending' || order.status === 'processing') && (
            <button 
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => onGenerateLabel(order.id)}
            >
              <Printer size={18} className="mr-2" />
              {order.labelGenerated ? 'Print Label' : 'Generate Label'}
            </button>
          )}
          
          {order.labelGenerated && order.status === 'processing' && (
            <button 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              onClick={() => onMarkAsShipped(order.id)}
            >
              Mark Shipped
            </button>
          )}
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-black">Order {order.id}</h3>
            <p className="text-gray-500 text-sm">
              Created on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="mr-2">Status:</span>
              <select 
                className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <button 
              className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 w-full"
              onClick={onSaveStatus}
            >
              Save Status
            </button>
          </div>
        </div>
        
        {order.trackingId && (
          <div className="bg-white p-2 rounded border border-gray-200 text-sm mb-4">
            <span className="font-medium">Tracking ID:</span> {order.trackingId}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className='text-black'>
            <p className="text-sm font-medium text-green-500 mb-1">Customer</p>
            <p className="font-bold">{order.customer.name}</p>
            <p>{order.customer.phone}</p>
            <div className="mt-2">
              <p>{order.customer.street}</p>
              <p>{order.customer.city}, {order.customer.state} {order.customer.postalCode}</p>
              <p>{order.customer.country}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Order Summary</p>
            <div className="flex justify-between mt-2 text-black">
              <span>Subtotal</span>
              <span>₹{(order.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1 text-black">
              <span>Tax</span>
              <span>₹{order.tax?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between mt-1 text-black">
              <span>Shipping</span>
              <span>₹{order.shippingCost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t font-bold text-black">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product List */}
      <div>
        <h4 className="font-bold mb-3 text-gray-500">Order Items</h4>
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {order.products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="h-10 w-10 rounded-md mr-3" 
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    ₹{(product.price * product.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Timeline */}
      <div className="mt-8">
        <h4 className="font-bold mb-3 text-gray-500">Order Timeline</h4>
        <div className="space-y-4">
          <div className="flex">
            <div className="mr-4 relative">
              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle size={14} />
              </div>
              <div className="absolute w-0.5 h-full bg-gray-200 left-3 top-6"></div>
            </div>
            <div>
              <p className="font-medium">Order Placed</p>
              <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 relative">
              <div className={`h-6 w-6 ${order.status !== 'pending' ? 'bg-blue-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white`}>
                {order.status !== 'pending' ? <CheckCircle size={14} /> : null}
              </div>
              <div className="absolute w-0.5 h-full bg-gray-200 left-3 top-6"></div>
            </div>
            <div>
              <p className="font-medium">Processing</p>
              {order.status !== 'pending' ? (
                <p className="text-gray-500 text-sm">Order accepted and being processed</p>
              ) : (
                <p className="text-gray-400 text-sm">Waiting for processing</p>
              )}
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 relative">
              <div className={`h-6 w-6 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white`}>
                {order.status === 'shipped' || order.status === 'delivered' ? <CheckCircle size={14} /> : null}
              </div>
              <div className="absolute w-0.5 h-full bg-gray-200 left-3 top-6"></div>
            </div>
            <div>
              <p className="font-medium">Shipped</p>
              {order.status === 'shipped' || order.status === 'delivered' ? (
                <p className="text-gray-500 text-sm">Order has been shipped via {order.trackingId ? order.trackingId : 'tracking pending'}</p>
              ) : (
                <p className="text-gray-400 text-sm">Waiting for shipment</p>
              )}
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4">
              <div className={`h-6 w-6 ${order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white`}>
                {order.status === 'delivered' ? <CheckCircle size={14} /> : null}
              </div>
            </div>
            <div>
              <p className="font-medium">Delivered</p>
              {order.status === 'delivered' ? (
                <p className="text-gray-500 text-sm">Order has been delivered successfully</p>
              ) : (
                <p className="text-gray-400 text-sm">Waiting for delivery</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;