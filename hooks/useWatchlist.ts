import { useState, useEffect } from 'react';
import { Media } from '../types';
import { getFavorites, addToFavorites, removeFromFavorites, isInFavorites } from '../utils/storage';

export function useWatchlist(mediaId?: number) {
  const [favorites, setFavorites] = useState<Media[]>([]);
  const [isInList, setIsInList] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Check if current media is in favorites
  useEffect(() => {
    if (mediaId) {
      setIsInList(isInFavorites(mediaId));
    }
  }, [mediaId]);

  const addItem = (media: Media) => {
    const success = addToFavorites(media);
    if (success) {
      setFavorites(getFavorites());
      setIsInList(true);
      return true;
    }
    return false;
  };

  const removeItem = (id: number) => {
    const success = removeFromFavorites(id);
    if (success) {
      setFavorites(getFavorites());
      setIsInList(false);
      return true;
    }
    return false;
  };

  const toggleItem = (media: Media) => {
    if (isInList) {
      return removeItem(media.id);
    } else {
      return addItem(media);
    }
  };

  return {
    favorites,
    isInList,
    addItem,
    removeItem,
    toggleItem,
  };
}
