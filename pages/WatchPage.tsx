import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchQuery } from '../hooks/useQuery';
import { fetchTMDBDataFromParams, fetchEpSelectionData, getMediaDetailsForStorage } from '../services/tmdbService';
import { TMDBData, EpisodeSelectionData } from '../types';
import Loader from '../components/Loader';
import EpisodeSelector from '../components/EpisodeSelector';
import { addToRecentlyViewed } from '../utils/storage';

const SERVERS = [
    { id: 1, name: "Server 1", badge: "Fast", color: "blue" },
    { id: 2, name: "Server 2", badge: "HD", color: "green" },
    { id: 3, name: "Server 3", badge: "Stable", color: "purple" },
    { id: 4, name: "Server 4", badge: "New", color: "orange" },
    { id: 5, name: "Server 5", badge: "Pro", color: "red" },
    { id: 6, name: "Server 6", badge: "Ultra", color: "cyan" },
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showServerInfo, setShowServerInfo] = useState(false);
    const [failedServers, setFailedServers] = useState<number[]>([]);
    const [isAutoSwitching, setIsAutoSwitching] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Auto-switch to next available server
    const tryNextServer = useCallback(() => {
        if (!params) return;
        
        const availableServers = SERVERS.filter(s => !failedServers.includes(s.id));
        const currentIndex = availableServers.findIndex(s => s.id === currentServer);
        
        if (currentIndex < availableServers.length - 1) {
            const nextServer = availableServers[currentIndex + 1];
            console.log(`Server ${currentServer} failed. Switching to Server ${nextServer.id}...`);
            setIsAutoSwitching(true);
            setFailedServers(prev => [...prev, currentServer]);
            setCurrentServer(nextServer.id);
            setIframeSrc(getIframeSrc(nextServer.id));
            
            // Show notification
            setTimeout(() => setIsAutoSwitching(false), 2000);
        } else {
            console.error('All servers failed to load');
            setError('Unable to load video from any server. Please try again later.');
        }
    }, [currentServer, failedServers, getIframeSrc, params]);

    // Monitor iframe loading
    useEffect(() => {
        if (!iframeSrc) return;

        // Clear previous timeout
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
        }

        // Set a timeout to detect if iframe fails to load
        loadTimeoutRef.current = setTimeout(() => {
            // If iframe hasn't loaded after 15 seconds, try next server
            if (iframeRef.current && !failedServers.includes(currentServer)) {
                console.warn(`Server ${currentServer} timeout. Trying next server...`);
                tryNextServer();
            }
        }, 15000); // 15 second timeout

        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, [iframeSrc, currentServer, failedServers, tryNextServer]);

    useEffect(() => {
        if (!params) {
            setError("Invalid URL. Please select a movie or TV show.");
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            setError(null);
            setFailedServers([]);
            try {
                const data = await fetchTMDBDataFromParams(params as any);
                setTmdbData(data);
                if (params.type === 'tv') {
                    const epData = await fetchEpSelectionData(params as any, data);
                    setEpSelectionData(epData);
                }
                const serverFromUrl = params.server ? parseInt(params.server) : 4; // Default to Server 4
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

    // Track recently viewed when media is loaded
    useEffect(() => {
        if (tmdbData && params) {
            const saveToRecent = async () => {
                try {
                    const fullMediaData = await getMediaDetailsForStorage(params.type, params.id);
                    addToRecentlyViewed(fullMediaData);
                } catch (error) {
                    console.error('Error saving to recently viewed:', error);
                }
            };
            
            saveToRecent();
        }
    }, [tmdbData, params]);

    const changeServer = (serverNumber: number) => {
        setCurrentServer(serverNumber);
        setIframeSrc(getIframeSrc(serverNumber));
        setIsAutoSwitching(false);
        
        // Clear timeout when manually switching
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
        }
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

    const getPrevEp = () => {
        if (!params || params.type !== 'tv' || !tmdbData) return null;
        const currentSeason = parseInt(params.season!);
        const currentEpisode = parseInt(params.episode!);

        if (currentEpisode > 1) {
            return { s: currentSeason, e: currentEpisode - 1 };
        }
        const prevSeason = currentSeason - 1;
        if (prevSeason >= 1 && tmdbData[prevSeason] !== undefined) {
            return { s: prevSeason, e: tmdbData[prevSeason] };
        }
        return null;
    };

    const handleNextEpisode = () => {
        const nextEp = getNextEp();
        if (nextEp) {
            navigate(`/watch?type=tv&id=${params!.id}&s=${nextEp.s}&e=${nextEp.e}&server=${currentServer}`);
        }
    };

    const handlePrevEpisode = () => {
        const prevEp = getPrevEp();
        if (prevEp) {
            navigate(`/watch?type=tv&id=${params!.id}&s=${prevEp.s}&e=${prevEp.e}&server=${currentServer}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader />
                    <p className="text-gray-400 text-lg">Loading player...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
                <div className="max-w-md text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/20 border-2 border-red-500">
                        <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Playback Error</h2>
                    <p className="text-red-400 text-lg">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Return Home</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!params || !tmdbData) return null;

    const pageTitle = params.type === 'movie'
        ? tmdbData.title
        : `${tmdbData.title}`;
    
    const episodeInfo = params.type === 'tv' ? `Season ${params.season} • Episode ${params.episode}` : null;
    const nextEp = getNextEp();
    const prevEp = getPrevEp();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-8 pt-16 lg:pt-20">
            {/* Auto-Switch Notification */}
            {isAutoSwitching && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 animate-fade-in-down">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold">Switching to Server {currentServer}...</span>
                </div>
            )}

            {/* Video Player Container */}
            <div className="relative bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="relative aspect-video bg-black shadow-2xl">
                        {iframeSrc ? (
                            <>
                                <iframe
                                    ref={iframeRef}
                                    key={iframeSrc}
                                    src={iframeSrc}
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups-to-escape-sandbox"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full border-0"
                                    title="Video Player"
                                    onLoad={() => {
                                        // Clear timeout when iframe loads successfully
                                        if (loadTimeoutRef.current) {
                                            clearTimeout(loadTimeoutRef.current);
                                        }
                                    }}
                                    onError={() => {
                                        console.error(`Server ${currentServer} failed to load`);
                                        tryNextServer();
                                    }}
                                ></iframe>
                                
                                {/* Loading Overlay */}
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300" id="loading-overlay">
                                    <Loader />
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
                {/* Title and Info Section */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        {/* Title Section */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-1.5 h-16 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                                        {pageTitle}
                                    </h1>
                                    {episodeInfo && (
                                        <p className="text-lg text-blue-400 font-semibold mt-2 flex items-center space-x-2">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                            </svg>
                                            <span>{episodeInfo}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {params.type === 'tv' && (
                                <>
                                    {/* Previous Episode */}
                                    <button
                                        onClick={handlePrevEpisode}
                                        disabled={!prevEp}
                                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 border border-gray-600 hover:border-gray-500 hover:shadow-lg disabled:hover:shadow-none group"
                                        title={prevEp ? `Previous: S${prevEp.s} E${prevEp.e}` : 'First episode'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span className="hidden sm:inline">Previous</span>
                                    </button>

                                    {/* Episodes List */}
                                    <button
                                        onClick={() => setIsEpSelectorOpen(true)}
                                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 border border-blue-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 4a1 1 0 00-1 1v1h14V5a1 1 0 00-1-1H4zM3 9h14v5a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
                                        </svg>
                                        <span>Episodes</span>
                                    </button>

                                    {/* Next Episode */}
                                    <button
                                        onClick={handleNextEpisode}
                                        disabled={!nextEp}
                                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 border border-gray-600 hover:border-gray-500 hover:shadow-lg disabled:hover:shadow-none group"
                                        title={nextEp ? `Next: S${nextEp.s} E${nextEp.e}` : 'Last episode'}
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Movie/Show Description Section */}
                {tmdbData.overview && (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h2 className="text-xl font-bold text-white">Overview</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {tmdbData.overview}
                        </p>
                    </div>
                )}

                {/* Server Selection Section */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                            <h2 className="text-xl font-bold text-white">Select Server</h2>
                        </div>
                        <button
                            onClick={() => setShowServerInfo(!showServerInfo)}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Server Info</span>
                        </button>
                    </div>

                    {/* Server Info Banner */}
                    {showServerInfo && (
                        <div className="mb-5 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg text-sm text-gray-300">
                            <p className="flex items-start space-x-2">
                                <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>If a server fails to load, we'll automatically try the next available server. You can also manually switch servers below.</span>
                            </p>
                        </div>
                    )}

                    {/* Server Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {SERVERS.map(server => (
                            <button
                                key={server.id}
                                onClick={() => changeServer(server.id)}
                                disabled={failedServers.includes(server.id)}
                                className={`relative group p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                                    currentServer === server.id 
                                        ? `bg-gradient-to-br from-${server.color}-600 to-${server.color}-700 text-white ring-2 ring-${server.color}-400 shadow-lg shadow-${server.color}-600/50` 
                                        : failedServers.includes(server.id)
                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    {failedServers.includes(server.id) ? (
                                        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                        </svg>
                                    )}
                                    <span className="text-sm">{server.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        currentServer === server.id 
                                            ? 'bg-white/20' 
                                            : failedServers.includes(server.id)
                                            ? 'bg-red-900/50'
                                            : 'bg-gray-600'
                                    }`}>
                                        {failedServers.includes(server.id) ? 'Failed' : server.badge}
                                    </span>
                                </div>
                                {currentServer === server.id && !failedServers.includes(server.id) && (
                                    <div className="absolute top-2 right-2">
                                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Current Server Indicator */}
                    <div className="mt-5 pt-5 border-t border-gray-700">
                        <p className="text-sm text-gray-400 flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>Currently playing from: <span className="text-white font-semibold">{SERVERS.find(s => s.id === currentServer)?.name}</span></span>
                        </p>
                    </div>
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
