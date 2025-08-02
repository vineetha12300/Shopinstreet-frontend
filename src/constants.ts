import { NavigationStep } from './types';

export const STEPS = {
  ORDERS: 1,
  ORDER_DETAILS: 2,
  SHIPPING_LABEL: 3,
  SHIPPING_PROGRESS: 4,
  ORDER_COMPLETE: 5
};

export const NAVIGATION_ITEMS: NavigationStep[] = [
  { id: STEPS.ORDERS, title: 'New', icon: 'Package' },
  { id: STEPS.ORDER_DETAILS, title: 'Active', icon: 'Truck' },
  { id: STEPS.ORDER_COMPLETE, title: 'Completed', icon: 'CheckCircle' }
];

