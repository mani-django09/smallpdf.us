"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { FileText, ArrowLeft, Sparkles, Shield, Zap, Clock, Play, Layers, GripVertical, Trash2 } from "lucide-react"

// AdSense Component
function AdSenseUnit({ adSlot, style = {} }) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error("AdSense:", err)
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-6913093595582462"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

export default function PreviewMergePDF() {
  const router = useRouter()
  const [filesData, setFilesData] = useState([])
  const [merging, setMerging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => {
    const storedFiles = sessionStorage.getItem("uploadedPDFs")

    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles)
        setFilesData(parsed)
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/merge-pdf")
      }
    } else {
      router.push("/merge-pdf")
    }
  }, [router])

  const handleReorder = (fromIndex, toIndex) => {
    const newFiles = [...filesData]
    const [removed] = newFiles.splice(fromIndex, 1)
    newFiles.splice(toIndex, 0, removed)
    setFilesData(newFiles)
    sessionStorage.setItem("uploadedPDFs", JSON.stringify(newFiles))
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    handleReorder(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const removeFile = (id) => {
    const newFiles = filesData.filter((f) => f.id !== id)
    setFilesData(newFiles)
    sessionStorage.setItem("uploadedPDFs", JSON.stringify(newFiles))

    if (newFiles.length < 2) {
      router.push("/merge-pdf")
    }
  }

  const handleMerge = async () => {
    if (filesData.length < 2) return

    setMerging(true)
    setProgress(0)
    setStage("Preparing files...")

    const stages = [
      { progress: 15, text: "Uploading documents...", delay: 400 },
      { progress: 35, text: "Processing PDFs...", delay: 500 },
      { progress: 55, text: "Combining pages...", delay: 600 },
      { progress: 75, text: "Optimizing output...", delay: 400 },
      { progress: 90, text: "Finalizing merge...", delay: 300 },
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

      for (let i = 0; i < filesData.length; i++) {
        const fileData = filesData[i]
        const response = await fetch(fileData.data)
        const blob = await response.blob()
        const file = new File([blob], fileData.name, { type: fileData.type })
        formData.append("files", file)
      }

      const mergeResponse = await fetch("http://localhost:5011/api/merge-pdf", {
        method: "POST",
        body: formData,
      })

      const result = await mergeResponse.json()

      setProgress(100)
      setStage("Complete!")

      if (mergeResponse.ok) {
        sessionStorage.setItem(
          "mergeResult",
          JSON.stringify({
            ...result,
            fileCount: filesData.length,
            totalSize: filesData.reduce((acc, f) => acc + f.size, 0),
          }),
        )
        setTimeout(() => {
          router.push(`/merge-pdf/download?file=${encodeURIComponent(result.downloadUrl)}`)
        }, 500)
      } else {
        alert("Merge failed: " + result.error)
        setMerging(false)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to merge files. Please try again.")
      setMerging(false)
    }
  }

  const totalSize = filesData.reduce((acc, f) => acc + f.size, 0)

  if (filesData.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Preview & Merge - Combine PDF Files"
      description="Review your PDF files and merge them into one document"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
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
            onClick={() => router.push("/merge-pdf")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Files</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Ready to Merge {filesData.length} PDFs
              </h1>
              <p className="font-body text-xs text-white/80">Review order and start merging</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner Ad */}
      <div className="bg-white py-4 px-4 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
            Advertisement
          </p>
          <div className="flex justify-center">
            <AdSenseUnit 
              adSlot="4209491059"
              style={{ width: "728px", height: "90px" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-50 min-h-screen py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Sidebar Ad - Desktop Only */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-4">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <AdSenseUnit 
                  adSlot="7797382279"
                  style={{ width: "160px", height: "600px" }}
                />
              </div>
            </div>

            {/* Main Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-white">
                          {filesData.length} PDF Files Selected
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Total: {(totalSize / 1024 / 1024).toFixed(2)} MB
                        </p>
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
                  {!merging ? (
                    <>
                      {/* File List */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display text-sm font-semibold text-slate-900">Document Order</h3>
                          <span className="text-xs text-slate-500">Drag to reorder</span>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filesData.map((f, index) => (
                            <div
                              key={f.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-move hover:bg-slate-100 transition-colors ${
                                draggedIndex === index ? "opacity-50 scale-95" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-400" />
                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </div>
                              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
                                <p className="text-xs text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <button
                                onClick={() => removeFile(f.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Merge Button */}
                      <button
                        onClick={handleMerge}
                        disabled={filesData.length < 2}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Play className="w-4 h-4" />
                        <span>Merge {filesData.length} PDF Files</span>
                      </button>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">{filesData.length}</div>
                          <div className="font-body text-xs text-slate-500">Files</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-emerald-600">&lt;5s</div>
                          <div className="font-body text-xs text-slate-500">Est. Time</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">100%</div>
                          <div className="font-body text-xs text-slate-500">Quality</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6">
                      <div className="text-center mb-5">
                        <div className="relative w-14 h-14 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-indigo-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <p className="font-body text-xs text-indigo-800 text-center">
                          Combining {filesData.length} PDF documents...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Ad - Below Main Card */}
              <div className="lg:hidden mt-5">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <div className="flex justify-center">
                  <AdSenseUnit 
                    adSlot="4209491059"
                    style={{ width: "320px", height: "50px" }}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Ad Space 1 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <div className="flex justify-center">
                  <AdSenseUnit 
                    adSlot="2896409385"
                    style={{ width: "300px", height: "250px" }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "Lossless quality", color: "text-violet-600 bg-violet-100" },
                    { icon: Shield, text: "Secure processing", color: "text-emerald-600 bg-emerald-100" },
                    { icon: Zap, text: "Fast merging", color: "text-amber-600 bg-amber-100" },
                    { icon: Clock, text: "Auto-delete in 1 hour", color: "text-blue-600 bg-blue-100" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color.split(" ")[1]}`}
                      >
                        <item.icon className={`w-3.5 h-3.5 ${item.color.split(" ")[0]}`} />
                      </div>
                      <span className="font-body text-xs text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Merge Process</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload & arrange", color: "bg-indigo-600" },
                    { num: "2", text: "Combine pages", color: "bg-purple-600" },
                    { num: "3", text: "Download merged PDF", color: "bg-emerald-600" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 ${step.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                      >
                        {step.num}
                      </div>
                      <span className="font-body text-xs text-slate-700">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>


              {/* Ad Space 2 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <div className="flex justify-center">
                  <AdSenseUnit 
                    adSlot="2896409385"
                    style={{ width: "300px", height: "250px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}