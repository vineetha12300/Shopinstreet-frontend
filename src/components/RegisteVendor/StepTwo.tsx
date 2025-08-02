import React from "react";
import FloatingInput from "../ReUsebleComponents/FloatingInput";
import { MdPadding } from "react-icons/md";

interface StepTwoProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  next: () => void;
  prev: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ formData, setFormData, errors, next, prev,handleChange }) => {
  

  return (
    <div style={{paddingTop:"0px"}} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      
      <div className="space-y-1">
        <FloatingInput
          label="Owner Name"
          name="owner_name"
          value={formData.owner_name}
          onChange={handleChange}
          error={errors.owner_name}
        />

        <FloatingInput
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          type="email"
        />

        <FloatingInput
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <FloatingInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <FloatingInput
          label="Confirm Password"
          name="confirm_password"
          type="password"
          value={formData.confirm_password || ""}
          onChange={handleChange}
          error={errors.confirm_password}
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
          onClick={next}
          className="bg-[#1DA1F2] text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepTwo;
