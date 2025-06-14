import React, { useState, useEffect } from 'react';
import { X, Megaphone, Loader2 } from 'lucide-react';
import { announcementService } from '../../lib/supabase';

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  is_active: boolean;
  priority: number;
}

const AnnouncementBar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementService.getAll();
        setAnnouncements(data);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [announcements.length]);

  const getBarColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'promotion':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-amber-500 to-orange-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4">
        <div className="container mx-auto flex items-center justify-center">
          <Loader2 size={16} className="animate-spin mr-2" />
          <span className="text-sm">Loading announcements...</span>
        </div>
      </div>
    );
  }

  if (!isVisible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={`${getBarColor(currentAnnouncement.type)} text-white py-3 px-4 relative overflow-hidden shadow-lg`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex-shrink-0">
            <Megaphone size={18} className="animate-pulse" />
          </div>
          <div className="flex-1 text-center">
            <p className="text-sm font-medium leading-relaxed">
              {currentAnnouncement.message}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors flex-shrink-0"
          aria-label="Close announcement"
        >
          <X size={16} />
        </button>
      </div>
      
      {announcements.length > 1 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
      </div>
    </div>
  );
};

export default AnnouncementBar;