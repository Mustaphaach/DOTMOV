import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EpisodeSelectionData, TMDBData, URLParams } from '../types';

interface EpisodeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  params: NonNullable<URLParams>;
  tmdbData: TMDBData;
  epSelectionData: EpisodeSelectionData;
  currentServer: number;
}

const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
  isOpen,
  onClose,
  params,
  tmdbData,
  epSelectionData,
  currentServer,
}) => {
  const [view, setView] = useState<'seasons' | 'episodes'>('seasons');
  const [selectedSeason, setSelectedSeason] = useState<number>(Number(params.season) || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setView('seasons');
      setSelectedSeason(Number(params.season) || 1);
      setSearchQuery('');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, params.season]);

  const handleSeasonClick = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setView('episodes');
  };

  const handleEpisodeClick = (season: number, episode: number) => {
    navigate(`/watch?type=tv&id=${params.id}&s=${season}&e=${episode}&server=${currentServer}`);
    onClose();
  };

  // Filter episodes based on search
  const filteredEpisodes = epSelectionData[selectedSeason]?.episodes.filter((ep) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ep.name.toLowerCase().includes(query) ||
      ep.episode_number.toString().includes(query)
    );
  }) || [];

  if (!isOpen) return null;

  const totalSeasons = tmdbData.seasons?.length || 0;
  const currentSeasonData = epSelectionData[selectedSeason];
  const totalEpisodes = currentSeasonData?.episodes?.length || 0;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-5 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center space-x-3 flex-1">
            {view === 'episodes' && (
              <button 
                onClick={() => setView('seasons')} 
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 group"
                aria-label="Back to seasons"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-white flex items-center space-x-2">
                {view === 'seasons' ? (
                  <>
                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{tmdbData.title}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    <span>{currentSeasonData?.name || `Season ${selectedSeason}`}</span>
                  </>
                )}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {view === 'seasons' 
                  ? `${totalSeasons} ${totalSeasons === 1 ? 'Season' : 'Seasons'} Available` 
                  : `${totalEpisodes} ${totalEpisodes === 1 ? 'Episode' : 'Episodes'}`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 group ml-2"
            aria-label="Close modal"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 transform group-hover:rotate-90 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Search Bar (Episodes View Only) */}
        {view === 'episodes' && (
          <div className="p-4 border-b border-gray-700 bg-gray-800/30">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search episodes..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition-all duration-200"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-grow custom-scrollbar">
          {/* Seasons View */}
          {view === 'seasons' && tmdbData.seasons && (
            <div className="space-y-3">
              {tmdbData.seasons.map((seasonNum) => {
                const seasonData = epSelectionData[seasonNum];
                const episodeCount = seasonData?.episodes?.length || 0;
                const isCurrentSeason = seasonNum === Number(params.season);
                
                return (
                  <button
                    key={seasonNum}
                    onClick={() => handleSeasonClick(seasonNum)}
                    className={`w-full text-left p-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] group ${
                      isCurrentSeason
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30 border-2 border-blue-400'
                        : 'bg-gray-700/50 hover:bg-gray-700 border-2 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isCurrentSeason ? 'bg-white/20' : 'bg-gray-600'
                          }`}>
                            Season {seasonNum}
                          </div>
                          {isCurrentSeason && (
                            <span className="flex items-center space-x-1 text-xs text-white/90">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              <span>Watching</span>
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-lg text-white mb-1">
                          {seasonData?.name || `Season ${seasonNum}`}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          {seasonData?.air_date && (
                            <span className="flex items-center space-x-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(seasonData.air_date).getFullYear()}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                            <span>{episodeCount} {episodeCount === 1 ? 'Episode' : 'Episodes'}</span>
                          </span>
                        </div>
                      </div>
                      <svg 
                        className={`h-6 w-6 transform transition-transform ${
                          isCurrentSeason ? 'text-white' : 'text-gray-400 group-hover:translate-x-1'
                        }`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Episodes View */}
          {view === 'episodes' && (
            <>
              {filteredEpisodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEpisodes.map((ep) => {
                    const isCurrentEpisode = Number(params.episode) === ep.episode_number && selectedSeason === Number(params.season);
                    
                    return (
                      <button
                        key={ep.episode_number}
                        onClick={() => handleEpisodeClick(selectedSeason, ep.episode_number)}
                        className={`text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] group ${
                          isCurrentEpisode
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400'
                            : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isCurrentEpisode ? 'bg-white/20 text-white' : 'bg-gray-600 text-gray-200'
                          }`}>
                            Episode {ep.episode_number}
                          </div>
                          {isCurrentEpisode && (
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-white mb-2 line-clamp-2 leading-snug">
                          {ep.name}
                        </h3>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-300">
                          {ep.air_date && (
                            <span className="flex items-center space-x-1">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{ep.air_date}</span>
                            </span>
                          )}
                          {ep.runtime && (
                            <span className="flex items-center space-x-1">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{ep.runtime}m</span>
                            </span>
                          )}
                        </div>

                        {isCurrentEpisode && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <span className="text-xs text-white/90 font-semibold flex items-center space-x-1">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              <span>Now Playing</span>
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Empty search state
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                    <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Episodes Found</h3>
                  <p className="text-gray-400 mb-4">
                    No episodes match your search for "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EpisodeSelector;
