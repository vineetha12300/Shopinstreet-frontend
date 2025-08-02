// src/components/VendorLogin/VendorLogin.tsx
import React, { useState } from "react";
import axios from "axios";
import FloatingInput from "../ReUsebleComponents/FloatingInput";
import { useNavigate } from "react-router-dom";
import shopinStreet from "../images/shopinstreetlogo_white.jpg.jpeg";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/vendor/login", formData);
      const { access_token, vendor_id } = response.data;

      // Save token and vendor ID to localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("vendor_id", vendor_id);
      console.log("token", access_token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Login failed";
      setError(msg);
    }
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
          <h2 className="text-lg font-semibold mb-4 text-center">Vendor Login</h2>

          {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}

          <form className="space-y-4">
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
              className="w-full bg-[#1DA1F2] text-white py-2 rounded-full hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/register" className="text-[#1DA1F2] hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;