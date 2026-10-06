export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://vaklease.nl';
  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: baseUrl + '/bedrijfswagens/', changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/machines/', changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/aanhangers/', changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/contact/', changeFrequency: 'monthly', priority: 0.7 },
  ];
}
