'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Download, Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification } from '@/lib/store';
import { downloadCSV } from '@/lib/utils';

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await (supabase
        .from('contact_submissions') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      showNotification('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await (supabase.from('contact_submissions') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Submission deleted successfully', 'success');
      fetchSubmissions();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleExportCSV = () => {
    const csvData = submissions.map((s) => ({
      'Full Name': s.full_name,
      Email: s.email,
      Phone: s.phone_number,
      Gender: s.gender || '',
      Residence: s.residence || '',
      Message: s.message,
      'Submitted At': new Date(s.created_at).toLocaleString(),
    }));

    downloadCSV(csvData, 'contact-submissions.csv');
    showNotification('CSV downloaded successfully', 'success');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Submissions</h1>
        <button
          onClick={handleExportCSV}
          disabled={submissions.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Residence
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{submission.full_name}</td>
                  <td className="px-4 py-3 text-sm">{submission.email}</td>
                  <td className="px-4 py-3 text-sm">{submission.phone_number}</td>
                  <td className="px-4 py-3 text-sm">{submission.gender || '-'}</td>
                  <td className="px-4 py-3 text-sm">{submission.residence || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Submission Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{selectedSubmission.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedSubmission.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{selectedSubmission.phone_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-900">{selectedSubmission.gender || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Residence</label>
                <p className="text-gray-900">{selectedSubmission.residence || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Submitted</label>
                <p className="text-gray-900">
                  {new Date(selectedSubmission.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="mt-6 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

