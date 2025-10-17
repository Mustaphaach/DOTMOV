import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  // Track scroll position for dynamic header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900 bg-opacity-95 backdrop-blur-lg shadow-lg shadow-blue-500/10' 
          : 'bg-gray-900 bg-opacity-80 backdrop-blur-md'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo with hover animation */}
          <Link 
            to="/" 
            className="group flex items-center space-x-2 text-2xl lg:text-3xl font-bold tracking-wider"
          >
            <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
              DOTMOV
            </span>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </Link>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <nav className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/movies" 
                className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group"
              >
                Movies
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/tv-shows" 
                className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group"
              >
                TV Shows
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/trending" 
                className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group"
              >
                Trending
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/new-releases" 
                className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group"
              >
                New Releases
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/favorites" 
                className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group"
              >
                Favorites
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
              <div className={`relative transition-all duration-300 ${
                isSearchFocused ? 'scale-105' : 'scale-100'
              }`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search movies or TV shows..."
                  className="bg-gray-800 border border-gray-700 text-white rounded-full py-2.5 pl-5 pr-12 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    w-48 lg:w-72 transition-all duration-300 
                    placeholder:text-gray-500"
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 
                    transition-colors duration-300 p-1 rounded-full hover:bg-gray-700"
                  aria-label="Search"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-4 space-y-3 border-t border-gray-800">
            <Link 
              to="/" 
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/movies" 
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Movies
            </Link>
            <Link 
              to="/tv-shows" 
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TV Shows
            </Link>
            <Link 
              to="/trending" 
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trending
            </Link>
            <Link 
              to="/new-releases" 
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              New Releases
            </Link>
            <Link 
              to="/favorites" 
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Favorites
            </Link>
            <form onSubmit={handleSearch} className="px-4 pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-full py-2 pl-4 pr-10 
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
