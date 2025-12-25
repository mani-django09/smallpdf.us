"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { FileText, ArrowLeft, Sparkles, Shield, Zap, Clock, Play, Trash2, CheckCircle, Eye, X } from "lucide-react"

export default function PreviewPdfToWord() {
  const router = useRouter()
  const [filesData, setFilesData] = useState([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewModal, setPreviewModal] = useState({ open: false, file: null })

  useEffect(() => {
    const storedFiles = sessionStorage.getItem("uploadedPdfFiles")

    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles)
        setFilesData(parsed)
        setSelectedFiles(parsed.map((f) => f.id))
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/pdf-to-word")
      }
    } else {
      router.push("/pdf-to-word")
    }
  }, [router])

  const toggleFileSelection = (id) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]))
  }

  const removeFile = (id) => {
    const newFiles = filesData.filter((f) => f.id !== id)
    setFilesData(newFiles)
    setSelectedFiles((prev) => prev.filter((fid) => fid !== id))
    sessionStorage.setItem("uploadedPdfFiles", JSON.stringify(newFiles))

    if (newFiles.length === 0) {
      router.push("/pdf-to-word")
    }
  }

  const handleConvert = async () => {
    const filesToConvert = filesData.filter((f) => selectedFiles.includes(f.id))
    if (filesToConvert.length === 0) return

    setConverting(true)
    setProgress(0)
    setStage("Initializing conversion engine...")

    const stages = [
      { progress: 12, text: "Uploading your documents to secure server...", delay: 500 },
      { progress: 28, text: "Analyzing PDF structure and layout...", delay: 700 },
      { progress: 45, text: "Extracting text, images, and formatting...", delay: 800 },
      { progress: 62, text: "Reconstructing document in Word format...", delay: 900 },
      { progress: 78, text: "Preserving fonts and styling...", delay: 600 },
      { progress: 92, text: "Finalizing your Word document...", delay: 400 },
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
      const formData = new FormData()

      for (const fileData of filesToConvert) {
        const response = await fetch(fileData.data)
        const blob = await response.blob()
        const file = new File([blob], fileData.name, { type: fileData.type || "application/pdf" })
        formData.append("files", file)
      }

      const convertResponse = await fetch("http://localhost:5011/api/pdf-to-word", {
        method: "POST",
        body: formData,
      })

      const result = await convertResponse.json()

      setProgress(100)
      setStage("Conversion complete! Preparing download...")

      if (convertResponse.ok) {
        sessionStorage.setItem(
          "pdfWordConvertResult",
          JSON.stringify({
            ...result,
            fileCount: filesToConvert.length,
            totalSize: filesToConvert.reduce((acc, f) => acc + f.size, 0),
          }),
        )
        setTimeout(() => {
          router.push(`/pdf-to-word/download?jobId=${result.jobId}`)
        }, 600)
      } else {
        alert("Conversion failed: " + result.error)
        setConverting(false)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Unable to complete conversion. Please check your connection and try again.")
      setConverting(false)
    }
  }

  const totalSize = filesData.reduce((acc, f) => acc + f.size, 0)
  const selectedCount = selectedFiles.length
  const totalPages = filesData.reduce((acc, f) => acc + (f.pageCount || 1), 0)

  if (filesData.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading your documents...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Review Your PDFs - Convert to Word" description="Preview and select PDF files to convert to Word format">
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
      {previewModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewModal({ open: false, file: null })}>
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white truncate max-w-md">{previewModal.file?.name}</h3>
                  <p className="text-sm text-slate-400">{previewModal.file?.pageCount || 1} page(s) • {((previewModal.file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setPreviewModal({ open: false, file: null })} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 bg-slate-100">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-600">First Page Preview</span>
                </div>
                {previewModal.file?.thumbnail ? (
                  <img src={previewModal.file.thumbnail} alt="PDF Preview" className="w-full" />
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <FileText className="w-16 h-16 text-blue-300" />
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                Full document ({previewModal.file?.pageCount || 1} pages) will be converted to Word format.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-blue-600 relative overflow-hidden">
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
            onClick={() => router.push("/pdf-to-word")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Upload Different Files</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Review {filesData.length} Document{filesData.length > 1 ? "s" : ""} Before Converting
              </h1>
              <p className="font-body text-xs text-white/80">Click any document to preview, then convert to Word</p>
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
                      <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-white">
                          {selectedCount} of {filesData.length} Selected for Conversion
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {totalPages} total pages • {(totalSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      <span className="text-xs font-medium text-blue-300">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {!converting ? (
                    <>
                      {/* File Grid with Thumbnails */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display text-sm font-semibold text-slate-900">Your PDF Documents</h3>
                          <button
                            onClick={() =>
                              setSelectedFiles(
                                selectedFiles.length === filesData.length ? [] : filesData.map((f) => f.id),
                              )
                            }
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {selectedFiles.length === filesData.length ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                          {filesData.map((f) => (
                            <div
                              key={f.id}
                              className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                selectedFiles.includes(f.id)
                                  ? "border-blue-500 shadow-lg"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div 
                                className="aspect-[3/4] bg-white relative overflow-hidden"
                                onClick={() => toggleFileSelection(f.id)}
                              >
                                {f.thumbnail ? (
                                  <img
                                    src={f.thumbnail}
                                    alt={f.name}
                                    className="w-full h-full object-cover object-top"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                    <FileText className="w-12 h-12 text-blue-400" />
                                  </div>
                                )}
                                
                                {/* Selection overlay */}
                                <div className={`absolute inset-0 transition-all ${
                                  selectedFiles.includes(f.id) 
                                    ? "bg-blue-600/10" 
                                    : "bg-black/0 group-hover:bg-black/5"
                                }`} />
                                
                                {/* Selection checkbox */}
                                <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  selectedFiles.includes(f.id)
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-white/90 border-slate-300 group-hover:border-blue-400"
                                }`}>
                                  {selectedFiles.includes(f.id) && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                
                                {/* Page count badge */}
                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                                  {f.pageCount || 1} pg
                                </div>
                                
                                {/* Action buttons */}
                                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setPreviewModal({ open: true, file: f })
                                    }}
                                    className="p-1.5 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                                    title="Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFile(f.id)
                                    }}
                                    className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* File info */}
                              <div className="p-2.5 bg-slate-50">
                                <p className="text-xs font-medium text-slate-900 truncate" title={f.name}>{f.name}</p>
                                <p className="text-xs text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Convert Button */}
                      <button
                        onClick={handleConvert}
                        disabled={selectedCount === 0}
                        className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:bg-blue-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        <span>
                          Convert {selectedCount} Document{selectedCount !== 1 ? "s" : ""} to Word
                        </span>
                      </button>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">{selectedCount}</div>
                          <div className="font-body text-xs text-slate-500">Selected</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-blue-600">{totalPages}</div>
                          <div className="font-body text-xs text-slate-500">Pages</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">DOCX</div>
                          <div className="font-body text-xs text-slate-500">Output</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8">
                      {/* Progress Animation */}
                      <div className="text-center mb-6">
                        <div className="relative w-20 h-20 mx-auto mb-5">
                          <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse-ring"></div>
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-3 bg-blue-50 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-1">{stage}</p>
                        <p className="font-body text-2xl font-bold text-blue-600">{progress}%</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="bg-slate-100 rounded-full h-3 overflow-hidden mb-5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out rounded-full relative"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-display text-sm font-semibold text-blue-900">Processing Your Documents</p>
                            <p className="font-body text-xs text-blue-700 mt-1">
                              Converting {selectedCount} PDF{selectedCount !== 1 ? "s" : ""} with {totalPages} total pages. 
                              Your editable Word {selectedCount !== 1 ? "files" : "file"} will be ready shortly.
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
              {/* What to Expect */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You'll Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "Fully editable Word document", color: "text-blue-600 bg-blue-100" },
                    { icon: Shield, text: "Original formatting preserved", color: "text-slate-600 bg-slate-100" },
                    { icon: Zap, text: "Images and tables intact", color: "text-amber-600 bg-amber-100" },
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

              {/* Conversion Steps */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Conversion Process</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload PDFs", color: "bg-blue-600", done: true },
                    { num: "2", text: "Review & convert", color: converting ? "bg-blue-600" : "bg-slate-400", done: false },
                    { num: "3", text: "Download Word files", color: "bg-slate-400", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 ${step.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-colors`}>
                        {step.done ? <CheckCircle className="w-3 h-3" /> : step.num}
                      </div>
                      <span className={`font-body text-xs ${step.done ? "text-slate-900 font-medium" : "text-slate-600"}`}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-2">💡 Quick Tip</h3>
                <p className="font-body text-xs text-slate-600 leading-relaxed">
                  Click on any document thumbnail to preview it before converting. This helps you verify you've uploaded the right files.
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