import { Media } from '../types';

const WATCHLIST_KEY = 'dotmov_watchlist';
const RECENTLY_VIEWED_KEY = 'dotmov_recently_viewed';
const FAVORITES_KEY = 'dotmov_favorites';
const MAX_RECENT_ITEMS = 20;

/**
 * Watchlist Functions
 */
export const getWatchlist = (): Media[] => {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading watchlist:', error);
    return [];
  }
};

export const addToWatchlist = (media: Media): boolean => {
  try {
    const watchlist = getWatchlist();
    // Check if already in watchlist
    if (watchlist.some(item => item.id === media.id)) {
      return false;
    }
    watchlist.unshift(media);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
};

export const removeFromWatchlist = (mediaId: number): boolean => {
  try {
    const watchlist = getWatchlist();
    const filtered = watchlist.filter(item => item.id !== mediaId);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
};

export const isInWatchlist = (mediaId: number): boolean => {
  const watchlist = getWatchlist();
  return watchlist.some(item => item.id === mediaId);
};

/**
 * Recently Viewed Functions
 */
export const getRecentlyViewed = (): Media[] => {
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading recently viewed:', error);
    return [];
  }
};

export const addToRecentlyViewed = (media: Media): void => {
  try {
    let recentlyViewed = getRecentlyViewed();
    
    // Remove if already exists to avoid duplicates (check both id AND media_type)
  
    
    // Add to beginning
    recentlyViewed.unshift(media);
    
    // Keep only the most recent items
    if (recentlyViewed.length > MAX_RECENT_ITEMS) {
      recentlyViewed = recentlyViewed.slice(0, MAX_RECENT_ITEMS);
    }
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

export const clearRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};

/**
 * Favorites Functions
 */
export const getFavorites = (): Media[] => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

export const addToFavorites = (media: Media): boolean => {
  try {
    const favorites = getFavorites();
    // Check if already in favorites
    if (favorites.some(item => item.id === media.id)) {
      return false;
    }
    favorites.unshift(media);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = (mediaId: number): boolean => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(item => item.id !== mediaId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const isInFavorites = (mediaId: number): boolean => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === mediaId);
};
