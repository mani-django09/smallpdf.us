"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { FileText, ArrowLeft, Sparkles, Shield, Zap, Clock, Play, Trash2 } from "lucide-react"

export default function PreviewPngToPdf() {
  const router = useRouter()
  const [filesData, setFilesData] = useState([])
  const [settings, setSettings] = useState({ pageSize: "a4", orientation: "auto" })
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => {
    const storedFiles = sessionStorage.getItem("uploadedPngFiles")
    const storedSettings = sessionStorage.getItem("pdfSettings")

    if (storedFiles) {
      try {
        setFilesData(JSON.parse(storedFiles))
        if (storedSettings) setSettings(JSON.parse(storedSettings))
      } catch (err) {
        console.error("Error parsing data:", err)
        router.push("/png-to-pdf")
      }
    } else {
      router.push("/png-to-pdf")
    }
  }, [router])

  const handleReorder = (fromIndex, toIndex) => {
    const newFiles = [...filesData]
    const [removed] = newFiles.splice(fromIndex, 1)
    newFiles.splice(toIndex, 0, removed)
    setFilesData(newFiles)
    sessionStorage.setItem("uploadedPngFiles", JSON.stringify(newFiles))
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
    sessionStorage.setItem("uploadedPngFiles", JSON.stringify(newFiles))

    if (newFiles.length === 0) {
      router.push("/png-to-pdf")
    }
  }

  const handleConvert = async () => {
    if (filesData.length === 0) return

    setConverting(true)
    setProgress(0)
    setStage("Preparing images...")

    const stages = [
      { progress: 15, text: "Uploading images...", delay: 400 },
      { progress: 35, text: "Processing files...", delay: 500 },
      { progress: 55, text: "Creating PDF pages...", delay: 600 },
      { progress: 75, text: "Optimizing document...", delay: 400 },
      { progress: 90, text: "Finalizing PDF...", delay: 300 },
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

      for (const fileData of filesData) {
        const response = await fetch(fileData.data)
        const blob = await response.blob()
        const file = new File([blob], fileData.name, { type: fileData.type })
        formData.append("files", file)
      }

      formData.append("pageSize", settings.pageSize)
      formData.append("orientation", settings.orientation)

      const convertResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/png-to-pdf`, {        method: "POST",
        body: formData,
      })

      const result = await convertResponse.json()

      setProgress(100)
      setStage("Complete!")

      if (convertResponse.ok) {
        sessionStorage.setItem(
          "pngToPdfResult",
          JSON.stringify({
            ...result,
            fileCount: filesData.length,
            totalSize: filesData.reduce((acc, f) => acc + f.size, 0),
          }),
        )
        setTimeout(() => {
          router.push(`/png-to-pdf/download?file=${encodeURIComponent(result.downloadUrl)}`)
        }, 500)
      } else {
        alert("Conversion failed: " + result.error)
        setConverting(false)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to convert files. Please try again.")
      setConverting(false)
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
              <div className="absolute inset-0 border-3 border-t-slate-700 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Preview & Convert - Images to PDF" description="Review your images and create PDF">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="bg-slate-800 relative overflow-hidden">
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
            onClick={() => router.push("/png-to-pdf")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Images</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Ready to Create PDF from {filesData.length} Image{filesData.length > 1 ? "s" : ""}
              </h1>
              <p className="font-body text-xs text-white/80">Arrange images and start conversion</p>
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
                <div className="bg-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-slate-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-white">
                          {filesData.length} Image{filesData.length > 1 ? "s" : ""} Selected
                        </p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Total: {(totalSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-500/30 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      <span className="text-xs font-medium text-slate-200">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {!converting ? (
                    <>
                      {/* Image Grid */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display text-sm font-semibold text-slate-900">Page Order</h3>
                          <span className="text-xs text-slate-500">Drag to reorder</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                          {filesData.map((f, index) => (
                            <div
                              key={f.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`relative group cursor-move rounded-lg border-2 transition-all ${
                                draggedIndex === index
                                  ? "opacity-50 scale-95 border-slate-400"
                                  : "border-slate-200 hover:border-slate-400"
                              }`}
                            >
                              <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden">
                                <img
                                  src={f.data || "/placeholder.svg"}
                                  alt={f.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute top-1 left-1 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                              </div>
                              <button
                                onClick={() => removeFile(f.id)}
                                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-5">
                        <h4 className="font-display text-sm font-semibold text-slate-900 mb-3">PDF Settings</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-xs text-slate-600 mb-1.5 block">Page Size</label>
                            <select
                              value={settings.pageSize}
                              onChange={(e) => setSettings((s) => ({ ...s, pageSize: e.target.value }))}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                              <option value="a4">A4</option>
                              <option value="letter">Letter</option>
                              <option value="legal">Legal</option>
                              <option value="fit">Fit to Image</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-body text-xs text-slate-600 mb-1.5 block">Orientation</label>
                            <select
                              value={settings.orientation}
                              onChange={(e) => setSettings((s) => ({ ...s, orientation: e.target.value }))}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                              <option value="auto">Auto</option>
                              <option value="portrait">Portrait</option>
                              <option value="landscape">Landscape</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Convert Button */}
                      <button
                        onClick={handleConvert}
                        className="w-full bg-slate-800 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:bg-slate-900 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>
                          Create PDF from {filesData.length} Image{filesData.length > 1 ? "s" : ""}
                        </span>
                      </button>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">{filesData.length}</div>
                          <div className="font-body text-xs text-slate-500">Pages</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-700">&lt;5s</div>
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
                          <div className="absolute inset-0 border-4 border-t-slate-700 border-r-slate-700 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-slate-700 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                        <p className="font-body text-xs text-slate-700 text-center">
                          Creating PDF from {filesData.length} image{filesData.length > 1 ? "s" : ""}...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "High-quality PDF", color: "text-slate-700 bg-slate-100" },
                    { icon: Shield, text: "Secure processing", color: "text-slate-600 bg-slate-100" },
                    { icon: Zap, text: "Fast conversion", color: "text-amber-600 bg-amber-100" },
                    { icon: Clock, text: "Auto-delete in 1 hour", color: "text-slate-600 bg-slate-100" },
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
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Conversion Steps</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload images", color: "bg-slate-600" },
                    { num: "2", text: "Arrange & configure", color: "bg-slate-700" },
                    { num: "3", text: "Download PDF", color: "bg-slate-800" },
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
