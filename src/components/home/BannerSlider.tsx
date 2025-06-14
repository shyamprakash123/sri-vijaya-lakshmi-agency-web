import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBanners } from '../../hooks/useBanners';

const BannerSlider: React.FC = () => {
  const { banners, loading, error } = useBanners();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="h-64 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || banners.length === 0) {
    return (
      <div className="h-64 md:h-96 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Welcome to Sri Vijaya Lakshmi Agency</h2>
          <p className="text-lg md:text-xl mb-6 opacity-90">Premium Quality Rice Delivered Fast</p>
          <Link
            to="/products"
            className="inline-block bg-white text-orange-500 px-8 py-3 rounded-full font-semibold transition-colors transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 md:h-96 overflow-hidden rounded-xl shadow-lg">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative h-full">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{banner.title}</h2>
                {banner.description && (
                  <p className="text-lg md:text-xl mb-6 opacity-90">{banner.description}</p>
                )}
                {banner.link && (
                  <Link
                    to={banner.link}
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors transform hover:scale-105"
                  >
                    Shop Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlider;