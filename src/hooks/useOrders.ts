
import { useState } from 'react';
import { Order, OrderStatus } from '../types/order.types'; 
export const useOrder = () => { 
  const [currentStep, setCurrentStep] = useState<number>(1); // STEPS.ORDERS = 1
  const [showModal, setShowModal] = useState<boolean>(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const navigateBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId) || null;
    setCurrentOrder(order);
    if (order) {
      goToStep(2); // STEPS.ORDER_DETAILS = 2
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    if (currentOrder?.id === orderId) {
      setCurrentOrder({ ...currentOrder, status });
    }
  };

  const handleDropOff = () => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, 'shipped'); // Changed from 'in_transit'
      setShowModal(false);
      goToStep(5); // STEPS.ORDER_COMPLETE = 5
    }
  };

  const handleDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  };

  // NEW: Function to set orders from API
  const setOrdersFromAPI = (apiOrders: Order[]) => {
    setOrders(apiOrders);
  };

  return {
    currentStep,
    showModal,
    orders,
    currentOrder,
    goToStep,
    navigateBack,
    selectOrder,
    updateOrderStatus,
    setShowModal,
    handleDropOff,
    handleDelivered,
    setOrdersFromAPI // NEW: Allow setting orders from API
  };
};