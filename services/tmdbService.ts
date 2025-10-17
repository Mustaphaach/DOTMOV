import { TMDB_API_KEY, TMDB_API_BASE_URL } from '../constants';
import { Media, MovieDetails, TVDetails, SeasonDetails, URLParams, TMDBData, EpisodeSelectionData } from '../types';

const headers = {
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'accept': 'application/json'
};

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generic fetch function with error handling and caching
 */
const fetchData = async <T,>(endpoint: string, useCache = true): Promise<T> => {
    const cacheKey = endpoint;
    
    // Check cache
    if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data as T;
        }
        cache.delete(cacheKey);
    }

    try {
        const response = await fetch(`${TMDB_API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Resource not found');
            } else if (response.status === 401) {
                throw new Error('Invalid API key or unauthorized access');
            } else if (response.status === 429) {
                throw new Error('Too many requests. Please try again later');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache the result
        if (useCache) {
            cache.set(cacheKey, { data, timestamp: Date.now() });
        }
        
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching ${endpoint}:`, error.message);
            throw error;
        }
        throw new Error('An unexpected error occurred');
    }
};

/**
 * Clear the cache (useful for force refresh)
 */
export const clearCache = () => {
    cache.clear();
};

/**
 * Clear specific cache entry
 */
export const clearCacheEntry = (endpoint: string) => {
    cache.delete(endpoint);
};

/**
 * Get trending media (movies or TV shows)
 */
export const getTrending = async (mediaType: 'movie' | 'tv', timeWindow: 'day' | 'week' = 'week'): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/trending/${mediaType}/${timeWindow}`);
    return data.results || [];
};

/**
 * Get popular media (movies or TV shows)
 */
export const getPopular = async (mediaType: 'movie' | 'tv', page: number = 1): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/${mediaType}/popular?page=${page}`);
    return data.results || [];
};

/**
 * Get top rated media
 */
export const getTopRated = async (mediaType: 'movie' | 'tv', page: number = 1): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/${mediaType}/top_rated?page=${page}`);
    return data.results || [];
};

/**
 * Get upcoming movies
 */
export const getUpcoming = async (page: number = 1): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/movie/upcoming?page=${page}`);
    return data.results || [];
};

/**
 * Get now playing movies
 */
export const getNowPlaying = async (page: number = 1): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/movie/now_playing?page=${page}`);
    return data.results || [];
};

/**
 * Search for movies, TV shows, and people
 */
export const searchMedia = async (query: string, page: number = 1): Promise<Media[]> => {
    if (!query.trim()) {
        return [];
    }
    
    const data = await fetchData<{ results: Media[] }>(
        `/search/multi?query=${encodeURIComponent(query)}&page=${page}`
    );
    return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
};

/**
 * Search specifically for movies
 */
export const searchMovies = async (query: string, page: number = 1): Promise<Media[]> => {
    if (!query.trim()) {
        return [];
    }
    
    const data = await fetchData<{ results: Media[] }>(
        `/search/movie?query=${encodeURIComponent(query)}&page=${page}`
    );
    return data.results || [];
};

/**
 * Search specifically for TV shows
 */
export const searchTV = async (query: string, page: number = 1): Promise<Media[]> => {
    if (!query.trim()) {
        return [];
    }
    
    const data = await fetchData<{ results: Media[] }>(
        `/search/tv?query=${encodeURIComponent(query)}&page=${page}`
    );
    return data.results || [];
};

/**
 * Get media by genre
 */
export const getByGenre = async (
    mediaType: 'movie' | 'tv', 
    genreId: number, 
    page: number = 1
): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(
        `/discover/${mediaType}?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`
    );
    return data.results || [];
};

/**
 * Get movie or TV show details
 */
export const getMediaDetails = async (mediaType: 'movie' | 'tv', id: string | number): Promise<MovieDetails | TVDetails> => {
    const data = await fetchData<MovieDetails | TVDetails>(`/${mediaType}/${id}?language=en-US`);
    return data;
};

/**
 * Get similar media recommendations
 */
export const getSimilar = async (mediaType: 'movie' | 'tv', id: string | number): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/${mediaType}/${id}/similar`);
    return data.results || [];
};

/**
 * Get media recommendations
 */
export const getRecommendations = async (mediaType: 'movie' | 'tv', id: string | number): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/${mediaType}/${id}/recommendations`);
    return data.results || [];
};

/**
 * Fetch TMDB data based on URL parameters
 */
export const fetchTMDBDataFromParams = async (params: NonNullable<URLParams>): Promise<TMDBData> => {
    const result: Partial<TMDBData> & { title: string; overview: string } = { 
        title: '', 
        overview: '' 
    };

    try {
        if (params.type === 'movie') {
            const data = await fetchData<MovieDetails>(`/movie/${params.id}?language=en-US`);
            result.title = data.title || data.original_title;
            result.overview = data.overview || '';
        } else if (params.type === 'tv') {
            const data = await fetchData<TVDetails>(`/tv/${params.id}?language=en-US`);
            result.title = data.name;
            result.overview = data.overview || '';
            result.seasons = [];
            
            if (data.seasons && Array.isArray(data.seasons)) {
                data.seasons.forEach(season => {
                    if (season.season_number !== undefined && season.episode_count !== undefined) {
                        result[season.season_number] = season.episode_count;
                        if (season.season_number !== 0) { // Exclude Season 0 (Specials)
                            result.seasons?.push(season.season_number);
                        }
                    }
                });
            }
        } else {
            throw new Error('Invalid media type specified');
        }
        
        return result as TMDBData;
    } catch (error) {
        console.error('Error fetching TMDB data:', error);
        throw error;
    }
};

/**
 * Fetch episode selection data for TV shows
 */
export const fetchEpSelectionData = async (
    params: NonNullable<URLParams>, 
    tmdbData: TMDBData
): Promise<EpisodeSelectionData> => {
    if (params.type !== 'tv' || !tmdbData.seasons || tmdbData.seasons.length === 0) {
        return {};
    }

    try {
        const result: EpisodeSelectionData = {};
        
        const seasonPromises = tmdbData.seasons.map(seasonNumber => 
            fetchData<SeasonDetails>(`/tv/${params.id}/season/${seasonNumber}?language=en-US`)
                .catch(error => {
                    console.error(`Error fetching season ${seasonNumber}:`, error);
                    return null;
                })
        );

        const seasonsData = await Promise.all(seasonPromises);
        
        seasonsData.forEach(seasonData => {
            if (seasonData && seasonData.season_number !== undefined) {
                result[seasonData.season_number] = seasonData;
            }
        });

        return result;
    } catch (error) {
        console.error('Error fetching episode selection data:', error);
        return {};
    }
};

/**
 * Get available genres for movies or TV shows
 */
export const getGenres = async (mediaType: 'movie' | 'tv'): Promise<{ id: number; name: string }[]> => {
    const data = await fetchData<{ genres: { id: number; name: string }[] }>(
        `/genre/${mediaType}/list?language=en-US`
    );
    return data.genres || [];
};

/**
 * Get cast and crew information
 */
export const getCredits = async (mediaType: 'movie' | 'tv', id: string | number) => {
    const data = await fetchData<any>(`/${mediaType}/${id}/credits`);
    return {
        cast: data.cast || [],
        crew: data.crew || []
    };
};

/**
 * Get videos (trailers, teasers, etc.)
 */
export const getVideos = async (mediaType: 'movie' | 'tv', id: string | number) => {
    const data = await fetchData<{ results: any[] }>(`/${mediaType}/${id}/videos`);
    return data.results || [];
};

/**
 * Get images (posters, backdrops)
 */
export const getImages = async (mediaType: 'movie' | 'tv', id: string | number) => {
    const data = await fetchData<any>(`/${mediaType}/${id}/images`);
    return {
        posters: data.posters || [],
        backdrops: data.backdrops || []
    };
};

/**
 * Batch fetch multiple media items by IDs
 */
export const batchFetchMedia = async (
    mediaType: 'movie' | 'tv', 
    ids: (string | number)[]
): Promise<(MovieDetails | TVDetails)[]> => {
    const promises = ids.map(id => 
        getMediaDetails(mediaType, id).catch(error => {
            console.error(`Error fetching ${mediaType} ${id}:`, error);
            return null;
        })
    );
    
    const results = await Promise.all(promises);
    return results.filter((item): item is MovieDetails | TVDetails => item !== null);
};

/**
 * Check API health
 */
export const checkAPIHealth = async (): Promise<boolean> => {
    try {
        await fetchData<any>('/configuration', false);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get full media details for storage (with poster images)
 */
export const getMediaDetailsForStorage = async (type: 'movie' | 'tv', id: string): Promise<Media> => {
  const data = await fetchData<any>(`/${type}/${id}?language=en-US`);
  
  return {
    id: data.id,
    title: data.title || data.name,
    name: data.title || data.name,
    media_type: type,
    poster_path: data.poster_path || '',
    backdrop_path: data.backdrop_path || '',
    vote_average: data.vote_average || 0,
    overview: data.overview || '',
  };
};
