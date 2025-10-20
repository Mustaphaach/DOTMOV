import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    content: [
      { name: 'Movies', path: '/movies' },
      { name: 'TV Shows', path: '/tv-shows' },
      { name: 'Trending', path: '/trending' },
      { name: 'New Releases', path: '/new-releases' },
      { name: 'Favorites', path: '/favorites' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-block group">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                DOTMOV
              </h2>
            </Link>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-sm">
              Your ultimate destination for discovering and streaming the latest movies and TV shows. 
              Explore endless entertainment possibilities.
            </p>
            
            {/* Contact Email */}
            <div className="mt-6">
              <h3 className="text-white font-semibold text-sm mb-2">Contact Us</h3>
              <a 
                href="mailto:contact@dotmov.me" 
                className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors duration-300 group"
              >
                <svg 
                  className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                <span className="relative">
                  contact@dotmov.me
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </a>
            </div>
          </div>

          {/* Content Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Browse</h3>
            <ul className="space-y-3">
              {footerLinks.content.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-300 
                      inline-flex items-center group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} <span className="text-blue-400 font-semibold">DOTMOV</span>. All Rights Reserved.
            </p>

            {/* Additional Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Made with ❤️ for movie lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
