import React from 'react';
import Link from 'next/link';

/**
 * Gritmode Streetwear Brand Logo Component
 * Pure Monochrome Black & White Aesthetic.
 */
export default function Logo({ size = 'text-2xl', className = '', to = '/', ...props }) {
  return (
    <Link 
      href={to}
      className={`inline-flex items-center gap-1 cursor-pointer select-none group font-display tracking-tight ${className}`} 
      {...props}
    >
      <span className={`font-black uppercase text-black dark:text-white ${size} tracking-tight group-hover:opacity-75 transition-opacity`}>
        GRITMODE<span className="text-xs align-super ml-0.5 font-sans font-black">®</span>
      </span>
    </Link>
  );
}
