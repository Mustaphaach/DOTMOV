import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTrending, getPopular } from '../services/tmdbService';
import { Media } from '../types';
import MediaSlider from '../components/MediaSlider';
import Loader from '../components/Loader';
import { TMDB_BACKDROP_BASE_URL } from '../constants';

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Media[]>([]);
  const [trendingTv, setTrendingTv] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTv, setPopularTv] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<Media[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

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
    return <div className="h-96"><Loader /></div>;
  }

  const currentHeroMedia = heroSlides[currentHeroIndex];
  const heroLinkTo = currentHeroMedia 
    ? `/watch?type=movie&id=${currentHeroMedia.id}`
    : '#';

  return (
    <div className="space-y-16">
      {currentHeroMedia && (
        <div className="relative -mx-4 -mt-8 h-[75vh] flex items-end text-white rounded-b-lg overflow-hidden group">
            {heroSlides.map((slide, index) => (
                 <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent z-10"></div>
                     <img 
                        src={`${TMDB_BACKDROP_BASE_URL}${slide.backdrop_path}`} 
                        alt={slide.title || slide.name} 
                        className="w-full h-full object-cover" 
                     />
                </div>
            ))}

            <div className="relative z-20 max-w-3xl p-8 mb-8">
                <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg animate-fade-in-down">{currentHeroMedia.title || currentHeroMedia.name}</h1>
                <p className="text-gray-300 line-clamp-3 mb-6 drop-shadow-md animate-fade-in-up">{currentHeroMedia.overview}</p>
                <Link to={heroLinkTo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform duration-300 transform hover:scale-105 inline-flex items-center space-x-2 animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    <span>Watch Now</span>
                </Link>
            </div>

            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentHeroIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentHeroIndex ? 'bg-blue-500' : 'bg-white/50 hover:bg-white/75'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
      )}
      <MediaSlider title="Trending Movies" media={trendingMovies} />
      <MediaSlider title="Trending TV Shows" media={trendingTv} />
      <MediaSlider title="Popular Movies" media={popularMovies} />
      <MediaSlider title="Popular TV Shows" media={popularTv} />
    </div>
  );
};

export default HomePage;