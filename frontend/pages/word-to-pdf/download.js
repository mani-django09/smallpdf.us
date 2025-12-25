import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Share2, 
  RefreshCw, 
  Shield, 
  Zap, 
  Clock, 
  Copy, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  Lock,
  FileCheck,
  Layers,
  Timer
} from "lucide-react"

export default function DownloadPage() {
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
    const result = sessionStorage.getItem("conversionResult")
    if (result) {
      setConversionResult(JSON.parse(result))
      setTimeout(() => setShowSuccess(true), 100)
    } else if (!file) {
      router.push("/word-to-pdf")
    }
  }, [file, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = async () => {
    if (!file) return
    setDownloading(true)
    
    try {
      const downloadUrl = `http://localhost:5011${file}`
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `converted-document-${Date.now()}.pdf`
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
    sessionStorage.removeItem("uploadedFile")
    sessionStorage.removeItem("conversionResult")
    router.push("/word-to-pdf")
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
          title: 'My Converted PDF',
          text: 'Check out my converted PDF file',
          url: window.location.href
        })
      } catch (err) {
        console.log('Share failed:', err)
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
              <div className="absolute inset-0 border-3 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading your file...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Download PDF - Conversion Complete | SmallPDF.us"
      description="Download your converted PDF file with perfect formatting preservation"
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
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
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
        .animate-fade-up-delay-3 { animation: fade-up 0.5s ease-out 0.3s forwards; opacity: 0; }
        .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        
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
        
        .success-gradient {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
        }
        
        .pdf-icon-gradient {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
        }
      `}</style>

      {/* Compact Hero Success Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Success Info */}
            <div className="flex items-center gap-4">
              <div className={`relative flex-shrink-0 ${mounted ? 'animate-fade-up' : ''}`}>
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
              <div className={`${mounted ? 'animate-fade-up-delay-1' : 'opacity-0'}`}>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Conversion Complete
                </h1>
                <p className="font-body text-emerald-100 text-sm">
                  Your PDF is ready for download
                </p>
              </div>
            </div>

            {/* Right: Status Pills */}
            <div className={`flex items-center gap-2 ${mounted ? 'animate-fade-up-delay-2' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-white">
                <Timer className="w-3.5 h-3.5" />
                <span>{formatTime(countdown)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-white">
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypted</span>
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
                    <div className="w-14 h-14 pdf-icon-gradient rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-lg sm:text-xl font-semibold text-white truncate">
                        converted-document.pdf
                      </h2>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          Ready
                        </span>
                        <span className="text-slate-400 text-sm">PDF • 2.4 MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="p-6 sm:p-8">
                  {/* Primary Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="group relative w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 sm:py-5 px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-500 hover:to-emerald-600 overflow-hidden"
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
                        <span className="relative">Download PDF</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      </>
                    )}
                  </button>

                  {/* Conversion Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900">2.3s</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Processing</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="font-display text-2xl sm:text-3xl font-bold text-emerald-600">100%</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Quality</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900">A+</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Formatting</div>
                    </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                    <button
                      onClick={handleConvertAnother}
                      className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-slate-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Convert Another</span>
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
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-violet-500/20">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">Perfect Formatting</h3>
                  <p className="font-body text-sm text-slate-600">Fonts, images & layouts preserved exactly</p>
                </div>
                
                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">Lightning Fast</h3>
                  <p className="font-body text-sm text-slate-600">Converted in under 3 seconds</p>
                </div>
                
                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">Bank-Level Security</h3>
                  <p className="font-body text-sm text-slate-600">256-bit encryption, auto-delete</p>
                </div>
                
                <div className="glass-card p-5 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">Professional Quality</h3>
                  <p className="font-body text-sm text-slate-600">Print-ready & business suitable</p>
                </div>
              </div>

              {/* More Tools Section */}
              <div className="glass-card rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-display text-lg font-semibold text-slate-900">Explore More Tools</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: 'PDF to Word', desc: 'Convert to editable docs', href: '/pdf-to-word', color: 'from-blue-500 to-blue-600' },
                      { name: 'Merge PDF', desc: 'Combine multiple files', href: '/merge-pdf', color: 'from-purple-500 to-purple-600' },
                      { name: 'Compress PDF', desc: 'Reduce file size', href: '/compress-pdf', color: 'from-rose-500 to-rose-600' }
                    ].map((tool) => (
                      <a
                        key={tool.name}
                        href={tool.href}
                        className="group p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 bg-white"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-display font-semibold text-slate-900 mb-0.5">{tool.name}</h4>
                        <p className="font-body text-sm text-slate-500 mb-2">{tool.desc}</p>
                        <span className="inline-flex items-center text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
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
              {/* Live Stats */}
              <div className="glass-card rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-display font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live Statistics
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Avg. Processing', value: '2.3s', icon: Clock },
                    { label: "Today's Conversions", value: '15.2K', icon: Zap },
                    { label: 'Success Rate', value: '99.8%', icon: CheckCircle },
                    { label: 'Global Users', value: '2.1M+', icon: Sparkles }
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-body text-xs text-slate-500">{stat.label}</div>
                        <div className="font-display text-lg font-bold text-slate-900">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ad Space 1 */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-3 text-center">Advertisement</p>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 flex items-center justify-center aspect-[4/3]">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Ad Space</p>
                    <p className="text-xl font-semibold text-slate-300">300×250</p>
                  </div>
                </div>
              </div>

              {/* Trust Section */}
              <div className="glass-card rounded-2xl border border-slate-200/60 p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display text-sm font-semibold text-emerald-800">100% Free Forever</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">★</span>
                    </div>
                    <span className="font-display text-sm font-semibold text-amber-800">4.9/5 User Rating</span>
                  </div>
                </div>
              </div>

              {/* Ad Space 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-3 text-center">Advertisement</p>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 flex items-center justify-center aspect-[4/3]">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Ad Space</p>
                    <p className="text-xl font-semibold text-slate-300">300×250</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 py-12 sm:py-16 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
            Need to Convert More?
          </h2>
          <p className="font-body text-base text-red-100 mb-6 max-w-xl mx-auto">
            Join over 2 million professionals who trust SmallPDF.us
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleConvertAnother}
              className="w-full sm:w-auto bg-white text-red-600 px-6 py-3 rounded-xl font-display font-semibold text-sm hover:bg-red-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Convert Another File
            </button>
            <a
              href="/"
              className="w-full sm:w-auto bg-white/15 backdrop-blur text-white px-6 py-3 rounded-xl font-display font-semibold text-sm hover:bg-white/25 transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              Explore All Tools
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}