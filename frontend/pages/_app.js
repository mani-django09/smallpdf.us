import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { pageview } from '../lib/analytics'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // Track initial page load
    pageview(router.pathname)

    // Track route changes
    const handleRouteChange = (url) => {
      pageview(url)
    }

    // Optimize route change performance
    const handleRouteChangeStart = () => {
      // Show loading indicator if needed
    }

    const handleRouteChangeComplete = () => {
      // Hide loading indicator
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    router.events.on('routeChangeComplete', handleRouteChange)
    
    // Cleanup
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, router.pathname])

  // Report Web Vitals to analytics
  useEffect(() => {
    // Measure Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
          // Send to analytics: gtag('event', 'LCP', { value: lastEntry.renderTime })
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime)
            // Send to analytics: gtag('event', 'FID', { value: entry.processingStart - entry.startTime })
          })
        })
        fidObserver.observe({ type: 'first-input', buffered: true })

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              console.log('CLS:', clsValue)
              // Send to analytics: gtag('event', 'CLS', { value: clsValue })
            }
          }
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })
      } catch (e) {
        console.error('Performance monitoring error:', e)
      }
    }
  }, [])

  // Prefetch common pages for faster navigation
  useEffect(() => {
    const prefetchPages = [
      '/merge-pdf',
      '/compress-pdf',
      '/pdf-to-word',
      '/jpg-to-pdf'
    ]

    // Prefetch after page is loaded (low priority)
    const timeout = setTimeout(() => {
      prefetchPages.forEach(page => {
        router.prefetch(page)
      })
    }, 3000) // Wait 3 seconds after page load

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <>
      {/* Load Google Analytics with optimal strategy */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-603K8BH9MK`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-603K8BH9MK', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />

      {/* ========================================
          ADDED: Google AdSense Script
          FIXED: No data-nscript attribute error
          ======================================== */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6913093595582462"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <Component {...pageProps} />
    </>
  )
}

// Export reportWebVitals for Next.js built-in monitoring
export function reportWebVitals(metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }

  
}

export default MyApp