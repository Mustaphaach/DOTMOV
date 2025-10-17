
import { TMDB_API_KEY, TMDB_API_BASE_URL } from '../constants';
import { Media, MovieDetails, TVDetails, SeasonDetails, URLParams, TMDBData, EpisodeSelectionData } from '../types';

const headers = {
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'accept': 'application/json'
};

const fetchData = async <T,>(endpoint: string): Promise<T> => {
    const response = await fetch(`${TMDB_API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: headers
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export const getTrending = async (mediaType: 'movie' | 'tv'): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/trending/${mediaType}/week`);
    return data.results;
};

export const getPopular = async (mediaType: 'movie' | 'tv'): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/${mediaType}/popular`);
    return data.results;
};

export const searchMedia = async (query: string): Promise<Media[]> => {
    const data = await fetchData<{ results: Media[] }>(`/search/multi?query=${encodeURIComponent(query)}`);
    return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
};

export const fetchTMDBDataFromParams = async (params: NonNullable<URLParams>): Promise<TMDBData> => {
    const result: Partial<TMDBData> & { title: string } = { title: '' };

    if (params.type === 'movie') {
        const data = await fetchData<MovieDetails>(`/movie/${params.id}?language=en-US`);
        result.title = data.original_title;
    } else if (params.type === 'tv') {
        const data = await fetchData<TVDetails>(`/tv/${params.id}?language=en-US`);
        result.title = data.name;
        result.seasons = [];
        data.seasons.forEach(season => {
            result[season.season_number] = season.episode_count;
            if (season.season_number !== 0) { // Exclude Season 0 (Specials)
                result.seasons?.push(season.season_number);
            }
        });
    } else {
        throw new Error('Invalid type specified');
    }
    return result as TMDBData;
};

export const fetchEpSelectionData = async (params: NonNullable<URLParams>, tmdbData: TMDBData): Promise<EpisodeSelectionData> => {
    if (params.type !== 'tv' || !tmdbData.seasons) return {};

    const result: EpisodeSelectionData = {};
    const seasonPromises = tmdbData.seasons.map(seasonNumber => 
        fetchData<SeasonDetails>(`/tv/${params.id}/season/${seasonNumber}?language=en-US`)
    );

    const seasonsData = await Promise.all(seasonPromises);
    seasonsData.forEach(seasonData => {
        result[seasonData.season_number] = seasonData;
    });

    return result;
};
