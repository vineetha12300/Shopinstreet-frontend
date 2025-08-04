import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean; // Add this prop for processing state
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  productName, 
  onConfirm, 
  onCancel,
  isSubmitting = false // Default to false for backward compatibility
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4 text-red-500">
          <AlertTriangle size={24} className="mr-2" />
          <h3 className="text-lg font-bold">Confirm Deletion</h3>
        </div>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete "<span className="font-semibold">{productName}</span>"? 
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
            }`}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-70'
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;