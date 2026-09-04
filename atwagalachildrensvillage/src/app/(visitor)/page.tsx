'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HelloSlides from '@/components/HelloSlides';
import ImageCard from '@/components/ImageCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight } from 'lucide-react';

interface AboutContent {
  id: string;
  description: string;
  image_url: string | null;
}

interface VisionMission {
  id: string;
  image_url: string | null;
  statement: string;
}

interface Objective {
  id: string;
  image_url: string | null;
  statement: string;
}

interface Program {
  id: string;
  image_url: string;
  title: string;
  description: string;
}

interface Achievement {
  id: string;
  image_url: string;
  title: string;
  description: string;
  achievement_date: string;
}

interface CoreValue {
  id: string;
  image_url: string;
  title: string;
  description: string;
}

interface NewsItem {
  id: string;
  image_url: string;
  title: string;
  description: string;
  published_date: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  description: string | null;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState<AboutContent[]>([]);
  const [vision, setVision] = useState<VisionMission | null>(null);
  const [mission, setMission] = useState<VisionMission | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [
        aboutData,
        visionData,
        missionData,
        objectivesData,
        programsData,
        achievementsData,
        coreValuesData,
        newsData,
        galleryData,
      ] = await Promise.all([
        (supabase.from('about_us') as any).select('*').eq('is_active', true).limit(1),
        (supabase.from('vision') as any).select('*').eq('is_active', true).single(),
        (supabase.from('mission') as any).select('*').eq('is_active', true).single(),
        (supabase.from('objectives') as any).select('*').eq('is_active', true).order('order_index').limit(3),
        (supabase.from('programs') as any).select('*').eq('is_active', true).eq('is_featured', true).limit(3),
        (supabase.from('achievements') as any).select('*').eq('is_active', true).eq('is_featured', true).limit(3),
        (supabase.from('core_values') as any).select('*').eq('is_active', true).eq('is_featured', true).limit(3),
        (supabase.from('news') as any).select('*').eq('is_active', true).eq('is_featured', true).order('published_date', { ascending: false }).limit(3),
        (supabase.from('gallery') as any).select('*').eq('is_active', true).eq('is_featured', true).limit(6),
      ]);

      setAbout(aboutData.data || []);
      setVision(visionData.data);
      setMission(missionData.data);
      setObjectives(objectivesData.data || []);
      setPrograms(programsData.data || []);
      setAchievements(achievementsData.data || []);
      setCoreValues(coreValuesData.data || []);
      setNews(newsData.data || []);
      setGallery(galleryData.data || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
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
    <div className="w-full">
      {/* Hello Slides Section */}
      <HelloSlides />

      {/* About Us Section */}
      {about.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">About Us</h2>
            <div className="relative w-[80vw] h-[80vh] mx-auto rounded-lg overflow-hidden shadow-2xl">
              {about[0].image_url && (
                <img
                  src={about[0].image_url}
                  alt="About Us"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Description overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center p-8 md:p-12">
                <div className="text-center max-w-4xl">
                  <p className="text-white text-lg md:text-2xl leading-relaxed mb-6">
                    {about[0].description}
                  </p>
                  <Link
                    to="/about"
                    className="inline-flex items-center text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Learn More <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vision Section */}
      {vision && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Vision</h2>
            <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
              {vision.image_url && (
                <div className="relative w-full md:w-1/2 h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={vision.image_url}
                    alt="Our Vision"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="w-full md:w-1/2">
                <p className="text-xl text-gray-800 leading-relaxed italic">
                  "{vision.statement}"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      {mission && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Mission</h2>
            <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
              {mission.image_url && (
                <div className="relative w-full md:w-1/2 h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={mission.image_url}
                    alt="Our Mission"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="w-full md:w-1/2">
                <p className="text-xl text-gray-800 leading-relaxed italic">
                  "{mission.statement}"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Objectives Section */}
      {objectives.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Objectives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {objectives.map((objective) => (
                <div key={objective.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  {objective.image_url && (
                    <div className="relative w-full h-48 mb-4 rounded overflow-hidden">
                      <img
                        src={objective.image_url}
                        alt="Objective"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed">{objective.statement}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programs Section */}
      {programs.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Programs</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 max-w-7xl mx-auto">
              {programs.map((program) => (
                <ImageCard
                  key={program.id}
                  imageUrl={program.image_url}
                  title={program.title}
                  description={program.description}
                />
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/programs"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View All Programs <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Achievements</h2>
            <div className="grid grid-cols-1 gap-8 mb-8 max-w-3xl mx-auto">
              <ImageCard
                key={achievements[0].id}
                imageUrl={achievements[0].image_url}
                title={achievements[0].title}
                description={achievements[0].description}
              />
            </div>
            <div className="text-center">
              <Link
                to="/achievements"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View All Achievements <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Core Values Section */}
      {coreValues.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 max-w-7xl mx-auto">
              {coreValues.map((value) => (
                <ImageCard
                  key={value.id}
                  imageUrl={value.image_url}
                  title={value.title}
                  description={value.description}
                />
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/core-values"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View All Values <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {gallery.map((image) => (
                <div key={image.id} className="relative aspect-square group overflow-hidden rounded-lg">
                  <img
                    src={image.image_url}
                    alt={image.description || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {image.description && (
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <p className="text-white text-center text-sm">{image.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/gallery"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View Full Gallery <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {news.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Latest News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {news.map((item) => (
                <ImageCard
                  key={item.id}
                  imageUrl={item.image_url}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/news"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View All News <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action - Donate */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Make a Difference Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-700">
            Your support helps us continue our mission to create positive change in our community.
          </p>
          <Link
            to="/donate"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Donate Now <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}

