import PdfToolkitWrapper from './PdfToolkitWrapper';

export const metadata = {
  title: 'Secure PDF Toolkit | Merge, Split & Edit PDFs Offline',
  description: 'Merge, split, compress, and e-sign PDF documents locally in your browser. Bank-grade privacy â€” your sensitive legal and financial documents are never uploaded.',
  alternates: {
    canonical: 'https://xeroping.online/tools/pdf-toolkit',
  },
  keywords: [
    'secure pdf merger', 'offline pdf editor', 'split pdf locally',
    'compress pdf without upload', 'private esign browser', 'pdf metadata scrubber local',
    'confidential pdf combiner', 'client-side pdf rotation', 'add watermark to pdf offline',
    'hipaa compliant pdf editor browser', 'extract pdf pages no upload',
    'smallpdf alternative offline', 'ilovepdf alternative no upload',
    'merge pdf without cloud', 'sign pdf without uploading',
    'adobe acrobat alternative privacy',
  ].join(', '),
  openGraph: {
    title: 'Secure PDF Toolkit | Merge, Split & Edit PDFs Offline',
    description: 'Merge, split, compress, and e-sign PDF documents locally. Your files never leave your device.',
    images: [{ url: 'https://xeroping.online/og/pdf-toolkit.png', width: 1200, height: 630 }],
    url: 'https://xeroping.online/tools/pdf-toolkit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Zero PingDev',
    title: 'Secure PDF Toolkit | Merge, Split & Edit PDFs Offline',
    description: 'Merge, split, compress, and e-sign PDFs locally. No uploads. HIPAA-safe.',
    images: ['https://xeroping.online/og/pdf-toolkit.png'],
  },
};

export default function PdfToolkitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Zero Ping", "item": "https://xeroping.online" },
          { "@type": "ListItem", "position": 2, "name": "PDF Toolkit", "item": "https://xeroping.online/tools/pdf-toolkit" }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://xeroping.online/tools/pdf-toolkit/#app",
        "name": "Zero Ping Secure PDF Toolkit",
        "url": "https://xeroping.online/tools/pdf-toolkit",
        "description": "Merge, split, compress, watermark, and e-sign PDFs entirely in your browser. No file uploads. HIPAA-aligned for sensitive legal and financial documents.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Windows, macOS, Linux, ChromeOS",
        "browserRequirements": "Requires PDF.js and WebAssembly support",
        "storageRequirements": "0MB (runs entirely in volatile client RAM)",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "Merge multiple PDFs without uploading",
          "Split PDFs into individual pages",
          "Compress PDFs client-side",
          "Add watermarks locally",
          "E-sign documents without cloud services",
          "Scrub PDF metadata and author data"
        ]
      },
      {
        "@type": "HowTo",
        "name": "How to merge PDF files without uploading them",
        "description": "Step-by-step guide to combining multiple PDF documents into one file locally in your browser using Zero Ping.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Open the PDF Toolkit",
            "text": "Navigate to Zero Ping's PDF Toolkit at xeroping.online/tools/pdf-toolkit. No account or login is required."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Select Merge mode",
            "text": "Click the Merge tab. Drag and drop your PDF files onto the upload area, or click to browse. Files are loaded into browser memory only."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Reorder pages if needed",
            "text": "Drag the file cards to set the merge order. Thumbnail previews are generated locally."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Download the merged PDF",
            "text": "Click Merge & Download. The combined PDF is generated in your browser and downloaded instantly. Nothing is sent to a server."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is Zero Ping's PDF editor HIPAA compliant?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero Ping processes all PDF files locally in your browser â€” files are never transmitted to external servers. This zero-upload architecture means sensitive protected health information (PHI) stays on your device, supporting HIPAA compliance workflows. Always consult your compliance officer for formal assessments."
            }
          },
          {
            "@type": "Question",
            "name": "Can I sign a PDF without uploading it?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Zero Ping's e-sign feature renders signature fields and draws your signature directly onto the PDF using the browser's Canvas API. The signed file is then downloaded. The document never leaves your device."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a file size limit for PDF merging?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero Ping has no server-side file size limit. The practical limit depends on your browser's available RAM. Most modern devices comfortably handle merges totalling several hundred megabytes."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <PdfToolkitWrapper />

      <div className="max-w-6xl mx-auto px-8 md:px-12 pb-16">
        <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">How to Edit PDFs Online</h2>
          <p className="font-bold text-summer-space/80 mb-6 text-lg">
            Editing PDF documents has traditionally required expensive desktop software. With our <strong>free online PDF toolkit</strong>, you can manage your files directly in your browser securely and locally. Whether you need to merge multiple documents into a single report, extract specific pages, or compress a massive file to meet email attachment limits, our suite handles it instantly. 
          </p>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Why Compress PDF Files?</h3>
          <p className="font-bold text-summer-space/80 mb-6">
            PDFs can become incredibly bloated, especially when they contain high-resolution images or embedded fonts. A large PDF can slow down website load times, fail to send via email, and consume unnecessary cloud storage. Our online PDF compressor automatically strips out duplicate fonts, downsamples excessive image resolutions, and reconstructs the file dictionary to make it as lightweight as possible while preserving readable quality.
          </p>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">The History of the Portable Document Format</h3>
          <p className="font-bold text-summer-space/80">
            The Portable Document Format (PDF) was created by Adobe in the early 1990s to present documents, including text formatting and images, in a manner independent of application software, hardware, and operating systems. Today, it is an open ISO standard. It is the absolute standard for legal documents, invoices, and digital signatures. Our free online tools ensure you can manipulate these critical files without any technical hurdles.
          </p>
        </div>
      </div>
    </>
  );
}
