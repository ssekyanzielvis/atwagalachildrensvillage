'use client';

interface ImageCardProps {
  imageUrl: string;
  title?: string;
  description: string;
  className?: string;
}

export default function ImageCard({ imageUrl, title, description, className = '' }: ImageCardProps) {
  const isVideo = Boolean(imageUrl && /\.(mp4|webm|ogg|mov)$/i.test(imageUrl));

  return (
    <div className={`relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 ${className}`}>
      <div className="relative w-full h-[360px] md:h-[460px] overflow-hidden bg-gray-100">
        {isVideo ? (
          <video
            src={imageUrl}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={imageUrl || '/placeholder.jpg'}
            alt={title || 'Achievement Image'}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Description overlay on hover */}
        {!isVideo && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 backdrop-blur-[2px]">
            <p className="text-white text-sm md:text-base leading-relaxed text-center font-medium line-clamp-6">
              {description}
            </p>
          </div>
        )}
      </div>
      
      {/* Title always visible below image */}
      {title && (
        <div className="p-4 bg-white border-t border-gray-50">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2">{title}</h3>
        </div>
      )}
    </div>
  );
}
