import React from 'react';

const Logo = ({ className = 'w-10 h-10', showText = true }) => {
  return (
    <div className="flex items-center space-x-2">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 200" 
        className={`${className} shadow-lg shadow-red-500/20 rounded-xl`}
      >
        <rect width="200" height="200" rx="40" fill="#E52323"/>
        <text 
          x="50%" 
          y="95" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill="#FFFFFF" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="56"
          letterSpacing="-1"
        >
          DUDI
        </text>
        <text 
          x="50%" 
          y="150" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill="#FFFFFF" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="600" 
          fontSize="26"
          letterSpacing="0.5"
        >
          software
        </text>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-black text-white tracking-wide leading-none">DUDI</span>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none mt-1">software</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
