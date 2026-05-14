import type { MetadataRoute } from 'next'

const siteUrl = 'https://calen-vlu.nhkhoa.live'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/settings/', '/convert/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
