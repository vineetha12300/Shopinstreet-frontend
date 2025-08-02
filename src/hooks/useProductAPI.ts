import { useState, useEffect, useCallback } from 'react';
import { Product } from '../components/product/IProductTypes';
import axios from "axios";
import ImageUploadService from '../components/services/ImageUploadService';

// Define the API response interface
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Define the hook
export const useProductAPI = () => {
  const [products, setProducts] = useState<ApiResponse<Product[]>>({
    data: null,
    loading: false,
    error: null
  });

  const [singleProduct, setSingleProduct] = useState<ApiResponse<Product>>({
    data: null,
    loading: false,
    error: null
  });

  // API URL - Replace with your actual API endpoint
  const API_URL = 'http://localhost:8000/api';

  // Helper to get the auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  // 🚀 FIXED: Fetch all products (updated to get ALL products, not just 10)
  const fetchProducts = useCallback(async (page: number = 1, size: number = 1000) => {
    try {
      setProducts({ data: null, loading: true, error: null });
      
      console.log(`🔄 Fetching products: page=${page}, size=${size}`);
      
      // Use a large size to get all products, or use the provided parameters
      const response = await axios.get(`${API_URL}/products/mine?page=${page}&size=${size}`, {
        headers: getAuthHeaders()
      });
      
      console.log(`✅ Fetched ${response.data?.length || 0} products from API`);
      
      const result = { data: response.data, loading: false, error: null };
      setProducts(result);
      return result;
    } catch (error: any) {
      console.error("❌ Error fetching products:", error);
      const result = { data: null, loading: false, error: error };
      setProducts(result);
      return result;
    }
  }, []);

  // 🆕 NEW: Fetch products with specific pagination (for when you want to implement server-side pagination)
  const fetchProductsPaginated = useCallback(async (page: number = 1, size: number = 10) => {
    try {
      console.log(`🔄 Fetching paginated products: page=${page}, size=${size}`);
      
      const response = await axios.get(`${API_URL}/products/mine?page=${page}&size=${size}`, {
        headers: getAuthHeaders()
      });
      
      console.log(`✅ Fetched paginated: ${response.data?.length || 0} products`);
      
      // Handle different possible response structures
      const data = response.data.data || response.data;
      const total = response.data.total || (Array.isArray(response.data) ? response.data.length : 0);
      
      return {
        data: data,
        total: total,
        page: response.data.page || page,
        size: response.data.size || size,
        totalPages: response.data.totalPages || Math.ceil(total / size),
        loading: false,
        error: null
      };
    } catch (error: any) {
      console.error("❌ Error fetching paginated products:", error);
      return {
        data: [],
        total: 0,
        page: 1,
        size: size,
        totalPages: 0,
        loading: false,
        error: error
      };
    }
  }, []);

  // Fetch a single product
  const fetchProductById = useCallback(async (id: number) => {
    try {
      setSingleProduct({ data: null, loading: true, error: null });
      
      const response = await axios.get(`${API_URL}/products/${id}`, {
        headers: getAuthHeaders()
      });
      
      const result = { data: response.data, loading: false, error: null };
      setSingleProduct(result);
      return result;
    } catch (error: any) {
      const result = { data: null, loading: false, error: error };
      setSingleProduct(result);
      return result;
    }
  }, []);

  // Create a new product
  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at'>) => {
    // Extract processing type from product object (with fallback)
    const processingType = (product as any).processing_type || 'enhanced';
    try {
      // Filter out any data URLs from image_urls - these should have been uploaded separately
      const validImageUrls = product.image_urls.filter(url => 
        !url.startsWith('data:') && url !== '/api/placeholder/200/200'
      );
      console.log("Valid image URLs:", product.image_urls);
      console.log("Processing type:", processingType);
      
      // Make sure pricing tiers have proper numeric values
      const formattedPricingTiers = product.pricing_tiers.map(tier => ({
        moq: Number(tier.moq),
        price: Number(tier.price)
      }));
      
      // Prepare the payload according to API requirements
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('category', product.category);
      formData.append('stock', String(product.stock));
      formData.append('price', String(product.price));

      // Append pricing tiers as a JSON string
      formData.append('pricing_tiers', JSON.stringify(formattedPricingTiers));
      
      // Add processing type to form data
      formData.append('processing_type', processingType);

      // Append valid image URLs
      product.image_urls.forEach((url) => {
        if (url.startsWith('data:')) {
          const binary = atob(url.split(',')[1]);
          const array = [];
          for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
          }
          const blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
          formData.append('images', blob, `image_${Date.now()}.jpg`);
        }
      });
      
      console.log("Sending product FormData to API with processing_type:", processingType);

      const response = await axios.post(`${API_URL}/products/`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating product:", error);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        
        if (error.response.data && error.response.data.detail) {
          console.error("API error details:", error.response.data.detail);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: number, product: Partial<Product>) => {
    try {
      console.log("🔄 Updating product with ID:", id);
      console.log("📊 Product data received:", product);
      
      // Extract processing type from product
      const processingType = (product as any).processing_type || 'enhanced';
      console.log("🔧 Processing type for update:", processingType);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      let updatedProduct = null;

      // 1. UPDATE PRODUCT DETAILS FIRST
      const hasDetailsToUpdate = product.name !== undefined || 
                                 product.description !== undefined || 
                                 product.category !== undefined || 
                                 product.stock !== undefined || 
                                 product.price !== undefined || 
                                 product.pricing_tiers !== undefined;

      if (hasDetailsToUpdate) {
        console.log("📝 Updating product details...");
        
        const detailsFormData = new FormData();
        
        if (product.name !== undefined && product.name !== null) {
          detailsFormData.append('name', String(product.name).trim());
        }
        if (product.description !== undefined && product.description !== null) {
          detailsFormData.append('description', String(product.description).trim());
        }
        if (product.category !== undefined && product.category !== null) {
          detailsFormData.append('category', String(product.category));
        }
        if (product.stock !== undefined && product.stock !== null) {
          detailsFormData.append('stock', String(parseInt(String(product.stock), 10)));
        }
        if (product.price !== undefined && product.price !== null) {
          detailsFormData.append('price', String(parseFloat(String(product.price))));
        }
        
        if (product.pricing_tiers !== undefined && product.pricing_tiers !== null) {
          const formattedPricingTiers = product.pricing_tiers.map(tier => ({
            moq: parseInt(String(tier.moq), 10),
            price: parseFloat(String(tier.price))
          }));
          detailsFormData.append('pricing_tiers', JSON.stringify(formattedPricingTiers));
        }

        const detailsResponse = await axios.patch(`${API_URL}/products/${id}/details`, detailsFormData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        updatedProduct = detailsResponse.data;
        console.log("✅ Details updated successfully");
      }

      // 2. HANDLE IMAGES - Only if image_urls is provided
      if (product.image_urls !== undefined) {
        console.log("🖼️ Processing image updates...");
        console.log("📊 Received image URLs:", product.image_urls);
        
        // Separate new images (data URLs) from existing images
        const newImageDataUrls = product.image_urls.filter(url => url && url.startsWith('data:'));
        const existingImageUrls = product.image_urls.filter(url => 
          url && 
          !url.startsWith('data:') && 
          url !== '/api/placeholder/200/200'
        );
        
        console.log("📤 New images to upload:", newImageDataUrls.length);
        console.log("📁 Existing images to keep:", existingImageUrls.length);
        console.log("🔢 Total images after changes:", existingImageUrls.length + newImageDataUrls.length);
        
        // Check if we have any images at all
        const totalImages = existingImageUrls.length + newImageDataUrls.length;
        
        if (totalImages === 0) {
          console.log("🗑️ All images were deleted - cannot proceed (at least 1 image required)");
          throw new Error("At least one image is required. Please add an image before saving.");
        }
        
        // Only update images if we have changes
        const currentImageCount = updatedProduct?.image_urls?.length || 0;
        const hasChanges = newImageDataUrls.length > 0 || existingImageUrls.length !== currentImageCount;
        
        if (hasChanges) {
          console.log("🔄 Image changes detected, updating...");
          console.log("🔧 Using processing type:", processingType);
          
          // Create FormData for the image update
          const imagesFormData = new FormData();
          
          // Add processing type to form data
          imagesFormData.append('processing_type', processingType);
          
          // Handle new image uploads
          if (newImageDataUrls.length > 0) {
            console.log(`📤 Converting ${newImageDataUrls.length} data URLs to files...`);
            
            const files: File[] = [];
            for (let i = 0; i < newImageDataUrls.length; i++) {
              const dataUrl = newImageDataUrls[i];
              try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], `new_image_${i}.jpg`, { type: 'image/jpeg' });
                files.push(file);
              } catch (error) {
                console.error("Error converting data URL to file:", error);
              }
            }
            
            // Add files to FormData
            files.forEach((file, index) => {
              imagesFormData.append('images', file, `new_image_${index}.jpg`);
            });
            
            console.log(`✅ Prepared ${files.length} files for upload with processing type: ${processingType}`);
          } else {
            // No new files, but we still need to send something for the endpoint
            const dummyFile = new File([''], 'dummy.txt', { type: 'text/plain' });
            imagesFormData.append('images', dummyFile);
            console.log("📝 No new files, sending dummy file");
          }
          
          // Always send existing images list (even if empty)
          imagesFormData.append('existing_images', JSON.stringify(existingImageUrls));
          
          console.log("📤 Sending to backend:", {
            newFiles: newImageDataUrls.length,
            existingImages: existingImageUrls.length,
            totalFinalImages: totalImages,
            processingType: processingType
          });
          
          try {
            const imagesResponse = await axios.post(`${API_URL}/products/${id}/images`, imagesFormData, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            updatedProduct = {
              ...updatedProduct,
              ...imagesResponse.data
            };
            
            console.log("✅ Images updated successfully with processing type:", processingType);
            console.log("📊 Final image count:", imagesResponse.data.image_urls?.length || 0);
            
          } catch (error: any) {
            console.error("❌ Image update failed:", error);
            if (error.response?.data?.detail) {
              console.error("🚨 Server error:", error.response.data.detail);
            }
            throw new Error(`Image update failed: ${error.response?.data?.detail || error.message}`);
          }
          
        } else {
          console.log("ℹ️ No image changes detected");
        }
      }

      // 3. If nothing was updated, fetch current product
      if (!updatedProduct) {
        console.log("ℹ️ No updates made, fetching current product...");
        const currentResponse = await axios.get(`${API_URL}/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        updatedProduct = currentResponse.data;
      }

      console.log("🎉 Final updated product:", updatedProduct);
      return updatedProduct;

    } catch (error: any) {
      console.error("❌ Error updating product:", error);
      
      if (error.response) {
        console.error("Update error details:", {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url
        });
        
        if (error.response.data?.detail) {
          console.error("🚨 Server error message:", error.response.data.detail);
        }
      }
      
      throw error;
    }
  }, []);

  // Delete a product
  const deleteProduct = useCallback(async (id: number) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: getAuthHeaders()
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }, []);

  return {
    products,
    singleProduct,
    fetchProducts, // 🚀 Now supports optional page and size parameters
    fetchProductsPaginated, // 🆕 NEW: For server-side pagination
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
  };
};