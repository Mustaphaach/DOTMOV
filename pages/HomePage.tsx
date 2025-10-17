import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTrending, getPopular } from '../services/tmdbService';
import { Media } from '../types';
import MediaSlider from '../components/MediaSlider';
import Loader from '../components/Loader';
import { TMDB_BACKDROP_BASE_URL } from '../constants';
import { getRecentlyViewed } from '../utils/storage';

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Media[]>([]);
  const [trendingTv, setTrendingTv] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTv, setPopularTv] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<Media[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<Media[]>([]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  useEffect(() => {
    const fetchAllMedia = async () => {
      try {
        setLoading(true);
        const [tMovies, tTv, pMovies, pTv] = await Promise.all([
          getTrending('movie'),
          getTrending('tv'),
          getPopular('movie'),
          getPopular('tv'),
        ]);
        setTrendingMovies(tMovies);
        setTrendingTv(tTv);
        setPopularMovies(pMovies);
        setPopularTv(pTv);
        if (tMovies.length > 0) {
          setHeroSlides(tMovies.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllMedia();
  }, []);

  useEffect(() => {
    const recent = getRecentlyViewed();
    setRecentlyViewed(recent);
  }, []);

  const nextSlide = useCallback(() => {
    if (heroSlides.length > 0) {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
    }
  }, [heroSlides.length]);

  const prevSlide = () => {
    if (heroSlides.length > 0) {
      setCurrentHeroIndex((prevIndex) => (prevIndex - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  useEffect(() => {
    if (heroSlides.length > 1) {
      const slideInterval = setInterval(nextSlide, 7000);
      return () => clearInterval(slideInterval);
    }
  }, [heroSlides.length, nextSlide]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <Loader variant="orbit" size="lg" color="gradient" />
      </div>
    );
  }

  const currentHeroMedia = heroSlides[currentHeroIndex];
  const heroLinkTo = currentHeroMedia 
    ? `/watch?type=movie&id=${currentHeroMedia.id}`
    : '#';

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-black min-h-screen pt-16 lg:pt-20">
      {/* Hero Section */}
      {currentHeroMedia && (
        <div className="relative w-full h-[90vh] flex items-end text-white overflow-hidden group mb-16">
          {/* Background Slides */}
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20 z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10"></div>
              
              <img 
                src={`${TMDB_BACKDROP_BASE_URL}${slide.backdrop_path}`} 
                alt={slide.title || slide.name} 
                className="w-full h-full object-cover scale-110 animate-ken-burns" 
              />
            </div>
          ))}

          {/* Content Container */}
          <div className="relative z-20 container mx-auto px-6 pb-16 md:pb-24">
            <div className="max-w-3xl space-y-5 md:space-y-7">
              {/* Badge Section */}
              <div className="flex items-center space-x-4 animate-fade-in">
                <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                  🔥 TRENDING NOW
                </span>
                {currentHeroMedia.vote_average > 0 && (
                  <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 px-3 py-1 rounded-full">
                    <svg className="h-4 w-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-yellow-400">
                      {currentHeroMedia.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-black leading-tight animate-fade-in-up">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
                  {currentHeroMedia.title || currentHeroMedia.name}
                </span>
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 animate-fade-in-up">
                {currentHeroMedia.release_date && (
                  <span className="bg-gray-800/60 backdrop-blur-sm px-3 py-1 rounded-lg font-bold border border-gray-700">
                    {new Date(currentHeroMedia.release_date).getFullYear()}
                  </span>
                )}
                <span className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span className="font-semibold">Movie</span>
                </span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-lg font-bold text-xs shadow-lg">
                  4K • HDR
                </span>
              </div>

              {/* Overview */}
              <p className="text-gray-200 text-lg md:text-xl line-clamp-3 animate-fade-in-up max-w-2xl leading-relaxed font-medium">
                {currentHeroMedia.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 animate-fade-in-up pt-4">
                <Link 
                  to={heroLinkTo} 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3 shadow-2xl shadow-blue-600/50 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 group-hover:scale-125 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg">Watch Now</span>
                </Link>

                <button 
                  onClick={() => setShowMoreInfo(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 border-2 border-white/20 shadow-xl group"
                >
                  <svg className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>More Info</span>
                </button>

                <button 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 border-2 border-white/20 shadow-xl"
                  aria-label="Add to watchlist"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide} 
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 border-2 border-white/20 shadow-2xl"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={nextSlide} 
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 border-2 border-white/20 shadow-2xl"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentHeroIndex 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-3 shadow-lg shadow-blue-500/50' 
                    : 'bg-white/40 hover:bg-white/60 w-3 h-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* More Info Modal */}
      {showMoreInfo && currentHeroMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowMoreInfo(false)}
        >
          <div 
            className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowMoreInfo(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full transition-all duration-300 border border-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Backdrop Image */}
            <div className="relative h-64 rounded-t-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10"></div>
              <img
                src={`${TMDB_BACKDROP_BASE_URL}${currentHeroMedia.backdrop_path}`}
                alt={currentHeroMedia.title || currentHeroMedia.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-8">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                {currentHeroMedia.title || currentHeroMedia.name}
              </h2>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {currentHeroMedia.release_date && (
                  <span className="bg-gray-800 px-3 py-1 rounded-lg font-bold text-sm">
                    {new Date(currentHeroMedia.release_date).getFullYear()}
                  </span>
                )}
                {currentHeroMedia.vote_average > 0 && (
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-yellow-400">
                      {currentHeroMedia.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed">
                  {currentHeroMedia.overview}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={heroLinkTo}
                  onClick={() => setShowMoreInfo(false)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Watch Now</span>
                </Link>
                <button
                  onClick={() => setShowMoreInfo(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 border border-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8 space-y-16">
        {recentlyViewed.length > 0 && (
          <MediaSlider 
            title="Continue Watching" 
            media={recentlyViewed}
            autoScroll={false}
          />
        )}
        
        <MediaSlider 
          title="Trending Movies" 
          media={trendingMovies} 
          viewAllLink="/movies/trending"
          autoScroll={true}
          autoScrollSpeed={1}
        />
        
        <MediaSlider 
          title="Trending TV Shows" 
          media={trendingTv} 
          viewAllLink="/tv/trending"
          autoScroll={true}
          autoScrollSpeed={1.2}
        />
        
        <MediaSlider 
          title="Popular Movies" 
          media={popularMovies} 
          viewAllLink="/movies/popular"
          autoScroll={true}
          autoScrollSpeed={0.8}
        />
        
        <MediaSlider 
          title="Popular TV Shows" 
          media={popularTv} 
          viewAllLink="/tv/popular"
          autoScroll={true}
          autoScrollSpeed={1}
        />
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes ken-burns {
          0% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1.2);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-ken-burns {
          animation: ken-burns 25s ease-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
