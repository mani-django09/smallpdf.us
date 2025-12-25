"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { Minimize2, ArrowLeft, Sparkles, Shield, Zap, Clock, Play, Trash2, CheckCircle, Settings } from "lucide-react"

export default function PreviewCompressImage() {
  const router = useRouter()
  const [filesData, setFilesData] = useState([])
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [compressionLevel, setCompressionLevel] = useState("balanced")

  useEffect(() => {
    const storedFiles = sessionStorage.getItem("uploadedCompressImages")

    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles)
        setFilesData(parsed)
        setSelectedFiles(parsed.map((f) => f.id))
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/compress-image")
      }
    } else {
      router.push("/compress-image")
    }
  }, [router])

  const toggleFileSelection = (id) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]))
  }

  const removeFile = (id) => {
    const newFiles = filesData.filter((f) => f.id !== id)
    setFilesData(newFiles)
    setSelectedFiles((prev) => prev.filter((fid) => fid !== id))
    sessionStorage.setItem("uploadedCompressImages", JSON.stringify(newFiles))

    if (newFiles.length === 0) {
      router.push("/compress-image")
    }
  }

  const handleCompress = async () => {
    const filesToCompress = filesData.filter((f) => selectedFiles.includes(f.id))
    if (filesToCompress.length === 0) return

    setCompressing(true)
    setProgress(0)
    setStage("Initializing compression...")

    const stages = [
      { progress: 15, text: "Analyzing image data...", delay: 400 },
      { progress: 35, text: "Applying compression algorithm...", delay: 500 },
      { progress: 55, text: "Optimizing file structure...", delay: 600 },
      { progress: 75, text: "Reducing file size...", delay: 400 },
      { progress: 90, text: "Finalizing compressed images...", delay: 300 },
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
      formData.append("quality", compressionLevel)

      for (const fileData of filesToCompress) {
        const response = await fetch(fileData.data)
        const blob = await response.blob()
        const file = new File([blob], fileData.name, { type: fileData.type })
        formData.append("files", file)
      }

      const compressResponse = await fetch("http://localhost:5000/api/compress-image", {
        method: "POST",
        body: formData,
      })

      const result = await compressResponse.json()

      setProgress(100)
      setStage("Compression Complete!")

      if (compressResponse.ok) {
        sessionStorage.setItem(
          "compressResult",
          JSON.stringify({
            ...result,
            fileCount: filesToCompress.length,
            totalSize: filesToCompress.reduce((acc, f) => acc + f.size, 0),
            compressionLevel: compressionLevel,
          }),
        )
        setTimeout(() => {
          router.push(`/compress-image/download?jobId=${result.jobId}`)
        }, 500)
      } else {
        alert("Compression failed: " + result.error)
        setCompressing(false)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to compress images. Please try again.")
      setCompressing(false)
    }
  }

  const totalSize = filesData.reduce((acc, f) => acc + f.size, 0)
  const selectedCount = selectedFiles.length

  const compressionOptions = [
    { value: "maximum", label: "Maximum Compression", desc: "Smallest file size", reduction: "80%" },
    { value: "balanced", label: "Balanced Quality", desc: "Best quality/size ratio", reduction: "60%" },
    { value: "light", label: "Light Compression", desc: "Minimal quality loss", reduction: "40%" },
  ]

  if (filesData.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Preview & Compress Images" description="Review your images and apply compression">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

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
            onClick={() => router.push("/compress-image")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Files</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Minimize2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Ready to Compress {filesData.length} Image{filesData.length > 1 ? "s" : ""}
              </h1>
              <p className="font-body text-xs text-white/80">Select images and compression level</p>
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
                        <Minimize2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-white">
                          {selectedCount} of {filesData.length} Selected
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Total: {(totalSize / 1024 / 1024).toFixed(2)} MB
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
                  {!compressing ? (
                    <>
                      {/* Compression Level Selector */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Settings className="w-4 h-4 text-slate-600" />
                          <h3 className="font-display text-sm font-semibold text-slate-900">Compression Level</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {compressionOptions.map((option) => (
                            <label
                              key={option.value}
                              className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                compressionLevel === option.value
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="compression"
                                  value={option.value}
                                  checked={compressionLevel === option.value}
                                  onChange={(e) => setCompressionLevel(e.target.value)}
                                  className="w-4 h-4 text-purple-600"
                                />
                                <div>
                                  <div className="font-display font-semibold text-slate-900 text-sm">
                                    {option.label}
                                  </div>
                                  <div className="text-xs text-slate-500">{option.desc}</div>
                                </div>
                              </div>
                              <span className="font-bold text-purple-600 text-sm">~{option.reduction}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Image Grid */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display text-sm font-semibold text-slate-900">Your Images</h3>
                          <button
                            onClick={() =>
                              setSelectedFiles(
                                selectedFiles.length === filesData.length ? [] : filesData.map((f) => f.id),
                              )
                            }
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            {selectedFiles.length === filesData.length ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                          {filesData.map((f) => (
                            <div
                              key={f.id}
                              onClick={() => toggleFileSelection(f.id)}
                              className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                                selectedFiles.includes(f.id)
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
                              }`}
                            >
                              <div className="p-2">
                                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-2 relative">
                                  <img
                                    src={f.data || "/placeholder.svg"}
                                    alt={f.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {selectedFiles.includes(f.id) && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-slate-900 truncate">{f.name}</p>
                                <p className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFile(f.id)
                                }}
                                className="absolute top-1 left-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Compress Button */}
                      <button
                        onClick={handleCompress}
                        disabled={selectedCount === 0 || compressing}
                        className="w-full bg-purple-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:bg-purple-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {compressing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Compressing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>
                              Compress {selectedCount} Image{selectedCount !== 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </button>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">{selectedCount}</div>
                          <div className="font-body text-xs text-slate-500">Selected</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-purple-600">&lt;5s</div>
                          <div className="font-body text-xs text-slate-500">Est. Time</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">
                            {compressionOptions.find((o) => o.value === compressionLevel)?.reduction}
                          </div>
                          <div className="font-body text-xs text-slate-500">Reduction</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6">
                      <div className="text-center mb-5">
                        <div className="relative w-14 h-14 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-purple-600 border-r-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-purple-600 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="font-body text-xs text-purple-800 text-center">
                          Compressing {selectedCount} image{selectedCount !== 1 ? "s" : ""}...
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
                    { icon: Sparkles, text: "Optimal compression", color: "text-purple-600 bg-purple-100" },
                    { icon: Shield, text: "Secure processing", color: "text-slate-600 bg-slate-100" },
                    { icon: Zap, text: "Lightning fast", color: "text-amber-600 bg-amber-100" },
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
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Compression Steps</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload images", color: "bg-purple-600" },
                    { num: "2", text: "Choose quality level", color: "bg-slate-600" },
                    { num: "3", text: "Download compressed files", color: "bg-slate-800" },
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
