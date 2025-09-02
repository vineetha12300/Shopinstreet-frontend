
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VendorLogin from "./components/VendorLogin/VendorLogin";
import RegisterVendor from "./components/RegisteVendor/RegisterVendor";
import UnifiedVendorDashboard from "./components/pages/VendorDashboard";
import DomainPage from "./components/domain/DomainPage";
import VendorOrdersDashboard from "./components/orders/VendorOrdersDashboard";
import MainLayout from "./components/layout/MainLayout";
import ToastContainer from './components/ReUsebleComponents/Toast';
import VendorStorePage from "./components/pages/VendorStorePage";
import CashierDashboard from "./components/cashier/CashierDashboard"; // NEW
import { JSX } from "react";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import SettingsPage from "./components/settings/SettingsPage";
import SalesHistory from "./components/cashier/SalesHistory";
// Authentication guard component
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Cashier wrapper to pass vendor ID
const CashierWrapper = () => {
  // Get vendor ID from localStorage or API
  const vendorId = parseInt(localStorage.getItem("vendor_id") || "1");
  console.log("Vendor ID:", vendorId)
  return <CashierDashboard vendorId={vendorId} />;
};

const SalesHistoryWrapper = () => {
  const vendorId = parseInt(localStorage.getItem("vendor_id") || "1");
  return <SalesHistory vendorId={vendorId} />;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<VendorLogin />} />
        <Route path="/register" element={<RegisterVendor />} />
        
        {/* Protected routes with MainLayout */}
        <Route 
          path="/" 
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<UnifiedVendorDashboard />} />
          <Route path="orders" element={<VendorOrdersDashboard />} />
          <Route path="domains" element={<DomainPage />} />
          <Route path="store" element={<VendorStorePage />} />
          <Route path="cashier" element={<CashierWrapper />} /> {/* NEW CASHIER ROUTE */}
          <Route path="sales-history" element={<SalesHistoryWrapper />} /> {/* ✅ MOVED INSIDE */}
          
          {/* Add placeholder routes for future features */}
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="shipping" element={<ComingSoon title="Shipping Management" />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Global toast notifications */}
      <ToastContainer />
    </BrowserRouter>
  );
}

// Placeholder component for features under development
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center flex-col p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    <div className="bg-blue-100 text-blue-800 px-6 py-8 rounded-lg max-w-md text-center">
      <p className="text-lg mb-2">🚧 Coming Soon 🚧</p>
      <p>This feature is currently under development and will be available in a future update.</p>
    </div>
  </div>
);

export default App;