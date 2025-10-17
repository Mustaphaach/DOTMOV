import React, { useState, useEffect } from 'react';
import { getTrending, getPopular, getTopRated, getUpcoming } from '../services/tmdbService';
import { Media } from '../types';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';

const MoviesPage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'top-rated' | 'upcoming'>('trending');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [trending, popular, topRated, upcoming] = await Promise.all([
          getTrending('movie'),
          getPopular('movie'),
          getTopRated('movie'),
          getUpcoming(),
        ]);
        setTrendingMovies(trending);
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const getCurrentList = () => {
    switch (activeTab) {
      case 'trending':
        return trendingMovies;
      case 'popular':
        return popularMovies;
      case 'top-rated':
        return topRatedMovies;
      case 'upcoming':
        return upcomingMovies;
      default:
        return trendingMovies;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center pt-20">
        <Loader variant="orbit" size="lg" color="gradient" />
      </div>
    );
  }

  const currentList = getCurrentList();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 md:pt-28 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Movies
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Explore the latest and greatest films</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'trending'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'popular'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ⭐ Popular
          </button>
          <button
            onClick={() => setActiveTab('top-rated')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'top-rated'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🏆 Top Rated
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎬 Upcoming
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{currentList.length}</span> movies
          </p>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {currentList.map((movie) => (
            <MovieCard key={movie.id} media={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoviesPage;
