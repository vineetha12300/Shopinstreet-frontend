// Enhanced VendorLogin.tsx
import React, { useState } from "react";
import axios from "axios";
import FloatingInput from "../ReUsebleComponents/FloatingInput";
import { useNavigate } from "react-router-dom";
import shopinStreet from "../images/shopinstreetlogo_white.jpg.jpeg";

// Template type mapping function
const getTemplateType = (businessCategory: string): string => {
  switch (businessCategory) {
    case 'Food':
      return 'Template7';
    case 'Clothing':
      return 'Template8';
    default:
      return 'Default';
  }
};

// Vendor info interface
interface VendorInfo {
  id: number;
  email: string;
  business_name: string;
  business_category: string;
  template_type: string;
  is_verified: boolean;
  owner_name: string;
  city?: string;
  business_logo?: string;
}

// Enhanced login response interface
interface LoginResponse {
  access_token: string;
  token_type: string;
  vendor: {
    id: number;
    email: string;
    business_name: string;
    business_category: string;
    is_verified: boolean;
    owner_name: string;
    city?: string;
    business_logo?: string;
  };
}

const VendorLogin: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:8000/api/vendor/login", 
        formData
      );
      
      // Enhanced response structure from your updated backend
      const { access_token, vendor } = response.data;

      // Auto-assign template type based on business category
      const template_type = getTemplateType(vendor.business_category);

      // Complete vendor info object for ProductForm
      const vendorInfo: VendorInfo = {
        id: vendor.id,
        email: vendor.email,
        business_name: vendor.business_name,
        business_category: vendor.business_category,
        template_type: template_type,
        is_verified: vendor.is_verified,
        owner_name: vendor.owner_name,
        city: vendor.city,
        business_logo: vendor.business_logo
      };

      // Store comprehensive vendor information
      localStorage.setItem("vendor_token", access_token);
      localStorage.setItem("vendor_info", JSON.stringify(vendorInfo));
      
      // Keep your existing storage for backward compatibility
      localStorage.setItem("token", access_token);
      localStorage.setItem("vendor_id", vendor.id.toString());
      localStorage.setItem("category", vendor.business_category);
      
      // Additional useful individual storage
      localStorage.setItem("business_name", vendor.business_name);
      localStorage.setItem("template_type", template_type);
      localStorage.setItem("is_verified", vendor.is_verified.toString());
      localStorage.setItem("owner_name", vendor.owner_name);

      console.log("✅ Login successful:", {
        vendor_id: vendor.id,
        business_name: vendor.business_name,
        business_category: vendor.business_category,
        template_type: template_type,
        message: getWelcomeMessage(template_type)
      });

      // Show success message based on template type
      const welcomeMessage = getWelcomeMessage(template_type);
      console.log(welcomeMessage);

      // Optional: Show toast notification
      // showSuccessToast(welcomeMessage);

      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (err: any) {
      console.error("❌ Login error:", err);
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = (templateType: string): string => {
    switch (templateType) {
      case 'Template7':
        return "Welcome to your Food Business Dashboard! 🍽️ Manage your restaurant menu with specialized fields.";
      case 'Template8':
        return "Welcome to your Fashion Business Dashboard! 👕 Manage your clothing inventory with size, color, and fabric options.";
      default:
        return "Welcome to your Business Dashboard! 🏪 Manage your products with our standard template.";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  // Add template preview info
  const getTemplatePreview = () => {
    return (
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">📋 Dashboard Templates:</h3>
        <div className="space-y-2 text-xs text-blue-700">
          <div className="flex items-center">
            <span className="w-6">🍽️</span>
            <div>
              <strong>Food Business:</strong> Restaurant template with cuisine types, dietary info, ingredients, and spice levels
            </div>
          </div>
          <div className="flex items-center">
            <span className="w-6">👕</span>
            <div>
              <strong>Clothing Business:</strong> Fashion template with brands, sizes, colors, fabric types, and care instructions
            </div>
          </div>
          <div className="flex items-center">
            <span className="w-6">🏪</span>
            <div>
              <strong>General Business:</strong> Standard template for all other product categories
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md w-full">
        {/* Logo Header */}
        <div className="bg-[#1DA1F2] p-4 flex items-center">
          <img
            src={shopinStreet}
            alt="ShopInStreet Logo"
            className="w-16 h-16 object-contain mr-4"
          />
          <div>
            <h1 className="text-xl font-bold text-white">ShopInStreet</h1>
            <p className="text-white text-xs opacity-80">Vendor Portal</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-2 text-center">Vendor Login</h2>
          <p className="text-gray-600 text-xs text-center mb-4">
            Access your template-specific dashboard
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <FloatingInput
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <FloatingInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={login}
              disabled={loading}
              className={`w-full py-3 rounded-full font-medium transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#1DA1F2] hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/register" className="text-[#1DA1F2] hover:underline font-medium">
                Register here
              </a>
            </p>
          </div>

          {/* Template Info Preview */}
          {getTemplatePreview()}
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;