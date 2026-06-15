import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Wrench, ShieldCheck, FileText, Image, Code, FileJson, Sparkles, Calculator } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import AdBlockDetector from "@/components/AdBlockDetector";
import Sidebar from "@/components/Sidebar";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  metadataBase: new URL('https://zeronode.dev'),
  title: {
    template: '%s | ZeroNode',
    default: 'ZeroNode | 100% Private, Local Developer Utilities',
  },
  description: 'A suite of lightning-fast, zero-server developer utilities. Convert formats, manipulate PDFs, and process massive datasets entirely in your browser. Zero uploads.',
  keywords: [
    'local developer tools', 'browser-based utilities', 'offline file converter',
    'privacy-first toolkit', 'client-side web tools', 'wasm developer utilities',
    'zero upload developer tools', 'offline data parser', 'no upload developer tools',
    'secure browser utilities', 'neo-brutalist dev tools',
    'ilovepdf alternative offline', 'smallpdf alternative no upload',
    'cloudconvert alternative local', 'tinypng alternative private',
  ],
  authors: [{ name: 'ZeroNode Team' }],
  creator: 'ZeroNode',
  publisher: 'ZeroNode',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'ZeroNode',
    title: 'ZeroNode | 100% Private, Local Developer Utilities',
    description: 'Lightning-fast, zero-server developer utilities running entirely in your browser. No uploads. No tracking.',
    images: [{ url: '/og/home.png', width: 1200, height: 630 }],
    url: 'https://zeronode.dev',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ZeroNodeDev',
    title: 'ZeroNode | 100% Private, Local Developer Utilities',
    description: 'Lightning-fast, zero-server developer utilities running entirely in your browser. No uploads. No tracking.',
    images: ['https://zeronode.dev/og/home.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://zeronode.dev/#website",
                  "url": "https://zeronode.dev",
                  "name": "ZeroNode",
                  "description": "100% private, local developer utilities. Zero uploads.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://zeronode.dev/search?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://zeronode.dev/#organization",
                  "name": "ZeroNode",
                  "url": "https://zeronode.dev",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://zeronode.dev/logo.png",
                    "width": 512,
                    "height": 512
                  },
                  "sameAs": [
                    "https://twitter.com/ZeroNodeDev",
                    "https://github.com/zeronode"
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-mono antialiased min-h-screen flex flex-col lg:flex-row selection:bg-summer-tiger selection:text-summer-space`}>
        {/* Sidebar Navigation - Brutalist / Responsive */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 bg-summer-sky relative pb-28 min-w-0">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#023047 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
          <div className="relative z-10">
            {children}
          </div>

          {/* Pre-Footer Global Ad */}
          <div className="mt-12 flex justify-center w-full px-4 relative z-10">
            <AdUnit width={728} height={90} className="hidden md:flex" />
            <AdUnit width={320} height={50} className="md:hidden" />
          </div>

          {/* AdSense Mandatory Trust Footer */}
          <footer className="mt-16 border-t-[4px] border-summer-space bg-white py-12 px-8">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="font-black text-xl uppercase text-summer-space mb-4 border-b-[2px] border-summer-space pb-2">ZeroNode</h3>
                <p className="font-bold text-sm text-summer-space/80">Providing fast, local developer tools. All processing happens safely inside your browser.</p>
              </div>
              <div>
                <h3 className="font-black text-xl uppercase text-summer-space mb-4 border-b-[2px] border-summer-space pb-2">Legal</h3>
                <ul className="space-y-2 font-bold text-sm text-summer-space/80">
                  <li><Link href="/privacy" className="hover:text-summer-tiger hover:underline">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-summer-tiger hover:underline">Terms of Service</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-black text-xl uppercase text-summer-space mb-4 border-b-[2px] border-summer-space pb-2">Company</h3>
                <ul className="space-y-2 font-bold text-sm text-summer-space/80">
                  <li><Link href="/about" className="hover:text-summer-tiger hover:underline">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-summer-tiger hover:underline">Contact Us</Link></li>
                  <li><Link href="/donate" className="hover:text-summer-tiger hover:underline">Support Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-black text-xl uppercase text-summer-space mb-4 border-b-[2px] border-summer-space pb-2">Contact</h3>
                <a href="mailto:contact@raytechinca.work" className="font-bold text-sm text-summer-space/80 hover:text-summer-tiger hover:underline">contact@raytechinca.work</a>
              </div>
            </div>
          </footer>

          {/* Sticky Bottom Ad */}
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 p-2 bg-summer-sea border-t-[4px] border-summer-space shadow-[0px_-4px_0px_#023047] flex justify-center">
            <AdUnit width={728} height={90} className="hidden md:flex" />
            <AdUnit width={320} height={50} className="md:hidden" />
          </div>
        </main>
        <AdBlockDetector />
      </body>
    </html>
  );
}
