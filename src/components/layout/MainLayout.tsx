import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  BarChart,
  Globe, 
  Image, 
  Settings, 
  LogOut,
  Menu,
  X,
  CreditCard // NEW: Cashier icon
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { path: '/store', name: 'Store', icon: <ShoppingBag size={18} /> },
    { path: '/dashboard', name: 'Products', icon: <Package size={18} /> },
    { path: '/orders', name: 'Orders', icon: <ShoppingBag size={18} /> },
    { path: '/cashier', name: 'Cashier', icon: <CreditCard size={18} /> }, 
    { path: '/sales-history', name: 'Sales History', icon: <BarChart size={18} /> }, // NEW LINE// NEW: Cashier menu item
    { path: '/domains', name: 'Domains', icon: <Globe size={18} /> },
    { path: '/analytics', name: 'Analytics', icon: <BarChart size={18} /> },
    { path: '/shipping', name: 'Shipping', icon: <Truck size={18} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={18} /> },
  ];

  const handleLogout = () => {
    // Clear localStorage tokens
    localStorage.removeItem('token');
    localStorage.removeItem('vendor_id');
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Narrower than before */}
      <div className={`${collapsed ? 'w-16' : 'w-52'} bg-black text-white flex flex-col transition-all duration-300`}>
        {/* Toggle Button */}
        <button 
          className="absolute top-4 right-4 text-white p-1 rounded-full hover:bg-gray-800 z-10"
          onClick={toggleSidebar}
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
        
        {/* Logo */}
        <div className={`p-4 ${collapsed ? 'flex justify-center' : ''}`}>
          <h1 className={`text-xl font-bold ${collapsed ? 'hidden' : 'block'}`}>ShopInStreet</h1>
          <h1 className={`text-xl font-bold ${collapsed ? 'block' : 'hidden'}`}>SIS</h1>
          <p className={`text-sm text-gray-400 ${collapsed ? 'hidden' : 'block'}`}>Vendor Portal</p>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-2 space-y-1 mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors ${
                  isActive 
                    ? 'text-white bg-blue-500' 
                    : 'text-gray-400 hover:bg-gray-800'
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              <span className={collapsed ? 'hidden' : 'block'}>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-800">
          <div className={`flex items-center mb-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
              VS
            </div>
            <div className={`ml-2 ${collapsed ? 'hidden' : 'block'}`}>
              <p className="text-xs font-medium">Vendor Shop</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className={`flex items-center text-gray-400 hover:text-white w-full px-3 py-2 rounded-lg hover:bg-gray-800 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={16} className={collapsed ? '' : 'mr-2'} />
            <span className={collapsed ? 'hidden' : 'block'}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;