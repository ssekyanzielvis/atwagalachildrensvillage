'use client';

import { useEffect, useState } from 'react';
import ImageCard from '@/components/ImageCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';

interface CoreValue {
  id: string;
  image_url: string;
  title: string;
  description: string;
}

export default function CoreValuesPage() {
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoreValues();
  }, []);

  const fetchCoreValues = async () => {
    try {
      const { data, error } = await supabase
        .from('core_values')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoreValues(data || []);
    } catch (error) {
      console.error('Error fetching core values:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Core Values</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          The principles that guide our work and define who we are.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {coreValues.map((value) => (
            <ImageCard
              key={value.id}
              imageUrl={value.image_url}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>

        {coreValues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No core values available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
