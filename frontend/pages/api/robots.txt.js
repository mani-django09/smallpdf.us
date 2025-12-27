// pages/api/robots.txt.js
export default function handler(req, res) {
  const baseUrl = 'https://smallpdf.us'
  
  const robots = `# *
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /uploads/

# Sitemap
Sitemap: ${baseUrl}/api/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Specific bot instructions
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /
`

  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.write(robots)
  res.end()
}
