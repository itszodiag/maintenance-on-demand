import { Link } from 'react-router-dom';

/**
 * Logo Component
 * Displays the Home Maintenance Service brand logo with optimized SVG
 * Responsive and supports both full and compact versions
 */

// Inline SVG Logo - optimized for dark backgrounds, inspired by HMS branding
const LogoSVG = ({ size = 'md', withText = false }) => {
  const sizes = {
    sm: '32',
    md: '48',
    lg: '64',
  };
  
  const dim = sizes[size];
  
  if (withText) {
    // Full logo with text
    return (
      <svg
        width={dim}
        height={(dim * 0.6)}
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* House outline - turquoise */}
        <g>
          {/* Main house shape */}
          <path
            d="M 30 110 L 30 55 L 65 25 L 100 55 L 100 110 Z"
            stroke="#14B8A6"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Door */}
          <rect x="50" y="75" width="30" height="35" fill="#14B8A6" rx="3" />
          {/* Door knob */}
          <circle cx="75" cy="92" r="2.5" fill="white" />
          {/* Window */}
          <rect x="20" y="50" width="18" height="18" stroke="#14B8A6" strokeWidth="1.5" fill="none" rx="2" />
          <line x1="29" y1="50" x2="29" y2="68" stroke="#14B8A6" strokeWidth="1.5" />
          <line x1="20" y1="59" x2="38" y2="59" stroke="#14B8A6" strokeWidth="1.5" />
          {/* Roof detail */}
          <circle cx="65" cy="20" r="4" fill="#14B8A6" opacity="0.6" />
        </g>
        
        {/* Wrench accent - black */}
        <g transform="translate(80, 35)">
          <g opacity="0.9">
            {/* Wrench handle */}
            <path d="M 10 4 L 18 4 Q 20 4 20 6 L 20 10 Q 20 12 18 12 L 10 12" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Wrench head */}
            <circle cx="6" cy="8" r="5" stroke="black" strokeWidth="2.5" fill="none" />
            <path d="M 2 8 L 10 8" stroke="black" strokeWidth="2" />
          </g>
        </g>
        
        {/* Text - "Home Maintenance Service" */}
        <g>
          {/* "Home" */}
          <text x="125" y="45" fontSize="18" fontWeight="900" fill="black" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5">
            Home
          </text>
          {/* "Maintenance" */}
          <text x="125" y="70" fontSize="18" fontWeight="700" fill="black" fontFamily="system-ui, -apple-system, sans-serif">
            Maintenance
          </text>
          {/* "Service" */}
          <text x="125" y="95" fontSize="16" fontWeight="500" fill="#6B7280" fontFamily="system-ui, -apple-system, sans-serif">
            Service
          </text>
        </g>
      </svg>
    );
  }
  
  // Compact icon only
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm"
    >
      {/* House outline - turquoise */}
      <g>
        {/* Main house shape */}
        <path
          d="M 25 90 L 25 45 L 60 20 L 95 45 L 95 90 Z"
          stroke="#14B8A6"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Door */}
        <rect x="45" y="62" width="30" height="28" fill="#14B8A6" rx="2" />
        {/* Door knob */}
        <circle cx="70" cy="76" r="2" fill="white" />
        {/* Window */}
        <rect x="18" y="42" width="16" height="16" stroke="#14B8A6" strokeWidth="1.5" fill="none" rx="1.5" />
        <line x1="26" y1="42" x2="26" y2="58" stroke="#14B8A6" strokeWidth="1.5" />
        <line x1="18" y1="50" x2="34" y2="50" stroke="#14B8A6" strokeWidth="1.5" />
        {/* Roof accent circle */}
        <circle cx="60" cy="15" r="3" fill="#14B8A6" opacity="0.6" />
      </g>
      
      {/* Wrench accent - black */}
      <g transform="translate(70, 30)">
        <g opacity="0.9">
          {/* Wrench handle */}
          <path d="M 8 3 L 16 3 Q 18 3 18 5 L 18 8 Q 18 10 16 10 L 8 10" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Wrench head */}
          <circle cx="4" cy="6" r="4" stroke="black" strokeWidth="2" fill="none" />
          <path d="M 1 6 L 7 6" stroke="black" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
};

export function Logo({ compact = false, className = '' }) {
  const size = compact ? 'sm' : 'md';
  
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2 group transition-opacity duration-200 hover:opacity-80 ${className}`}
      aria-label="Home Maintenance Service - Go to home"
    >
      <div className="flex items-center transform transition-transform duration-300 group-hover:scale-105">
        <LogoSVG size={size} withText={false} />
      </div>
    </Link>
  );
}

/**
 * Compact icon-only version for collapsed sidebars
 */
export function LogoIcon({ className = '' }) {
  return (
    <Link 
      to="/" 
      className={`flex items-center justify-center group transition-opacity duration-200 hover:opacity-80 ${className}`}
      aria-label="Home Maintenance Service - Go to home"
    >
      <div className="transform transition-transform duration-300 group-hover:scale-110">
        <LogoSVG size="lg" withText={false} />
      </div>
    </Link>
  );
}

/**
 * Text-only branding for minimal implementations
 */
export function LogoText({ className = '' }) {
  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-1 group transition-opacity duration-200 hover:opacity-80 ${className}`}
      aria-label="Home Maintenance Service - Go to home"
    >
      <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300">
        HMS
      </span>
    </Link>
  );
}

/**
 * Utility component for logo with image fallback
 * Allows using external image file if available
 */
export function LogoWithImage({ imageSrc, compact = false, className = '' }) {
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2 group transition-opacity duration-200 hover:opacity-80 ${className}`}
      aria-label="Home Maintenance Service - Go to home"
    >
      <div className="flex items-center transform transition-transform duration-300 group-hover:scale-105">
        <img
          src={imageSrc}
          alt="Home Maintenance Service"
          className={`${compact ? 'h-10' : 'h-12'} w-auto max-w-none drop-shadow-sm`}
          onError={() => {
            // Fallback to SVG if image fails to load
            return false;
          }}
        />
      </div>
    </Link>
  );
}
