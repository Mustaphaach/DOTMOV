import React, { useState, useEffect } from 'react';
import { getTrending, getPopular, getTopRated } from '../services/tmdbService';
import { Media } from '../types';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';

const TVShowsPage: React.FC = () => {
  const [trendingTv, setTrendingTv] = useState<Media[]>([]);
  const [popularTv, setPopularTv] = useState<Media[]>([]);
  const [topRatedTv, setTopRatedTv] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'top-rated'>('trending');

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setLoading(true);
        const [trending, popular, topRated] = await Promise.all([
          getTrending('tv'),
          getPopular('tv'),
          getTopRated('tv'),
        ]);
        setTrendingTv(trending);
        setPopularTv(popular);
        setTopRatedTv(topRated);
      } catch (error) {
        console.error('Failed to fetch TV shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  const getCurrentList = () => {
    switch (activeTab) {
      case 'trending':
        return trendingTv;
      case 'popular':
        return popularTv;
      case 'top-rated':
        return topRatedTv;
      default:
        return trendingTv;
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
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              TV Shows
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Discover amazing TV series and shows</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'trending'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'popular'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ⭐ Popular
          </button>
          <button
            onClick={() => setActiveTab('top-rated')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'top-rated'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🏆 Top Rated
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{currentList.length}</span> TV shows
          </p>
        </div>

        {/* TV Shows Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {currentList.map((show) => (
            <MovieCard key={show.id} media={show} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TVShowsPage;
