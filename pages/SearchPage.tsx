
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {searchQuery ? `Search Results for "${searchQuery}"` : 'Please enter a search query'}
      </h1>
      {loading ? (
        <Loader />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((media) => (
            <MovieCard key={media.id} media={media} />
          ))}
        </div>
      ) : (
        !loading && searchQuery && <p className="text-gray-400">No results found.</p>
      )}
    </div>
  );
};

export default SearchPage;
