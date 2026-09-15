'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, QrCode } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MerchantCode {
  id: string;
  provider_name: string;
  merchant_code: string;
  account_name: string;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function MerchantCodesPage() {
  const [merchantCodes, setMerchantCodes] = useState<MerchantCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<MerchantCode | null>(null);
  const [formData, setFormData] = useState({
    provider_name: '',
    merchant_code: '',
    account_name: '',
    instructions: '',
    is_active: true,
    display_order: 0,
  });
  const showNotification = useAppStore((state) => state.showNotification);

  useEffect(() => {
    fetchMerchantCodes();
  }, []);

  const fetchMerchantCodes = async () => {
    try {
      const { data, error } = await (supabase
        .from('merchant_codes') as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setMerchantCodes(data || []);
    } catch (error: any) {
      showNotification('Failed to load merchant codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCode) {
        const { error } = await (supabase
          .from('merchant_codes') as any)
          .update({
            ...formData,
            instructions: formData.instructions || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCode.id);

        if (error) throw error;
        showNotification('Merchant code updated successfully', 'success');
      } else {
        const { error } = await (supabase.from('merchant_codes') as any).insert({
          ...formData,
          instructions: formData.instructions || null,
        });

        if (error) throw error;
        showNotification('Merchant code created successfully', 'success');
      }

      resetForm();
      fetchMerchantCodes();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this merchant code?')) return;

    try {
      const { error } = await (supabase.from('merchant_codes') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Merchant code deleted successfully', 'success');
      fetchMerchantCodes();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase
        .from('merchant_codes') as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      showNotification(`Merchant code ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      fetchMerchantCodes();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      provider_name: '',
      merchant_code: '',
      account_name: '',
      instructions: '',
      is_active: true,
      display_order: 0,
    });
    setEditingCode(null);
    setIsModalOpen(false);
  };

  const handleEdit = (code: MerchantCode) => {
    setEditingCode(code);
    setFormData({
      provider_name: code.provider_name,
      merchant_code: code.merchant_code,
      account_name: code.account_name,
      instructions: code.instructions || '',
      is_active: code.is_active,
      display_order: code.display_order,
    });
    setIsModalOpen(true);
  };

  if (loading && merchantCodes.length === 0) {
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
          <h1 className="text-3xl font-bold">Merchant Codes</h1>
          <p className="text-gray-600 mt-1">Manage merchant payment codes for donors</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Merchant Code
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Merchant codes allow donors to pay by entering a short code on their mobile money app
          (e.g. MTN MoMo Pay, Airtel Pay). Active codes will appear on the Donate page under the
          &quot;Pay via Merchant Code&quot; option.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Merchant Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Name
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
            {merchantCodes.map((code) => (
              <tr key={code.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{code.provider_name}</div>
                  {code.instructions && (
                    <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">
                      {code.instructions}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-blue-700 text-lg">{code.merchant_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-700">{code.account_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-600">{code.display_order}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(code.id, code.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      code.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {code.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(code)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
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
        </div>

        {merchantCodes.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No merchant codes added yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click &quot;Add Merchant Code&quot; to get started
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingCode ? 'Edit Merchant Code' : 'Add Merchant Code'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. MTN MoMo Pay"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.merchant_code}
                  onChange={(e) => setFormData({ ...formData, merchant_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 123456"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The code donors will enter on their mobile money app
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ATWAGALA CHILDREN'S VILLAGE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions (Optional)
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Dial *165*3# → Select Pay Merchant → Enter code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
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
                  Active (visible on donation page)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {editingCode ? 'Update' : 'Create'}
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

