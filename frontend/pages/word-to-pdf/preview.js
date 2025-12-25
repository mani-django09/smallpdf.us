import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import { FileText, ArrowLeft, CheckCircle2, Sparkles, Shield, Zap, Clock, Play } from "lucide-react"

export default function PreviewWordToPDF() {
  const router = useRouter()
  const [fileData, setFileData] = useState(null)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")

  useEffect(() => {
    const storedFile = sessionStorage.getItem("uploadedFile")
    
    if (storedFile) {
      try {
        const parsed = JSON.parse(storedFile)
        setFileData(parsed)
      } catch (err) {
        console.error("Error parsing file data:", err)
        router.push("/word-to-pdf")
      }
    } else {
      router.push("/word-to-pdf")
    }
  }, [router])

  const handleConvert = async () => {
    if (!fileData) return

    setConverting(true)
    setProgress(0)
    setStage("Uploading...")

    const stages = [
      { progress: 20, text: "Uploading...", delay: 300 },
      { progress: 40, text: "Processing...", delay: 400 },
      { progress: 60, text: "Converting...", delay: 500 },
      { progress: 80, text: "Finalizing...", delay: 300 },
      { progress: 95, text: "Almost done...", delay: 200 }
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
      const response = await fetch(fileData.data)
      const blob = await response.blob()
      const file = new File([blob], fileData.name, { type: fileData.type })

      const formData = new FormData()
      formData.append("file", file)

      const convertResponse = await fetch("http://localhost:5011/api/word-to-pdf", {
        method: "POST",
        body: formData,
      })

      const result = await convertResponse.json()
      
      setProgress(100)
      setStage("Complete!")

      if (convertResponse.ok) {
        sessionStorage.setItem("conversionResult", JSON.stringify(result))
        setTimeout(() => {
          router.push(`/word-to-pdf/download?file=${encodeURIComponent(result.downloadUrl)}`)
        }, 500)
      } else {
        alert("Conversion failed: " + result.error)
        setConverting(false)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to convert file. Please try again.")
      setConverting(false)
    }
  }

  if (!fileData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 border-3 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-red-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Preview & Convert - Word to PDF"
      description="Preview your document and convert to PDF"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Compact Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 py-5">
          <button
            onClick={() => router.push("/word-to-pdf")}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change File</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white">
                Ready to Convert
              </h1>
              <p className="font-body text-xs text-white/80">Review and start conversion</p>
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
                {/* File Info Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-white truncate">{fileData.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{(fileData.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                        <span>{fileData.name.split('.').pop().toUpperCase()}</span>
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
                  {!converting ? (
                    <>
                      {/* Status Card */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 text-center border border-slate-200 mb-5">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm mb-3 border border-slate-200">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 mb-1">
                          Document Validated
                        </h3>
                        <p className="font-body text-sm text-slate-600">
                          Ready for conversion with formatting preserved
                        </p>
                      </div>

                      {/* Convert Button */}
                      <button
                        onClick={handleConvert}
                        className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3.5 px-6 rounded-xl font-display font-semibold text-sm hover:from-red-700 hover:to-rose-700 hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Start Conversion</span>
                      </button>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-slate-900">{(fileData.size / 1024).toFixed(0)}</div>
                          <div className="font-body text-xs text-slate-500">KB Size</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-display text-lg font-bold text-emerald-600">&lt;3s</div>
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
                          <div className="absolute inset-0 border-4 border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 mb-0.5">{stage}</p>
                        <p className="font-body text-sm text-slate-600">{progress}% Complete</p>
                      </div>

                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-gradient-to-r from-red-600 to-rose-600 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="font-body text-xs text-red-800 text-center">
                          Please wait while we convert your document...
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
                    { icon: Sparkles, text: "Perfect formatting", color: "text-violet-600 bg-violet-100" },
                    { icon: Shield, text: "Bank-level encryption", color: "text-emerald-600 bg-emerald-100" },
                    { icon: Zap, text: "Lightning-fast processing", color: "text-amber-600 bg-amber-100" },
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
                    { num: "1", text: "Upload & validate", color: "bg-red-600" },
                    { num: "2", text: "Convert to PDF", color: "bg-rose-600" },
                    { num: "3", text: "Download instantly", color: "bg-emerald-600" }
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