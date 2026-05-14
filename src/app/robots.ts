import type { MetadataRoute } from 'next'

const siteUrl = 'https://calendar-vlu.nhkhoa.site'

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
