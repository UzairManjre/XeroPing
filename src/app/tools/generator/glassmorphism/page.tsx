'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(10);
  const [transparency, setTransparency] = useState(0.2);
  const [color, setColor] = useState('#ffffff');
  const [outline, setOutline] = useState(0.1);

  const cssOutput = `background: rgba(${hexToRgb(color)}, ${transparency});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: 1px solid rgba(255, 255, 255, ${outline});
border-radius: 16px;`;

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
      : '255, 255, 255';
  }

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="CSS Glassmorphism Generator"
      description="Create beautiful, modern glass-like CSS effects instantly in your browser."
    >
      <div className="space-y-8">
        {/* Preview Area */}
        <div className="relative w-full h-[300px] rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
          <div 
            className="w-[250px] h-[150px] flex items-center justify-center p-6 shadow-2xl transition-all duration-200"
            style={{
              background: `rgba(${hexToRgb(color)}, ${transparency})`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              border: `1px solid rgba(255, 255, 255, ${outline})`,
              borderRadius: '16px'
            }}
          >
            <span className="text-white font-semibold text-lg drop-shadow-md">Glass Effect</span>
          </div>
          
          {/* Decorative shapes behind the glass */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-white/30 rounded-full blur-xl mix-blend-overlay"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>
        </div>

        {/* Controls */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm font-medium text-zinc-300 mb-1">
                <span>Blur Value</span>
                <span className="text-indigo-400">{blur}px</span>
              </label>
              <input 
                type="range" min="0" max="40" value={blur} 
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div>
              <label className="flex justify-between text-sm font-medium text-zinc-300 mb-1">
                <span>Transparency</span>
                <span className="text-indigo-400">{transparency}</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" value={transparency} 
                onChange={(e) => setTransparency(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm font-medium text-zinc-300 mb-1">
                <span>Outline Opacity</span>
                <span className="text-indigo-400">{outline}</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" value={outline} 
                onChange={(e) => setOutline(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Background Tint</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-full rounded border-0 bg-transparent p-0 cursor-pointer"
                />
                <span className="text-zinc-400 text-sm font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{color}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="mt-6 relative group">
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 border-b-0 rounded-t-xl px-4 py-2">
            <span className="text-xs text-zinc-500 font-medium">CSS</span>
            <button 
              onClick={handleCopy}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre className="p-4 bg-[#0d0d12] border border-zinc-800 rounded-b-xl overflow-x-auto text-sm text-zinc-300 font-mono leading-relaxed">
            <code>{cssOutput}</code>
          </pre>
        </div>
      </div>
    </ToolLayout>
  );
}
