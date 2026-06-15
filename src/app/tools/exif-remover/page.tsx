import ExifRemoverClient from './ExifRemoverClient';

export const metadata = {
  title: 'Free Online EXIF Remover & Metadata Editor | Remove GPS Location | Zero Ping',
  description: 'Instantly strip hidden EXIF metadata, delete GPS locations, or edit camera tags online for free. Protect your privacy before uploading photos.',
  keywords: 'exif remover, delete exif data online, strip gps location from photo, edit exif metadata, online photo privacy tool'
};

export default function ExifRemoverPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Free Online EXIF Remover",
    "operatingSystem": "All",
    "applicationCategory": "SecurityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How to remove EXIF data from photos?",
        "acceptedAnswer": { "@type": "Answer", "text": "Upload your image to our free online EXIF remover, select the 'Strip Data' option, and download the secured image. All GPS locations and camera data will be instantly erased." }
      },
      {
        "@type": "Question",
        "name": "What is EXIF data?",
        "acceptedAnswer": { "@type": "Answer", "text": "EXIF (Exchangeable Image File Format) data is hidden metadata embedded in your photos by your smartphone or camera. It includes the exact GPS coordinates where the photo was taken, timestamps, and device info." }
      },
      {
        "@type": "Question",
        "name": "Is it safe to use this tool for sensitive photos?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes! Our tool processes the images securely inside your web browser. The photos are never uploaded or saved to our servers." }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <ExifRemoverClient />

      {/* SEO INFO BLOCK */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 pb-16">
        <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">Why Do You Need an EXIF Remover?</h2>
          <p className="font-bold text-summer-space/80 mb-6 text-lg">
            When you capture a photo with your iPhone, Android, or DSLR camera, the device automatically embeds hidden metadata into the file known as <strong>EXIF data</strong> (Exchangeable Image File Format). While useful for organizing your photo library, this hidden data often contains highly sensitive privacy leaks, including:
          </p>
          <ul className="list-disc pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
            <li><strong>Exact GPS Coordinates:</strong> The precise latitude and longitude where the photo was taken (e.g., your home address).</li>
            <li><strong>Timestamps:</strong> The exact date and time the photo was captured.</li>
            <li><strong>Device Information:</strong> The specific camera make, model, and software version you are using.</li>
          </ul>
          
          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Protect Your Privacy Before Uploading</h3>
          <p className="font-bold text-summer-space/80 mb-6">
            When you upload unscrubbed photos to social media platforms, public forums, or dating apps, you may unknowingly broadcast your home address or daily routines to strangers. Using our <strong>free online EXIF remover</strong>, you can safely strip all location data and identifying metadata <em>before</em> you share your images. Our tool processes the files instantly right in your web browser, guaranteeing that your private images never touch our servers.
          </p>

          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Advanced Online EXIF Metadata Editor</h3>
          <p className="font-bold text-summer-space/80">
            In addition to permanently deleting metadata, our tool functions as an advanced <strong>EXIF metadata editor</strong>. Are you a professional photographer who needs to correct an improper timestamp, add copyright tags, or fake the camera model for aesthetic reasons? Our online editor gives you full control over your JPEG tags without degrading the original image quality.
          </p>
        </div>
      </div>
    </>
  );
}
