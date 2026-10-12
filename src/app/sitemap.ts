
import type { MetadataRoute } from 'next';

const SITE = 'https://pregtap.owerhappiness.id.vn';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE + '/', changeFrequency: 'weekly', priority: 1 },
    { url: SITE + '/about', changeFrequency: 'yearly', priority: 0.5 },
    { url: SITE + '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { url: SITE + '/terms-of-use', changeFrequency: 'yearly', priority: 0.3 },
  ];
}
