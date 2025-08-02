import React, { useState, useRef } from 'react';
import { Upload, ImagePlus, Check, AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../layout/PageHeader';

const ImagesPage: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Process the uploaded file
  const processFile = (file: File) => {
    // Reset states
    setStatus('uploading');
    setErrorMessage('');
    setUploadProgress(0);
    setIsUploading(true);

    // Validate file type
    if (!file.type.match('image.*')) {
      setErrorMessage('Please upload an image file (JPEG, PNG, etc.)');
      setStatus('error');
      setIsUploading(false);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 10MB');
      setStatus('error');
      setIsUploading(false);
      return;
    }

    // Show original image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setOriginalImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Simulate upload progress
    const uploadTimer = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(uploadTimer);
          simulateImageProcessing(file);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  // Simulate backend image processing
  const simulateImageProcessing = (file: File) => {
    setStatus('processing');

    // Simulate processing delay (2-3 seconds)
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setEnhancedImage(e.target.result as string);
          setStatus('success');
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }, 2500);
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Reset the component
  const handleReset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <>
      <PageHeader title="Product Image Upload">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          disabled={status === 'idle'}
        >
          Upload New Image
        </button>
      </PageHeader>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-6">Upload your product images and we'll automatically enhance them for your listings</p>

          {/* Error Message */}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {status === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ImagePlus size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Drop your product image here</h3>
              <p className="text-gray-500 mb-4">or</p>
              <button
                onClick={handleUploadClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Upload size={16} className="inline mr-2" />
                Select Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="mt-4 text-xs text-gray-500">
                Our system will automatically enhance your image quality, optimize lighting, and resize for best display
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <RefreshCw
                    size={18}
                    className={`mr-2 ${status === 'processing' ? 'animate-spin text-blue-500' : 'text-gray-500'}`}
                  />
                  <span className="font-medium">
                    {status === 'uploading' ? 'Uploading image...' : 'Enhancing image...'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {status === 'uploading' ? `${uploadProgress}%` : 'AI processing'}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-blue-600'}`}
                  style={{ width: status === 'processing' ? '100%' : `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Results */}
          {status === 'success' && (
            <div>
              <div className="flex items-center text-green-600 mb-4">
                <Check size={24} className="mr-2" />
                <h3 className="text-lg font-medium">Image enhanced successfully!</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Original Upload</h4>
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={originalImage || ''}
                      alt="Original upload"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Enhanced Image</h4>
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={enhancedImage || ''}
                      alt="Enhanced image"
                      className="object-contain w-full h-full"
                      style={{
                        filter: 'brightness(1.1) contrast(1.15) saturate(1.05)',
                        transform: 'scale(1.02)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Upload Another Image
                </button>
                <button
                  onClick={() => alert('Image saved to your product gallery!')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save to Product Gallery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImagesPage;