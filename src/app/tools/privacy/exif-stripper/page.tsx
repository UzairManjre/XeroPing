import ExifStripperClient from './ExifStripperClient';

export const metadata = {
  title: 'EXIF Data Remover | Strip Photo Metadata & GPS Locally',
  description: 'Instantly erase hidden GPS coordinates, camera models, and EXIF metadata from your photos. Secure, client-side scrubbing ensures total privacy before you post.',
  alternates: {
    canonical: 'https://zeronode.dev/tools/privacy/exif-stripper',
  },
  keywords: [
    'remove exif data locally', 'strip photo metadata browser', 'delete iphone gps location photo',
    'remove location from photo android chrome', 'samsung photo metadata remover',
    'private image scrubber', 'sanitize photo metadata offline',
    'remove camera model from photo', 'batch exif remover client side',
    'clean image metadata before posting', 'hide gps from photo online',
    'how to remove location from photo without app',
    'strip metadata from image before posting instagram',
    'remove exif data windows mac no software',
  ].join(', '),
  openGraph: {
    title: 'EXIF Data Remover | Strip Photo Metadata & GPS Locally',
    description: 'Erase GPS coordinates, camera models, and EXIF metadata from photos entirely in your browser. No uploads.',
    images: [{ url: 'https://zeronode.dev/og/exif-stripper.png', width: 1200, height: 630 }],
    url: 'https://zeronode.dev/tools/privacy/exif-stripper',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ZeroNodeDev',
    title: 'EXIF Data Remover | Strip GPS & Metadata Locally',
    description: 'Erase GPS coordinates and EXIF metadata from photos client-side. No uploads.',
    images: ['https://zeronode.dev/og/exif-stripper.png'],
  },
};

export default function ExifStripperPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "ZeroNode", "item": "https://zeronode.dev" },
          { "@type": "ListItem", "position": 2, "name": "Privacy Tools", "item": "https://zeronode.dev/tools/privacy" },
          { "@type": "ListItem", "position": 3, "name": "EXIF Stripper", "item": "https://zeronode.dev/tools/privacy/exif-stripper" }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://zeronode.dev/tools/privacy/exif-stripper/#app",
        "name": "ZeroNode EXIF Data Stripper",
        "url": "https://zeronode.dev/tools/privacy/exif-stripper",
        "description": "Batch-remove GPS coordinates, camera model, lens data, and all EXIF metadata from photos entirely in your browser. Zero uploads.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Windows, macOS, Linux, Android, iOS",
        "browserRequirements": "Requires modern browser with File API support",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "Remove GPS coordinates from any photo format",
          "Strip camera make, model, and lens EXIF data",
          "Batch process multiple images simultaneously",
          "Zero-upload — files never leave your device",
          "Works on JPEG, PNG, HEIC, and TIFF"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What EXIF data does ZeroNode remove from photos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ZeroNode strips all standard EXIF fields including GPS latitude/longitude/altitude, camera make and model, lens specifications, shutter speed, aperture, ISO, date/time taken, and software tags. The output image is a clean file with no embedded metadata."
            }
          },
          {
            "@type": "Question",
            "name": "Does removing EXIF data affect image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. EXIF metadata is stored in a separate header block and has no effect on the pixel data. Removing it does not change resolution, color, or visual quality in any way."
            }
          },
          {
            "@type": "Question",
            "name": "Can I remove location data from iPhone photos on a PC?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. ZeroNode's EXIF Stripper runs entirely in the browser and works with iPhone HEIC and JPEG files on Windows, macOS, or Linux without requiring any software installation."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ExifStripperClient />

      {/* SEO INFO BLOCK */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-16 pt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-zinc-300 text-sm leading-relaxed prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-white mb-4">Protect Your Privacy Online</h2>
          <p className="mb-6">
            Every time you snap a picture with your smartphone or digital camera, hidden information is stored inside the image file. This data, known as <strong>EXIF (Exchangeable Image File Format) data</strong>, includes details like the exact date and time the photo was taken, the specific camera settings used, the device manufacturer, and even the exact GPS coordinates of where you were standing. If you share these photos online without removing this metadata, anyone can potentially track your location or analyze your photography habits.
          </p>
          <p className="mb-6">
            Our <strong>free online EXIF data stripper</strong> helps you secure your images instantly. By uploading your JPG, PNG, or WEBP files to our tool, we automatically detect and remove all sensitive metadata, leaving you with a clean, safe image that you can confidently share on social media, messaging apps, or public forums. 
          </p>
          
          <h3 className="text-xl font-bold text-white mb-4">Why Remove EXIF Data?</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Prevent Doxxing:</strong> Keep your home or work address private by stripping GPS coordinates before posting to forums like Reddit or 4chan.</li>
            <li><strong>Protect Your Anonymity:</strong> Remove device identifiers that can link anonymous accounts back to your personal smartphone.</li>
            <li><strong>Reduce File Size:</strong> Embedded thumbnails and extensive metadata can unnecessarily bloat image file sizes.</li>
          </ul>

          <h3 className="text-xl font-bold text-white mb-4">How Does Our EXIF Stripper Work?</h3>
          <p className="mb-6">
            The process is completely free, lightning fast, and happens entirely online. Unlike other photo privacy tools that require you to upload your sensitive images to a remote server, our EXIF stripper processes your files locally inside your web browser. This means your private photos never leave your device, guaranteeing 100% privacy and security.
          </p>
        </div>
      </div>
    </>
  );
}
