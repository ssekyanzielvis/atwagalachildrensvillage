'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';

interface GalleryImage {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  description: string | null;
  category: string | null;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.category === selectedCategory));
    }
  }, [selectedCategory, images]);

  const fetchGallery = async () => {
    try {
      const { data, error } = await (supabase
        .from('gallery') as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const galleryImages = (data || []) as GalleryImage[];
      setImages(galleryImages);
      setFilteredImages(galleryImages);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(galleryImages.map(img => img.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching gallery:', error);
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
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Gallery</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Browse through our collection of memorable moments and activities.
        </p>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredImages.map((item) => (
            <div
              key={item.id}
              className="relative h-[500px] group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              {item.media_type === 'video' ? (
                <video
                  src={item.media_url}
                  className="object-cover w-full h-full"
                  controls
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={item.description || 'Gallery image'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}
              {item.description && (
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                  <p className="text-white text-center text-base md:text-lg font-medium">{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              {selectedCategory === 'all' 
                ? 'No images available at the moment.' 
                : `No images in ${selectedCategory} category.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
