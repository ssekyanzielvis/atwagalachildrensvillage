'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Plus, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useNotification } from '@/lib/store';

type CoreValue = Database['public']['Tables']['core_values']['Row'];

export default function CoreValuesManagement() {
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<CoreValue | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchCoreValues();
  }, []);

  const fetchCoreValues = async () => {
    try {
      const { data, error } = await supabase
        .from('core_values')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCoreValues(data || []);
    } catch (error: any) {
      showNotification('Failed to load core values', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      showNotification('Please wait for image upload to complete', 'info');
      return;
    }
    setLoading(true);

    try {
      if (editingValue) {
        const { error } = await (supabase
          .from('core_values') as any)
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingValue.id);

        if (error) throw error;
        showNotification('Core value updated successfully', 'success');
      } else {
        const maxOrder = coreValues.length > 0 ? Math.max(...coreValues.map((v) => v.order_index || 0)) : 0;
        const { error } = await (supabase.from('core_values') as any).insert({
          ...formData,
          order_index: maxOrder + 1,
        });

        if (error) throw error;
        showNotification('Core value created successfully', 'success');
      }

      resetForm();
      fetchCoreValues();
    } catch (error: any) {
      showNotification(error.message || 'Failed to save core value', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this core value?')) return;

    try {
      const { error } = await (supabase.from('core_values') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Core value deleted successfully', 'success');
      fetchCoreValues();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      is_active: true,
      is_featured: false,
    });
    setEditingValue(null);
    setIsModalOpen(false);
  };

  const openEditModal = (value: CoreValue) => {
    setEditingValue(value);
    setFormData({
      title: value.title,
      description: value.description || '',
      image_url: value.image_url || '',
      is_active: value.is_active,
      is_featured: value.is_featured,
    });
    setIsModalOpen(true);
  };

  if (loading && coreValues.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Core Values Management</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Core Value
        </button>
      </div>

      {coreValues.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">No core values added yet.</p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add First Core Value
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coreValues.map((value) => (
          <div key={value.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow">
            {value.image_url && (
              <img src={value.image_url} alt={value.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{value.title}</h3>
                <div className="flex items-center gap-2">
                  {value.is_featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 font-medium px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                  {value.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{value.description}</p>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(value)}
                  className="flex-1 bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(value.id)}
                  className="flex-1 bg-red-50 text-red-600 font-medium py-2 rounded-lg hover:bg-red-100 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingValue ? 'Edit Core Value' : 'Add Core Value'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Compassion, Integrity"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={4}
                  placeholder="Describe this core value and what it means..."
                />
              </div>
              <FileUpload
                bucket="core-values"
                currentUrl={formData.image_url}
                onUploadComplete={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                onUploadingChange={setIsUploading}
                accept="image"
                label="Core Value Image"
                maxSizeMB={5}
              />
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isUploading ? 'Uploading image...' : loading ? 'Saving...' : editingValue ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
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

