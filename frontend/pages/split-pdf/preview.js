"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { FileText, ArrowLeft, Sparkles, Shield, Zap, Clock, Play, Scissors, CheckCircle, Eye, X } from "lucide-react"

export default function PreviewSplitPdf() {
  const router = useRouter()
  const [fileData, setFileData] = useState(null)
  const [splitting, setSplitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [previewModal, setPreviewModal] = useState({ open: false, page: null })

  useEffect(() => {
    const storedFile = sessionStorage.getItem("splitPdfFile")

    if (storedFile) {
      try {
        const parsed = JSON.parse(storedFile)
        setFileData(parsed)
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/split-pdf")
      }
    } else {
      router.push("/split-pdf")
    }
  }, [router])

  const handleSplit = async () => {
    if (!fileData) return

    setSplitting(true)
    setProgress(0)
    setStage("Initializing split operation...")

    const stages = [
      { progress: 15, text: "Uploading PDF to secure server...", delay: 500 },
      { progress: 35, text: "Analyzing document structure...", delay: 600 },
      { progress: 55, text: "Extracting selected pages...", delay: 800 },
      { progress: 75, text: "Building new PDF document...", delay: 700 },
      { progress: 90, text: "Finalizing your file...", delay: 400 },
    ]

    let currentStage = 0
    const updateProgress = () => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress)
        setStage(stages[currentStage].text)
        currentStage++
        setTimeout(updateProgress, stages[currentStage - 1].delay)
      }
    }
    updateProgress()

    try {
      // Convert base64 to blob
      const response = await fetch(fileData.data)
      const blob = await response.blob()
      const file = new File([blob], fileData.name, { type: fileData.type || "application/pdf" })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("pages", JSON.stringify(fileData.selectedPages))

      const splitResponse = await fetch("http://localhost:5000/api/split-pdf", {
        method: "POST",
        body: formData,
      })

      const result = await splitResponse.json()

      setProgress(100)
      setStage("Split complete!")

      if (splitResponse.ok) {
        sessionStorage.setItem(
          "splitPdfResult",
          JSON.stringify({
            ...result,
            originalName: fileData.name,
            selectedPages: fileData.selectedPages,
            totalPages: fileData.pageCount,
          }),
        )
        setTimeout(() => {
          router.push(`/split-pdf/download?jobId=${result.jobId}`)
        }, 600)
      } else {
        alert("Split failed: " + result.error)
        setSplitting(false)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Unable to split PDF. Please check your connection and try again.")
      setSplitting(false)
    }
  }

  if (!fileData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading your selection...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const selectedPages = fileData.selectedPages || []
  const pageThumbnails = fileData.pageThumbnails || []

  return (
    <Layout title="Confirm Split - Extract PDF Pages" description="Review and confirm your page selection">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 1; } 100% { transform: scale(1.3); opacity: 0; } }
        .animate-pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
      `}</style>

      {/* Preview Modal */}
      {previewModal.open && previewModal.page && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewModal({ open: false, page: null })}>
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">Page {previewModal.page.pageNumber}</h3>
                  <p className="text-sm text-slate-400">{fileData?.name}</p>
                </div>
              </div>
              <button onClick={() => setPreviewModal({ open: false, page: null })} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 bg-slate-100">
              <img src={previewModal.page.thumbnail} alt={`Page ${previewModal.page.pageNumber}`} className="w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-5">
          <button
            onClick={() => router.push("/split-pdf")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Selection</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Ready to Extract {selectedPages.length} Page{selectedPages.length > 1 ? "s" : ""}
              </h1>
              <p className="font-body text-xs text-white/80">Review your selection and split the PDF</p>
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
                {/* Header */}
                <div className="bg-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-white truncate max-w-xs">
                          {fileData.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Extracting {selectedPages.length} of {fileData.pageCount} pages
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                      <span className="text-xs font-medium text-purple-300">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {!splitting ? (
                    <>
                      {/* Selected Pages Preview */}
                      <div className="mb-5">
                        <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">
                          Selected Pages Preview
                        </h3>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-1">
                          {pageThumbnails.map((page) => (
                            <div
                              key={page.pageNumber}
                              className="relative group rounded-lg overflow-hidden border-2 border-purple-400 shadow-md"
                            >
                              <div className="aspect-[3/4] bg-white relative overflow-hidden">
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  className="w-full h-full object-cover object-top"
                                />
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-purple-600/5" />
                                
                                {/* Check badge */}
                                <div className="absolute top-1 left-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                                
                                {/* Preview button */}
                                <button
                                  onClick={() => setPreviewModal({ open: true, page })}
                                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                  title="Preview"
                                >
                                  <Eye className="w-3 h-3 text-slate-600" />
                                </button>
                              </div>
                              
                              {/* Page number */}
                              <div className="text-center py-1 text-xs font-medium bg-purple-100 text-purple-700">
                                {page.pageNumber}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Page Range Display */}
                      <div className="bg-slate-50 rounded-lg p-4 mb-5">
                        <p className="font-display text-sm font-semibold text-slate-700 mb-2">Pages to Extract:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPages.map((pageNum) => (
                            <span
                              key={pageNum}
                              className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                            >
                              {pageNum}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Split Button */}
                      <button
                        onClick={handleSplit}
                        className="w-full bg-purple-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:bg-purple-700 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>
                          Split PDF & Extract {selectedPages.length} Page{selectedPages.length !== 1 ? "s" : ""}
                        </span>
                      </button>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-purple-600">{selectedPages.length}</div>
                          <div className="font-body text-xs text-slate-500">Extracting</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">{fileData.pageCount}</div>
                          <div className="font-body text-xs text-slate-500">Total Pages</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">PDF</div>
                          <div className="font-body text-xs text-slate-500">Output</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8">
                      {/* Progress Animation */}
                      <div className="text-center mb-6">
                        <div className="relative w-20 h-20 mx-auto mb-5">
                          <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-pulse-ring"></div>
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-purple-600 border-r-purple-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-3 bg-purple-50 rounded-full flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-1">{stage}</p>
                        <p className="font-body text-2xl font-bold text-purple-600">{progress}%</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="bg-slate-100 rounded-full h-3 overflow-hidden mb-5">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-500 ease-out rounded-full relative"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-display text-sm font-semibold text-purple-900">Splitting Your PDF</p>
                            <p className="font-body text-xs text-purple-700 mt-1">
                              Extracting {selectedPages.length} page{selectedPages.length !== 1 ? "s" : ""} from your document.
                              Your new PDF will be ready in moments.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* What You'll Get */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You'll Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "New PDF with selected pages only", color: "text-purple-600 bg-purple-100" },
                    { icon: Shield, text: "Original quality preserved", color: "text-slate-600 bg-slate-100" },
                    { icon: Zap, text: "Instant download ready", color: "text-amber-600 bg-amber-100" },
                    { icon: Clock, text: "Auto-delete in 60 minutes", color: "text-slate-600 bg-slate-100" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color.split(" ")[1]}`}>
                        <item.icon className={`w-3.5 h-3.5 ${item.color.split(" ")[0]}`} />
                      </div>
                      <span className="font-body text-xs text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Steps */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Process</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload & select pages", done: true },
                    { num: "2", text: "Review selection", done: true },
                    { num: "3", text: "Split & download", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 ${step.done ? "bg-purple-600" : splitting ? "bg-purple-600 animate-pulse" : "bg-slate-400"} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {step.done ? <CheckCircle className="w-3 h-3" /> : step.num}
                      </div>
                      <span className={`font-body text-xs ${step.done ? "text-slate-900 font-medium" : "text-slate-600"}`}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl p-4 border border-purple-100">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-2">💡 Quick Tip</h3>
                <p className="font-body text-xs text-slate-600 leading-relaxed">
                  The extracted PDF will maintain the same page order as shown above. Need to reorder pages? Use our Merge PDF tool after downloading.
                </p>
              </div>

              {/* Ad Space */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <div className="bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center aspect-[4/3]">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Ad Space</p>
                    <p className="text-lg font-semibold text-slate-300">300x250</p>
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