import { Metadata } from 'next';
import ImageConverterClient from '../ImageConverterClient';

export function generateStaticParams() {
  const formats = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'heic', 'tiff', 'gif'];
  const pairs: { slug: string }[] = [];
  for (const f of formats) {
    for (const t of formats) {
      if (f !== t) pairs.push({ slug: `${f}-to-${t}` });
    }
  }
  return pairs;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const parts = resolvedParams.slug.split('-to-');
  const from = parts[0]?.toUpperCase() || '';
  const to   = parts[1]?.toUpperCase() || '';
  const slug = resolvedParams.slug;

  return {
    title: `Convert ${from} to ${to} | 100% Local, No Uploads`,
    description: `Batch convert ${from} files to ${to} securely in your browser. Zero uploads, no file size limits, and complete offline privacy.`,
    keywords: `convert ${from} to ${to} offline, local ${from} converter, ${from} to ${to} without uploading, ${from} to ${to} no cloud, secure ${to} batch processor`,

    alternates: {
      canonical: `https://xeroping.online/tools/image-converter/${slug}`,
    },

    openGraph: {
      title: `Convert ${from} to ${to} | 100% Local, No Uploads`,
      description: `Batch convert ${from} files to ${to} entirely in your browser. Zero uploads.`,
      images: [{ url: 'https://xeroping.online/og/image-converter.png', width: 1200, height: 630 }],
      url: `https://xeroping.online/tools/image-converter/${slug}`,
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      site: '@Zero PingDev',
      title: `Convert ${from} to ${to} Locally — No Uploads`,
      description: `Batch convert ${from} to ${to} in your browser. Private. No file size limits.`,
      images: ['https://xeroping.online/og/image-converter.png'],
    },
  };
}

export default async function DynamicImageConverterPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const parts = resolvedParams.slug.split('-to-');
  const from = parts[0]?.toUpperCase() || '';
  const to = parts[1]?.toUpperCase() || '';
  const slug = resolvedParams.slug;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Zero Ping", "item": "https://xeroping.online" },
                  { "@type": "ListItem", "position": 2, "name": "Image Converter", "item": "https://xeroping.online/tools/image-converter" },
                  { "@type": "ListItem", "position": 3, "name": `Convert ${from} to ${to}`, "item": `https://xeroping.online/tools/image-converter/${slug}` }
                ]
              },
              {
                "@type": "WebApplication",
                "name": `Zero Ping ${from} to ${to} Converter`,
                "url": `https://xeroping.online/tools/image-converter/${slug}`,
                "description": `Convert ${from} files to ${to} locally in your browser. No uploads, no file size limits.`,
                "applicationCategory": "MultimediaApplication",
                "isAccessibleForFree": true,
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
              }
            ]
          })
        }}
      />
      <ImageConverterClient />
      
      {/* Dynamic SEO Block */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 pb-16">
        <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none mt-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">
            How to Convert {from} to {to} Locally
          </h2>
          <p className="font-bold text-summer-space/80 mb-6 text-lg">
            Converting {from} files to {to} shouldn't require uploading sensitive data to cloud servers. The Zero Ping {from} to {to} converter executes entirely inside your browser using WebAssembly. This means your image files are processed instantaneously without leaving your device.
          </p>
          
          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">
            Batch Processing {from} Offline
          </h3>
          <p className="font-bold text-summer-space/80 mb-6">
            Need to convert hundreds of {from} files? Switch to our Batch Processor mode. You can queue multiple {from} images and export them as highly compressed {to} files packaged directly into a ZIP archive—all handled by your local CPU.
          </p>
        </div>
      </div>
    </>
  );
}
