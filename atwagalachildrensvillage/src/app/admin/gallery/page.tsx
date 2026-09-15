'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Plus, Eye, EyeOff, Trash2, Edit2, Upload, X, ImageIcon, CheckSquare, Square } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification } from '@/lib/store';

interface GalleryItem {
  id: string;
  image_url: string;
  description: string | null;
  category: string | null;
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    image_url: '',
    description: '',
    category: '',
    is_active: true,
    is_featured: false,
    order_index: 0,
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data, error } = await (supabase
        .from('gallery') as any)
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setGallery(data || []);
    } catch (error: any) {
      showNotification('Failed to load gallery', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ----- Multi-image upload -----
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // If editing a single item, just use first file
    if (editingItem) {
      await uploadSingleFile(files[0]);
      return;
    }

    // Multi-upload: upload all files then insert rows
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 20) {
        showNotification(`${file.name} is too large (max 20MB), skipping.`, 'error');
        setUploadProgress({ done: i + 1, total: files.length });
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      } catch (err: any) {
        showNotification(`Failed to upload ${file.name}: ${err.message}`, 'error');
      }
      setUploadProgress({ done: i + 1, total: files.length });
    }

    if (uploadedUrls.length > 0) {
      // Insert all uploaded images as separate gallery rows
      const rows = uploadedUrls.map((url, idx) => ({
        image_url: url,
        description: '',
        category: '',
        is_active: true,
        is_featured: false,
        order_index: gallery.length + idx,
      }));

      const { error: insertError } = await (supabase.from('gallery') as any).insert(rows);
      if (insertError) {
        showNotification('Uploaded images but failed to save to gallery: ' + insertError.message, 'error');
      } else {
        showNotification(`Successfully added ${uploadedUrls.length} image(s) to gallery!`, 'success');
        fetchGallery();
      }
    }

    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Single file upload for edit modal
  const uploadSingleFile = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      showNotification('Image uploaded!', 'success');
    } catch (err: any) {
      showNotification('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // ----- Edit / Update -----
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    try {
      const { error } = await (supabase.from('gallery') as any)
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingItem.id);

      if (error) throw error;
      showNotification('Gallery item updated', 'success');
      resetForm();
      fetchGallery();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image from gallery?')) return;
    try {
      const { error } = await (supabase.from('gallery') as any).delete().eq('id', id);
      if (error) throw error;
      showNotification('Image deleted', 'success');
      fetchGallery();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await (supabase.from('gallery') as any)
        .update({ is_active: !current })
        .eq('id', id);
      if (error) throw error;
      fetchGallery();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({ image_url: '', description: '', category: '', is_active: true, is_featured: false, order_index: 0 });
    setEditingItem(null);
    setIsModalOpen(false);
    setPreviews([]);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      image_url: item.image_url,
      description: item.description || '',
      category: item.category || '',
      is_active: item.is_active,
      is_featured: item.is_featured,
      order_index: item.order_index,
    });
    setIsModalOpen(true);
  };

  if (loading && gallery.length === 0) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
          <p className="text-gray-500 text-sm mt-1">{gallery.length} image(s) in gallery</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </div>

      {/* Hidden multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Upload progress bar */}
      {uploadProgress && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between text-sm text-blue-800 mb-2">
            <span>Uploading images...</span>
            <span>{uploadProgress.done} / {uploadProgress.total}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Info box when empty */}
      {gallery.length === 0 && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500">No images yet</p>
          <p className="text-gray-400 mt-2">Click here or the "Upload Images" button to add photos</p>
          <p className="text-sm text-gray-400 mt-1">You can select multiple images at once</p>
        </div>
      )}

      {/* Gallery grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={item.image_url}
                alt={item.description || 'Gallery image'}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                {item.is_featured && (
                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-semibold">
                    Featured
                  </span>
                )}
                <button
                  onClick={() => handleToggleActive(item.id, item.is_active)}
                  title={item.is_active ? 'Click to hide' : 'Click to show'}
                >
                  {item.is_active ? (
                    <Eye className="w-5 h-5 text-white bg-green-600 rounded p-0.5" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-white bg-gray-500 rounded p-0.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-3">
              {item.description && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
              )}
              {item.category && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.category}</span>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg hover:bg-blue-100 text-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 py-1.5 rounded-lg hover:bg-red-100 text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Gallery Item</h2>
              <button onClick={resetForm}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Current image preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2 border" />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Click to replace image'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Caption or description for this image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Events, Children, Programs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active (visible)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
