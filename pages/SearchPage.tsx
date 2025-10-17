import React, { useState, useEffect } from 'react';
import { useQuery } from '../hooks/useQuery';
import { searchMedia } from '../services/tmdbService';
import { Media } from '../types';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';

const SearchPage: React.FC = () => {
  const query = useQuery();
  const searchQuery = query.get('q') || '';
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'date'>('relevance');

  useEffect(() => {
    if (searchQuery) {
      const performSearch = async () => {
        setLoading(true);
        try {
          const searchResults = await searchMedia(searchQuery);
          setResults(searchResults);
        } catch (error) {
          console.error("Failed to search media:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      };
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const filteredResults = results.filter((media) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'movie') return media.media_type === 'movie' || !media.media_type;
    if (activeFilter === 'tv') return media.media_type === 'tv';
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    if (sortBy === 'date') {
      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';
      return dateB.localeCompare(dateA);
    }
    return 0;
  });

  const filterOptions = [
    { id: 'all', label: 'All Results', count: results.length },
    { id: 'movie', label: 'Movies', count: results.filter(m => m.media_type === 'movie' || !m.media_type).length },
    { id: 'tv', label: 'TV Shows', count: results.filter(m => m.media_type === 'tv').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 md:pt-28">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          {searchQuery ? (
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">
                Search Results
              </h1>
              <p className="text-xl text-gray-400">
                for <span className="text-blue-400 font-semibold">"{searchQuery}"</span>
              </p>
              {!loading && (
                <p className="text-sm text-gray-500">
                  {sortedResults.length} {sortedResults.length === 1 ? 'result' : 'results'} found
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-4">
                <svg className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Start Your Search</h1>
              <p className="text-gray-400">Enter a movie or TV show name in the search bar above</p>
            </div>
          )}
        </div>

        {searchQuery && (
          <>
            {/* Filters and Sorting */}
            <div className="mb-8 space-y-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-3">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as any)}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      activeFilter === filter.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeFilter === filter.id ? 'bg-blue-700' : 'bg-gray-700'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'relevance', label: 'Relevance' },
                      { id: 'rating', label: 'Rating' },
                      { id: 'date', label: 'Release Date' },
                    ].map((sort) => (
                      <button
                        key={sort.id}
                        onClick={() => setSortBy(sort.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          sortBy === sort.id
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Options */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg bg-gray-700 text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader variant="orbit" size="lg" color="gradient" />
              </div>
            ) : sortedResults.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {sortedResults.map((media) => (
                    <MovieCard key={`${media.id}-${media.media_type}`} media={media} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="max-w-md text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-800 mb-4">
                    <svg className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-white">No Results Found</h2>
                  <p className="text-gray-400 leading-relaxed">
                    We couldn't find any matches for <span className="text-white font-semibold">"{searchQuery}"</span>
                  </p>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mt-6 text-left">
                    <h3 className="text-sm font-semibold text-white mb-3">Try these suggestions:</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start space-x-2">
                        <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>Check your spelling or try different keywords</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>Try more general or shorter search terms</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>Browse trending movies and TV shows instead</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <a
                      href="/"
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/30"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Back to Home</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
