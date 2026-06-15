'use client';

import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function AdBlockDetector() {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait a moment for ad blockers to do their thing
    const timer = setTimeout(() => {
      if (adRef.current) {
        // Many ad blockers hide elements by setting display: none or height: 0
        const style = window.getComputedStyle(adRef.current);
        if (style.display === 'none' || adRef.current.offsetHeight === 0) {
          setIsAdBlockerActive(true);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isAdBlockerActive || dismissed) return (
    <div 
      ref={adRef} 
      className="ad-banner ad-container ad-placement doubleclick sponsor adsbox" 
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px' }} 
      aria-hidden="true"
    />
  );

  return (
    <div className="fixed bottom-6 right-6 max-w-sm z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white border-[4px] border-summer-space p-5 shadow-[8px_8px_0px_#023047] relative">
        <button 
          onClick={() => setDismissed(true)}
          className="absolute -top-4 -right-4 w-10 h-10 bg-summer-tiger border-[3px] border-summer-space flex items-center justify-center text-summer-space hover:bg-rose-400 hover:-rotate-12 transition-all shadow-[4px_4px_0px_#023047] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none z-10"
        >
          <X className="w-6 h-6 stroke-[3px]" />
        </button>
        
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-summer-amber border-[3px] border-summer-space flex items-center justify-center shrink-0 shadow-sm transform -rotate-6">
            <span className="text-3xl">🥷</span>
          </div>
          <div>
            <h3 className="font-black text-xl text-summer-space uppercase tracking-tighter leading-none mb-2">Sneaky Sneaky!</h3>
            <p className="text-sm font-bold text-summer-space/80">
              We noticed you're using an Ad Blocker!
              <br/><br/>
              Don't worry, we won't block you from using the tools. But if you feel like supporting us, disabling it helps feed the hamsters running our servers! 🐹🍕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
