'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Upload, X, FileVideo, Image as ImageIcon } from 'lucide-react';
import { useNotification } from '@/lib/store';

interface FileUploadProps {
  bucket: string;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  accept?: 'image' | 'video' | 'both';
  maxSizeMB?: number;
  label?: string;
}

export default function FileUpload({
  bucket,
  onUploadComplete,
  currentUrl = '',
  accept = 'both',
  maxSizeMB = 10,
  label = 'Upload File',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const getAcceptString = () => {
    if (accept === 'image') return 'image/*';
    if (accept === 'video') return 'video/*';
    return 'image/*,video/*';
  };

  const isValidFileType = (file: File): boolean => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name);

    if (accept === 'image') return isImage;
    if (accept === 'video') return isVideo;
    return isImage || isVideo;
  };

  const getFileType = (file: File): 'image' | 'video' | null => {
    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) return 'image';
    if (file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name)) return 'video';
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidFileType(file)) {
      showNotification(
        `Please upload a valid ${accept === 'both' ? 'image or video' : accept} file`,
        'error'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      showNotification(`File size must be less than ${maxSizeMB}MB`, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileType(getFileType(file));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
      showNotification('File uploaded successfully', 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = typeof error?.message === 'string'
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Failed to upload file';
      showNotification(errorMessage, 'error');
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setFileType(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {preview ? (
        <div className="relative inline-block">
          {fileType === 'video' || preview.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={preview}
              controls
              className="max-w-full h-40 rounded-lg border border-gray-300"
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-40 object-cover rounded-lg border border-gray-300"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            {accept === 'video' ? (
              <FileVideo className="w-12 h-12 text-gray-400" />
            ) : accept === 'image' ? (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : `Click to upload ${accept === 'both' ? 'image or video' : accept}`}
            </p>
            <p className="text-xs text-gray-500">Max size: {maxSizeMB}MB</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
        onChange={handleFileSelect}
        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
        className="hidden"
        style={{ display: 'none' }}
        disabled={uploading}
      />
    </div>
  );
}
