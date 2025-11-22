import React, { useEffect, useState } from "react";
import { mockDb } from "../services/mockSupabase";
import { Announcement, CarouselItem } from "../types";
import { Card, Modal, Button } from "../components/UI";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { supabaseDb } from "@/services/supabaseDb";

const Home: React.FC = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cData, aData] = await Promise.all([
        mockDb.carousel.getAll(),
        mockDb.announcements.getAll(),
      ]);
      setCarouselItems(cData.sort((a, b) => a.order - b.order));
      setAnnouncements(aData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Fix: Reset timer whenever currentSlide changes (including manual clicks)
  useEffect(() => {
    if (carouselItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselItems, currentSlide]);

  const nextSlide = () => {
    if (carouselItems.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    if (carouselItems.length === 0) return;
    setCurrentSlide(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* CAROUSEL */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden bg-gray-900 group">
        {carouselItems.length > 0 ? (
          carouselItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.caption}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent text-white">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    {item.caption}
                  </h2>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            No images available
          </div>
        )}

        {/* Controls - Only show if > 1 item */}
        {carouselItems.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              title="Previous slide"
              className="absolute z-20 left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur text-white transition"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              title="Next slide"
              className="absolute z-20 right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur text-white transition"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* ANNOUNCEMENTS */}
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 border-b-4 border-blue-500 inline-block mb-8 pb-2">
          Latest Announcements
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((ann) => (
            <Card
              key={ann.id}
              className="flex flex-col h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300 group"
              onClick={() => setSelectedAnnouncement(ann)}
            >
              {ann.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={ann.imageUrl}
                    alt={ann.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar size={16} className="mr-1" />
                  {new Date(ann.date).toLocaleDateString()}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {ann.title}
                </h3>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {ann.content}
                </p>
                <span className="text-blue-600 text-sm font-medium mt-auto">
                  Read Full Announcement &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
        {announcements.length === 0 && (
          <p className="text-gray-500 text-center">
            No announcements at this time.
          </p>
        )}
      </div>

      {/* ANNOUNCEMENT DETAILS MODAL */}
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title="Announcement Details"
      >
        {selectedAnnouncement && (
          <div className="space-y-6">
            {/* Image */}
            {selectedAnnouncement.imageUrl && (
              <div className="w-full h-64 md:h-80 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {selectedAnnouncement.title}
              </h2>
              <div className="flex items-center text-gray-500">
                <Calendar size={18} className="mr-2 text-blue-500" />
                <span className="font-medium">
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedAnnouncement.content}
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button
                variant="outlined"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
