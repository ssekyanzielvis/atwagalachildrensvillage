'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OfficeHour {
  id: string;
  day_label: string;
  hours: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function OfficeHoursPage() {
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHour, setEditingHour] = useState<OfficeHour | null>(null);
  const [formData, setFormData] = useState({
    day_label: '',
    hours: '',
    is_active: true,
    display_order: 0,
  });
  const showNotification = useAppStore((state) => state.showNotification);

  useEffect(() => {
    fetchOfficeHours();
  }, []);

  const fetchOfficeHours = async () => {
    try {
      const { data, error } = await (supabase
        .from('office_hours') as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setOfficeHours(data || []);
    } catch (error: any) {
      showNotification('Failed to load office hours', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingHour) {
        const { error } = await (supabase
          .from('office_hours') as any)
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingHour.id);

        if (error) throw error;
        showNotification('Office hours updated successfully', 'success');
      } else {
        const { error } = await (supabase.from('office_hours') as any).insert(formData);

        if (error) throw error;
        showNotification('Office hours created successfully', 'success');
      }

      resetForm();
      fetchOfficeHours();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this office hour?')) return;

    try {
      const { error } = await (supabase.from('office_hours') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Office hours deleted successfully', 'success');
      fetchOfficeHours();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase
        .from('office_hours') as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      showNotification(`Office hours ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      fetchOfficeHours();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      day_label: '',
      hours: '',
      is_active: true,
      display_order: 0,
    });
    setEditingHour(null);
    setIsModalOpen(false);
  };

  const handleEdit = (hour: OfficeHour) => {
    setEditingHour(hour);
    setFormData({
      day_label: hour.day_label,
      hours: hour.hours,
      is_active: hour.is_active,
      display_order: hour.display_order,
    });
    setIsModalOpen(true);
  };

  if (loading && officeHours.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Office Hours</h1>
          <p className="text-gray-600 mt-1">Manage office hours displayed on contact page</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Office Hours
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day/Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {officeHours.map((hour) => (
              <tr key={hour.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{hour.day_label}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{hour.hours}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-600">{hour.display_order}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(hour.id, hour.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      hour.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {hour.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(hour)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(hour.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {officeHours.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No office hours added yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Office Hours" to create your first entry</p>
          </div>
        )}
      </div>

      {/* Preview Card */}
      {officeHours.filter(h => h.is_active).length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 max-w-md">
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Preview (Contact Page)
          </h3>
          <div className="space-y-1">
            {officeHours
              .filter(h => h.is_active)
              .map((hour) => (
                <p key={hour.id} className="text-gray-700">
                  {hour.day_label}: {hour.hours}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingHour ? 'Edit Office Hours' : 'Add Office Hours'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day/Period *
                </label>
                <input
                  type="text"
                  required
                  value={formData.day_label}
                  onChange={(e) => setFormData({ ...formData, day_label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Monday - Friday"
                />
                <p className="text-xs text-gray-500 mt-1">Can be a single day or range</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active (visible on contact page)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {editingHour ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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
