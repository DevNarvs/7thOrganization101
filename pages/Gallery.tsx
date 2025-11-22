
import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockSupabase';
import { GalleryItem } from '../types';
import { Modal } from '../components/UI';

const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await mockDb.gallery.getAll();
      setItems(data.sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Photo Showcase</h1>
        <p className="mt-4 text-xl text-gray-600">Highlights from our events and community initiatives.</p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="group relative h-64 overflow-hidden rounded-lg shadow-md cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                <div className="p-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                   <h3 className="text-white font-bold text-lg">{item.title}</h3>
                   <p className="text-gray-200 text-xs">{new Date(item.dateUploaded).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p>No photos available in the showcase yet.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.title || 'Image View'}
      >
        {selectedImage && (
          <div className="flex flex-col gap-4">
             <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-auto max-h-[70vh] object-contain rounded" />
             <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Uploaded: {new Date(selectedImage.dateUploaded).toLocaleDateString()}</span>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Gallery;
