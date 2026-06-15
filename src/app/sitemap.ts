import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE = 'https://zeronode.dev';
const FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'heic', 'tiff', 'gif'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/tools/image-converter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/tools/pdf-toolkit`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/tools/privacy/exif-stripper`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/dev-toolkit`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/text-redactor`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/text-splitter`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/data-converter`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = FORMATS.flatMap(from =>
    FORMATS
      .filter(to => to !== from)
      .map(to => ({
        url: `${BASE}/tools/image-converter/${from}-to-${to}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
  );

  return [...staticRoutes, ...dynamicRoutes];
}
