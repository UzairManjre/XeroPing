import React from 'react';
import { AdSlot } from './AdSlot';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white">Xero<span className="text-indigo-400">Ping</span></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-400">100% Secure & Local Execution</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{title}</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[200px] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
          
          <div className="space-y-6 sticky top-6">
            <AdSlot width={300} height={250} id="sidebar-ad-1" />
            
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <h3 className="font-semibold text-zinc-200 mb-2">Why Local Execution?</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>✨ Zero server uploads</li>
                <li>🔒 Total data privacy</li>
                <li>⚡ Instant processing</li>
              </ul>
            </div>
            
            <AdSlot width={300} height={250} id="sidebar-ad-2" />
          </div>
        </div>
      </main>
    </div>
  );
}
