import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Media } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { useWatchlist } from '../hooks/useWatchlist';

interface MovieCardProps {
  media: Media;
}

const MovieCard: React.FC<MovieCardProps> = ({ media }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const { isInList, toggleItem } = useWatchlist(media.id);

  const title = media.title || media.name;
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  const linkTo = mediaType === 'movie' 
    ? `/watch?type=movie&id=${media.id}`
    : `/watch?type=tv&id=${media.id}&s=1&e=1`;
  
  const placeholderImage = 'https://via.placeholder.com/500x750/1a1a1a/4a5568?text=No+Image';
  const posterUrl = media.poster_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : placeholderImage;

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(media);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div className="relative">
      <Link 
        to={linkTo} 
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative rounded-xl overflow-hidden bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
          {/* Image container with loading state */}
          <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
            {/* Loading skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            )}

            {/* Poster image */}
            <img
              src={posterUrl}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              loading="lazy"
            />

            {/* Dark overlay */}
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}></div>

            {/* Play button overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              <div className="bg-white/95 backdrop-blur-sm rounded-full p-5 shadow-2xl transform hover:scale-110 transition-transform duration-200">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-gray-900 ml-0.5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Rating badge */}
            {media.vote_average > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center space-x-1">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{media.vote_average.toFixed(1)}</span>
                </div>
              </div>
            )}

            {/* Media type badge */}
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-white/20">
                {mediaType === 'movie' ? (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    <span>Movie</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Series</span>
                  </>
                )}
              </div>
            </div>

            {/* Bottom info on hover */}
            <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/95 to-transparent transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}>
              {media.overview && (
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 mb-2">
                  {media.overview}
                </p>
              )}
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                {year && (
                  <span className="flex items-center space-x-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{year}</span>
                  </span>
                )}
                {media.vote_count > 0 && (
                  <>
                    <span>•</span>
                    <span>{media.vote_count.toLocaleString()} votes</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="relative p-3 bg-gray-900 border-t border-gray-800">
            <h3 
              className={`text-white font-semibold text-sm leading-snug transition-colors duration-200 ${
                isHovered ? 'text-blue-400' : ''
              }`}
              title={title}
            >
              <span className="line-clamp-2">{title}</span>
            </h3>
            
            {/* Action hint */}
            <div className={`mt-2 flex items-center space-x-1.5 text-xs transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}>
              <span className="text-blue-400 font-semibold">Watch Now</span>
              <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Watchlist Button - Outside the Link */}
      <button
        onClick={handleWatchlistClick}
        className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
          isInList 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50' 
            : 'bg-black/60 text-white hover:bg-black/80'
        }`}
        aria-label={isInList ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {isInList ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>

      {/* Notification Toast */}
      {showNotification && (
        <div className="absolute top-14 right-3 z-30 bg-black/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xl border border-white/20 animate-fade-in">
          {isInList ? '✓ Added to watchlist' : '✕ Removed from watchlist'}
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MovieCard;
