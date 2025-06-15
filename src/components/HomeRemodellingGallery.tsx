import React from 'react';
import { Image } from 'lucide-react'; // Using Lucide icons as seen in your other components

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: string;
}

interface HomeRemodellingGalleryProps {
  title?: string;
  description?: string;
}

const HomeRemodellingGallery: React.FC<HomeRemodellingGalleryProps> = ({
  title = "Home Remodelling Projects",
  description = "Explore our recent renovation and remodelling work"
}) => {
  // Sample gallery images based on your existing project images
  const galleryImages: GalleryImage[] = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1',
      alt: 'Modern kitchen renovation with white cabinets and wooden countertops',
      category: 'Kitchen'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858',
      alt: 'Contemporary living room with large windows and wooden flooring',
      category: 'Living Room'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
      alt: 'Elegant bathroom remodel with walk-in shower',
      category: 'Bathroom'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92',
      alt: 'Home office renovation with built-in shelving',
      category: 'Office'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d',
      alt: 'Outdoor deck and patio renovation',
      category: 'Outdoor'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f',
      alt: 'Basement renovation with entertainment area',
      category: 'Basement'
    }
  ];

  return (
    <div className="py-8">
      {title && (
        <h2 className="text-2xl font-display font-bold text-neutral-800 mb-2">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-neutral-600 mb-6">
          {description}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {galleryImages.map((image) => (
          <div key={image.id} className="relative group rounded-md overflow-hidden">
            <div className="aspect-w-4 aspect-h-3 bg-neutral-100">
              <img
                src={`${image.url}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
                alt={image.alt}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="p-4 w-full">
                  <span className="inline-block px-2 py-1 bg-primary-500 text-white text-xs rounded-md mb-2">
                    {image.category}
                  </span>
                  <p className="text-white text-sm">{image.alt}</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeRemodellingGallery;
