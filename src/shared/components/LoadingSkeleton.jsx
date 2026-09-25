import React from 'react';
import { cn } from '../utils/cn';

/**
 * LoadingSkeleton Component with Tailwind animate-pulse
 */
export default function LoadingSkeleton({ 
  width, 
  height, 
  className = '',
  circle = false,
}) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-slate-800",
        circle ? "rounded-full" : "rounded-xl",
        !height && "h-4",
        !width && "w-full",
        className
      )} 
      style={{ 
        width: width, 
        height: height, 
      }} 
    />
  );
}
