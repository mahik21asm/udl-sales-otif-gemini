import React from 'react';

export const UDLLogo = ({ className = "h-12 w-auto", hideText = false }: { className?: string, hideText?: boolean }) => (
  <svg 
    viewBox={hideText ? "0 0 160 100" : "0 0 400 240"} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* UD Triangle Symbol */}
    <g transform={hideText ? "translate(0, 0)" : "translate(90, 0)"}>
      {/* Downward Triangle (U) */}
      <path 
        d="M5 10 H85 L45 80 Z" 
        fill="#765341" 
        stroke="#765341" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <text x="45" y="48" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="-1">U</text>
      
      {/* Upward Triangle (D) */}
      <path 
        d="M75 80 H155 L115 10 Z" 
        fill="white" 
        stroke="#765341" 
        strokeWidth="4" 
        strokeLinejoin="round"
      />
      <text x="115" y="60" textAnchor="middle" fill="#765341" fontSize="28" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="-1">D</text>
    </g>
    
    {!hideText && (
      <g transform="translate(0, 110)">
        {/* Main Text - Uni Deritend Ltd */}
        <text 
          x="200" 
          y="50" 
          textAnchor="middle" 
          fill="#4A3728" 
          fontSize="44" 
          fontWeight="500" 
          fontFamily="'Playfair Display', serif"
        >
          Uni Deritend Ltd
        </text>
        
        {/* Tagline - A Neterwala Group Company */}
        <text 
          x="200" 
          y="95" 
          textAnchor="middle" 
          fill="#765341" 
          fontSize="22" 
          fontWeight="700" 
          fontFamily="Inter, sans-serif"
          className="uppercase tracking-[0.1em]"
        >
          A Neterwala Group Company
        </text>
        
        {/* Bottom Decorative Line */}
        <path d="M100 110 H300" stroke="#765341" strokeWidth="0.5" opacity="0.3" />
      </g>
    )}
  </svg>
);
