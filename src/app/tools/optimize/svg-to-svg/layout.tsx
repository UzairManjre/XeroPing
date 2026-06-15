import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online SVG Optimizer | Zero Ping',
  description: 'Minify and clean your vector graphics directly online using SVGO.',
  openGraph: {
    title: 'Free Online SVG Optimizer',
    description: 'Minify SVG files securely online.',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SVG Optimizer',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
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
