import React, { useRef, useState, useEffect } from 'react';
import { Media } from '../types';
import MovieCard from './MovieCard';

interface MediaSliderProps {
  title: string;
  media: Media[];
  viewAllLink?: string;
  autoScroll?: boolean;
  autoScrollSpeed?: number;
}

const MediaSlider: React.FC<MediaSliderProps> = ({ 
  title, 
  media, 
  viewAllLink,
  autoScroll = true,
  autoScrollSpeed = 1
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef<number>();

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

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || isPaused || isDragging) return;

    const el = sliderRef.current;
    if (!el) return;

    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;

      if (delta > 16) { // ~60fps
        const currentScroll = el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth;

        // Auto-scroll to the right
        if (currentScroll >= maxScroll) {
          // Reset to beginning for infinite loop
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += autoScrollSpeed;
        }

        lastTimestamp = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoScroll, isPaused, isDragging, autoScrollSpeed]);

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
      const scrollAmount = el.clientWidth * 0.8;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.userSelect = 'auto';
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.userSelect = 'auto';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };

  return (
    <section 
      className="mb-16 relative" 
      aria-label={title}
      role="region"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Background Glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>

      {/* Header with 3D Effect */}
      <div className="flex items-center justify-between mb-6 px-1 relative z-10">
        <h2 className="text-2xl md:text-4xl font-black text-white flex items-center space-x-4 group perspective-container">
          <span className="relative flex items-center space-x-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-400 rounded-full transform group-hover:scale-y-125 transition-all duration-500 shadow-lg shadow-blue-500/50 animate-glow"></span>
            <span className="relative transform-3d group-hover:translate-z-10 transition-all duration-500">
              {title}
              <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 group-hover:w-full transition-all duration-700 rounded-full shadow-lg shadow-blue-500/50"></span>
              {/* Floating particles effect */}
              <span className="absolute -top-2 -right-2 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-float-delayed opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </span>
          </span>
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Auto-scroll control */}
          {autoScroll && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="relative text-gray-400 hover:text-white font-medium text-sm flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-800/50 backdrop-blur-sm group"
              aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            >
              {isPaused ? (
                <>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Play</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Pause</span>
                </>
              )}
            </button>
          )}

          {viewAllLink && (
            <a 
              href={viewAllLink}
              className="relative text-blue-400 hover:text-blue-300 font-bold text-sm md:text-base flex items-center space-x-2 transition-all duration-300 group overflow-hidden px-4 py-2 rounded-lg hover:bg-blue-500/10 backdrop-blur-sm"
            >
              <span className="relative z-10">View All</span>
              <svg 
                className="h-5 w-5 transform group-hover:translate-x-2 transition-all duration-300 relative z-10" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            </a>
          )}
        </div>
      </div>

      {/* Slider Container with 3D Perspective */}
      <div 
        className="relative group/slider perspective-1000"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-label={`${title} carousel`}
      >
        {/* Auto-scroll status indicator */}
        {autoScroll && !isPaused && (
          <div className="absolute top-2 right-2 z-50 bg-blue-500/20 backdrop-blur-md border border-blue-500/50 rounded-full px-3 py-1 flex items-center space-x-2 animate-pulse-gentle">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-blue-200 font-semibold">Auto-scrolling</span>
          </div>
        )}

        {/* Left Navigation Button with 3D Effect */}
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 bg-gradient-to-r from-black/90 via-black/70 to-transparent hover:from-black/95 text-white px-6 md:px-8 transition-all duration-300 opacity-0 group-hover/slider:opacity-100 focus:opacity-100 group transform-3d"
            aria-label="Scroll left"
            tabIndex={0}
          >
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md p-4 rounded-2xl border border-white/20 transform group-hover:scale-110 group-hover:rotate-y-12 transition-all duration-500 shadow-2xl hover:shadow-blue-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-7 w-7 md:h-9 md:w-9 relative z-10" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
        )}

        {/* Scrollable Content with Parallax Effect */}
        <div 
          ref={sliderRef}
          className="flex space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide pb-6 px-2 cursor-grab active:cursor-grabbing preserve-3d"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollBehavior: isDragging ? 'auto' : 'smooth'
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          role="list"
        >
          {/* Duplicate items for infinite scroll effect */}
          {[...media, ...media].map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="flex-shrink-0 w-40 sm:w-48 md:w-56 lg:w-64 card-3d-container"
              role="listitem"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className={`relative transform-3d transition-all duration-500 ${
                  hoveredIndex === index 
                    ? 'scale-110 translate-y-[-20px] rotate-y-8 translate-z-30' 
                    : hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1
                    ? 'scale-95 translate-y-[10px]'
                    : 'scale-100'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Glowing background layer */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-2xl blur-xl transition-opacity duration-500 ${
                    hoveredIndex === index ? 'opacity-100 scale-110' : 'opacity-0'
                  }`}
                  style={{ transform: 'translateZ(-20px)' }}
                ></div>
                
                {/* Card shadow layer */}
                <div 
                  className={`absolute inset-0 bg-black/50 rounded-2xl blur-2xl transition-all duration-500 ${
                    hoveredIndex === index ? 'opacity-100 translate-y-8 scale-105' : 'opacity-30 translate-y-4'
                  }`}
                  style={{ transform: 'translateZ(-10px)' }}
                ></div>

                {/* Main card content */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm bg-gray-900/50">
                  <MovieCard media={item} />
                  
                  {/* Holographic overlay */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br from-blue-400/0 via-purple-400/5 to-cyan-400/0 pointer-events-none transition-opacity duration-500 ${
                      hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
                      mixBlendMode: 'overlay'
                    }}
                  ></div>

                  {/* Shine effect */}
                  <div 
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
                      hoveredIndex === index ? 'animate-shine' : 'opacity-0'
                    }`}
                    style={{
                      background: 'linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                      backgroundSize: '200% 100%'
                    }}
                  ></div>
                </div>

                {/* Floating info badge */}
                {hoveredIndex === index && (
                  <div 
                    className="absolute -top-3 -right-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-2xl animate-bounce-subtle"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    #{(index % media.length) + 1}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Navigation Button with 3D Effect */}
        {canScrollRight && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 bg-gradient-to-l from-black/90 via-black/70 to-transparent hover:from-black/95 text-white px-6 md:px-8 transition-all duration-300 opacity-0 group-hover/slider:opacity-100 focus:opacity-100 group transform-3d"
            aria-label="Scroll right"
            tabIndex={0}
          >
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md p-4 rounded-2xl border border-white/20 transform group-hover:scale-110 group-hover:rotate-y-[-12deg] transition-all duration-500 shadow-2xl hover:shadow-blue-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-7 w-7 md:h-9 md:w-9 relative z-10" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}

        {/* Enhanced Progress Indicator with 3D Effect */}
        <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gray-800/40 rounded-full overflow-hidden opacity-0 group-hover/slider:opacity-100 transition-opacity backdrop-blur-sm border border-gray-700/50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full relative overflow-hidden shadow-lg shadow-blue-500/50"
            style={{
              width: `${sliderRef.current ? ((sliderRef.current.scrollLeft + sliderRef.current.clientWidth) / sliderRef.current.scrollWidth) * 100 : 0}%`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Item Count with Animation */}
      <div className="mt-5 text-sm text-gray-400 flex items-center space-x-3 px-1 animate-fade-in">
        <div className="relative">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </div>
        <span className="font-medium">
          <span className="text-white font-bold">{media.length}</span> {media.length === 1 ? 'item' : 'items'} available
        </span>
        {autoScroll && (
          <span className="text-xs text-gray-500">• Auto-scrolling enabled</span>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .perspective-container {
          perspective: 800px;
        }

        .transform-3d {
          transform-style: preserve-3d;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .card-3d-container {
          transform-style: preserve-3d;
        }

        .translate-z-10 {
          transform: translateZ(10px);
        }

        .translate-z-30 {
          transform: translateZ(30px);
        }

        .rotate-y-8 {
          transform: rotateY(8deg);
        }

        .rotate-y-12 {
          transform: rotateY(12deg);
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(147, 51, 234, 0.4);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-10px) translateX(5px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-8px) translateX(-5px);
          }
        }

        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateZ(40px) translateY(0);
          }
          50% {
            transform: translateZ(40px) translateY(-5px);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 0.5s;
        }

        .animate-shine {
          animation: shine 2s ease-in-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default MediaSlider;
