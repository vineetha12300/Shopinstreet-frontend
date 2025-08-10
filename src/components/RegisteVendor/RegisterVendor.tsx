// src/components/RegisteVendor/RegisterVendor.tsx
import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import axios from "axios";
import "./RegisterVendor.css";
import  { ProfessionalSuccessModal } from "./SucessModal";
import AlreadyExistsModal from "./AlreadyExistedVendor";
import shopinStreet from "../images/shopinstreetlogo_white.jpg.jpeg";

const RegisterVendor = () => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAlreadyExists, setShowAlreadyExists] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    business_category: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    verification_type: "",
    verification_number: "",
    website_url: "",
    linkedin_url: "",
    business_logo: ""
  });

  interface WebsiteInfo {
  subdomain: string | null;
  website_url: string | null;
  status: string;
  readiness_score: number;
  next_steps: string[];
}
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo | null>(null);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.business_name) newErrors.business_name = "Business name is required";
      if (!formData.business_category) newErrors.business_category = "Category is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.pincode) {
        newErrors.pincode = formData.country === "Canada" ? "Postal code is required" : "Pincode is required";
      }
    }

    if (step === 2) {
      if (!formData.owner_name) newErrors.owner_name = "Owner name is required";
      if (!formData.email.includes("@")) newErrors.email = "Valid email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Minimum 6 characters";
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const next = () => {
    if (validateStep()) setStep(prev => prev + 1);
  };

  const prev = () => setStep(prev => prev - 1);

  const submit = async () => {
  try {
    const { confirm_password, ...payload } = formData;
    
    // Updated API call to handle enhanced response
    const response = await axios.post("http://localhost:8000/api/vendor/register", payload);
    
    // Check if response includes website info
    if (response.data.website_info) {
      setWebsiteInfo(response.data.website_info);
      setVendorId(response.data.vendor_id);
    }
    
    setShowSuccess(true);
    
  } catch (error: any) {
    const message = error.response?.data?.detail || "";

    if (message.includes("Vendor already exists")) {
      setShowAlreadyExists(true);
    } else {
      alert("❌ " + message || "Registration failed");
    }

    console.error(error);
  }
};

  return (
    <div  className="min-h-screen flex items-center justify-center bg-gray-100">
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
            <p className="text-white text-xs opacity-80">Vendor Registration</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-[#000000]">
            {step === 1 ? "Business Information" : 
             step === 2 ? "Owner & Account Info" : 
             "Verification & Links"}
          </h2>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${s === step ? 'bg-[#1DA1F2] text-white font-bold' : 
                        s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                  >
                    {s < step ? '✓' : s}
                  </div>
                  <span className="text-xs mt-1">
                    {s === 1 ? "Business" : s === 2 ? "Account" : "Verify"}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-1">
              <div className="h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-1 bg-[#1DA1F2] rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="mx-auto">
            {step === 1 && (
              <div className="w-full">
                <StepOne
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  next={next}
                  handleChange={handleChange}
                />
              </div>
            )}
            {step === 2 && (
              <div className="w-full">
                <StepTwo
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  next={next}
                  prev={prev}
                  handleChange={handleChange}
                />
              </div>
            )}
            {step === 3 && (
              <div className="w-full">
                <StepThree
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  submit={submit}
                  prev={prev}
                  handleChange={handleChange}
                />
              </div>
            )}
          </div>
          
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-[#1DA1F2] hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>

      {showSuccess && (
  <ProfessionalSuccessModal 
    isOpen={showSuccess}
    onClose={() => setShowSuccess(false)}
    websiteInfo={websiteInfo ?? undefined}
    vendorId={vendorId ?? undefined}
    businessName={formData.business_name}
  />
)}
      
      {/* Already Exists Modal */}
      {showAlreadyExists && <AlreadyExistsModal onClose={() => setShowAlreadyExists(false)} />}
    </div>
  );
};

export default RegisterVendor;