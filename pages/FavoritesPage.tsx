import React, { useState, useEffect } from 'react';
import { getFavorites } from '../utils/storage';
import { Media } from '../types';
import MovieCard from '../components/MovieCard';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Media[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    loadFavorites();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const loadFavorites = () => {
    const items = getFavorites();
    setFavorites(items);
  };

  const filteredFavorites = favorites.filter(item => {
    if (filter === 'all') return true;
    return item.media_type === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 md:pt-28 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              ❤️ My Favorites
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Your personally curated collection</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg shadow-pink-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({favorites.length})
          </button>
          <button
            onClick={() => setFilter('movie')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              filter === 'movie'
                ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg shadow-pink-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎬 Movies ({favorites.filter(f => f.media_type === 'movie').length})
          </button>
          <button
            onClick={() => setFilter('tv')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              filter === 'tv'
                ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg shadow-pink-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📺 TV Shows ({favorites.filter(f => f.media_type === 'tv').length})
          </button>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-800 mb-6">
              <svg className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-gray-400 mb-6">Start adding movies and TV shows to your favorites!</p>
            <a
              href="#/"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold px-6 py-3 rounded-xl hover:from-pink-700 hover:to-red-700 transition-all duration-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Browse Content</span>
            </a>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing <span className="text-white font-semibold">{filteredFavorites.length}</span> favorites
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredFavorites.map((media) => (
                <MovieCard key={media.id} media={media} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
