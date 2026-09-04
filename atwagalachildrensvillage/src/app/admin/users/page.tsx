'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useNotification } from '@/lib/store';

type Admin = Database['public']['Tables']['admins']['Row'];

export default function UsersManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    image_url: '',
    password: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await (supabase
        .from('admins') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error: any) {
      showNotification('Failed to load admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingId(admin.id);
    setFormData({
      full_name: admin.full_name,
      email: admin.email,
      phone_number: admin.phone_number || '',
      image_url: admin.image_url || '',
      password: '', // Leave empty, only update if provided
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update existing admin
        const updateData: any = {
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        };

        // Only update password if provided
        if (formData.password) {
          const encoder = new TextEncoder();
          const data = encoder.encode(formData.password);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          updateData.password_hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        }

        const { error } = await (supabase
          .from('admins') as any)
          .update(updateData)
          .eq('id', editingId);

        if (error) throw error;
        showNotification('Admin updated successfully', 'success');
      } else {
        // Create new admin
        const encoder = new TextEncoder();
        const data = encoder.encode(formData.password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const password_hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        const { error } = await (supabase.from('admins') as any).insert({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          image_url: formData.image_url || null,
          password_hash,
          is_active: true,
        });

        if (error) throw error;
        showNotification('Admin created successfully', 'success');
      }
      
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase
        .from('admins') as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      showNotification(`Admin ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      fetchAdmins();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.'))
      return;

    try {
      const { error } = await (supabase.from('admins') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Admin deleted successfully', 'success');
      fetchAdmins();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      image_url: '',
      password: '',
    });
    setIsModalOpen(false);
  };

  if (loading && admins.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage admin users and their access</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add New Admin
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-white border rounded-lg p-6">
            <div className="flex items-start gap-4">
              {admin.image_url ? (
                <img
                  src={admin.image_url}
                  alt={admin.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {admin.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{admin.full_name}</h3>
                <p className="text-sm text-gray-600">{admin.email}</p>
                {admin.phone_number && (
                  <p className="text-sm text-gray-600">{admin.phone_number}</p>
                )}
                <div className="mt-2">
                  {admin.is_active ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      <Eye className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      <EyeOff className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(admin)}
                className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 text-sm flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(admin.id, admin.is_active)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 text-sm"
              >
                {admin.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(admin.id)}
                className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Admin' : 'Add New Admin'}
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
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <FileUpload
                bucket="admin-profiles"
                currentUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                accept="image"
                label="Profile Image"
                maxSizeMB={2}
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password{editingId ? '' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required={!editingId}
                  minLength={6}
                  placeholder={editingId ? 'Leave blank to keep current password' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingId ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Admin' : 'Create Admin')}
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

