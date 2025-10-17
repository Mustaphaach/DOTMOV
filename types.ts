export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  overview: string;
  media_type?: 'movie' | 'tv';
}

export interface MovieDetails extends Media {
  original_title: string;
}

export interface TVDetails extends Media {
  name: string;
  seasons: Season[];
  number_of_episodes: number;
  number_of_seasons: number;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

export interface Episode {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
}

export interface SeasonDetails extends Season {
    episodes: Episode[];
}

export type URLParams = {
    type: 'movie' | 'tv';
    id: string;
    season?: string;
    episode?: string;
    server?: string;
} | null;

export interface TMDBData {
    title: string;
    overview: string; // ADDED THIS LINE
    seasons?: number[];
    [key: number]: number | string | number[] | undefined; // Updated to allow string for overview
}

export interface EpisodeSelectionData {
    [key: number]: SeasonDetails;
}
