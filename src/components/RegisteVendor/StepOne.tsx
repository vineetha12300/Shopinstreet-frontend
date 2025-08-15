import React from "react";
import FloatingInput from "../ReUsebleComponents/FloatingInput";

interface StepOneProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  next: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const StepOne: React.FC<StepOneProps> = ({ formData, errors, next, handleChange }) => {
  return (
    <div style={{ paddingTop: "0px" }} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">


      <div className="space-y-1">
        <FloatingInput
          label="Business Name"
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
          error={errors.business_name}
        />

        <div className="relative w-full mt-6">
          <select
            name="business_category"
            value={formData.business_category}
            onChange={handleChange}
            className={`peer w-full border-b-2 bg-transparent pt-6 pb-2 text-sm focus:outline-none 
              ${errors.business_category ? "border-red-500" : "border-gray-300 focus:border-[#1DA1F2]"}`}
          >
            <option value="" disabled hidden></option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Services">Services</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
          </select>
          <label
            htmlFor="business_category"
            className="absolute left-0 top-1 text-gray-500 text-sm transition-all duration-200 
            peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
            peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#1DA1F2] pointer-events-none">
            Business Category
          </label>
          {errors.business_category && <p className="text-red-500 text-xs mt-1">{errors.business_category}</p>}
        </div>

        <div className="relative w-full mt-6">
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`peer w-full border-b-2 bg-transparent pt-6 pb-2 text-sm focus:outline-none 
              ${errors.country ? "border-red-500" : "border-gray-300 focus:border-[#1DA1F2]"}`}
          >
            <option value="" disabled hidden></option>
            <option value="India">India</option>
            <option value="Canada">Canada</option>
          </select>
          <label
            htmlFor="country"
            className="absolute left-0 top-1 text-gray-500 text-sm transition-all duration-200 
            peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
            peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#1DA1F2]">
            Country
          </label>
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
        </div>

        <FloatingInput
          label={formData.country === "Canada" ? "Postal Code" : "Pincode"}
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          error={errors.pincode}
        />

        <FloatingInput
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
        />

        <FloatingInput
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
        />


        <FloatingInput
          label={formData.country === "Canada" ? "Province" : "State"}
          name="state"
          value={formData.state}
          onChange={handleChange}
          error={errors.state}
        />
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={next}
          className="bg-[#1DA1F2] text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepOne;
