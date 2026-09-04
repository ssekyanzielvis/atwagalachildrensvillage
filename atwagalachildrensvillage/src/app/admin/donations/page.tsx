'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Download, Eye, Trash2, Printer } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification } from '@/lib/store';
import { downloadCSV } from '@/lib/utils';

type Donation = Database['public']['Tables']['donations']['Row'];
type FooterInfo = Database['public']['Tables']['footer_info']['Row'];

export default function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDonations();
    fetchFooterInfo();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data, error } = await (supabase
        .from('donations') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error: any) {
      showNotification('Failed to load donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFooterInfo = async () => {
    try {
      const { data, error } = await (supabase.from('footer_info') as any).select('*').limit(1).single();

      if (error) throw error;
      setFooterInfo(data);
    } catch (error: any) {
      console.error('Failed to load footer info', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    try {
      const { error } = await (supabase.from('donations') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Donation deleted successfully', 'success');
      fetchDonations();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleExportCSV = () => {
    const csvData = donations.map((d) => ({
      'Receipt Number': d.receipt_number || d.payment_reference || `RCP-${new Date(d.created_at).toISOString().slice(0, 10).replace(/-/g, '')}-${d.id.slice(0, 5).toUpperCase()}`,
      'Donor Name': d.donor_name,
      Email: d.donor_email || '',
      Phone: d.donor_phone || '',
      Amount: d.amount,
      'Payment Method': d.payment_method,
      'Donated At': new Date(d.created_at).toLocaleString(),
    }));

    downloadCSV(csvData, 'donations.csv');
    showNotification('CSV downloaded successfully', 'success');
  };

  const handlePrintReceipt = (donation: Donation) => {
    // Generate receipt number if it doesn't exist
    const receiptNumber = donation.receipt_number || donation.payment_reference || `RCP-${new Date(donation.created_at).toISOString().slice(0, 10).replace(/-/g, '')}-${donation.id.slice(0, 5).toUpperCase()}`;
    
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Donation Receipt - ${receiptNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1E40AF;
              padding-bottom: 20px;
            }
            .header img {
              width: 80px;
              height: 80px;
              margin-bottom: 15px;
              object-fit: contain;
            }
            .header h1 {
              margin: 0;
              color: #1E40AF;
            }
            .details {
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
            }
            .amount {
              font-size: 24px;
              color: #1E40AF;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${window.location.origin}/logo.png" alt="Logo" />
            <h1>${footerInfo?.organization_name || 'Organization'}</h1>
            <p>${footerInfo?.location || ''}</p>
            <p>${footerInfo?.email || ''} | ${footerInfo?.phone || ''}</p>
          </div>
          
          <h2 style="text-align: center; color: #1E40AF;">DONATION RECEIPT</h2>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Receipt Number:</span>
              <span>${receiptNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${new Date(donation.created_at).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Donor Name:</span>
              <span>${donation.donor_name}</span>
            </div>
            ${
              donation.donor_email
                ? `<div class="detail-row">
              <span class="detail-label">Email:</span>
              <span>${donation.donor_email}</span>
            </div>`
                : ''
            }
            ${
              donation.donor_phone
                ? `<div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span>${donation.donor_phone}</span>
            </div>`
                : ''
            }
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span>${donation.payment_method}</span>
            </div>
            <div class="detail-row" style="margin-top: 20px; border-top: 2px solid #1E40AF; padding-top: 20px;">
              <span class="detail-label">Amount Donated:</span>
              <span class="amount">UGX ${donation.amount.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your generous donation!</p>
            <p>This receipt was generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Donations Management</h1>
          <p className="text-gray-600">
            Total: UGX {donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={donations.length === 0}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Receipt #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Method</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {donations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">
                    {donation.receipt_number || donation.payment_reference || `RCP-${new Date(donation.created_at).toISOString().slice(0, 10).replace(/-/g, '')}-${donation.id.slice(0, 5).toUpperCase()}`}
                  </td>
                  <td className="px-4 py-3 text-sm">{donation.donor_name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    UGX {donation.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{donation.payment_method}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrintReceipt(donation)}
                        className="text-green-600 hover:text-green-800"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(donation.id)}
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

      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Donation Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Receipt Number</label>
                <p className="text-gray-900 font-mono">{selectedDonation.receipt_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Donor Name</label>
                <p className="text-gray-900">{selectedDonation.donor_name}</p>
              </div>
              {selectedDonation.donor_email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedDonation.donor_email}</p>
                </div>
              )}
              {selectedDonation.donor_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedDonation.donor_phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-gray-900 text-2xl font-bold text-blue-600">
                  UGX {selectedDonation.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Method</label>
                <p className="text-gray-900">{selectedDonation.payment_method}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="text-gray-900">
                  {new Date(selectedDonation.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handlePrintReceipt(selectedDonation)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedDonation(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

