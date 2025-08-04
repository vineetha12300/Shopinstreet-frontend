import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Trash, Upload, ImagePlus, RefreshCw, Camera, Settings, Sparkles, Loader2, Wand2, CheckCircle, AlertCircle, Zap } from 'lucide-react';

// Types based on your interfaces
export interface PricingTier {
  id: number;
  moq: number;
  price: number;
}

export interface Product {
  name: string;
  description: string;
  category: string;
  image_urls: string[];
  price: number;
  stock: number;
  id: number;
  vendor_id: number;
  created_at: string;
  pricing_tiers: PricingTier[];
}

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  isAdding: boolean;
}

// AI Extraction Service
class AIExtractionService {
  private static readonly API_URL = 'http://localhost:8000/api';

  private static getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  public static async extractProductFromImage(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.API_URL}/ai/extract-product`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI extraction failed:', error);
      throw error;
    }
  }
}

// Mock ImageUploadService methods for the component
const mockImageUploadService = {
  validateImageFiles: (files: File[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (files.length > 6) {
      errors.push('Maximum 6 images allowed per product');
      return { isValid: false, errors, validFiles: [] };
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
      } else if (file.size > maxSize) {
        errors.push(`File ${index + 1}: File size too large. Maximum 10MB allowed.`);
      } else {
        validFiles.push(file);
      }
    });

    return { isValid: errors.length === 0, errors, validFiles };
  },

  convertFilesToDataUrls: async (files: File[]) => {
    const promises = files.map(async (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve({ url: event.target.result as string, success: true });
          } else {
            resolve({ url: '', success: false, message: 'Failed to read file' });
          }
        };
        reader.onerror = () => {
          resolve({ url: '', success: false, message: 'Failed to read file' });
        };
        reader.readAsDataURL(file);
      });
    });
    return await Promise.all(promises);
  }
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel, isAdding }) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [basePrice, setBasePrice] = useState<string>('');
  const [pricingTiers, setPricingTiers] = useState<Omit<PricingTier, 'id'>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingType, setProcessingType] = useState<'raw' | 'enhanced'>('enhanced');

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

  // AI state
  const [aiExtracting, setAiExtracting] = useState<boolean>(false);
  const [aiSuggestionVisible, setAiSuggestionVisible] = useState<boolean>(false);
  const [aiExtractedFields, setAiExtractedFields] = useState<string[]>([]);
  const [showAiSuccess, setShowAiSuccess] = useState<boolean>(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Clothing', 'Electronics', 'Home & Kitchen', 'Beauty', 
    'Toys & Games', 'Books', 'Food & Grocery', 'Health', 'Other'
  ];

  // Helper function to check if any processing is happening
  const isAnyProcessing = () => {
    return isSubmitting || uploading || aiExtracting;
  };

  // Initialize form with existing product data
  useEffect(() => {
    if (product && !isAdding) {
      setName(product.name);
      setDescription(product.description);
      setCategory(product.category);
      setStock(String(product.stock));
      setBasePrice(String(product.price));
      
      if (product.image_urls && product.image_urls.length > 0) {
        setImageUrls([...product.image_urls]);
        setImageFiles([]);
        setDeletedImageUrls([]);
      } else {
        setImageUrls([]);
        setImageFiles([]);
        setDeletedImageUrls([]);
      }
      
      if (product.pricing_tiers && product.pricing_tiers.length > 0) {
        setPricingTiers(product.pricing_tiers.map(tier => ({ 
          moq: tier.moq, 
          price: tier.price 
        })));
      } else {
        // Initialize with base price if available for editing existing product
        const initialPrice = product.price || 0;
        setPricingTiers([{ moq: 1, price: initialPrice }]);
      }
    } else {
      // Reset form for adding new product
      setName('');
      setDescription('');
      setCategory('');
      setStock('');
      setBasePrice('');
      setImageUrls([]);
      setPricingTiers([{ moq: 1, price: 0 }]); // Will be auto-filled when basePrice is set
      setImageFiles([]);
      setDeletedImageUrls([]);
      setAiExtractedFields([]);
    }
    
    setIsSubmitting(false);
    setAiSuggestionVisible(false);
  }, [product, isAdding]);

  // Show AI suggestion when first image is uploaded
  useEffect(() => {
    if (imageFiles.length > 0 && !aiSuggestionVisible && isAdding) {
      setAiSuggestionVisible(true);
    }
  }, [imageFiles.length, aiSuggestionVisible, isAdding]);

  useEffect(() => {
    const basePriceNum = parseFloat(basePrice);
    
    // Only auto-fill if basePrice is valid and we have tiers
    if (basePriceNum > 0 && pricingTiers.length > 0) {
      setPricingTiers(prevTiers => 
        prevTiers.map((tier, index) => {
          // Only update first tier if it's 0 or if it's the initial tier
          if (index === 0 && (tier.price === 0 || tier.moq === 1)) {
            return { ...tier, price: basePriceNum };
          }
          return tier;
        })
      );
    }
  }, [basePrice]); // Only depend on basePrice, not pricingTiers to avoid loops

  // AI Extraction Function
  const handleAIExtraction = async () => {
    if (imageFiles.length === 0) {
      alert('Please upload an image first to use AI extraction');
      return;
    }

    const firstImage = imageFiles[0];
    setAiExtracting(true);
    setAiSuggestionVisible(false);

    try {
      console.log('🤖 Starting AI extraction...');
      const result = await AIExtractionService.extractProductFromImage(firstImage);
      
      if (result.success && result.data) {
        console.log('🤖 AI extraction successful:', result.data);
        
        // Auto-populate fields (excluding stock, price, pricing_tiers)
        const extractedFields: string[] = [];
        
        if (result.data.name && result.data.name.trim()) {
          setName(result.data.name.trim());
          extractedFields.push('name');
        }
        
        if (result.data.description) {
          // Handle both string and object descriptions
          let descriptionText = '';
          if (typeof result.data.description === 'string') {
            descriptionText = result.data.description;
          } else if (result.data.description.summary) {
            descriptionText = result.data.description.summary;
            if (result.data.description.features && Array.isArray(result.data.description.features)) {
              descriptionText += '\n\nKey Features:\n' + result.data.description.features.map((f: string) => `• ${f}`).join('\n');
            }
          }
          
          if (descriptionText.trim()) {
            setDescription(descriptionText.trim());
            extractedFields.push('description');
          }
        }
        
        if (result.data.category && result.data.category.trim()) {
          setCategory(result.data.category.trim());
          extractedFields.push('category');
        }
        
        setAiExtractedFields(extractedFields);
        
        // Show success state
        setShowAiSuccess(true);
        setTimeout(() => setShowAiSuccess(false), 4000);
        
        // Clear any existing errors for auto-populated fields
        setErrors(prev => {
          const newErrors = { ...prev };
          extractedFields.forEach(field => {
            delete newErrors[field];
          });
          return newErrors;
        });
        
        console.log(`✅ AI extracted and populated ${extractedFields.length} fields`);
      } else {
        throw new Error(result.message || 'AI extraction failed');
      }
    } catch (error: any) {
      console.error('❌ AI extraction error:', error);
      let errorMessage = 'AI extraction failed. Please try again or fill the form manually.';
      
      if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid image format. Please try a different image.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      setAiExtracting(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!description.trim()) newErrors.description = 'Description is required';
    
    const stockNum = parseInt(stock, 10);
    if (!stock || isNaN(stockNum) || stockNum <= 0) {
      newErrors.stock = 'Stock must be a positive whole number';
    }
    
    const priceNum = parseFloat(basePrice);
    if (!basePrice || isNaN(priceNum) || priceNum <= 0) {
      newErrors.basePrice = 'Base price must be a positive number';
    }
    
    if (imageUrls.length === 0) newErrors.imageUrls = 'At least one product image is required';
    
    if (pricingTiers.length === 0) {
      newErrors.pricingTiers = 'At least one pricing tier is required';
    } else {
      pricingTiers.forEach((tier, index) => {
        if (!tier.moq || tier.moq <= 0) {
          newErrors[`tier_${index}_moq`] = 'Minimum order quantity must be greater than 0';
        }
        if (!tier.price || tier.price <= 0) {
          newErrors[`tier_${index}_price`] = 'Price must be greater than 0';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnyProcessing()) return;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('🔄 Starting image upload process...');

    const validation = mockImageUploadService.validateImageFiles(Array.from(files));
    
    if (!validation.isValid) {
      alert(`Upload validation failed:\n${validation.errors.join('\n')}`);
      return;
    }

    if (imageUrls.length + validation.validFiles.length > 6) {
      alert('You can upload a maximum of 6 images per product.');
      return;
    }

    setUploading(true);
    
    try {
      setImageFiles(prevFiles => [...prevFiles, ...validation.validFiles]);
      
      const dataUrlResults = await mockImageUploadService.convertFilesToDataUrls(validation.validFiles);
      
      const successfulDataUrls = dataUrlResults
        .filter((result: any) => result.success)
        .map((result: any) => result.url);
      
      setImageUrls(prevUrls => [...prevUrls, ...successfulDataUrls]);
      
      console.log(`✅ Added ${successfulDataUrls.length} new images for preview`);
      
    } catch (error) {
      console.error('Error handling image upload:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const existingImages = imageUrls.filter(url => 
      !url.startsWith('data:') && 
      url !== '/api/placeholder/200/200' &&
      !deletedImageUrls.includes(url)
    );
    
    const newDataUrls = imageUrls.filter(url => url.startsWith('data:'));
    
    return [...existingImages, ...newDataUrls];
  };

  const removeImage = async (index: number) => {
    if (isAnyProcessing()) return;

    const urlToRemove = imageUrls[index];
    
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
    
    if (!urlToRemove.startsWith('data:') && urlToRemove !== '/api/placeholder/200/200') {
      setDeletedImageUrls(prev => [...prev, urlToRemove]);
    }
    
    if (urlToRemove.startsWith('data:')) {
      const dataUrlsBefore = imageUrls.slice(0, index).filter(url => url.startsWith('data:')).length;
      setImageFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles.splice(dataUrlsBefore, 1);
        return newFiles;
      });
    }

    // Hide AI suggestion if no images left
    if (newImageUrls.length === 0) {
      setAiSuggestionVisible(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAnyProcessing()) return;
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const uploadedImageUrls = await uploadImages();
      
      const formattedPricingTiers = pricingTiers.map((tier, index) => ({
        moq: Number(tier.moq),
        price: Number(tier.price),
        id: product && product.pricing_tiers && product.pricing_tiers[index]
          ? product.pricing_tiers[index].id
          : index + 1
      }));

      const newProduct: any = {
        name: name.trim(),
        description: description.trim(),
        category: category,
        stock: Number(stock),
        price: Number(basePrice),
        image_urls: uploadedImageUrls,
        pricing_tiers: formattedPricingTiers,
        processing_type: processingType, 
      };

      if (!isAdding && product) {
        newProduct.id = product.id;
        if (product.created_at) {
          newProduct.created_at = product.created_at;
        }
      }

      await onSave(newProduct as Product);
      
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPricingTier = () => {
    if (isAnyProcessing()) return;
    
    const lastTier = pricingTiers[pricingTiers.length - 1];
    const newMoq = lastTier ? Math.max(lastTier.moq + 10, 1) : 1;
    
    // Safe price calculation with fallbacks
    let autoPrice = 0;
    const basePriceNum = parseFloat(basePrice) || 0;
    const lastTierPrice = lastTier?.price || 0;
    
    if (basePriceNum > 0) {
      autoPrice = basePriceNum;
    } else if (lastTierPrice > 0) {
      autoPrice = lastTierPrice;
    }
    
    setPricingTiers(prev => [...prev, { moq: newMoq, price: autoPrice }]);
  };

  const removePricingTier = (index: number) => {
    if (isAnyProcessing() || pricingTiers.length <= 1) return;
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const updatePricingTier = (index: number, field: 'moq' | 'price', value: string) => {
    if (isAnyProcessing()) return;
    const updatedTiers = [...pricingTiers];
    const numValue = field === 'moq' ? parseInt(value, 10) || 0 : parseFloat(value) || 0;
    updatedTiers[index] = { ...updatedTiers[index], [field]: numValue };
    setPricingTiers(updatedTiers);
  };

  const triggerFileInput = () => {
    if (isAnyProcessing()) return;
    fileInputRef.current?.click();
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnyProcessing()) return;
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setStock(value);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnyProcessing()) return;
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBasePrice(value);
    }
  };

  const handleCancel = () => {
    if (isAnyProcessing()) return;
    onCancel();
  };

  const getFieldClassName = (fieldName: string, hasError: boolean) => {
    const baseClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
      hasError ? 'border-red-500' : 'border-gray-300'
    } ${isAnyProcessing() ? 'bg-gray-50 cursor-not-allowed' : ''}`;
    
    // Add special styling for AI-extracted fields
    if (aiExtractedFields.includes(fieldName)) {
      return `${baseClasses} bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300`;
    }
    
    return baseClasses;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header with AI Success Indicator */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdding ? "Add New Product" : "Edit Product"}
        </h2>
        
        {showAiSuccess && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 animate-pulse">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">AI extracted {aiExtractedFields.length} fields!</span>
            <Sparkles className="w-4 h-4 text-green-600" />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Images & AI */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Product Images <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Max 6 images)</span>
              </label>
              
              {/* Processing Type Selection */}
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Image Processing Options
                </h4>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="radio"
                      name="processingType"
                      value="raw"
                      checked={processingType === 'raw'}
                      onChange={(e) => !isAnyProcessing() && setProcessingType('raw')}
                      disabled={isAnyProcessing()}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <Camera className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Upload As-Is</span>
                        <span className="ml-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          🚀 Fastest
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Perfect for pre-edited photos! Keep images exactly as uploaded.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="radio"
                      name="processingType"
                      value="enhanced"
                      checked={processingType === 'enhanced'}
                      onChange={(e) => !isAnyProcessing() && setProcessingType('enhanced')}
                      disabled={isAnyProcessing()}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Auto-Enhance</span>
                        <span className="ml-2 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                          ⭐ Recommended
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        AI-powered background removal and professional optimization.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Image gallery */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-24 object-cover border-2 border-gray-200 rounded-lg shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isAnyProcessing()}
                      className={`absolute -top-2 -right-2 rounded-full p-1 transition-all duration-200 shadow-lg ${
                        isAnyProcessing() 
                          ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                          : 'bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100'
                      } text-white`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {imageUrls.length < 6 && (
                  <div 
                    className={`w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isAnyProcessing()
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }`}
                    onClick={triggerFileInput}
                  >
                    <div className="text-center">
                      <ImagePlus size={20} className={`mx-auto mb-1 ${
                        isAnyProcessing() ? 'text-gray-300' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        isAnyProcessing() ? 'text-gray-300' : 'text-gray-500'
                      }`}>Add Image</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="flex items-center space-x-3 mb-4">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={imageUrls.length >= 6 || isAnyProcessing()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    imageUrls.length >= 6 || isAnyProcessing()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                      : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                  }`}
                >
                  <Upload size={16} />
                  Upload Images
                </button>
                <span className="text-sm text-gray-500">
                  {imageUrls.length}/6 images
                </span>
              </div>

              {/* AI Suggestion Card */}
              {aiSuggestionVisible && !aiExtracting && isAdding && (
                <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-dashed border-purple-200 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">✨ AI Auto-Fill Available!</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Let our AI analyze your product image and automatically fill the product details for you.
                      </p>
                      <button
                        type="button"
                        onClick={handleAIExtraction}
                        disabled={aiExtracting || imageFiles.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          aiExtracting || imageFiles.length === 0
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {aiExtracting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            <span>Extract with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Processing State */}
              {aiExtracting && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                    <div>
                      <h4 className="font-semibold text-gray-900">🤖 AI is analyzing your product...</h4>
                      <p className="text-sm text-gray-600">Extracting product details, this will take a few seconds.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual AI Trigger (Always Available) */}
              {!aiSuggestionVisible && !aiExtracting && imageFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleAIExtraction}
                  disabled={isAnyProcessing()}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all border ${
                    isAnyProcessing()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 border-purple-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Product Details with AI</span>
                </button>
              )}
              
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                disabled={isAnyProcessing()}
                className="hidden"
              />
              
              {errors.imageUrls && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.imageUrls}
                </p>
              )}
            </div>
          </div>
          
          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
                {aiExtractedFields.includes('name') && (
                  <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    ✨ AI Generated
                  </span>
                )}
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => !isAnyProcessing() && setName(e.target.value)}
                disabled={isAnyProcessing()}
                className={getFieldClassName('name', !!errors.name)}
                placeholder="e.g. Premium Organic Coffee Beans"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
                {aiExtractedFields.includes('category') && (
                  <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    ✨ AI Generated
                  </span>
                )}
              </label>
              <select 
                value={category}
                onChange={(e) => !isAnyProcessing() && setCategory(e.target.value)}
                disabled={isAnyProcessing()}
                className={getFieldClassName('category', !!errors.category)}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
                {aiExtractedFields.includes('description') && (
                  <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    ✨ AI Generated
                  </span>
                )}
              </label>
              <textarea 
                value={description}
                onChange={(e) => !isAnyProcessing() && setDescription(e.target.value)}
                disabled={isAnyProcessing()}
                rows={5}
                className={`${getFieldClassName('description', !!errors.description)} resize-none`}
                placeholder="Describe your product features, benefits, and details..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
            
            {/* Stock and Base Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={stock}
                  onChange={handleStockChange}
                  disabled={isAnyProcessing()}
                  className={getFieldClassName('stock', !!errors.stock)}
                  placeholder="100"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Price ($) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={basePrice}
                  onChange={handlePriceChange}
                  disabled={isAnyProcessing()}
                  className={getFieldClassName('basePrice', !!errors.basePrice)}
                  placeholder="24.99"
                />
                {errors.basePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing Tiers Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing Tiers</h3>
            <button
              type="button"
              onClick={addPricingTier}
              disabled={isAnyProcessing()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isAnyProcessing()
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                  : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md'
              }`}
            >
              <Plus size={14} />
              Add Tier
            </button>
          </div>
          
          <div className="space-y-3">
            {pricingTiers.map((tier, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Order Qty
                  </label>
                  <input 
                    type="text"
                    value={tier.moq}
                    onChange={(e) => updatePricingTier(index, 'moq', e.target.value)}
                    disabled={isAnyProcessing()}
                    className={`w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      isAnyProcessing() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="1"
                  />
                  {errors[`tier_${index}_moq`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`tier_${index}_moq`]}</p>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input 
                    type="text"
                    value={tier.price}
                    onChange={(e) => updatePricingTier(index, 'price', e.target.value)}
                    disabled={isAnyProcessing()}
                    className={`w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      isAnyProcessing() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="0.00"
                  />
                  {errors[`tier_${index}_price`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`tier_${index}_price`]}</p>
                  )}
                </div>
                
                {pricingTiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePricingTier(index)}
                    disabled={isAnyProcessing()}
                    className={`mt-6 p-2 rounded transition-all ${
                      isAnyProcessing() 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {errors.pricingTiers && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.pricingTiers}
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isAnyProcessing()}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isAnyProcessing()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
            }`}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isAnyProcessing()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isAnyProcessing()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-70 shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isAdding ? "Creating..." : "Updating..."}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isAdding ? "Create Product" : "Update Product"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Features Info */}
      {isAdding && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">✨ AI-Powered Product Creation</h4>
              <p className="text-sm text-gray-600">
                Upload your product image and let our AI automatically extract the product name, description, and category. 
                You can always edit the AI-generated content before saving.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;