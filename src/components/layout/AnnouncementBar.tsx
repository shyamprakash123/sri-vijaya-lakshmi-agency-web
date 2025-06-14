import React, { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  isActive: boolean;
  priority: number;
}

const AnnouncementBar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Mock announcements - in real app, fetch from API
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        message: '🚚 Orders dispatched within 1 hour | 📞 Pre-order 24hrs in advance for discounts!',
        type: 'info',
        isActive: true,
        priority: 1
      },
      {
        id: '2',
        message: '🎉 New Year Special: Use code NEWYEAR25 for 25% off on orders above ₹1500',
        type: 'promotion',
        isActive: true,
        priority: 2
      },
      {
        id: '3',
        message: '🌾 Fresh harvest rice now available - Premium quality guaranteed!',
        type: 'success',
        isActive: true,
        priority: 3
      }
    ];

    setAnnouncements(mockAnnouncements.filter(a => a.isActive));
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

  if (!isVisible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={`${getBarColor(currentAnnouncement.type)} text-white py-2 px-4 relative overflow-hidden`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <Megaphone size={16} className="flex-shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-sm font-medium animate-pulse">
              {currentAnnouncement.message}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      {announcements.length > 1 && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1 pb-1">
          {announcements.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementBar;