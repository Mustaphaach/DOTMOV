
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchQuery } from '../hooks/useQuery';
import { fetchTMDBDataFromParams, fetchEpSelectionData } from '../services/tmdbService';
import { TMDBData, EpisodeSelectionData } from '../types';
import Loader from '../components/Loader';
import EpisodeSelector from '../components/EpisodeSelector';

const SERVERS = [
    { id: 1, name: "Vidsrc" },
    { id: 2, name: "MoviesAPI" },
    { id: 3, name: "VidsrcME" },
    { id: 4, name: "Videasy" },
    { id: 5, name: "VidsrcSU" },
    { id: 6, name: "VidLink" },
];

const WatchPage: React.FC = () => {
    const params = useWatchQuery();
    const navigate = useNavigate();
    const [iframeSrc, setIframeSrc] = useState('');
    const [tmdbData, setTmdbData] = useState<TMDBData | null>(null);
    const [epSelectionData, setEpSelectionData] = useState<EpisodeSelectionData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentServer, setCurrentServer] = useState(1);
    const [isEpSelectorOpen, setIsEpSelectorOpen] = useState(false);

    const getIframeSrc = useCallback((serverNumber: number) => {
        if (!params) return '';
        let src = '';
        if (params.type === 'movie') {
            switch (serverNumber) {
                case 1: src = `https://vidsrc.cc/v3/embed/movie/${params.id}?autoPlay=false`; break;
                case 2: src = `https://moviesapi.club/movie/${params.id}`; break;
                case 3: src = `https://vidsrc.me/embed/movie?tmdb=${params.id}`; break;
                case 4: src = `https://player.videasy.net/movie/${params.id}`; break;
                case 5: src = `https://vidsrc.su/embed/movie/${params.id}`; break;
                case 6: src = `https://vidlink.pro/movie/${params.id}?title=true&poster=true&autoplay=false`; break;
            }
        } else if (params.type === 'tv') {
            switch (serverNumber) {
                case 1: src = `https://vidsrc.cc/v3/embed/tv/${params.id}/${params.season}/${params.episode}?autoPlay=false`; break;
                case 2: src = `https://moviesapi.club/tv/${params.id}-${params.season}-${params.episode}`; break;
                case 3: src = `https://vidsrc.me/embed/tv?tmdb=${params.id}&season=${params.season}&episode=${params.episode}`; break;
                case 4: src = `https://player.videasy.net/tv/${params.id}/${params.season}/${params.episode}?nextEpisode=true&episodeSelector=true`; break;
                case 5: src = `https://vidsrc.su/embed/tv/${params.id}/${params.season}/${params.episode}`; break;
                case 6: src = `https://vidlink.pro/tv/${params.id}/${params.season}/${params.episode}?title=true&poster=true&autoplay=false&nextbutton=true`; break;
            }
        }
        return src;
    }, [params]);

    useEffect(() => {
        if (!params) {
            setError("Invalid URL. Please select a movie or TV show.");
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchTMDBDataFromParams(params as any);
                setTmdbData(data);
                if (params.type === 'tv') {
                    const epData = await fetchEpSelectionData(params as any, data);
                    setEpSelectionData(epData);
                }
                const serverFromUrl = params.server ? parseInt(params.server) : 1;
                setCurrentServer(serverFromUrl);
                setIframeSrc(getIframeSrc(serverFromUrl));
            } catch (err) {
                console.error(err);
                setError("Failed to load media details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [params, getIframeSrc]);

    const changeServer = (serverNumber: number) => {
        setCurrentServer(serverNumber);
        setIframeSrc(getIframeSrc(serverNumber));
    };

    const getNextEp = () => {
        if (!params || params.type !== 'tv' || !tmdbData) return null;
        const currentSeason = parseInt(params.season!);
        const currentEpisode = parseInt(params.episode!);
        const currentSeasonEps = tmdbData[currentSeason];

        if (currentEpisode < currentSeasonEps) {
            return { s: currentSeason, e: currentEpisode + 1 };
        }
        const nextSeason = currentSeason + 1;
        if (tmdbData[nextSeason] !== undefined) {
            return { s: nextSeason, e: 1 };
        }
        return null;
    };

    const handleNextEpisode = () => {
        const nextEp = getNextEp();
        if (nextEp) {
            navigate(`/watch?type=tv&id=${params!.id}&s=${nextEp.s}&e=${nextEp.e}&server=${currentServer}`);
        }
    };

    if (loading) return <div className="h-96"><Loader /></div>;
    if (error) return <div className="text-center text-red-500 text-xl p-8">{error}</div>;
    if (!params || !tmdbData) return null;

    const pageTitle = params.type === 'movie'
        ? tmdbData.title
        : `${tmdbData.title} S${params.season} E${params.episode}`;
    
    const nextEp = getNextEp();

    return (
        <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl shadow-blue-500/20">
                {iframeSrc ? (
                    <iframe
                        key={iframeSrc}
                        src={iframeSrc}
                        allowFullScreen
                        className="w-full h-full border-0"
                    ></iframe>
                ) : <Loader />}
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-0">
                        {pageTitle}
                    </h1>
                    <div className="flex items-center space-x-2">
                        {params.type === 'tv' && (
                            <>
                                <button
                                    onClick={() => setIsEpSelectorOpen(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 4a1 1 0 00-1 1v1h14V5a1 1 0 00-1-1H4zM3 9h14v5a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" /></svg>
                                  <span>Episodes</span>
                                </button>
                                <button
                                    onClick={handleNextEpisode}
                                    disabled={!nextEp}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    title={nextEp ? `Next: S${nextEp.s} E${nextEp.e}` : 'Last episode'}
                                >
                                   <span>Next</span>
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Servers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {SERVERS.map(server => (
                        <button
                            key={server.id}
                            onClick={() => changeServer(server.id)}
                            className={`p-3 rounded-lg font-semibold transition-all duration-200 ${currentServer === server.id ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {server.name}
                        </button>
                    ))}
                </div>
            </div>
            
            {params.type === 'tv' && (
                <EpisodeSelector
                    isOpen={isEpSelectorOpen}
                    onClose={() => setIsEpSelectorOpen(false)}
                    params={params as any}
                    tmdbData={tmdbData}
                    epSelectionData={epSelectionData}
                    currentServer={currentServer}
                />
            )}
        </div>
    );
};

export default WatchPage;
