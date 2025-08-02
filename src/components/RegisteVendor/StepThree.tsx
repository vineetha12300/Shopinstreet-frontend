import React from "react";
import FloatingInput from "../ReUsebleComponents/FloatingInput";

interface StepThreeProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  prev: () => void;
  submit: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const StepThree: React.FC<StepThreeProps> = ({ formData, setFormData, errors, prev, submit,handleChange }) => {
  

  return (
    <div style={{paddingTop:"0px"}} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      
      <div className="space-y-1">
        {/* Verification Type */}
        <div className="relative w-full mt-6">
          <select
            name="verification_type"
            value={formData.verification_type}
            onChange={handleChange}
            className={`peer w-full border-b-2 bg-transparent pt-6 pb-2 text-sm focus:outline-none ${
              errors.verification_type ? "border-red-500" : "border-gray-300 focus:border-[#1DA1F2]"
            }`}
          >
            <option value="" disabled hidden></option>
            <option value="GSTIN">GSTIN</option>
            <option value="Business License">Business License</option>
            <option value="Other">Other</option>
          </select>
          <label
            htmlFor="verification_type"
            className="absolute left-0 top-1 text-gray-500 text-sm transition-all duration-200 
              peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
              peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#1DA1F2]"
          >
            Verification Type
          </label>
          {errors.verification_type && (
            <p className="text-red-500 text-xs mt-1">{errors.verification_type}</p>
          )}
        </div>

        <FloatingInput
          label="Verification Number"
          name="verification_number"
          value={formData.verification_number}
          onChange={handleChange}
          error={errors.verification_number}
        />

        <FloatingInput
          label="Website URL"
          name="website_url"
          value={formData.website_url}
          onChange={handleChange}
          error={errors.website_url}
        />

        <FloatingInput
          label="LinkedIn URL"
          name="linkedin_url"
          value={formData.linkedin_url}
          onChange={handleChange}
          error={errors.linkedin_url}
        />

        <FloatingInput
          label="Business Logo URL"
          name="business_logo"
          value={formData.business_logo}
          onChange={handleChange}
          error={errors.business_logo}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prev}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all"
        >
          Back
        </button>
        <button
          onClick={submit}
          className="bg-[#1DA1F2] text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-all"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default StepThree;
