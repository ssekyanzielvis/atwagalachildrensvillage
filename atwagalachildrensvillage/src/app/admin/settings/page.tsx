'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Save } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification } from '@/lib/store';

type FooterInfo = Database['public']['Tables']['footer_info']['Row'];
type PaymentSettings = Database['public']['Tables']['payment_settings']['Row'];

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'footer' | 'payment'>('footer');
  const { showNotification } = useNotification();

  // Footer Info
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [footerForm, setFooterForm] = useState({
    organization_name: '',
    location: '',
    director: '',
    email: '',
    phone: '',
    organization_type: '',
    primary_focus: '',
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    mtn_number: '',
    airtel_number: '',
    manual_payment_instructions: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [footerData, paymentData] = await Promise.all([
        (supabase.from('footer_info') as any).select('*').limit(1).single(),
        (supabase.from('payment_settings') as any).select('*').limit(1).single(),
      ]);

      if (footerData.data) {
        setFooterInfo(footerData.data);
        setFooterForm({
          organization_name: footerData.data.organization_name,
          location: footerData.data.location,
          director: footerData.data.director,
          email: footerData.data.email,
          phone: footerData.data.phone,
          organization_type: footerData.data.organization_type || '',
          primary_focus: footerData.data.primary_focus || '',
        });
      }

      if (paymentData.data) {
        setPaymentSettings(paymentData.data);
        setPaymentForm({
          mtn_number: paymentData.data.mtn_number || '',
          airtel_number: paymentData.data.airtel_number || '',
          manual_payment_instructions: paymentData.data.manual_payment_instructions || '',
        });
      }
    } catch (error: any) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFooter = async () => {
    setLoading(true);
    try {
      if (footerInfo) {
        const { error } = await (supabase
          .from('footer_info') as any)
          .update({
            ...footerForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', footerInfo.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from('footer_info') as any).insert(footerForm);

        if (error) throw error;
      }

      showNotification('Footer information updated successfully', 'success');
      fetchSettings();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setLoading(true);
    try {
      if (paymentSettings) {
        const { error } = await (supabase
          .from('payment_settings') as any)
          .update({
            ...paymentForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentSettings.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from('payment_settings') as any).insert(paymentForm);

        if (error) throw error;
      }

      showNotification('Payment settings updated successfully', 'success');
      fetchSettings();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !footerInfo && !paymentSettings) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2 ${
            activeTab === 'footer'
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-600'
          }`}
        >
          Footer Information
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 ${
            activeTab === 'payment'
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-600'
          }`}
        >
          Payment Settings
        </button>
      </div>

      {activeTab === 'footer' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Organization Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organization Name*</label>
              <input
                type="text"
                value={footerForm.organization_name}
                onChange={(e) =>
                  setFooterForm({ ...footerForm, organization_name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location*</label>
              <input
                type="text"
                value={footerForm.location}
                onChange={(e) => setFooterForm({ ...footerForm, location: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Director*</label>
              <input
                type="text"
                value={footerForm.director}
                onChange={(e) => setFooterForm({ ...footerForm, director: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                value={footerForm.email}
                onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone*</label>
              <input
                type="tel"
                value={footerForm.phone}
                onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization Type</label>
              <input
                type="text"
                value={footerForm.organization_type}
                onChange={(e) =>
                  setFooterForm({ ...footerForm, organization_type: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Focus</label>
              <input
                type="text"
                value={footerForm.primary_focus}
                onChange={(e) => setFooterForm({ ...footerForm, primary_focus: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <button
              onClick={handleSaveFooter}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Footer Info
            </button>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">MTN Mobile Money Number</label>
              <input
                type="text"
                value={paymentForm.mtn_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, mtn_number: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="256XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Airtel Money Number</label>
              <input
                type="text"
                value={paymentForm.airtel_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, airtel_number: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="256XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Manual Payment Instructions
              </label>
              <textarea
                value={paymentForm.manual_payment_instructions}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, manual_payment_instructions: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                rows={6}
                placeholder="Enter instructions for donors who want to send money directly..."
              />
            </div>
            <button
              onClick={handleSavePayment}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Payment Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

