'use client';

import React, { useEffect, useState } from 'react';

interface AdSlotProps {
  width: number;
  height: number;
  id: string;
}

export function AdSlot({ width, height, id }: AdSlotProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // In production, we would inject the ad network script here
    // But ONLY after the DOM is ready (deferred) to avoid CLS
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500); // Simulate network delay for ad loading
    
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div 
      className="flex flex-col items-center justify-center bg-zinc-900 border border-dashed border-zinc-700 rounded-lg overflow-hidden relative"
      style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
    >
      <span className="absolute top-2 right-2 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Advertisement</span>
      
      {!isLoaded ? (
        <div className="animate-pulse flex items-center justify-center w-full h-full">
          <div className="text-zinc-600 text-sm">Loading Ad...</div>
        </div>
      ) : (
        <div className="text-zinc-500 text-sm">
          {width}x{height} Ad Unit
        </div>
      )}
    </div>
  );
}
