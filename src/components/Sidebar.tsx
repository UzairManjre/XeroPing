'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench, ShieldCheck, FileText, Image as ImageIcon, Code, FileJson, Sparkles, Calculator, Menu, X, Coffee } from 'lucide-react';
import AdUnit from '@/components/AdUnit';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 border-[3px] border-summer-space rounded-none font-bold transition-all shadow-brutal hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 ${
      pathname === path || pathname.startsWith(path + '/')
        ? 'bg-summer-amber text-summer-space'
        : 'bg-summer-sky text-summer-space'
    }`;

  return (
    <>
      {/* â”€â”€ MOBILE TOP HEADER â”€â”€ */}
      <header className="lg:hidden w-full bg-summer-sea border-b-[4px] border-summer-space sticky top-0 z-50 flex items-center justify-between px-5 py-3">
        <Link href="/" className="block">
          <h1 className="text-xl font-black text-summer-space uppercase tracking-tighter leading-none">Zero Ping</h1>
          <p className="text-[9px] font-bold text-summer-space/70 uppercase tracking-widest mt-0.5">Utility Network</p>
        </Link>
        <button
          onClick={() => setIsOpen(v => !v)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className="p-2 border-[3px] border-summer-space bg-summer-amber text-summer-space active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-brutal"
        >
          {isOpen ? <X className="w-6 h-6 stroke-[2.5px]" /> : <Menu className="w-6 h-6 stroke-[2.5px]" />}
        </button>
      </header>

      {/* â”€â”€ DARK BACKDROP (mobile only) â”€â”€ */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-summer-space/50 z-40 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* â”€â”€ SIDEBAR â”€â”€ */}
      <aside
        className={`
          bg-summer-sea border-summer-space flex flex-col shrink-0 z-40 overflow-hidden
          /* Mobile: slides in from the left as a full-height drawer */
          fixed top-0 bottom-0 left-0 w-[280px] transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Desktop: always visible, no transform */
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-r-[4px]
        `}
      >
        {/* Sidebar Logo Header */}
        <div className="p-5 lg:p-6 border-b-[4px] border-summer-space bg-summer-amber flex items-center justify-between">
          <Link href="/" onClick={closeMenu} className="block">
            <h1 className="text-2xl font-black text-summer-space uppercase tracking-tighter leading-none">Zero Ping</h1>
            <p className="text-xs font-bold text-summer-space/70 uppercase tracking-widest mt-1">Utility Network</p>
          </Link>
          {/* Close X only visible on mobile inside drawer */}
          <button
            className="lg:hidden p-1 text-summer-space"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 p-4 space-y-2.5 overflow-y-auto">
          <p className="text-xs font-black text-summer-space/60 uppercase tracking-widest mb-3 ml-1 mt-1">Privacy Tools</p>

          <Link href="/tools/exif-remover" onClick={closeMenu} className={linkClass('/tools/exif-remover')}>
            <ShieldCheck className="w-5 h-5 stroke-[2.5px] shrink-0" /> EXIF Remover
          </Link>

          <Link href="/tools/image-ai" onClick={closeMenu} className={linkClass('/tools/image-ai')}>
            <Sparkles className="w-5 h-5 stroke-[2.5px] shrink-0" /> Image AI
          </Link>

          <Link href="/tools/text-redactor" onClick={closeMenu} className={linkClass('/tools/text-redactor')}>
            <FileText className="w-5 h-5 stroke-[2.5px] shrink-0" /> Text Redactor
          </Link>

          <Link href="/tools/image-converter" onClick={closeMenu} className={linkClass('/tools/image-converter')}>
            <ImageIcon className="w-5 h-5 stroke-[2.5px] shrink-0" /> Image Converter
          </Link>

          <Link href="/tools/data-converter" onClick={closeMenu} className={linkClass('/tools/data-converter')}>
            <FileJson className="w-5 h-5 stroke-[2.5px] shrink-0" /> Data Converter
          </Link>

          <Link href="/tools/pdf-toolkit" onClick={closeMenu} className={linkClass('/tools/pdf-toolkit')}>
            <FileText className="w-5 h-5 stroke-[2.5px] shrink-0" /> PDF Toolkit
          </Link>

          <p className="text-xs font-black text-summer-space/60 uppercase tracking-widest mt-6 mb-3 ml-1">Productivity</p>

          <Link href="/tools/dev-toolkit" onClick={closeMenu} className={linkClass('/tools/dev-toolkit')}>
            <Code className="w-5 h-5 stroke-[2.5px] shrink-0" /> Developer Toolkit
          </Link>

          <Link href="/tools/text-splitter" onClick={closeMenu} className={linkClass('/tools/text-splitter')}>
            <FileText className="w-5 h-5 stroke-[2.5px] shrink-0" /> Text Splitter
          </Link>

          <Link href="/tools/number-converter" onClick={closeMenu} className={linkClass('/tools/number-converter')}>
            <Calculator className="w-5 h-5 stroke-[2.5px] shrink-0" /> Number Converter
          </Link>

          <Link href="/tools/unit-converter" onClick={closeMenu} className={linkClass('/tools/unit-converter')}>
            <Wrench className="w-5 h-5 stroke-[2.5px] shrink-0" /> All Converters
          </Link>

          {/* Support / Donate button */}
          <div className="pt-4 border-t-[3px] border-summer-space mt-4">
            <Link
              href="/donate"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 bg-rose-500 hover:bg-rose-600 border-[3px] border-summer-space text-white font-black uppercase tracking-wider transition-all shadow-brutal hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1"
            >
              <Coffee className="w-5 h-5 shrink-0" /> Support Us â¤ï¸
            </Link>
          </div>

          {/* Skyscraper Ad â€“ Desktop only */}
          <div className="hidden lg:flex mt-6 mb-2 justify-center w-full px-2">
            <AdUnit width={160} height={600} />
          </div>
        </nav>
      </aside>
    </>
  );
}
