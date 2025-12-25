"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import {
  Download,
  ImageIcon,
  CheckCircle,
  Share2,
  RefreshCw,
  Shield,
  Zap,
  Clock,
  Copy,
  ChevronRight,
  ArrowRight,
  Lock,
  Layers,
  Timer,
  Camera,
  Palette,
} from "lucide-react"

export default function DownloadJPGPage() {
  const router = useRouter()
  const { file } = router.query
  const [conversionResult, setConversionResult] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState(3600)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const result = sessionStorage.getItem("jpgConversionResult")
    if (result) {
      setConversionResult(JSON.parse(result))
      setTimeout(() => setShowSuccess(true), 100)
    } else if (!file) {
      router.push("/pdf-to-jpg")
    }
  }, [file, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownload = async () => {
    if (!file) return
    setDownloading(true)

    try {
      const downloadUrl = `http://localhost:5011${file}`
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pdf-images-${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setDownloadComplete(true)
      setTimeout(() => setDownloadComplete(false), 3000)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download file. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  const handleConvertAnother = () => {
    sessionStorage.removeItem("uploadedPDFFile")
    sessionStorage.removeItem("jpgConversionResult")
    router.push("/pdf-to-jpg")
  }

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${file}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Extracted JPG Images",
          text: "Check out my converted images from PDF",
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share failed:", err)
      }
    } else {
      handleCopyLink()
    }
  }

  if (!conversionResult && !file) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading your images...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Download JPG Images - Extraction Complete | SmallPDF.us"
      description="Download your extracted JPG images from PDF with perfect quality"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        
        @keyframes checkmark-draw {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes circle-fill {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-checkmark { animation: checkmark-draw 0.4s ease-out 0.3s forwards; stroke-dasharray: 24; stroke-dashoffset: 24; }
        .animate-circle { animation: circle-fill 0.3s ease-out forwards; }
        .animate-fade-up { animation: fade-up 0.5s ease-out forwards; }
        .animate-fade-up-delay-1 { animation: fade-up 0.5s ease-out 0.1s forwards; opacity: 0; }
        .animate-fade-up-delay-2 { animation: fade-up 0.5s ease-out 0.2s forwards; opacity: 0; }
        
        .btn-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .jpg-icon-gradient {
          background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        }
      `}</style>

      {/* Compact Hero Success Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`relative flex-shrink-0 ${mounted ? "animate-fade-up" : ""}`}>
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-checkmark"
                    />
                  </svg>
                </div>
              </div>
              <div className={`${mounted ? "animate-fade-up-delay-1" : "opacity-0"}`}>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Images Extracted Successfully
                </h1>
                <p className="font-body text-amber-100 text-sm">Your JPG files are ready for download</p>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${mounted ? "animate-fade-up-delay-2" : "opacity-0"}`}>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-white">
                <Timer className="w-3.5 h-3.5" />
                <span>{formatTime(countdown)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-white">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-50/50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main Download Section */}
            <div className="lg:col-span-8 space-y-6">
              {/* Download Card */}
              <div className="glass-card rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* File Preview Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 jpg-icon-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                      <ImageIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-lg sm:text-xl font-semibold text-white truncate">
                        extracted-images.zip
                      </h2>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          Ready
                        </span>
                        <span className="text-slate-400 text-sm">ZIP • Multiple JPG Files</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="p-6 sm:p-8">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="group relative w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white py-4 sm:py-5 px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-500 hover:to-orange-600 overflow-hidden"
                  >
                    <div className="absolute inset-0 btn-shimmer"></div>
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="relative">Preparing Download...</span>
                      </>
                    ) : downloadComplete ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="relative">Downloaded Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 group-hover:animate-bounce" />
                        <span className="relative">Download JPG Images</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      </>
                    )}
                  </button>

                  {/* Conversion Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900">3.1s</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Extraction</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="font-display text-2xl sm:text-3xl font-bold text-amber-600">300</div>
                      <div className="font-body text-xs text-slate-500 mt-1">DPI Quality</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900">JPG</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Format</div>
                    </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                    <button
                      onClick={handleConvertAnother}
                      className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-slate-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Convert Another PDF</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="py-3 px-4 rounded-xl font-medium text-sm bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-slate-700"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="py-3 px-4 rounded-xl font-medium text-sm bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-slate-700"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-amber-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">Crystal Clear Quality</h3>
                  <p className="font-body text-sm text-slate-600">High-resolution images with perfect clarity</p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-yellow-500/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">Instant Processing</h3>
                  <p className="font-body text-sm text-slate-600">Pages extracted in seconds, not minutes</p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">Private & Secure</h3>
                  <p className="font-body text-sm text-slate-600">Files auto-delete after 60 minutes</p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-violet-500/20">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">True Color Accuracy</h3>
                  <p className="font-body text-sm text-slate-600">Vibrant colors preserved from source</p>
                </div>
              </div>

              {/* More Tools Section */}
              <div className="glass-card rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-display text-lg font-semibold text-slate-900">Explore More PDF Tools</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        name: "JPG to PDF",
                        desc: "Combine images into PDF",
                        href: "/jpg-to-pdf",
                        color: "from-blue-500 to-blue-600",
                      },
                      {
                        name: "PDF to PNG",
                        desc: "Extract transparent images",
                        href: "/pdf-to-png",
                        color: "from-purple-500 to-purple-600",
                      },
                      {
                        name: "Compress PDF",
                        desc: "Reduce file size",
                        href: "/compress-pdf",
                        color: "from-rose-500 to-rose-600",
                      },
                    ].map((tool) => (
                      <a
                        key={tool.name}
                        href={tool.href}
                        className="group p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 bg-white"
                      >
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-display font-semibold text-slate-900 mb-0.5">{tool.name}</h4>
                        <p className="font-body text-sm text-slate-500 mb-2">{tool.desc}</p>
                        <span className="inline-flex items-center text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors">
                          Try now
                          <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* File Expiry Notice */}
              <div className="glass-card rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden">
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-slate-900">File Available</h3>
                      <p className="font-body text-xs text-slate-600">Download within 1 hour</p>
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-amber-200/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-body text-xs text-slate-600">Time remaining</span>
                      <span className="font-display text-sm font-bold text-amber-600">{formatTime(countdown)}</span>
                    </div>
                    <div className="bg-amber-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(countdown / 3600) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Uses */}
              <div className="glass-card rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-display text-sm font-semibold text-slate-900">Use Your Images For</h3>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    {[
                      { icon: "📱", text: "Social media posts" },
                      { icon: "📊", text: "Presentation slides" },
                      { icon: "🌐", text: "Website content" },
                      { icon: "✉️", text: "Email newsletters" },
                      { icon: "🖨️", text: "Print materials" },
                      { icon: "📁", text: "Digital archives" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-body text-slate-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ad Space */}
              <div className="glass-card rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                  <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center">
                    Advertisement
                  </p>
                </div>
                <div className="p-5">
                  <div className="bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center aspect-[4/5]">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Ad Space</p>
                      <p className="text-xl font-semibold text-slate-300">300×400</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="glass-card rounded-2xl border border-slate-200/60 p-5">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Quick Tips</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>💡 JPG images work everywhere - email, web, print</p>
                  <p>💡 Save to cloud storage for permanent access</p>
                  <p>💡 Rename files to stay organized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
