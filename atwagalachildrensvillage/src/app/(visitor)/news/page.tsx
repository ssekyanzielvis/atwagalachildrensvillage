'use client';

import { useEffect, useState } from 'react';
import ImageCard from '@/components/ImageCard';
import TruncatedText from '@/components/TruncatedText';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface NewsItem {
  id: string;
  image_url: string;
  title: string;
  description: string;
  published_date: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_active', true)
        .order('published_date', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
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
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Latest News</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Stay updated with our latest news and announcements.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {news.map((item) => (
            <div key={item.id} className="space-y-2">
              <ImageCard
                imageUrl={item.image_url}
                title={item.title}
                description={item.description}
              />
              <TruncatedText text={item.description} />
              <p className="text-sm text-gray-500 text-center">
                {formatDate(item.published_date)}
              </p>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No news available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
