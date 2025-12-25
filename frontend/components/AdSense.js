"use client"

import { useEffect } from "react"

export default function AdSense({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  style = {},
  className = ""
}) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-6913093595582462"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  )
}

// Predefined AdSense components for different sizes

export function LeaderboardAd({ adSlot, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="auto"
        fullWidthResponsive={true}
        style={{ display: "inline-block", width: "728px", height: "90px" }}
      />
    </div>
  )
}

export function MobileLeaderboardAd({ adSlot, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="auto"
        fullWidthResponsive={true}
        style={{ display: "inline-block", width: "320px", height: "50px" }}
      />
    </div>
  )
}

export function SkyscraperAd({ adSlot, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm ${className}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="auto"
        fullWidthResponsive={false}
        style={{ display: "inline-block", width: "160px", height: "600px" }}
      />
    </div>
  )
}

export function MediumRectangleAd({ adSlot, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${className}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="auto"
        fullWidthResponsive={false}
        style={{ display: "inline-block", width: "300px", height: "250px" }}
      />
    </div>
  )
}

export function ResponsiveAd({ adSlot, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="auto"
        fullWidthResponsive={true}
      />
    </div>
  )
}