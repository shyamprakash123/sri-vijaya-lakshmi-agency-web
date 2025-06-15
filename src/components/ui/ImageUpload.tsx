import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cloudinaryService, CloudinaryUploadResponse } from  "../../lib/cloudinary"
import { useDialog } from '../../hooks/useDialog';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  existingImages?: string[];
  maxImages?: number;
  folder?: string;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadingImage {
  file: File;
  progress: number;
  preview: string;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  existingImages = [],
  maxImages = 5,
  folder = 'products',
  className = '',
  multiple = true,
  disabled = false
}) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useDialog();

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - existingImages.length - uploadingImages.length;
    
    if (fileArray.length > remainingSlots) {
      await showAlert(
        'Too Many Images',
        `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`,
        'warning'
      );
      return;
    }

    // Validate and prepare files for upload
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validation = cloudinaryService.validateImageFile(file);
      if (!validation.isValid) {
        await showAlert('Invalid File', validation.error!, 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create preview objects
    const newUploadingImages: UploadingImage[] = validFiles.map(file => ({
      file,
      progress: 0,
      preview: URL.createObjectURL(file)
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    // Upload files
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          // Compress image before upload
          const compressedFile = await cloudinaryService.compressImage(file);
          
          // Update progress
          setUploadingImages(prev => 
            prev.map((img, i) => 
              img.file === file ? { ...img, progress: 25 } : img
            )
          );

          // Upload to Cloudinary
          const result = await cloudinaryService.uploadImage(compressedFile, folder);
          
          // Update progress
          setUploadingImages(prev => 
            prev.map((img, i) => 
              img.file === file ? { ...img, progress: 100 } : img
            )
          );

          return result.secure_url;
        } catch (error) {
          console.error('Upload failed:', error);
          setUploadingImages(prev => 
            prev.map((img, i) => 
              img.file === file ? { ...img, error: 'Upload failed' } : img
            )
          );
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onUpload(uploadedUrls);

      // Clean up uploading state
      setTimeout(() => {
        setUploadingImages(prev => 
          prev.filter(img => !validFiles.includes(img.file))
        );
      }, 1000);

    } catch (error) {
      await showAlert(
        'Upload Failed',
        'Some images failed to upload. Please try again.',
        'error'
      );
    }
  }, [existingImages.length, uploadingImages.length, maxImages, folder, onUpload, showAlert]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleRemoveExisting = async (url: string) => {
    if (onRemove) {
      onRemove(url);
    }
  };

  const handleRemoveUploading = (file: File) => {
    setUploadingImages(prev => {
      const updated = prev.filter(img => img.file !== file);
      // Revoke object URL to prevent memory leaks
      const imgToRemove = prev.find(img => img.file === file);
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.preview);
      }
      return updated;
    });
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const canUploadMore = existingImages.length + uploadingImages.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop images here' : 'Upload Images'}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop images here, or click to select files
          </p>
          <p className="text-xs text-gray-500">
            Supports: JPEG, PNG, WebP • Max size: 10MB • Max {maxImages} images
          </p>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {!disabled && onRemove && (
                  <button
                    onClick={() => handleRemoveExisting(url)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading Images */}
      <AnimatePresence>
        {uploadingImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">Uploading...</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadingImages.map((uploadingImage, index) => (
                <motion.div
                  key={`${uploadingImage.file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={uploadingImage.preview}
                    alt="Uploading"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Progress Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    {uploadingImage.error ? (
                      <div className="text-center text-white">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs">Failed</p>
                      </div>
                    ) : uploadingImage.progress === 100 ? (
                      <div className="text-center text-white">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1"
                        >
                          ✓
                        </motion.div>
                        <p className="text-xs">Complete</p>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                        <p className="text-xs">{uploadingImage.progress}%</p>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveUploading(uploadingImage.file)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Count */}
      <div className="text-sm text-gray-500 text-center">
        {existingImages.length + uploadingImages.length} / {maxImages} images
      </div>
    </div>
  );
};

export default ImageUpload;