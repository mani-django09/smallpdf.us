// components/AdSenseUnit.js

import { useEffect, useRef } from "react"

export default function AdSenseUnit({ adSlot, style = {}, format = "auto", responsive = true }) {
  const adRef = useRef(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    // Only load ads once per component instance
    if (loadedRef.current) return
    
    try {
      // Check if we're in the browser
      if (typeof window === "undefined") return

      // Wait for the ad container to be rendered
      if (!adRef.current) return

      // Check if adsbygoogle script is loaded
      if (typeof window.adsbygoogle === "undefined") {
        console.warn("AdSense script not loaded yet")
        return
      }

      // Only push if this ad hasn't been initialized
      const insElement = adRef.current
      
      // Check if already has data-adsbygoogle-status
      if (insElement.getAttribute("data-adsbygoogle-status")) {
        console.log("AdSense ad already initialized")
        return
      }

      // Push to adsbygoogle array
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      
      loadedRef.current = true
      console.log("✅ AdSense ad loaded:", adSlot)
    } catch (err) {
      console.error("❌ AdSense error:", err.message)
      // Don't throw - fail silently for better UX
    }
  }, [adSlot])

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-6913093595582462"
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  )
}