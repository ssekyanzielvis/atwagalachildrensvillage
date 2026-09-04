'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Plus, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useNotification } from '@/lib/store';

type GalleryItem = Database['public']['Tables']['gallery']['Row'];

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    media_url: '',
    media_type: 'image' as 'image' | 'video',
    description: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data, error } = await (supabase
        .from('gallery') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGallery(data || []);
    } catch (error: any) {
      showNotification('Failed to load gallery', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem) {
        const { error } = await (supabase
          .from('gallery') as any)
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        showNotification('Gallery item updated successfully', 'success');
      } else {
        const { error } = await (supabase.from('gallery') as any).insert(formData);

        if (error) throw error;
        showNotification('Gallery item created successfully', 'success');
      }

      resetForm();
      fetchGallery();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await (supabase.from('gallery') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Gallery item deleted successfully', 'success');
      fetchGallery();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      media_url: '',
      media_type: 'image',
      description: '',
      is_active: true,
      is_featured: false,
    });
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      media_url: item.media_url,
      media_type: item.media_type,
      description: item.description || '',
      is_active: item.is_active,
      is_featured: item.is_featured,
    });
    setIsModalOpen(true);
  };

  if (loading && gallery.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Image
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg overflow-hidden group">
            <div className="relative">
              {item.media_type === 'video' ? (
                <video src={item.media_url} controls className="w-full h-48 object-cover" />
              ) : (
                <img src={item.media_url} alt={item.description || 'Gallery'} className="w-full h-48 object-cover" />
              )}
              <div className="absolute top-2 right-2 flex gap-1">{item.is_featured && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Featured
                  </span>
                )}
                {item.is_active ? (
                  <Eye className="w-4 h-4 text-white bg-green-600 rounded p-0.5" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white bg-gray-600 rounded p-0.5" />
                )}
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg hover:bg-blue-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-red-50 text-red-600 py-1.5 rounded-lg hover:bg-red-100 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FileUpload
                bucket="gallery"
                currentUrl={formData.media_url}
                onUploadComplete={(url) => {
                  setFormData({ ...formData, media_url: url });
                  // Auto-detect media type from URL
                  const isVideo = url.match(/\.(mp4|webm|ogg|mov|avi)$/i);
                  if (isVideo) {
                    setFormData({ ...formData, media_url: url, media_type: 'video' });
                  } else {
                    setFormData({ ...formData, media_url: url, media_type: 'image' });
                  }
                }}
                accept="both"
                label="Media (Image or Video)"
                maxSizeMB={20}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
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

