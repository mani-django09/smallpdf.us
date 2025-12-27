import Head from 'next/head'

export default function SEOHead({ 
  title = "Free PDF Tools - Convert, Merge, Split & Compress PDF Online | SmallPDF.us",
  description = "Free online PDF tools to convert, merge, split, compress PDFs and more. No signup required. Fast, secure, and easy to use. Convert PDF to Word, JPG to PDF, and compress images instantly.",
  canonical = "https://smallpdf.us",
  ogImage = "/og-image.jpg",
  structuredData = null
}) {
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://smallpdf.us/#organization",
        "name": "SmallPDF.us",
        "url": "https://smallpdf.us",
        "logo": {
          "@type": "ImageObject",
          "url": "https://smallpdf.us/logo.png",
          "width": 512,
          "height": 512
        },
        "description": "Free online PDF conversion and editing tools. Convert, merge, split, and compress PDFs with ease.",
        "sameAs": [
          "https://twitter.com/smallpdfus",
          "https://facebook.com/smallpdfus"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Support",
          "email": "support@smallpdf.us"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://smallpdf.us/#website",
        "url": "https://smallpdf.us",
        "name": "SmallPDF.us - Free PDF Tools",
        "description": "Free online PDF tools for everyone",
        "publisher": {
          "@id": "https://smallpdf.us/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://smallpdf.us/?s={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        "url": canonical,
        "name": title,
        "description": description,
        "isPartOf": {
          "@id": "https://smallpdf.us/#website"
        },
        "about": {
          "@id": "https://smallpdf.us/#organization"
        },
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0]
      },
      {
        "@type": "SoftwareApplication",
        "name": "SmallPDF.us PDF Tools",
        "operatingSystem": "Web Browser",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "12543",
          "bestRating": "5",
          "worstRating": "1"
        },
        "featureList": [
          "PDF to Word Converter",
          "Merge PDF Files",
          "Split PDF Documents", 
          "Compress PDF Size",
          "PDF to JPG Converter",
          "JPG to PDF Converter",
          "PNG to PDF Converter"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is your website really free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it's completely free, no hidden fees, no premium tiers. You can convert, compress, merge, and split as many PDFs as you want without paying a penny."
            }
          },
          {
            "@type": "Question", 
            "name": "How secure are my files when I upload them?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Your privacy and security are our top priorities. Every file you upload is protected with 256-bit SSL encryption. Files are automatically deleted from our servers within 2 hours after processing."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to create an account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No account creation required. No signup forms, no email verification. Just visit the site, choose your tool, upload your file, and you're done."
            }
          }
        ]
      }
    ]
  }

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content="PDF converter, merge PDF, split PDF, compress PDF, PDF to Word, JPG to PDF, free PDF tools, online PDF editor, PDF to image converter" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="SmallPDF.us" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="SmallPDF.us" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#DC2626" />
      
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(structuredData || defaultStructuredData)
        }}
      />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    </Head>
  )
}
