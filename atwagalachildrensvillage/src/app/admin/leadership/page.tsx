'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Plus, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useNotification } from '@/lib/store';

type Leader = Database['public']['Tables']['leadership']['Row'];

export default function LeadershipManagement() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    achievement: '',
    image_url: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('leadership')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLeaders(data || []);
    } catch (error: any) {
      showNotification('Failed to load leaders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingLeader) {
        const { error } = await (supabase
          .from('leadership') as any)
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLeader.id);

        if (error) throw error;
        showNotification('Leader updated successfully', 'success');
      } else {
        const maxOrder = leaders.length > 0 ? Math.max(...leaders.map((l) => l.order_index)) : 0;
        const { error } = await (supabase.from('leadership') as any).insert({
          ...formData,
          order_index: maxOrder + 1,
        });

        if (error) throw error;
        showNotification('Leader created successfully', 'success');
      }

      resetForm();
      fetchLeaders();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leader?')) return;

    try {
      const { error } = await (supabase.from('leadership') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Leader deleted successfully', 'success');
      fetchLeaders();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      title: '',
      achievement: '',
      image_url: '',
      is_active: true,
      is_featured: false,
    });
    setEditingLeader(null);
    setIsModalOpen(false);
  };

  const openEditModal = (leader: Leader) => {
    setEditingLeader(leader);
    setFormData({
      full_name: leader.full_name,
      title: leader.title,
      achievement: leader.achievement || '',
      image_url: leader.image_url || '',
      is_active: leader.is_active,
      is_featured: leader.is_featured,
    });
    setIsModalOpen(true);
  };

  if (loading && leaders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leadership Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Leader
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leaders.map((leader) => (
          <div key={leader.id} className="bg-white border rounded-lg overflow-hidden">
            {leader.image_url && (
              <img src={leader.image_url} alt={leader.full_name} className="w-full h-64 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{leader.full_name}</h3>
                  <p className="text-sm text-blue-600">{leader.title}</p>
                </div>
                <div className="flex gap-1">
                  {leader.is_featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {leader.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{leader.achievement}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(leader)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(leader.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm"
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
              {editingLeader ? 'Edit Leader' : 'Add Leader'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name*</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Achievement</label>
                <textarea
                  value={formData.achievement}
                  onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                />
              </div>
              <FileUpload
                bucket="leadership"
                currentUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                accept="image"
                label="Profile Image"
                maxSizeMB={5}
              />
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
                  {loading ? 'Saving...' : editingLeader ? 'Update' : 'Create'}
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

