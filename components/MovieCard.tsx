
import React from 'react';
import { Link } from 'react-router-dom';
import { Media } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';

interface MovieCardProps {
  media: Media;
}

const MovieCard: React.FC<MovieCardProps> = ({ media }) => {
  const title = media.title || media.name;
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
  const linkTo = mediaType === 'movie' 
    ? `/watch?type=movie&id=${media.id}`
    : `/watch?type=tv&id=${media.id}&s=1&e=1`;
  
  const placeholderImage = 'https://via.placeholder.com/500x750/0a0a0a/ffffff?text=No+Image';

  return (
    <Link to={linkTo} className="group block bg-gray-800 rounded-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20">
      <div className="relative">
        <img
          src={media.poster_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : placeholderImage}
          alt={title}
          className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-70"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
        {media.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {media.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold truncate" title={title}>{title}</h3>
      </div>
    </Link>
  );
};

export default MovieCard;
