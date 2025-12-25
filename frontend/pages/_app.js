import { useEffect } from 'react'
import { useRouter } from 'next/router'
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

    router.events.on('routeChangeComplete', handleRouteChange)
    
    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, router.pathname])

  return <Component {...pageProps} />
}

export default MyApp