import React, { useState, useEffect } from 'react';
import { getTrending } from '../services/tmdbService';
import { Media } from '../types';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';

const TrendingPage: React.FC = () => {
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>('movie');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const media = await getTrending(activeTab);
        setTrendingMedia(media);
      } catch (error) {
        console.error('Failed to fetch trending:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center pt-20">
        <Loader variant="orbit" size="lg" color="gradient" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 md:pt-28 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              🔥 Trending Now
            </span>
          </h1>
          <p className="text-gray-400 text-lg">What's hot this week</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('movie')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'movie'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎬 Movies
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'tv'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📺 TV Shows
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{trendingMedia.length}</span> trending {activeTab === 'movie' ? 'movies' : 'TV shows'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {trendingMedia.map((media) => (
            <MovieCard key={media.id} media={media} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
