import axios from 'axios';

export interface UploadResponse {
  url: string;
  success: boolean;
  message?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  uploadedImages: UploadResponse[];
  message?: string;
}

class ImageUploadService {
  private static instance: ImageUploadService;
  private readonly API_URL = 'http://localhost:8000/api';

  private constructor() {}

  public static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Upload images for an EXISTING product using the dedicated images endpoint
   * This is the cleanest approach for your modular architecture
   * @param productId The ID of the existing product
   * @param files Array of image files to upload
   * @param onProgress Optional callback for upload progress
   * @returns Promise with upload response
   */
  public async uploadImagesForProduct(
    productId: number,
    files: File[],
    onProgress?: (percentage: number) => void
  ): Promise<BulkUploadResponse> {
    try {
      console.log(`🔄 Uploading ${files.length} images for product ${productId}`);
      
      if (files.length === 0) {
        return {
          success: false,
          uploadedImages: [],
          message: 'No files provided'
        };
      }

      // Create FormData with the image files
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file, `product_${productId}_image_${index}_${Date.now()}.jpg`);
      });

      // Simulate progress updates
      if (onProgress) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          onProgress(Math.min(progress, 90)); // Don't go to 100% until upload is done
          if (progress >= 90) {
            clearInterval(interval);
          }
        }, 100);
      }

      // Upload to the dedicated images endpoint
      const response = await axios.post(
        `${this.API_URL}/products/${productId}/images`, 
        formData, 
        {
          headers: this.getAuthHeaders()
        }
      );

      // Complete progress
      if (onProgress) {
        onProgress(100);
      }

      // Extract image URLs from response
      const imageUrls = response.data.image_urls || [];
      
      console.log(`✅ Successfully uploaded ${imageUrls.length} images`);

      return {
        success: true,
        uploadedImages: imageUrls.map((url: string) => ({
          url,
          success: true
        })),
        message: `Successfully uploaded ${imageUrls.length} images`
      };

    } catch (error: any) {
      console.error('Error uploading images for product:', error);
      
      if (onProgress) {
        onProgress(0); // Reset progress on error
      }

      return {
        success: false,
        uploadedImages: files.map(() => ({
          url: '',
          success: false,
          message: error.response?.data?.detail || 'Upload failed'
        })),
        message: error.response?.data?.detail || 'Failed to upload images'
      };
    }
  }

  /**
   * Upload a single image file for an existing product
   * @param productId The ID of the existing product
   * @param file The image file to upload
   * @param onProgress Optional callback for upload progress
   * @returns Promise with upload response
   */
  public async uploadImageForProduct(
    productId: number,
    file: File, 
    onProgress?: (percentage: number) => void
  ): Promise<UploadResponse> {
    const result = await this.uploadImagesForProduct(productId, [file], onProgress);
    
    if (result.success && result.uploadedImages.length > 0) {
      return result.uploadedImages[0];
    } else {
      return {
        url: '',
        success: false,
        message: result.message || 'Upload failed'
      };
    }
  }

  /**
   * For NEW products: Convert files to data URLs for temporary preview
   * These will be uploaded when the product is created
   * @param files Array of files to convert
   * @returns Promise with array of data URLs
   */
  public async convertFilesToDataUrls(files: File[]): Promise<UploadResponse[]> {
    try {
      console.log(`🔄 Converting ${files.length} files to data URLs for preview`);
      
      const promises = files.map(async (file): Promise<UploadResponse> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve({
                url: event.target.result as string,
                success: true
              });
            } else {
              resolve({
                url: '',
                success: false,
                message: 'Failed to read file'
              });
            }
          };
          reader.onerror = () => {
            resolve({
              url: '',
              success: false,
              message: 'Failed to read file'
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(promises);
      console.log(`✅ Converted ${results.filter(r => r.success).length} files to data URLs`);
      
      return results;
    } catch (error) {
      console.error('Error converting files to data URLs:', error);
      return files.map(() => ({
        url: '',
        success: false,
        message: 'Conversion failed'
      }));
    }
  }

  /**
   * Validate image files before upload
   * @param files Array of files to validate
   * @returns Object with validation result and errors
   */
  public validateImageFiles(files: File[]): { 
    isValid: boolean; 
    errors: string[]; 
    validFiles: File[] 
  } {
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

    return {
      isValid: errors.length === 0,
      errors,
      validFiles
    };
  }

  /**
   * Delete an image (placeholder for future implementation)
   * @param url URL of the image to delete
   * @returns Promise with delete operation status
   */
  public async deleteImage(url: string): Promise<{ success: boolean, message?: string }> {
    try {
      // TODO: Implement actual image deletion
      // This would require extracting the S3 key from the URL and calling a delete endpoint
      console.log('🗑️ Image deletion not implemented yet:', url);
      
      return { 
        success: true, 
        message: 'Image deletion not implemented yet' 
      };
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return { 
        success: false, 
        message: error.message || 'Delete failed' 
      };
    }
  }
}

export default ImageUploadService;