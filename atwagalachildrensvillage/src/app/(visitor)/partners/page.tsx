'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPartners(data);
        }
      } catch (err) {
        console.error('Error fetching partners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Partners</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We are proud to partner with organizations and individuals who share our vision and contribute to our cause.
        </p>
      </div>

      {partners.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-lg">No partners listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner) => (
            <div key={partner.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              {partner.logo_url && (
                <div className="w-full h-32 mb-4 flex items-center justify-center">
                  <img src={partner.logo_url} alt={`${partner.business_name || partner.organization_name} logo`} className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.business_name || partner.organization_name || partner.full_name}</h3>
              {partner.full_name && partner.business_name && (
                <p className="text-sm text-gray-500 mb-2">Contact: {partner.full_name}</p>
              )}
              <div className="space-y-1 text-sm text-gray-600 mt-2">
                {partner.nationality && (
                  <p><span className="font-semibold text-gray-900">Location:</span> {partner.nationality}</p>
                )}
                {partner.offer && (
                  <p><span className="font-semibold text-gray-900">Contribution:</span> {partner.offer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
