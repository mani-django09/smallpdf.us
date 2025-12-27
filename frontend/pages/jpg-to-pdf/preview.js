"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { FileText, ArrowLeft, Sparkles, Shield, Zap, Clock, Play, Trash2, CheckCircle } from "lucide-react"

export default function PreviewJpgToPdf() {
  const router = useRouter()
  const [filesData, setFilesData] = useState([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])

  useEffect(() => {
    const storedFiles = sessionStorage.getItem("uploadedJpgFiles")

    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles)
        setFilesData(parsed)
        setSelectedFiles(parsed.map((f) => f.id))
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/jpg-to-pdf")
      }
    } else {
      router.push("/jpg-to-pdf")
    }
  }, [router])

  const toggleFileSelection = (id) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]))
  }

  const removeFile = (id) => {
    const newFiles = filesData.filter((f) => f.id !== id)
    setFilesData(newFiles)
    setSelectedFiles((prev) => prev.filter((fid) => fid !== id))
    sessionStorage.setItem("uploadedJpgFiles", JSON.stringify(newFiles))

    if (newFiles.length === 0) {
      router.push("/jpg-to-pdf")
    }
  }

  const handleConvert = async () => {
  const filesToConvert = filesData.filter((f) => selectedFiles.includes(f.id))
  if (filesToConvert.length === 0) return

  setConverting(true)
  setProgress(0)
  setStage("Preparing images...")

  const stages = [
    { progress: 15, text: "Converting to JPEG...", delay: 400 },
    { progress: 35, text: "Uploading files...", delay: 500 },
    { progress: 55, text: "Creating PDF document...", delay: 600 },
    { progress: 75, text: "Embedding images...", delay: 400 },
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

    for (const fileData of filesToConvert) {
      try {
        // Load image into canvas and convert to JPEG
        const img = new Image()
        img.src = fileData.data
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        // Create canvas
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'white' // Fill with white background for JPEG
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        // Convert to JPEG blob
        const jpegBlob = await new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.95)
        })
        
        // Create proper JPEG file
        const baseName = fileData.name.replace(/\.(jpg|jpeg|png|webp)$/i, '')
        const filename = baseName + '.jpg'
        
        const file = new File([jpegBlob], filename, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        })
        
        console.log('Created JPEG file:', filename, 'Type:', file.type, 'Size:', file.size)
        formData.append("files", file)
        
      } catch (fileError) {
        console.error(`Error processing file ${fileData.name}:`, fileError)
      }
    }

    console.log('Sending request to backend...')
    
    const convertResponse = await fetch("https://smallpdf.us/api/jpg-to-pdf", {
      method: "POST",
      body: formData,
    })

    console.log('Response status:', convertResponse.status)
    const result = await convertResponse.json()
    console.log('Response data:', result)

    setProgress(100)
    setStage("Complete!")

    if (convertResponse.ok) {
      sessionStorage.setItem(
        "jpgConvertResult",
        JSON.stringify({
          ...result,
          fileCount: filesToConvert.length,
          totalSize: filesToConvert.reduce((acc, f) => acc + f.size, 0),
        }),
      )
      setTimeout(() => {
        router.push(`/jpg-to-pdf/download?jobId=${result.jobId}`)
      }, 500)
    } else {
      console.error("Conversion failed:", result)
      alert("Conversion failed: " + (result.error || "Unknown error"))
      setConverting(false)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("Failed to convert files: " + error.message)
    setConverting(false)
  }
}
  const totalSize = filesData.reduce((acc, f) => acc + f.size, 0)
  const selectedCount = selectedFiles.length

  if (filesData.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Preview & Convert - JPG to PDF" description="Review your JPG files and convert them to PDF">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap');
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="bg-orange-600 relative overflow-hidden">
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
            onClick={() => router.push("/jpg-to-pdf")}
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
                Ready to Convert {filesData.length} JPG Image{filesData.length > 1 ? "s" : ""}
              </h1>
              <p className="font-body text-xs text-white/80">Select images and create PDF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-orange-50 min-h-screen py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
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
                    <div className="flex items-center gap-1.5 bg-orange-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      <span className="text-xs font-medium text-orange-300">Ready</span>
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
                          <h3 className="font-display text-sm font-semibold text-slate-900">Your JPG Images</h3>
                          <button
                            onClick={() =>
                              setSelectedFiles(
                                selectedFiles.length === filesData.length ? [] : filesData.map((f) => f.id),
                              )
                            }
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
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
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
                              }`}
                            >
                              <div className="p-2">
                                <div className="aspect-square bg-orange-100 rounded-lg overflow-hidden mb-2 relative">
                                  <img
                                    src={f.data || "/placeholder.svg"}
                                    alt={f.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {selectedFiles.includes(f.id) && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
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
                        className="w-full bg-orange-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:bg-orange-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        <span>
                          Convert {selectedCount} Image{selectedCount !== 1 ? "s" : ""} to PDF
                        </span>
                      </button>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="font-display text-lg font-bold text-slate-900">{selectedCount}</div>
                          <div className="font-body text-xs text-slate-500">Selected</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="font-display text-lg font-bold text-orange-600">&lt;5s</div>
                          <div className="font-body text-xs text-slate-500">Est. Time</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="font-display text-lg font-bold text-slate-900">1 PDF</div>
                          <div className="font-body text-xs text-slate-500">Output</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6">
                      <div className="text-center mb-5">
                        <div className="relative w-14 h-14 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-orange-600 border-r-orange-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-orange-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-orange-600 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="font-body text-xs text-orange-800 text-center">
                          Converting {selectedCount} JPG image{selectedCount !== 1 ? "s" : ""} to PDF...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "Professional PDF", color: "text-orange-600 bg-orange-100" },
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

              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Conversion Steps</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload JPG files", color: "bg-orange-600" },
                    { num: "2", text: "Select & convert", color: "bg-amber-600" },
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

              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <div className="bg-orange-50 rounded-lg border border-orange-200 flex items-center justify-center aspect-[4/3]">
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
