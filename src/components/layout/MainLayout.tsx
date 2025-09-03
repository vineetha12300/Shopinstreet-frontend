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
    { path: '/sales-history', name: 'Sales History', icon: <BarChart size={18} /> },
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
      <div className={`${collapsed ? 'w-16' : 'w-52'} bg-black text-white flex flex-col transition-all duration-300 relative`}>
        {/* Toggle Button - Position changes based on collapsed state */}
        {collapsed ? (
          /* When collapsed: Button at top center */
          <div className="flex justify-center p-2">
            <button 
              className="text-white p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </button>
          </div>
        ) : (
          /* When expanded: Button in header with logo */
          <div className="p-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">ShopInStreet</h1>
              <p className="text-sm text-gray-400">Vendor Portal</p>
            </div>
            <button 
              className="text-white p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
              onClick={toggleSidebar}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Logo - Only show SIS when collapsed */}
        {collapsed && (
          <div className="flex justify-center px-4 pb-4">
            <h1 className="text-xl font-bold">SIS</h1>
          </div>
        )}

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

        {/* Logout button */}
        <div className="p-2">
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 w-full text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            <span className={collapsed ? 'hidden' : 'block'}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;