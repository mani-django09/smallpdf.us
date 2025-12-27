// pages/api/sitemap.xml.js
export default function handler(req, res) {
  const baseUrl = 'https://smallpdf.us'
  const currentDate = new Date().toISOString().split('T')[0]

  // Define all your pages with their priority and change frequency
  const pages = [
    { url: '', changefreq: 'daily', priority: '1.0' }, // Homepage
    { url: '/merge-pdf', changefreq: 'weekly', priority: '0.9' },
    { url: '/split-pdf', changefreq: 'weekly', priority: '0.9' },
    { url: '/compress-pdf', changefreq: 'weekly', priority: '0.9' },
    { url: '/pdf-to-word', changefreq: 'weekly', priority: '0.9' },
    { url: '/word-to-pdf', changefreq: 'weekly', priority: '0.9' },
    { url: '/pdf-to-jpg', changefreq: 'weekly', priority: '0.8' },
    { url: '/jpg-to-pdf', changefreq: 'weekly', priority: '0.8' },
    { url: '/png-to-pdf', changefreq: 'weekly', priority: '0.8' },
    { url: '/pdf-to-png', changefreq: 'weekly', priority: '0.8' },
    { url: '/compress-image', changefreq: 'weekly', priority: '0.8' },
    { url: '/webp-to-png', changefreq: 'weekly', priority: '0.7' },
    { url: '/png-to-webp', changefreq: 'weekly', priority: '0.7' },
    { url: '/about', changefreq: 'monthly', priority: '0.5' },
    { url: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
    { url: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.write(sitemap)
  res.end()
}
