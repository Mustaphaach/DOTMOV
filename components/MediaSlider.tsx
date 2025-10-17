import React, { useRef, useState, useEffect } from 'react';
import { Media } from '../types';
import MovieCard from './MovieCard';

interface MediaSliderProps {
  title: string;
  media: Media[];
}

const MediaSlider: React.FC<MediaSliderProps> = ({ title, media }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!media || media.length === 0) {
    return null;
  }
  
  const checkScrollability = () => {
    const el = sliderRef.current;
    if (el) {
      const isAtEnd = el.scrollWidth <= el.clientWidth + el.scrollLeft + 1;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(!isAtEnd);
    }
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (el) {
        checkScrollability();
        el.addEventListener('scroll', checkScrollability, { passive: true });
        window.addEventListener('resize', checkScrollability);

        return () => {
            el.removeEventListener('scroll', checkScrollability);
            window.removeEventListener('resize', checkScrollability);
        };
    }
  }, [media]);

  const scroll = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8; // Scroll by 80% of the visible width
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-blue-500 pl-3">{title}</h2>
      <div className="relative group">
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div 
          ref={sliderRef}
          className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar"
        >
          {media.map((item) => (
             <div key={item.id} className="flex-shrink-0 w-40 sm:w-48 md:w-56">
                <MovieCard media={item} />
             </div>
          ))}
        </div>
        {canScrollRight && (
           <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaSlider;
