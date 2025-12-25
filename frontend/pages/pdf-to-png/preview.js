"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { ArrowLeft, Sparkles, Shield, Zap, Clock, ImageIcon, Check, Download } from "lucide-react"

export default function PreviewPDFtoPNG() {
  const router = useRouter()
  const [conversionResult, setConversionResult] = useState(null)
  const [pages, setPages] = useState([])
  const [selectedPages, setSelectedPages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedResult = sessionStorage.getItem("pdfToPngResult")

    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult)
        setConversionResult(parsed)

        // Create page list from the conversion result
        const pageList = Array.from({ length: parsed.pageCount }, (_, i) => ({
          id: i + 1,
          url: parsed.files ? parsed.files[i] : null,
          selected: true,
        }))
        setPages(pageList)
        setSelectedPages(pageList.map((p) => p.id))
      } catch (err) {
        console.error("Error parsing conversion result:", err)
        router.push("/pdf-to-png")
      }
    } else {
      router.push("/pdf-to-png")
    }
  }, [router])

  const togglePage = (pageId) => {
    setSelectedPages((prev) => (prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]))
  }

  const selectAll = () => setSelectedPages(pages.map((p) => p.id))
  const deselectAll = () => setSelectedPages([])

  const handleDownload = async () => {
    if (selectedPages.length === 0) return

    setProcessing(true)
    setProgress(0)
    setStage("Preparing images...")

    const stages = [
      { progress: 20, text: "Selecting pages...", delay: 300 },
      { progress: 45, text: "Preparing PNG files...", delay: 400 },
      { progress: 70, text: "Creating archive...", delay: 500 },
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
      // Store download info
      sessionStorage.setItem(
        "pdfToPngDownload",
        JSON.stringify({
          ...conversionResult,
          selectedPages: selectedPages,
          totalSelected: selectedPages.length,
        }),
      )

      setProgress(100)
      setStage("Complete!")

      setTimeout(() => {
        router.push(`/pdf-to-png/download?jobId=${conversionResult.jobId}`)
      }, 500)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to prepare download. Please try again.")
      setProcessing(false)
    }
  }

  if (!conversionResult) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-blue-200 rounded-full"></div>
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
      title="Preview PNG Images - PDF to PNG Converter"
      description="Preview and download your converted PNG images"
    >
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
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
            onClick={() => router.push("/pdf-to-png")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Convert Another PDF</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                {conversionResult.pageCount} PNG Images Ready
              </h1>
              <p className="font-body text-xs text-white/80">{conversionResult.originalName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-blue-50 min-h-screen py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Main Card */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-white">
                          {selectedPages.length} of {pages.length} Pages Selected
                        </p>
                        <p className="text-xs text-blue-200 mt-0.5">Click images to select/deselect</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAll}
                        className="text-xs font-medium text-blue-200 hover:text-white transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-blue-400">|</span>
                      <button
                        onClick={deselectAll}
                        className="text-xs font-medium text-blue-300 hover:text-white transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {!processing ? (
                    <>
                      {/* Page Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-5">
                        {pages.map((page) => (
                          <div
                            key={page.id}
                            onClick={() => togglePage(page.id)}
                            className={`relative bg-blue-50 rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg group ${
                              selectedPages.includes(page.id)
                                ? "border-blue-500 ring-2 ring-blue-100"
                                : "border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {/* Preview */}
                            <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                  <ImageIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-500">PNG</span>
                              </div>
                            </div>

                            {/* Selection Indicator */}
                            <div
                              className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                selectedPages.includes(page.id)
                                  ? "bg-blue-600 shadow-lg"
                                  : "bg-white border-2 border-slate-300"
                              }`}
                            >
                              {selectedPages.includes(page.id) && <Check className="w-4 h-4 text-white" />}
                            </div>

                            {/* Page Number */}
                            <div className="p-2 bg-white border-t border-slate-100 text-center">
                              <span className="text-sm font-semibold text-slate-700">Page {page.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        disabled={selectedPages.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        <span>
                          Download {selectedPages.length} PNG Image
                          {selectedPages.length !== 1 ? "s" : ""}
                        </span>
                      </button>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="font-display text-lg font-bold text-slate-900">{pages.length}</div>
                          <div className="font-body text-xs text-slate-500">Total Pages</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="font-display text-lg font-bold text-blue-600">{selectedPages.length}</div>
                          <div className="font-body text-xs text-slate-500">Selected</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="font-display text-lg font-bold text-slate-900">150</div>
                          <div className="font-body text-xs text-slate-500">DPI</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6">
                      <div className="text-center mb-5">
                        <div className="relative w-14 h-14 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-blue-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="font-body text-xs text-blue-800 text-center">
                          Preparing {selectedPages.length} PNG images for download...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">What You Get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: "High-quality 150 DPI", color: "text-blue-600 bg-blue-100" },
                    { icon: Shield, text: "Secure processing", color: "text-emerald-600 bg-emerald-100" },
                    { icon: Zap, text: "Instant download", color: "text-amber-600 bg-amber-100" },
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

              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Conversion Process</h3>
                <div className="space-y-2">
                  {[
                    { num: "1", text: "Upload PDF", color: "bg-blue-600" },
                    { num: "2", text: "Select pages", color: "bg-indigo-600" },
                    { num: "3", text: "Download PNGs", color: "bg-blue-700" },
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

              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                <p className="font-body text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Advertisement
                </p>
                <div className="bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center aspect-[4/3]">
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