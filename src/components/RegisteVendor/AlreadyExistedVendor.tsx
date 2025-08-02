import React from "react";

interface AlreadyExistsModalProps {
  onClose: () => void;
}

const AlreadyExistsModal: React.FC<AlreadyExistsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Vendor Already Exists
        </h2>

        <p className="text-gray-700 mb-6">
          It looks like you're already part of{" "}
          <strong>ShopInStreet</strong>! 🎉 <br />
          Please login to your vendor dashboard.
        </p>

        <a
          href="/login"
          className="inline-block bg-[#1DA1F2] text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
        >
          🔐 Go to Login
        </a>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlreadyExistsModal;
