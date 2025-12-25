// pages/api/sitemap.xml.js

export default async function handler(req, res) {
  try {
    // Fetch blog posts from your API
    const blogResponse = await fetch('http://localhost:5011/api/blog/posts?limit=100')
    const blogData = await blogResponse.json()
    const blogPosts = blogData.success ? blogData.posts : []

    // Static pages
    const staticPages = [
      {
        url: 'https://smallpdf.us/',
        lastmod: '2024-12-24',
        changefreq: 'daily',
        priority: '1.0'
      },
      // PDF Conversion Tools
      {
        url: 'https://smallpdf.us/word-to-pdf',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/pdf-to-word',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/pdf-to-jpg',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/jpg-to-pdf',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/pdf-to-png',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/png-to-pdf',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/webp-to-png',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.8'
      },
      // PDF Manipulation
      {
        url: 'https://smallpdf.us/merge-pdf',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/split-pdf',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: 'https://smallpdf.us/compress-pdf',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.9'
      },
      // Image Tools
      {
        url: 'https://smallpdf.us/compress-image',
        lastmod: '2024-12-24',
        changefreq: 'weekly',
        priority: '0.8'
      },
      // Info Pages
      {
        url: 'https://smallpdf.us/about',
        lastmod: '2024-12-24',
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        url: 'https://smallpdf.us/contact',
        lastmod: '2024-12-24',
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        url: 'https://smallpdf.us/privacy',
        lastmod: '2024-12-24',
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        url: 'https://smallpdf.us/terms',
        lastmod: '2024-12-24',
        changefreq: 'monthly',
        priority: '0.6'
      },
      // Blog
      {
        url: 'https://smallpdf.us/blog',
        lastmod: '2024-12-24',
        changefreq: 'daily',
        priority: '0.8'
      }
    ]

    // Dynamic blog post URLs
    const blogUrls = blogPosts.map(post => ({
      url: `https://smallpdf.us/blog/${post.slug}`,
      lastmod: post.updated_at || post.created_at,
      changefreq: 'weekly',
      priority: '0.7'
    }))

    // Combine all URLs
    const allPages = [...staticPages, ...blogUrls]

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages
  .map(
    page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

    // Set headers
    res.setHeader('Content-Type', 'text/xml')
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
    
    // Send response
    res.status(200).send(sitemap)
  } catch (error) {
    console.error('Sitemap generation error:', error)
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
}