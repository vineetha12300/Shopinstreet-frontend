import { Product } from "../product/IProductTypes";

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      console.log("API Service: Creating product with data:", product);
      
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Create FormData since your backend expects file uploads
      const formData = new FormData();
      
      // Add all required text fields
      formData.append('name', String(product.name || '').trim());
      formData.append('description', String(product.description || '').trim());
      formData.append('category', String(product.category || ''));
      formData.append('stock', String(parseInt(String(product.stock || 0), 10)));
      formData.append('price', String(parseFloat(String(product.price || 0))));
      
      // Add pricing tiers as JSON string
      if (product.pricing_tiers && product.pricing_tiers.length > 0) {
        const formattedTiers = product.pricing_tiers.map(tier => ({
          moq: parseInt(String(tier.moq), 10),
          price: parseFloat(String(tier.price))
        }));
        formData.append('pricing_tiers', JSON.stringify(formattedTiers));
      } else {
        // Default pricing tier
        formData.append('pricing_tiers', JSON.stringify([{
          moq: 1, 
          price: parseFloat(String(product.price || 0))
        }]));
      }
      
      // Handle images - convert data URLs to files (this is the key fix!)
      let imageCount = 0;
      if (product.image_urls && product.image_urls.length > 0) {
        for (const url of product.image_urls) {
          if (url && url.startsWith('data:')) {
            try {
              // Convert data URL to blob then to file
              const response = await fetch(url);
              const blob = await response.blob();
              // Create a File object from the blob
              const file = new File([blob], `product_image_${imageCount}.jpg`, { 
                type: 'image/jpeg' 
              });
              formData.append('images', file);
              imageCount++;
            } catch (error) {
              console.error("Error converting image:", error);
            }
          }
        }
      }
      
      // If no images were processed, create a placeholder
      if (imageCount === 0) {
        try {
          // Create a simple placeholder image
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw a simple placeholder
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 300, 300);
            ctx.fillStyle = '#6c757d';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Product Image', 150, 140);
            ctx.fillText('Coming Soon', 150, 170);
          }
          
          // Convert to blob and create file
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/png');
          });
          
          const file = new File([blob], 'placeholder.png', { type: 'image/png' });
          formData.append('images', file);
        } catch (error) {
          console.error("Error creating placeholder image:", error);
        }
      }
      
      // Log what we're sending (for debugging)
      console.log("API Service: Sending FormData with fields:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(key, value);
        }
      }
      
      const response = await fetch("http://localhost:8000/api/products/", {
        method: 'POST',
        headers: { 
          // DO NOT set Content-Type for FormData - let browser set it with boundary
          'Authorization': `Bearer ${token}` 
        },
        body: formData // Send FormData, not JSON
      });
      
      console.log("API Service: Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Service: Error response:", errorData);
        
        let errorMessage = 'Failed to create product';
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.detail) {
            if (Array.isArray(parsedError.detail)) {
              errorMessage = parsedError.detail.map((err: any) => {
                if (typeof err === 'object' && err.msg) {
                  return `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`;
                }
                return String(err);
              }).join(', ');
            } else {
              errorMessage = String(parsedError.detail);
            }
          }
        } catch (parseError) {
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("API Service: Success response:", result);
      return result;
      
    } catch (error: any) {
      console.error("API Service: Error creating product:", error);
      
      // Re-throw with more specific error message
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Network error or server unavailable');
      }
    }
  }

// Update product function - might need different approach for updates
export const updateProduct = async (id: number, product: Partial<Product>) => {
    try {
      console.log("API Service: Updating product", id, "with data:", product);
      
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // For updates, try JSON first (check if your backend supports this for updates)
      const payload: any = {};
      
      if (product.name !== undefined) payload.name = String(product.name).trim();
      if (product.description !== undefined) payload.description = String(product.description).trim();
      if (product.category !== undefined) payload.category = String(product.category);
      if (product.stock !== undefined) payload.stock = parseInt(String(product.stock), 10);
      if (product.price !== undefined) payload.price = parseFloat(String(product.price));
      
      // For updates, check what your backend expects - might be 'images' instead of 'image_urls'
      if (product.image_urls !== undefined) {
        const validUrls = product.image_urls.filter(url => 
          url && 
          !url.startsWith('data:') && 
          url !== '/api/placeholder/200/200' &&
          url.trim() !== ''
        );
        
        // Try both field names - adjust based on your backend
        payload.image_urls = validUrls;
        // payload.images = validUrls; // Use this instead if your backend expects 'images'
      }
      
      if (product.pricing_tiers !== undefined) {
        payload.pricing_tiers = product.pricing_tiers.map(tier => ({
          id: tier.id,
          moq: parseInt(String(tier.moq), 10),
          price: parseFloat(String(tier.price))
        }));
      }
      
      console.log("API Service: Update payload:", JSON.stringify(payload, null, 2));
      
      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Service: Update error response:", errorData);
        
        let errorMessage = 'Failed to update product';
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.detail) {
            if (Array.isArray(parsedError.detail)) {
              errorMessage = parsedError.detail.map((err: any) => {
                if (typeof err === 'object' && err.msg) {
                  return `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`;
                }
                return String(err);
              }).join(', ');
            } else {
              errorMessage = String(parsedError.detail);
            }
          }
        } catch (parseError) {
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("API Service: Update success response:", result);
      return result;
      
    } catch (error: any) {
      console.error("API Service: Error updating product:", error);
      throw error;
    }
}