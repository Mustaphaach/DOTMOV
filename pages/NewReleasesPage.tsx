import React, { useState, useEffect } from 'react';
import { getUpcoming, getNowPlaying } from '../services/tmdbService';
import { Media } from '../types';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';

const NewReleasesPage: React.FC = () => {
  const [upcomingMovies, setUpcomingMovies] = useState<Media[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'now-playing'>('upcoming');

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        setLoading(true);
        const [upcoming, nowPlaying] = await Promise.all([
          getUpcoming(),
          getNowPlaying(),
        ]);
        setUpcomingMovies(upcoming);
        setNowPlayingMovies(nowPlaying);
      } catch (error) {
        console.error('Failed to fetch new releases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewReleases();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center pt-20">
        <Loader variant="orbit" size="lg" color="gradient" />
      </div>
    );
  }

  const currentList = activeTab === 'upcoming' ? upcomingMovies : nowPlayingMovies;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 md:pt-28 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
              🎬 New Releases
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Latest movies in theaters and coming soon</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎭 Coming Soon
          </button>
          <button
            onClick={() => setActiveTab('now-playing')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'now-playing'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎥 Now Playing
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{currentList.length}</span> movies
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {currentList.map((media) => (
            <MovieCard key={media.id} media={media} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewReleasesPage;
