import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Trash2, 
  Edit3, 
  Package, 
  DollarSign, 
  Hash, 
  FileText,
  Tag,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Plus
} from 'lucide-react';

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

interface UpdateProductModalProps {
  isOpen: boolean;
  product: Product;
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
}

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  isOpen,
  product,
  onSave,
  onClose
}) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [basePrice, setBasePrice] = useState<string>('');
  const [pricingTiers, setPricingTiers] = useState<Omit<PricingTier, 'id'>[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'images'>('basic');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Clothing', 'Electronics', 'Home & Kitchen', 'Beauty', 
    'Toys & Games', 'Books', 'Food & Grocery', 'Health', 'Other'
  ];

  // Initialize form with product data
  useEffect(() => {
    if (product && isOpen) {
      setName(product.name);
      setDescription(product.description);
      setCategory(product.category);
      setStock(String(product.stock));
      setBasePrice(String(product.price));
      setImageUrls([...product.image_urls]);
      setImageFiles([]);
      setDeletedImageUrls([]);
      
      if (product.pricing_tiers && product.pricing_tiers.length > 0) {
        setPricingTiers(product.pricing_tiers.map(tier => ({ 
          moq: tier.moq, 
          price: tier.price 
        })));
      } else {
        setPricingTiers([{ moq: 1, price: product.price }]);
      }
      
      setErrors({});
      setHasChanges(false);
      setActiveTab('basic');
    }
  }, [product, isOpen]);

  // Track changes
  useEffect(() => {
    if (!product) return;
    
    const originalPricingTiers = product.pricing_tiers || [{ moq: 1, price: product.price }];
    const currentPricingTiers = pricingTiers;
    
    const hasBasicChanges = 
      name !== product.name ||
      description !== product.description ||
      category !== product.category ||
      Number(stock) !== product.stock ||
      Number(basePrice) !== product.price;
    
    const hasPricingChanges = 
      JSON.stringify(originalPricingTiers.map(t => ({ moq: t.moq, price: t.price }))) !== 
      JSON.stringify(currentPricingTiers);
    
    const hasImageChanges = 
      imageFiles.length > 0 || 
      deletedImageUrls.length > 0 ||
      imageUrls.length !== product.image_urls.length;
    
    setHasChanges(hasBasicChanges || hasPricingChanges || hasImageChanges);
  }, [name, description, category, stock, basePrice, pricingTiers, imageUrls, imageFiles, deletedImageUrls, product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!stock || Number(stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!basePrice || Number(basePrice) <= 0) newErrors.basePrice = 'Valid price is required';

    // Validate pricing tiers
    pricingTiers.forEach((tier, index) => {
      if (tier.moq <= 0) newErrors[`tier_${index}_moq`] = 'MOQ must be greater than 0';
      if (tier.price <= 0) newErrors[`tier_${index}_price`] = 'Price must be greater than 0';
    });

    if (imageUrls.length === 0 && imageFiles.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare image URLs (existing + new)
      const uploadedImageUrls = await uploadImages();
      
      const formattedPricingTiers = pricingTiers.map((tier, index) => ({
        moq: Number(tier.moq),
        price: Number(tier.price),
        id: product.pricing_tiers && product.pricing_tiers[index]
          ? product.pricing_tiers[index].id
          : index + 1
      }));

      const updatedProduct: Product = {
        ...product,
        name: name.trim(),
        description: description.trim(),
        category: category,
        stock: Number(stock),
        price: Number(basePrice),
        image_urls: uploadedImageUrls,
        pricing_tiers: formattedPricingTiers
      };

      await onSave(updatedProduct);
      
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrls(prev => [...prev, e.target!.result as string]);
          setImageFiles(prev => [...prev, file]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
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
  };

  const addPricingTier = () => {
    const lastTier = pricingTiers[pricingTiers.length - 1];
    const newMoq = lastTier ? Math.max(lastTier.moq + 10, 1) : 1;
    const autoPrice = Number(basePrice) || (lastTier?.price || 0);
    
    setPricingTiers(prev => [...prev, { moq: newMoq, price: autoPrice }]);
  };

  const removePricingTier = (index: number) => {
    if (pricingTiers.length <= 1) return;
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const updatePricingTier = (index: number, field: 'moq' | 'price', value: string) => {
    const updatedTiers = [...pricingTiers];
    const numValue = field === 'moq' ? parseInt(value, 10) || 0 : parseFloat(value) || 0;
    updatedTiers[index] = { ...updatedTiers[index], [field]: numValue };
    setPricingTiers(updatedTiers);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Update Product</h2>
                <p className="text-blue-100 text-sm">Editing: {product.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <div className="flex items-center space-x-2 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                  <span className="text-yellow-100 text-sm">Unsaved changes</span>
                </div>
              )}
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-0">
            {[
              { key: 'basic', label: 'Basic Info', icon: Package },
              { key: 'pricing', label: 'Pricing Tiers', icon: DollarSign },
              { key: 'images', label: 'Images', icon: ImageIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-200px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your product"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.stock}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      step="0.01"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.basePrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.basePrice && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.basePrice}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tiers Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Bulk Pricing Configuration</h3>
                  <p className="text-blue-700 text-sm">
                    Set different prices based on minimum order quantities (MOQ). Higher quantities can have better rates.
                  </p>
                </div>

                <div className="space-y-4">
                  {pricingTiers.map((tier, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Order Quantity
                        </label>
                        <input
                          type="number"
                          value={tier.moq}
                          onChange={(e) => updatePricingTier(index, 'moq', e.target.value)}
                          disabled={isSubmitting}
                          min="1"
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                            errors[`tier_${index}_moq`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`tier_${index}_moq`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`tier_${index}_moq`]}</p>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price per Unit (₹)
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updatePricingTier(index, 'price', e.target.value)}
                          disabled={isSubmitting}
                          min="0"
                          step="0.01"
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                            errors[`tier_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`tier_${index}_price`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`tier_${index}_price`]}</p>
                        )}
                      </div>
                      
                      {pricingTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePricingTier(index)}
                          disabled={isSubmitting}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addPricingTier}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 border border-blue-300 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Pricing Tier</span>
                </button>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Product Images</h3>
                  <p className="text-gray-600 text-sm">
                    Upload high-quality images of your product. The first image will be used as the main display image.
                  </p>
                </div>

                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting || uploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload Images
                    </button>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, WebP up to 10MB each. Maximum 6 images.
                    </p>
                  </div>
                </div>

                {/* Image Preview Grid */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {errors.images && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.images}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(product.created_at).toLocaleDateString()}
                </span>
                {hasChanges && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">You have unsaved changes</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    isSubmitting || !hasChanges
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductModal;