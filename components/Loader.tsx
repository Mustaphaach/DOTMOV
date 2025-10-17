import React from 'react';

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'orbit';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'cyan' | 'gradient';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  variant = 'spinner', 
  size = 'md',
  color = 'blue',
  text 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    cyan: 'border-cyan-500',
    gradient: 'border-transparent'
  };

  const dotColorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  };

  const barColorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    gradient: 'bg-gradient-to-t from-blue-500 to-cyan-500'
  };

  // Modern Spinner with gradient option
  const SpinnerLoader = () => (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} rounded-full border-4 ${
          color === 'gradient' 
            ? 'border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 animate-spin'
            : `${colorClasses[color]} border-t-transparent animate-spin`
        }`}
        style={color === 'gradient' ? {
          backgroundClip: 'padding-box',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        } : {}}
      ></div>
      {color === 'gradient' && (
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent animate-spin`}
          style={{
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '4px'
          }}
        ></div>
      )}
    </div>
  );

  // Bouncing Dots Loader
  const DotsLoader = () => (
    <div className="flex space-x-2">
      <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} ${dotColorClasses[color]} rounded-full animate-bounce-dot animation-delay-0`}></div>
      <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} ${dotColorClasses[color]} rounded-full animate-bounce-dot animation-delay-200`}></div>
      <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} ${dotColorClasses[color]} rounded-full animate-bounce-dot animation-delay-400`}></div>
    </div>
  );

  // Pulse Loader
  const PulseLoader = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} ${dotColorClasses[color]} rounded-full animate-ping absolute`}></div>
      <div className={`${sizeClasses[size]} ${dotColorClasses[color]} rounded-full relative`}></div>
    </div>
  );

  // Bars Loader
  const BarsLoader = () => (
    <div className="flex items-end space-x-2">
      <div className={`${size === 'sm' ? 'w-1 h-6' : size === 'md' ? 'w-2 h-12' : 'w-3 h-16'} ${barColorClasses[color]} rounded-full animate-bar-loader animation-delay-0`}></div>
      <div className={`${size === 'sm' ? 'w-1 h-6' : size === 'md' ? 'w-2 h-12' : 'w-3 h-16'} ${barColorClasses[color]} rounded-full animate-bar-loader animation-delay-150`}></div>
      <div className={`${size === 'sm' ? 'w-1 h-6' : size === 'md' ? 'w-2 h-12' : 'w-3 h-16'} ${barColorClasses[color]} rounded-full animate-bar-loader animation-delay-300`}></div>
      <div className={`${size === 'sm' ? 'w-1 h-6' : size === 'md' ? 'w-2 h-12' : 'w-3 h-16'} ${barColorClasses[color]} rounded-full animate-bar-loader animation-delay-450`}></div>
    </div>
  );

  // Orbit Loader
  const OrbitLoader = () => (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className={`absolute inset-0 rounded-full border-2 ${colorClasses[color]} opacity-20`}></div>
      <div className="absolute inset-0 flex items-center justify-center animate-spin">
        <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} ${dotColorClasses[color]} rounded-full absolute ${size === 'sm' ? 'top-0' : size === 'md' ? 'top-1' : 'top-2'}`}></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center animate-spin-reverse animation-delay-300">
        <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} ${dotColorClasses[color]} rounded-full absolute ${size === 'sm' ? 'bottom-0' : size === 'md' ? 'bottom-1' : 'bottom-2'} opacity-60`}></div>
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'orbit':
        return <OrbitLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full space-y-4">
      {renderLoader()}
      {text && (
        <p className="text-gray-400 text-sm md:text-base font-medium animate-pulse">
          {text}
        </p>
      )}

      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: scale(0.6) translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1) translateY(-20px);
            opacity: 1;
          }
        }

        @keyframes bar-loader {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-bounce-dot {
          animation: bounce-dot 1.4s infinite ease-in-out;
        }

        .animate-bar-loader {
          animation: bar-loader 1.2s infinite ease-in-out;
        }

        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }

        .animation-delay-0 {
          animation-delay: 0s;
        }

        .animation-delay-150 {
          animation-delay: 0.15s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-450 {
          animation-delay: 0.45s;
        }
      `}</style>
    </div>
  );
};

export default Loader;
