'use client';

import React, { useState } from 'react';
import { Coffee, Heart, Check, Copy, DollarSign, ExternalLink } from 'lucide-react';

export default function Donate() {
  const [coffees, setCoffees] = useState(3);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const pricePerCoffee = 5;
  const totalAmount = coffees * pricePerCoffee;

  const cryptoAddresses = {
    BTC: 'bc1qxy2kg3ut5934a6cf3z3cc2ss4hh2uxg2234abc',
    ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    SOL: 'HN7cAB1R6S4VQu7sNp9dBm1Ed7A728X2A18X24abc123'
  };

  const handleCopy = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    setCopiedText(name);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-8 py-16 bg-white text-summer-space border-[4px] border-summer-space shadow-brutal my-8">
      {/* HEADER */}
      <header className="mb-10 text-center border-b-[4px] border-summer-space pb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-summer-amber border-[3px] border-summer-space mb-4 shadow-sm">
          <Coffee className="w-8 h-8 text-summer-space stroke-[2.5px]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '2px 2px 0px #fb8500' }}>
          Buy Me a Coffee
        </h1>
        <p className="text-summer-space/80 font-bold max-w-xl mx-auto">
          ZeroNode runs 100% locally in your browser to protect your privacy. No uploads, no servers, and no subscriptions. Support our independent development!
        </p>
      </header>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: COFFEE SELECTOR */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-summer-sky/20 border-[3px] border-summer-space p-6 shadow-sm">
            <h3 className="font-black text-lg uppercase tracking-wider mb-4 text-summer-space">Support Level</h3>
            
            {/* Coffee Amount Button Selectors */}
            <div className="flex gap-3 mb-6">
              {[1, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setCoffees(num)}
                  className={`flex-1 py-3 border-[3px] border-summer-space font-black uppercase text-sm transition-all shadow-sm ${
                    coffees === num
                      ? 'bg-summer-amber text-summer-space translate-y-[-2px] shadow-brutal'
                      : 'bg-white hover:bg-zinc-50 text-summer-space'
                  }`}
                >
                  {num === 1 ? '☕ 1' : `☕ ${num}`}
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between font-black text-sm uppercase">
                <span>Number of Coffees: {coffees}</span>
                <span>${totalAmount} USD</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={coffees}
                onChange={(e) => setCoffees(parseInt(e.target.value) || 1)}
                className="w-full h-3 bg-zinc-200 border-[2px] border-summer-space rounded-none appearance-none cursor-pointer accent-summer-amber"
              />
            </div>

            {/* Dynamic Status / message */}
            <div className="bg-white border-[3px] border-summer-space p-4 text-center font-bold text-sm">
              {coffees <= 2 && '😊 Every drop counts! Thank you for the support.'}
              {coffees > 2 && coffees <= 5 && '🚀 Coffee powers coders. You are fueling next week\'s features!'}
              {coffees > 5 && coffees <= 10 && '🔥 Super Support! You are helping cover our domain and hosting fees.'}
              {coffees > 10 && '👑 Absolute Legend! You are a patron of privacy-first tooling.'}
            </div>
          </div>

          {/* TRADITIONAL CHANNELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://buymeacoffee.com/zeronode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-black border-[3px] border-summer-space p-4 font-black uppercase tracking-widest text-sm transition-all shadow-brutal hover:translate-x-1 hover:translate-y-1"
            >
              <Coffee className="w-5 h-5 fill-current" /> Buy Me A Coffee <ExternalLink className="w-4 h-4" />
            </a>
            
            <a
              href="https://paypal.me/zeronode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white border-[3px] border-summer-space p-4 font-black uppercase tracking-widest text-sm transition-all shadow-brutal hover:translate-x-1 hover:translate-y-1"
            >
              <DollarSign className="w-5 h-5" /> PayPal Me <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: CRYPTO ADRESSES */}
        <div className="lg:col-span-5 bg-zinc-50 border-[3px] border-summer-space p-6 shadow-sm space-y-6">
          <h3 className="font-black text-lg uppercase tracking-wider text-summer-space flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" /> Crypto Support
          </h3>

          <p className="text-xs font-bold text-summer-space/70 leading-relaxed">
            Prefer decentralized donations? Send crypto directly to the addresses below:
          </p>

          <div className="space-y-4">
            {(Object.keys(cryptoAddresses) as Array<keyof typeof cryptoAddresses>).map((key) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black uppercase">
                  <span>{key} Address</span>
                  <button
                    onClick={() => handleCopy(cryptoAddresses[key], key)}
                    className={`flex items-center gap-1 border border-summer-space px-1.5 py-0.5 text-[10px] tracking-wider transition-colors ${
                      copiedText === key ? 'bg-emerald-400 text-summer-space font-black' : 'bg-white hover:bg-summer-amber'
                    }`}
                  >
                    {copiedText === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedText === key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-white p-2 border-[2px] border-summer-space font-mono text-[10px] break-all select-all select-none">
                  {cryptoAddresses[key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
