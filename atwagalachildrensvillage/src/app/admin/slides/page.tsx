'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useNotification } from '@/lib/store';

type HelloSlide = Database['public']['Tables']['hello_slides']['Row'];

export default function SlidesManagement() {
  const [slides, setSlides] = useState<HelloSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HelloSlide | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    image_url: '',
    description: '',
    direction: 'left' as 'left' | 'right',
    is_active: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await (supabase
        .from('hello_slides') as any)
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error: any) {
      showNotification('Failed to load slides', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSlide) {
        const { error } = await (supabase
          .from('hello_slides') as any)
          .update({
            image_url: formData.image_url,
            description: formData.description,
            direction: formData.direction,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
        showNotification('Slide updated successfully', 'success');
      } else {
        const maxOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.order_index)) : 0;
        const { error } = await (supabase.from('hello_slides') as any).insert({
          image_url: formData.image_url,
          description: formData.description,
          direction: formData.direction,
          is_active: formData.is_active,
          order_index: maxOrder + 1,
        });

        if (error) throw error;
        showNotification('Slide created successfully', 'success');
      }

      resetForm();
      fetchSlides();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const { error } = await (supabase.from('hello_slides') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Slide deleted successfully', 'success');
      fetchSlides();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex((s) => s.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === slides.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedSlides = [...slides];
    [updatedSlides[currentIndex], updatedSlides[newIndex]] = [
      updatedSlides[newIndex],
      updatedSlides[currentIndex],
    ];

    try {
      const updates = updatedSlides.map((slide, idx) => ({
        id: slide.id,
        order_index: idx,
      }));

      for (const update of updates) {
        await (supabase
          .from('hello_slides') as any)
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      showNotification('Slides reordered successfully', 'success');
      fetchSlides();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      description: '',
      direction: 'left',
      is_active: true,
    });
    setEditingSlide(null);
    setIsModalOpen(false);
  };

  const openEditModal = (slide: HelloSlide) => {
    setEditingSlide(slide);
    setFormData({
      image_url: slide.image_url,
      description: slide.description || '',
      direction: slide.direction as 'left' | 'right',
      is_active: slide.is_active,
    });
    setIsModalOpen(true);
  };

  if (loading && slides.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hello Slides Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add New Slide
        </button>
      </div>

      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="bg-white border rounded-lg p-4 flex items-center gap-4"
          >
            <img
              src={slide.image_url}
              alt={slide.description || 'Slide'}
              className="w-32 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{slide.description || 'No description'}</p>
              <p className="text-sm text-gray-500">
                Direction: {slide.direction} | {slide.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReorder(slide.id, 'up')}
                disabled={index === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleReorder(slide.id, 'down')}
                disabled={index === slides.length - 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => openEditModal(slide)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(slide.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSlide ? 'Edit Slide' : 'Add New Slide'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FileUpload
                bucket="hello-slides"
                currentUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                accept="both"
                label="Slide Media (Image or Video)"
                maxSizeMB={10}
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
              <div>
                <label className="block text-sm font-medium mb-1">Scroll Direction</label>
                <select
                  value={formData.direction}
                  onChange={(e) =>
                    setFormData({ ...formData, direction: e.target.value as 'left' | 'right' })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="left">Left to Right</option>
                  <option value="right">Right to Left</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingSlide ? 'Update' : 'Create'}
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

