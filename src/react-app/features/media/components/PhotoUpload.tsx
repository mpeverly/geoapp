import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoUpload: (file: File, locationId?: number, stepId?: number) => Promise<boolean>;
  locationId?: number;
  stepId?: number;
  locationName?: string;
  className?: string;
}

export function PhotoUpload({ onPhotoUpload, locationId, stepId, locationName, className = '' }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadMessage('Please select an image file');
        setUploadStatus('error');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadMessage('File size must be less than 10MB');
        setUploadStatus('error');
        return;
      }

      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadMessage('');

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      const success = await onPhotoUpload(selectedFile, locationId, stepId);
      
      if (success) {
        setUploadStatus('success');
        setUploadMessage('Photo uploaded successfully!');
        // Clear the form after successful upload
        setTimeout(() => {
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadStatus('idle');
          setUploadMessage('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000);
      } else {
        setUploadStatus('error');
        setUploadMessage('Failed to upload photo. Please try again.');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Error uploading photo. Please try again.');
      console.error('Photo upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadStatus('idle');
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {locationName ? `Photo for ${locationName}` : 'Upload Photo'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Take a photo to prove you visited this location
        </p>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          id={`photo-upload-${locationId || stepId || 'default'}`}
        />

        {/* Upload Status */}
        {uploadStatus === 'success' && (
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{uploadMessage}</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{uploadMessage}</span>
          </div>
        )}

        {/* Photo Preview */}
        {previewUrl && (
          <div className="mb-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Photo preview"
                className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {!selectedFile ? (
            <label
              htmlFor={`photo-upload-${locationId || stepId || 'default'}`}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo</span>
            </label>
          ) : (
            <>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
              </button>
              <button
                onClick={handleRemovePhoto}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Uploading photo...</p>
          </div>
        )}
      </div>
    </div>
  );
}
