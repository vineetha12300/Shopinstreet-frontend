import React from "react";

interface SuccessModalProps {
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-[#1DA1F2] mb-4">
          🎉 Welcome to ShopInStreet!
        </h2>

        <p className="text-gray-700 mb-4 text-sm leading-relaxed">
          You're now an official partner of <strong>ShopInStreet</strong> — a
          community-driven B2B marketplace built on trust, connection, and
          local empowerment. 🌱
          <br />
          <br />
          We’re excited to grow together and help your business reach new
          heights across <strong>India & Canada</strong>. 🇮🇳 🇨🇦
        </p>

        <p className="italic text-sm text-gray-500 mb-6">
          You're not just a vendor — you're family now. 💙
        </p>

        <a
          href="/login"
          className="inline-block bg-[#1DA1F2] text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
        >
          🚀 Go to Login & Explore Dashboard
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

export default SuccessModal;
