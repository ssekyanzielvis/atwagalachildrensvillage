'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Plus, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useNotification } from '@/lib/store';
import { generateBudgetPDF } from '@/utils/pdfGenerator';
import { Trash2, Download } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type Program = Database['public']['Tables']['programs']['Row'];

export default function ProgramsManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
    is_featured: false,
    start_date: '',
    end_date: '',
    budget: [] as { item: string; cost: number }[],
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await (supabase
        .from('programs') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      showNotification('Failed to load programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProgram) {
        const { error } = await (supabase
          .from('programs') as any)
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProgram.id);

        if (error) throw error;
        showNotification('Program updated successfully', 'success');
      } else {
        const { error } = await (supabase.from('programs') as any).insert(formData);

        if (error) throw error;
        showNotification('Program created successfully', 'success');
      }

      resetForm();
      fetchPrograms();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const { error } = await (supabase.from('programs') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Program deleted successfully', 'success');
      fetchPrograms();
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
      start_date: '',
      end_date: '',
      budget: [],
    });
    setEditingProgram(null);
    setIsModalOpen(false);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description || '',
      image_url: program.image_url || '',
      is_active: program.is_active,
      is_featured: program.is_featured,
      start_date: (program as any).start_date || '',
      end_date: (program as any).end_date || '',
      budget: (program as any).budget || [],
    });
    setIsModalOpen(true);
  };

  if (loading && programs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Programs Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add New Program
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <div key={program.id} className="bg-white border rounded-lg overflow-hidden">
            {program.image_url && (
              <img
                src={program.image_url}
                alt={program.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{program.title}</h3>
                <div className="flex gap-1">
                  {program.is_featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {program.is_active ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{program.description}</p>
              
              {((program as any).start_date || (program as any).end_date) && (
                <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded border">
                  <div><strong>Start:</strong> {(program as any).start_date || 'N/A'}</div>
                  <div><strong>End:</strong> {(program as any).end_date || 'N/A'}</div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(program)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
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
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Budget Draft Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Budget Draft (Optional)</h3>
                  <div className="flex gap-2">
                    {formData.budget.length > 0 && (
                      <button
                        type="button"
                        onClick={() => generateBudgetPDF(formData.title || 'Untitled', formData.budget)}
                        className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-medium"
                      >
                        <Download size={14} /> PDF
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: [...formData.budget, { item: '', cost: 0 }] })}
                      className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.budget.map((bItem, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Item description"
                          value={bItem.item}
                          onChange={(e) => {
                            const newBudget = [...formData.budget];
                            newBudget[index].item = e.target.value;
                            setFormData({ ...formData, budget: newBudget });
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          placeholder="Cost"
                          value={bItem.cost === 0 ? '' : bItem.cost}
                          onChange={(e) => {
                            const newBudget = [...formData.budget];
                            newBudget[index].cost = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, budget: newBudget });
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          min="0"
                          step="any"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newBudget = [...formData.budget];
                          newBudget.splice(index, 1);
                          setFormData({ ...formData, budget: newBudget });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {formData.budget.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No budget items added.</p>
                  )}

                  {formData.budget.length > 0 && (
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded mt-2 border">
                      <span className="font-bold">Total Estimated Cost:</span>
                      <span className="font-bold text-lg text-purple-700">
                        UGX {formData.budget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <FileUpload
                bucket="programs"
                currentUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                accept="both"
                label="Program Media (Image or Video)"
                maxSizeMB={10}
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
                  {loading ? 'Saving...' : editingProgram ? 'Update' : 'Create'}
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

