interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

interface CloudinaryError {
  message: string;
  name: string;
  http_code: number;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;
  private apiKey: string;

  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

    if (!this.cloudName || !this.uploadPreset) {
      console.warn('Cloudinary configuration missing. Please check your environment variables.');
    }
  }

  /**
   * Upload a single image to Cloudinary
   */
  async uploadImage(
    file: File,
    folder?: string,
    transformation?: string
  ): Promise<CloudinaryUploadResponse> {
    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary configuration is missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    if (folder) {
      formData.append('folder', folder);
    }

    if (transformation) {
      formData.append('transformation', transformation);
    }

    // Add tags for better organization
    formData.append('tags', 'vanisarees,product');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadMultipleImages(
    files: File[],
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResponse[]> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const result = await this.uploadImage(file, folder);
        if (onProgress) {
          onProgress(((index + 1) / files.length) * 100);
        }
        return result;
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!this.cloudName || !this.apiKey) {
      throw new Error('Cloudinary configuration is missing');
    }

    try {
      // Note: For security reasons, deletion should ideally be done from the backend
      // This is a simplified version for demonstration
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = await this.generateSignature(publicId, timestamp);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('signature', signature);
      formData.append('api_key', this.apiKey);
      formData.append('timestamp', timestamp.toString());

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    } = {}
  ): string {
    if (!this.cloudName) {
      return publicId; // Return original if no cloud name
    }

    const {
      width = 800,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    let transformation = `c_${crop},q_${quality},f_${format}`;
    
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicId}`;
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getOptimizedImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      quality: 'auto'
    });
  }

  /**
   * Generate signature for secure operations (simplified version)
   * In production, this should be done on the backend
   */
  private async generateSignature(publicId: string, timestamp: number): Promise<string> {
    // This is a simplified version. In production, signature generation
    // should be done on the backend for security reasons
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      throw new Error('API secret not configured');
    }

    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    
    // Simple hash function (in production, use proper crypto)
    let hash = 0;
    for (let i = 0; i < stringToSign.length; i++) {
      const char = stringToSign.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPEG, PNG, or WebP)'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size should be less than 10MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Compress image before upload
   */
  async compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
    const { default: imageCompression } = await import('browser-image-compression');
    
    const options = {
      maxSizeMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      return file; // Return original file if compression fails
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();

// Export types
export type { CloudinaryUploadResponse, CloudinaryError };