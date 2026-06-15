import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSS Glassmorphism Generator | XeroPing',
  description: 'Create beautiful, modern glass-like CSS effects instantly in your browser. 100% secure and local.',
  openGraph: {
    title: 'CSS Glassmorphism Generator',
    description: 'Create beautiful, modern glass-like CSS effects instantly.',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CSS Glassmorphism Generator',
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
