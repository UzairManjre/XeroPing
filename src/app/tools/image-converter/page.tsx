import ImageConverterClient from './ImageConverterClient';

export const metadata = {
  title: 'Batch Image Converter & Compressor | 100% Local Processing',
  description: 'Batch convert and compress massive images to WebP, AVIF, HEIC, JPEG, and PNG. 100% private browser-based processing. No file uploads, instant downloads.',
  alternates: {
    canonical: 'https://xeroping.online/tools/image-converter',
  },
  keywords: [
    'local image converter', 'offline image compressor', 'convert png to webp browser',
    'batch avif converter', 'free image optimizer offline', 'bulk image resize no upload',
    'heic to jpg local', 'compress large tiff files offline', 'no upload image resizer',
    'secure bulk photo converter', 'lossless webp generator offline',
    'squoosh alternative offline', 'tinypng alternative no upload',
    'bulk convert images without internet', 'avif converter without cloud',
  ].join(', '),
  openGraph: {
    title: 'Batch Image Converter & Compressor | 100% Local Processing',
    description: 'Batch convert and compress massive images to WebP, AVIF, HEIC, JPEG, and PNG. No file uploads.',
    images: [{ url: 'https://xeroping.online/og/image-converter.png', width: 1200, height: 630 }],
    url: 'https://xeroping.online/tools/image-converter',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Zero PingDev',
    title: 'Batch Image Converter & Compressor | 100% Local Processing',
    description: 'Batch convert massive images to WebP, AVIF, HEIC locally. No uploads.',
    images: ['https://xeroping.online/og/image-converter.png'],
  },
};

export default function ImageConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Zero Ping", "item": "https://xeroping.online" },
          { "@type": "ListItem", "position": 2, "name": "Image Converter", "item": "https://xeroping.online/tools/image-converter" }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://xeroping.online/tools/image-converter/#app",
        "name": "Zero Ping Local Image Converter",
        "url": "https://xeroping.online/tools/image-converter",
        "description": "Batch convert and compress images to WebP, AVIF, HEIC, JPEG, and PNG entirely in your browser with no file uploads.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Windows, macOS, Linux, ChromeOS, Android, iOS",
        "browserRequirements": "Requires HTML5 Canvas and WebAssembly support",
        "storageRequirements": "0MB (runs entirely in volatile client RAM)",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "Hardware-accelerated batch processing",
          "Lossless WebP and AVIF compression",
          "Zero-upload architecture",
          "No file size limits (RAM-bound only)"
        ],
        "screenshot": "https://xeroping.online/screenshots/image-converter.png"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is there a file size limit for image compression?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "There is no server-imposed limit because Zero Ping processes files directly on your device. The practical ceiling is your computer's available RAM â€” most modern machines handle 100MB+ images without issue."
            }
          },
          {
            "@type": "Question",
            "name": "Does Zero Ping upload my images to a server?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Zero Ping's image converter runs entirely in your browser using WebAssembly and the HTML5 Canvas API. Your files never leave your device and are discarded from memory when you close the tab."
            }
          },
          {
            "@type": "Question",
            "name": "Which image formats does Zero Ping support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero Ping supports input and output in WebP, AVIF, HEIC, JPEG, PNG, and TIFF. Batch conversion across formats is supported in a single pass."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ImageConverterClient />

      {/* SEO INFO BLOCK */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 pb-16">
        <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">The Best Free Online Image Converter</h2>
          <p className="font-bold text-summer-space/80 mb-6 text-lg">
            Whether you need to convert a massive TIFF file for a specific software requirement or just want to reduce the file size of a photograph before emailing it, our <strong>free online image converter</strong> provides professional-grade results. You can instantly convert between all popular formats including JPEG, PNG, GIF, BMP, WEBP, and AVIF. We even support professional digital camera RAW formats without requiring you to install heavy desktop editing software like Photoshop.
          </p>
          
          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Why Image Compression Matters for SEO</h3>
          <p className="font-bold text-summer-space/80 mb-6">
            Large, unoptimized images are the number one cause of slow website loading times. Search engines like Google actively penalize slow websites by dropping them down the search rankings. By utilizing our online image compressor, you can:
          </p>
          <ul className="list-disc pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
            <li>Dial in the exact quality level you need using our interactive slider.</li>
            <li>Use the <strong>Visual Comparison Slider</strong> to compare the original image and the compressed output side-by-side to guarantee no visual artifacts.</li>
            <li>Automatically crop and resize images to standard responsive web dimensions (e.g., 800px, 1200px, 1920px).</li>
          </ul>

          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">WebP vs AVIF: Next-Generation Formats</h3>
          <p className="font-bold text-summer-space/80">
            If you are still serving standard PNGs and JPGs on your website, you are wasting bandwidth. <strong>WebP</strong> (developed by Google) and <strong>AVIF</strong> (based on the AV1 video codec) are next-generation image formats that provide vastly superior compression. WebP is widely supported across all modern browsers and offers excellent quality at tiny file sizes. AVIF offers even better compression ratios and is quickly becoming the new industry standard. Use our bulk batch converter to migrate your entire media library to AVIF today and drastically improve your website's performance!
          </p>
        </div>
      </div>
    </>
  );
}
