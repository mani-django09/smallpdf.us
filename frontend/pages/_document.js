import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ========================================
            CRITICAL PERFORMANCE OPTIMIZATIONS
        ======================================== */}
        
        {/* Preconnect to critical domains - Load these FIRST */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* DNS Prefetch for faster lookups */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Preload critical fonts - IMPORTANT FOR LCP */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" 
          rel="stylesheet"
        />

        {/* ========================================
            FAVICON - COMPLETE SET
        ======================================== */}
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ========================================
            THEME & BRANDING
        ======================================== */}
        
        <meta name="theme-color" content="#2563EB" />
        <meta name="msapplication-TileColor" content="#2563EB" />
        
        {/* ========================================
            GOOGLE ANALYTICS - ASYNC LOADING
        ======================================== */}
        
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-603K8BH9MK"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-603K8BH9MK', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure',
                send_page_view: false
              });
            `,
          }}
        />
      </Head>
      <body>
        {/* Prevent FOUC (Flash of Unstyled Content) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.body.classList.add(theme);
              })();
            `,
          }}
        />
        
        <Main />
        <NextScript />
        
        {/* Resource hints for better performance */}
        <link rel="prefetch" href="/_next/static/css/app.css" as="style" />
        <link rel="prefetch" href="/_next/static/chunks/main.js" as="script" />
      </body>
    </Html>
  )
}