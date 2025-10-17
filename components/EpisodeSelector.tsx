
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
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setView('seasons');
      setSelectedSeason(Number(params.season) || 1);
    }
  }, [isOpen, params.season]);

  const handleSeasonClick = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setView('episodes');
  };

  const handleEpisodeClick = (season: number, episode: number) => {
    navigate(`/watch?type=tv&id=${params.id}&s=${season}&e=${episode}&server=${currentServer}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          {view === 'episodes' && (
            <button onClick={() => setView('seasons')} className="p-2 rounded-full hover:bg-gray-700">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <h2 className="text-xl font-bold text-center flex-grow">
            {view === 'seasons' ? tmdbData.title : epSelectionData[selectedSeason]?.name || `Season ${selectedSeason}`}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="overflow-y-auto p-4 flex-grow">
          {view === 'seasons' && tmdbData.seasons && (
            <ul className="space-y-2">
              {tmdbData.seasons.map((seasonNum) => (
                <li key={seasonNum}>
                  <button
                    onClick={() => handleSeasonClick(seasonNum)}
                    className="w-full text-left p-4 bg-gray-700 rounded-md hover:bg-blue-600 transition-colors duration-200"
                  >
                    <div className="font-semibold">{epSelectionData[seasonNum]?.name || `Season ${seasonNum}`}</div>
                    <div className="text-sm text-gray-400">{epSelectionData[seasonNum]?.air_date || ''}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {view === 'episodes' && epSelectionData[selectedSeason] && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {epSelectionData[selectedSeason].episodes.map((ep) => (
                <li key={ep.episode_number}>
                  <button
                    onClick={() => handleEpisodeClick(selectedSeason, ep.episode_number)}
                    className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${Number(params.episode) === ep.episode_number ? 'bg-blue-600' : 'bg-gray-700 hover:bg-blue-600'}`}
                  >
                    <div className="font-semibold truncate">E{ep.episode_number} - {ep.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {ep.air_date} {ep.runtime ? `(${ep.runtime}m)` : ''}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EpisodeSelector;
