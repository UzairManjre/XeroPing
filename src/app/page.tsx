import Link from 'next/link';
import { ShieldCheck, ArrowRight, FileText, Code, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-8 md:p-12 lg:p-16 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <header className="mb-16">
        <div className="inline-block px-4 py-2 bg-summer-tiger border-[3px] border-summer-space shadow-brutal mb-6">
          <span className="text-sm font-black text-summer-space uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-summer-space rounded-full animate-pulse"></span>
            Free Online Utilities
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-summer-space tracking-tighter mb-6 uppercase leading-none" style={{ textShadow: '4px 4px 0px #ffb703' }}>
          Ultimate Online<br />Utility Network.
        </h1>
        <p className="text-xl text-summer-space/80 max-w-2xl font-bold leading-relaxed border-l-[4px] border-summer-space pl-6">
          A suite of essential tools. Convert, edit, and optimize your files easily online. Free to use with no hidden fees.
        </p>
      </header>

      {/* TOOLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* EXIF Tool Card */}
        <Link href="/tools/exif-remover" className="group block bg-summer-amber border-[4px] border-summer-space p-8 transition-all hover:-translate-y-2 hover:shadow-brutal-lg shadow-brutal relative overflow-hidden">
          <div className="w-14 h-14 bg-summer-sky border-[3px] border-summer-space flex items-center justify-center mb-6 shadow-brutal transition-transform group-hover:scale-110">
            <ShieldCheck className="w-7 h-7 text-summer-space stroke-[2.5px]" />
          </div>
          <h2 className="text-2xl font-black text-summer-space mb-3 uppercase tracking-tight">EXIF Remover</h2>
          <p className="text-summer-space/80 font-bold mb-6">
            Remove GPS coordinates, camera models, and hidden metadata from your photos online quickly.
          </p>
          <div className="flex items-center gap-2 text-summer-space font-black uppercase tracking-widest text-sm group-hover:translate-x-2 transition-transform">
            Launch Tool <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </div>
        </Link>

        {/* Image Converter Tool Card */}
        <Link href="/tools/image-converter" className="group block bg-summer-sea border-[4px] border-summer-space p-8 transition-all hover:-translate-y-2 hover:shadow-brutal-lg shadow-brutal relative overflow-hidden">
          <div className="w-14 h-14 bg-summer-amber border-[3px] border-summer-space flex items-center justify-center mb-6 shadow-brutal transition-transform group-hover:scale-110">
            <ImageIcon className="w-7 h-7 text-summer-space" />
          </div>
          <h2 className="text-2xl font-black text-summer-space mb-3 uppercase tracking-tight">Image Converter</h2>
          <p className="text-summer-space font-bold mb-6">
            Convert PNG/JPEG to WebP, resize, and compress images instantly in your browser.
          </p>
          <div className="flex items-center gap-2 text-summer-space font-black uppercase tracking-widest text-sm group-hover:translate-x-2 transition-transform">
            Launch Tool <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </div>
        </Link>

        {/* PDF Toolkit Card */}
        <Link href="/tools/pdf-toolkit" className="group block bg-summer-sea border-[4px] border-summer-space p-8 transition-all hover:-translate-y-2 hover:shadow-brutal-lg shadow-brutal relative overflow-hidden">
          <div className="w-14 h-14 bg-summer-amber border-[3px] border-summer-space flex items-center justify-center mb-6 shadow-brutal transition-transform group-hover:scale-110">
            <FileText className="w-7 h-7 text-summer-space stroke-[2.5px]" />
          </div>
          <h2 className="text-2xl font-black text-summer-space mb-3 uppercase tracking-tight">PDF Toolkit</h2>
          <p className="text-summer-space font-bold mb-6">
            Merge, split, rotate, convert images, and edit PDF metadata online for free.
          </p>
          <div className="flex items-center gap-2 text-summer-space font-black uppercase tracking-widest text-sm group-hover:translate-x-2 transition-transform">
            Launch Tool <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </div>
        </Link>

        {/* Text Splitter Card */}
        <Link href="/tools/text-splitter" className="group block bg-summer-amber border-[4px] border-summer-space p-8 transition-all hover:-translate-y-2 hover:shadow-brutal-lg shadow-brutal relative overflow-hidden">
          <div className="w-14 h-14 bg-summer-sky border-[3px] border-summer-space flex items-center justify-center mb-6 shadow-brutal transition-transform group-hover:scale-110">
            <FileText className="w-7 h-7 text-summer-space stroke-[2.5px]" />
          </div>
          <h2 className="text-2xl font-black text-summer-space mb-3 uppercase tracking-tight">Text Splitter</h2>
          <p className="text-summer-space/80 font-bold mb-6">
            Instantly chunk and slice massive strings online using symbols, regex, or character length.
          </p>
          <div className="flex items-center gap-2 text-summer-space font-black uppercase tracking-widest text-sm group-hover:translate-x-2 transition-transform">
            Launch Tool <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </div>
        </Link>

      </div>
    </div>
  );
}
