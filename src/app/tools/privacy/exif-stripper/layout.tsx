import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online EXIF Data Stripper | ZeroNode',
  description: 'Remove GPS locations, camera models, and hidden metadata from your photos online.',
  openGraph: {
    title: 'Free Online EXIF Data Stripper',
    description: 'Securely remove metadata from your photos online.',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'EXIF Data Stripper',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript and HTML5 Canvas',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
