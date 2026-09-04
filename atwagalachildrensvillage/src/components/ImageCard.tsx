'use client';

interface ImageCardProps {
  imageUrl: string;
  title?: string;
  description: string;
  className?: string;
}

export default function ImageCard({ imageUrl, title, description, className = '' }: ImageCardProps) {
  return (
    <div className={`relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="relative w-full h-[600px]">
        <img
          src={imageUrl || '/placeholder.jpg'}
          alt={title || 'Image'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Description overlay on hover */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
          <p className="text-white text-base md:text-lg leading-relaxed text-center">
            {description}
          </p>
        </div>
      </div>
      
      {/* Title always visible below image */}
      {title && (
        <div className="p-4 bg-white">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
        </div>
      )}
    </div>
  );
}
