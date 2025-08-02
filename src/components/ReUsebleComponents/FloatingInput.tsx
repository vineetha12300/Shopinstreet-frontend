import React from "react";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
}

const FloatingInput: React.FC<Props> = ({ label, name, value, onChange, error, type = "text" }) => {
  return (
    <div className="relative w-full mt-6">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=""
        className={`peer w-full border-b-2 bg-transparent pt-6 pb-2 text-sm focus:outline-none transition-all duration-200
        ${error ? "border-red-500" : "border-gray-300 focus:border-[#1DA1F2]"}`}
      />
      <label
        htmlFor={name}
        className="absolute left-0 top-1 text-gray-500 text-sm transition-all duration-200 
        peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
        peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#1DA1F2] pointer-events-none"
      >
        {label}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FloatingInput;
