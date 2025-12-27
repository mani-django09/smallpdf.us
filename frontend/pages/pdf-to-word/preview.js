"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { FileText, ArrowLeft, CheckCircle2, Sparkles, Shield, Zap, Clock, Play, AlertCircle } from "lucide-react"

// Get API URL - use environment variable or empty string for relative URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export default function PreviewPdfToWord() {
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Load files from sessionStorage
    const storedFiles = sessionStorage.getItem("uploadedPdfFiles")
    
    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles)
        setFiles(Array.isArray(parsed) ? parsed : [parsed])
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/pdf-to-word")
      }
    } else {
      router.push("/pdf-to-word")
    }
  }, [router])

  const handleConvert = async () => {
    if (files.length === 0) return

    setConverting(true)
    setProgress(0)
    setStage("Preparing files...")
    setError("")

    // Progress animation
    const stages = [
      { progress: 15, text: "Uploading PDFs...", delay: 400 },
      { progress: 35, text: "Analyzing document structure...", delay: 600 },
      { progress: 55, text: "Extracting tables and text...", delay: 800 },
      { progress: 75, text: "Creating Word document...", delay: 600 },
      { progress: 90, text: "Finalizing...", delay: 400 }
    ]

    let currentStage = 0
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress)
        setStage(stages[currentStage].text)
        currentStage++
      }
    }, 500)

    try {
      // Create FormData with all files
      const formData = new FormData()
      
      for (const fileData of files) {
        // Convert base64 back to File object
        const response = await fetch(fileData.data)
        const blob = await response.blob()
        const file = new File([blob], fileData.name, { type: "application/pdf" })
        formData.append("files", file)
      }

      // Call the conversion API
      const convertResponse = await fetch(`${API_BASE_URL}/api/pdf-to-word`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      const result = await convertResponse.json()

      if (convertResponse.ok && result.success) {
        setProgress(100)
        setStage("Complete!")

        // Store the conversion result with jobId
        sessionStorage.setItem("pdfWordConvertResult", JSON.stringify(result))

        // Navigate to download page with jobId
        setTimeout(() => {
          router.push(`/pdf-to-word/download?jobId=${result.jobId}`)
        }, 500)
      } else {
        throw new Error(result.error || result.details || "Conversion failed")
      }
    } catch (err) {
      clearInterval(progressInterval)
      console.error("Conversion error:", err)
      setError(err.message || "Failed to convert PDF. Please try again.")
      setConverting(false)
      setProgress(0)
    }
  }

  const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 1), 0)
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0)

  if (files.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Preview & Convert - PDF to Word"
      description="Preview your PDF and convert to editable Word document"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 py-5">
          <button
            onClick={() => router.push("/pdf-to-word")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Files</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Ready to Convert
              </h1>
              <p className="font-body text-xs text-white/80">
                {files.length} PDF{files.length > 1 ? 's' : ''} • {totalPages} page{totalPages > 1 ? 's' : ''} total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-50 min-h-screen py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Files Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-white truncate">
                        {files.length === 1 ? files[0].name : `${files.length} PDF Documents`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{(totalSize / 1024 / 1024).toFixed(2)} MB total</span>
                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                        <span>{totalPages} pages</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                      <span className="text-xs font-medium text-emerald-300">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-body text-sm text-red-800 font-medium">Conversion Failed</p>
                        <p className="font-body text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {!converting ? (
                    <>
                      {/* File List */}
                      {files.length > 1 && (
                        <div className="mb-4 max-h-40 overflow-y-auto">
                          <p className="text-xs font-medium text-slate-500 mb-2">Files to convert:</p>
                          <div className="space-y-2">
                            {files.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                                <span className="text-xs text-slate-500">{file.pageCount || 1} pg</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Card */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 text-center border border-slate-200 mb-5">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm mb-3 border border-slate-200">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 mb-1">
                          Documents Validated
                        </h3>
                        <p className="font-body text-sm text-slate-600">
                          Ready for conversion with table & layout extraction
                        </p>
                      </div>

                      {/* Convert Button */}
                      <button
                        onClick={handleConvert}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Convert to Word</span>
                      </button>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">{files.length}</div>
                          <div className="font-body text-xs text-slate-500">Files</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-emerald-600">&lt;10s</div>
                          <div className="font-body text-xs text-slate-500">Est. Time</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">.DOCX</div>
                          <div className="font-body text-xs text-slate-500">Output</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6">
                      <div className="text-center mb-5">
                        <div className="relative w-14 h-14 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-700 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="font-body text-xs text-blue-800 text-center">
                          Converting {files.length} PDF{files.length > 1 ? 's' : ''} with intelligent table extraction...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Features */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "Tables & layout preserved", color: "text-violet-600 bg-violet-100" },
                    { icon: Shield, text: "Bank-level encryption", color: "text-emerald-600 bg-emerald-100" },
                    { icon: Zap, text: "Intelligent text extraction", color: "text-amber-600 bg-amber-100" },
                    { icon: Clock, text: "Auto-delete after 1 hour", color: "text-blue-600 bg-blue-100" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color.split(' ')[1]}`}>
                        <item.icon className={`w-3.5 h-3.5 ${item.color.split(' ')[0]}`} />
                      </div>
                      <span className="font-body text-xs text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Steps */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Conversion Process</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload & validate", color: "bg-blue-600" },
                    { num: "2", text: "Extract tables & text", color: "bg-blue-700" },
                    { num: "3", text: "Create Word document", color: "bg-emerald-600" }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 ${step.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {step.num}
                      </div>
                      <span className="font-body text-xs text-slate-700">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ad Space */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">Advertisement</p>
                <div className="bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center aspect-[4/3]">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Ad Space</p>
                    <p className="text-lg font-semibold text-slate-300">300×250</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}