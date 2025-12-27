"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { FileImage, ArrowLeft, Sparkles, Shield, Zap, Clock, Play, Trash2, CheckCircle } from "lucide-react"

export default function PreviewWebpToPng() {
  const router = useRouter()
  const [filesData, setFilesData] = useState([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])

  useEffect(() => {
    const storedFiles = sessionStorage.getItem("uploadedWebpFiles")

    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles)
        setFilesData(parsed)
        setSelectedFiles(parsed.map((f) => f.id))
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/webp-to-png")
      }
    } else {
      router.push("/webp-to-png")
    }
  }, [router])

  const toggleFileSelection = (id) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]))
  }

  const removeFile = (id) => {
    const newFiles = filesData.filter((f) => f.id !== id)
    setFilesData(newFiles)
    setSelectedFiles((prev) => prev.filter((fid) => fid !== id))
    sessionStorage.setItem("uploadedWebpFiles", JSON.stringify(newFiles))

    if (newFiles.length === 0) {
      router.push("/webp-to-png")
    }
  }

  const handleConvert = async () => {
    console.log('🔍 API URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('🔍 Full endpoint:', `${process.env.NEXT_PUBLIC_API_URL}/api/webp-to-png`)
    const filesToConvert = filesData.filter((f) => selectedFiles.includes(f.id))
    if (filesToConvert.length === 0) return

    setConverting(true)
    setProgress(0)
    setStage("Preparing images...")

    const stages = [
      { progress: 15, text: "Uploading images...", delay: 400 },
      { progress: 35, text: "Processing WEBP files...", delay: 500 },
      { progress: 55, text: "Converting to PNG...", delay: 600 },
      { progress: 75, text: "Optimizing output...", delay: 400 },
      { progress: 90, text: "Finalizing...", delay: 300 },
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
        const file = new File([blob], fileData.name, { type: fileData.type || "image/webp" })
        formData.append("files", file)
      }

      const convertResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webp-to-png`, {
        method: "POST",
        body: formData,
      })

      const result = await convertResponse.json()

      setProgress(100)
      setStage("Complete!")

      if (convertResponse.ok) {
        sessionStorage.setItem(
          "webpConvertResult",
          JSON.stringify({
            ...result,
            fileCount: filesToConvert.length,
            totalSize: filesToConvert.reduce((acc, f) => acc + f.size, 0),
          }),
        )
        setTimeout(() => {
          router.push(`/webp-to-png/download?jobId=${result.jobId}`)
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
  const selectedCount = selectedFiles.length

  if (filesData.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-teal-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-teal-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Preview & Convert - WEBP to PNG" description="Review your WEBP files and convert them to PNG">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-display {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .font-body {
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 relative overflow-hidden">
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
            onClick={() => router.push("/webp-to-png")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Files</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FileImage className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Ready to Convert {filesData.length} WEBP Image{filesData.length > 1 ? "s" : ""}
              </h1>
              <p className="font-body text-xs text-white/80">Select images and start conversion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-teal-50 min-h-screen py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-teal-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileImage className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-white">
                          {selectedCount} of {filesData.length} Selected
                        </p>
                        <p className="text-xs text-teal-200 mt-0.5">
                          Total: {(totalSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
                      <span className="text-xs font-medium text-emerald-200">Ready</span>
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
                          <h3 className="font-display text-sm font-semibold text-slate-900">Your WEBP Images</h3>
                          <button
                            onClick={() =>
                              setSelectedFiles(
                                selectedFiles.length === filesData.length ? [] : filesData.map((f) => f.id),
                              )
                            }
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
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
                                  ? "border-teal-500 bg-teal-50"
                                  : "border-slate-200 bg-slate-50 hover:border-teal-300"
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
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
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

                      {/* Convert Button */}
                      <button
                        onClick={handleConvert}
                        disabled={selectedCount === 0}
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:from-teal-700 hover:to-emerald-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        <span>
                          Convert {selectedCount} Image{selectedCount !== 1 ? "s" : ""} to PNG
                        </span>
                      </button>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-100">
                          <div className="font-display text-lg font-bold text-slate-900">{selectedCount}</div>
                          <div className="font-body text-xs text-slate-500">Selected</div>
                        </div>
                        <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-100">
                          <div className="font-display text-lg font-bold text-teal-600">&lt;3s</div>
                          <div className="font-body text-xs text-slate-500">Est. Time</div>
                        </div>
                        <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-100">
                          <div className="font-display text-lg font-bold text-slate-900">100%</div>
                          <div className="font-body text-xs text-slate-500">Quality</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6">
                      <div className="text-center mb-5">
                        <div className="relative w-14 h-14 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-teal-600 border-r-teal-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-teal-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <p className="font-body text-xs text-teal-800 text-center">
                          Converting {selectedCount} WEBP image{selectedCount !== 1 ? "s" : ""} to PNG...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "Lossless PNG quality", color: "text-teal-600 bg-teal-100" },
                    { icon: Shield, text: "Secure processing", color: "text-slate-600 bg-slate-100" },
                    { icon: Zap, text: "Instant conversion", color: "text-amber-600 bg-amber-100" },
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

              <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Conversion Steps</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload WEBP files", color: "bg-teal-600" },
                    { num: "2", text: "Select & preview", color: "bg-emerald-600" },
                    { num: "3", text: "Download PNG files", color: "bg-teal-700" },
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

              <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-200">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <div className="bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-center aspect-[4/3]">
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