import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

/**
 * Custom hook to parse URL search parameters
 * @returns URLSearchParams object
 */
export function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/**
 * Type definitions for watch page parameters
 */
export interface MovieParams {
  type: 'movie';
  id: string;
  server?: string;
}

export interface TVParams {
  type: 'tv';
  id: string;
  season: string;
  episode: string;
  server?: string;
}

export type WatchParams = MovieParams | TVParams;

/**
 * Hook specifically for the watch page params with type safety
 * @returns Parsed watch parameters or null if invalid
 */
export function useWatchQuery(): WatchParams | null {
  const { search } = useLocation();
  
  return useMemo(() => {
    const params = new URLSearchParams(search);
    const type = params.get('type');
    const id = params.get('id');
    const server = params.get('server');
    const season = params.get('s') || params.get('season');
    const episode = params.get('e') || params.get('episode');

    // Validate required parameters
    if (!type || !id) {
      return null;
    }

    // Handle movie type
    if (type === 'movie') {
      const movieParams: MovieParams = {
        type: 'movie',
        id,
      };
      
      if (server) {
        movieParams.server = server;
      }
      
      return movieParams;
    }

    // Handle TV show type
    if (type === 'tv' && season && episode) {
      const tvParams: TVParams = {
        type: 'tv',
        id,
        season,
        episode,
      };
      
      if (server) {
        tvParams.server = server;
      }
      
      return tvParams;
    }

    return null;
  }, [search]);
}

/**
 * Enhanced hook using useSearchParams for easier parameter manipulation
 * @returns [searchParams, setSearchParams] tuple
 */
export function useSearchParamsState() {
  return useSearchParams();
}

/**
 * Hook to get a specific query parameter value
 * @param key - The parameter key to retrieve
 * @param defaultValue - Optional default value if parameter doesn't exist
 * @returns The parameter value or default value
 */
export function useQueryParam(key: string, defaultValue?: string): string | null {
  const { search } = useLocation();
  
  return useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get(key) || defaultValue || null;
  }, [search, key, defaultValue]);
}

/**
 * Hook to get multiple query parameters at once
 * @param keys - Array of parameter keys to retrieve
 * @returns Object with key-value pairs
 */
export function useMultipleQueryParams(keys: string[]): Record<string, string | null> {
  const { search } = useLocation();
  
  return useMemo(() => {
    const params = new URLSearchParams(search);
    const result: Record<string, string | null> = {};
    
    keys.forEach(key => {
      result[key] = params.get(key);
    });
    
    return result;
  }, [search, keys]);
}

/**
 * Utility hook to check if watch params are valid
 * @returns Object with validation status and error message
 */
export function useWatchQueryValidation() {
  const params = useWatchQuery();
  
  return useMemo(() => {
    if (!params) {
      return {
        isValid: false,
        error: 'Invalid or missing watch parameters',
        params: null,
      };
    }

    if (params.type === 'movie') {
      return {
        isValid: true,
        error: null,
        params,
        mediaType: 'movie' as const,
      };
    }

    if (params.type === 'tv') {
      const seasonNum = parseInt(params.season);
      const episodeNum = parseInt(params.episode);
      
      if (isNaN(seasonNum) || seasonNum < 1) {
        return {
          isValid: false,
          error: 'Invalid season number',
          params: null,
        };
      }
      
      if (isNaN(episodeNum) || episodeNum < 1) {
        return {
          isValid: false,
          error: 'Invalid episode number',
          params: null,
        };
      }
      
      return {
        isValid: true,
        error: null,
        params,
        mediaType: 'tv' as const,
      };
    }

    return {
      isValid: false,
      error: 'Unknown media type',
      params: null,
    };
  }, [params]);
}

/**
 * Hook to build watch page URLs programmatically
 * @returns Function to generate watch URLs
 */
export function useWatchUrlBuilder() {
  return useMemo(() => {
    return {
      buildMovieUrl: (id: string | number, server?: number) => {
        const params = new URLSearchParams({
          type: 'movie',
          id: String(id),
        });
        
        if (server) {
          params.set('server', String(server));
        }
        
        return `/watch?${params.toString()}`;
      },
      
      buildTVUrl: (id: string | number, season: number, episode: number, server?: number) => {
        const params = new URLSearchParams({
          type: 'tv',
          id: String(id),
          s: String(season),
          e: String(episode),
        });
        
        if (server) {
          params.set('server', String(server));
        }
        
        return `/watch?${params.toString()}`;
      },
    };
  }, []);
}

/**
 * Hook to get all query parameters as an object
 * @returns Object with all query parameters
 */
export function useAllQueryParams(): Record<string, string> {
  const { search } = useLocation();
  
  return useMemo(() => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    
    params.forEach((value, key) => {
      result[key] = value;
    });
    
    return result;
  }, [search]);
}
