"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  Star,
  ChevronDown,
  Layers,
} from "lucide-react"
import Head from "next/head"

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

export default function MergePDF() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const [openFaq, setOpenFaq] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file) => {
    const validTypes = ["application/pdf"]
    const maxSize = 100 * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Please select PDF files only" }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size must be under 100MB" }
    }

    return { valid: true }
  }

  const processFiles = async (newFiles) => {
    if (newFiles.length < 2) {
      setError("You need at least 2 PDF files to merge them together")
      return
    }

    if (newFiles.length > 20) {
      setError("You can merge up to 20 files at once")
      return
    }

    const validFiles = []
    let hasError = false

    for (const file of newFiles) {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push({
          file,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
        })
      } else {
        setError(validation.error)
        hasError = true
        break
      }
    }

    if (!hasError && validFiles.length >= 2) {
      setIsProcessing(true)
      setError("")

      try {
        const fileDataArray = await Promise.all(
          validFiles.map(async (f) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                resolve({
                  id: f.id,
                  name: f.name,
                  size: f.size,
                  type: f.file.type,
                  data: e.target.result,
                })
              }
              reader.onerror = reject
              reader.readAsDataURL(f.file)
            })
          }),
        )

        sessionStorage.setItem("uploadedPDFs", JSON.stringify(fileDataArray))

        setTimeout(() => {
          router.push("/merge-pdf/preview")
        }, 600)
      } catch (err) {
        console.error("Error processing files:", err)
        setError("Something went wrong while processing your files. Please try again.")
        setIsProcessing(false)
      }
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError("")

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileChange = (e) => {
    setError("")
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files))
    }
    e.target.value = ""
  }

  const handleButtonClick = () => {
    document.getElementById("file-upload").click()
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How many PDFs can I merge at once?",
      answer:
        "Up to 20 files in one go, and each file can be 100MB. Need to merge more? Just do it in batches - merge 20, then merge those results with another batch.",
    },
    {
      question: "Will the quality get worse when I combine them?",
      answer:
        "Nope. Everything stays exactly as it was. Text looks the same, images are still sharp, formatting doesn't change. We just stick the files together without messing with the content.",
    },
    {
      question: "Can I change the order before merging?",
      answer:
        "Yeah, after you upload, you'll see all your files. Just drag them around to put them in whatever order you want. The final PDF will match that order.",
    },
    {
      question: "Is this safe to use with private documents?",
      answer:
        "Everything's encrypted when you upload. We process files on secure servers and delete both your originals and the merged file after an hour. Nobody can see your documents.",
    },
    {
      question: "Do I need to install anything?",
      answer:
        "No. Works right in your browser on any device. Phone, tablet, laptop, whatever. No downloads, no apps, no software.",
    },
  ]

  return (
    <>
      <Head>
        <title>Merge PDF Files Online Free - Combine Multiple PDFs | SmallPDF.us</title>
        <meta
          name="description"
          content="Merge PDF files online for free. Combine multiple PDF documents into one file instantly. Easy drag-and-drop interface, secure processing, no registration needed."
        />
        <meta
          name="keywords"
          content="merge pdf, combine pdf, pdf merger, join pdf files, merge pdf online free, combine multiple pdfs, pdf combiner tool, merge pdf documents"
        />
        <link rel="canonical" href="https://smallpdf.us/merge-pdf" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smallpdf.us/merge-pdf" />
        <meta property="og:title" content="Merge PDF Files Online Free - Combine Multiple PDFs | SmallPDF.us" />
        <meta
          property="og:description"
          content="Combine multiple PDF documents into one file instantly. Easy, secure, and completely free."
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PDF Merger - SmallPDF.us",
              url: "https://smallpdf.us/merge-pdf",
              description: "Merge and combine multiple PDF files into one document online for free",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "26341",
              },
            }),
          }}
        />
      </Head>

      <Layout
        title="Merge PDF - Combine PDF Files Online"
        description="Combine multiple PDF documents into one file in seconds."
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
          .font-display {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
          .font-body {
            font-family: 'DM Sans', sans-serif;
          }
          @keyframes blob {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(20px, -30px) scale(1.05);
            }
            66% {
              transform: translate(-15px, 15px) scale(0.95);
            }
          }
          .animate-blob {
            animation: blob 8s ease-in-out infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          @keyframes loading-bar {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 100%;
            }
          }
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out infinite;
          }
          @keyframes bounce-slow {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-4px);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
        `}</style>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="max-w-4xl mx-auto px-4 pt-4 pb-4 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Merge PDF Files <span className="text-blue-600">Online Free</span>
            </h1>

            <p className="font-body text-base text-slate-600 max-w-2xl mx-auto mb-2">
              Combine multiple PDF documents into one file. Fast, easy, and completely free on{" "}
              <strong>SmallPDF.us</strong>
            </p>
          </div>
        </div>

        {/* Top Banner Ad - 728x90 */}
        <div className="bg-white py-4 px-4 border-b border-slate-200">
          <div className="max-w-4xl mx-auto">
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

        {/* Upload Section with Sidebar Ads */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 py-8 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-8 right-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

              {/* Main Upload Area */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-6">
                  {isProcessing ? (
                    <div className="py-10 text-center">
                      <div className="relative w-16 h-16 mx-auto mb-5">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                        <Layers className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Loading Your Files</h3>
                      <p className="font-body text-sm text-slate-600">Getting everything ready...</p>
                      <div className="mt-5 max-w-xs mx-auto">
                        <div className="bg-blue-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full animate-loading-bar"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Upload Area */}
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative rounded-xl transition-all duration-300 ${
                          dragActive
                            ? "border-4 border-blue-500 bg-blue-50 scale-102 shadow-lg"
                            : "border-3 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
                        }`}
                        style={{ borderWidth: dragActive ? "4px" : "3px" }}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,application/pdf"
                          multiple
                          onChange={handleFileChange}
                        />

                        <div className="p-10 text-center">
                          <div className="mb-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
                              <Layers className="w-8 h-8 text-white animate-bounce-slow" />
                            </div>
                          </div>

                          <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                            {dragActive ? "Drop Your PDFs Here!" : "Select PDF Files to Merge"}
                          </h3>
                          <p className="font-body text-sm text-slate-500 mb-4">
                            Drag and drop your files or click to browse
                          </p>

                          <button
                            type="button"
                            onClick={handleButtonClick}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Upload className="w-5 h-5" />
                            <span>Choose PDFs</span>
                          </button>

                          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>PDF Format</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            <div className="flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5 text-slate-600" />
                              <span>Secure</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Instant</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="font-body text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  {!isProcessing && (
                    <p className="text-center font-body text-sm text-slate-600 mt-5">
                      Up to <span className="font-bold text-blue-600">100MB</span> per file |{" "}
                      <span className="font-bold text-blue-600">20 files</span> maximum
                    </p>
                  )}
                </div>
              </div>

              {/* Right Sidebar Ad - Desktop Only */}
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
            </div>

            {/* Mobile Ad - Below Upload Section */}
            <div className="lg:hidden mt-6">
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
        </div>

        {/* Features Section */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Why Use Our PDF Merger</h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                Combining PDFs shouldn't be complicated. We made it as simple as possible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                  title: "Dead Simple to Use",
                  desc: "Upload your PDFs, drag them into the order you want, click merge. That's it. No complicated settings or confusing options to figure out.",
                },
                {
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                  title: "Nothing Gets Lost",
                  desc: "Text stays sharp, images stay clear, links keep working, formatting stays perfect. We combine the files without touching the quality of anything inside them.",
                },
                {
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                  title: "Happens Fast",
                  desc: "Even if you're merging 20 big files, it only takes a few seconds. Upload, arrange, merge, download. The whole thing's done before you finish your coffee.",
                },
                {
                  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                  title: "Your Files Stay Private",
                  desc: "Everything's encrypted in transit. We process on secure servers and delete your files after an hour. Nobody can access your documents except you.",
                },
                {
                  icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
                  title: "Works on Everything",
                  desc: "Phone, tablet, laptop, desktop. Windows, Mac, Android, iPhone. If you've got a browser, you can merge PDFs. No app needed.",
                },
                {
                  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                  title: "Actually Free",
                  desc: "No trial that expires, no premium features locked away, no hidden charges. This is the whole tool, completely free, forever.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="font-body text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* In-Content Ad - Between Sections */}
        <div className="bg-slate-50 py-6 px-4">
          <div className="max-w-4xl mx-auto">
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

        {/* How It Works */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Three Quick Steps</h2>
              <p className="font-body text-slate-600">Merge your PDFs in under a minute</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload Files",
                  desc: "Select at least 2 PDF files. You can grab them all at once or add them one by one.",
                  color: "bg-blue-600",
                },
                {
                  step: "2",
                  title: "Arrange Order",
                  desc: "Drag the files around to put them in whatever order you want. The merged PDF will match this sequence.",
                  color: "bg-indigo-600",
                },
                {
                  step: "3",
                  title: "Merge & Download",
                  desc: "Hit the merge button, wait a couple seconds, then download your combined PDF. Done.",
                  color: "bg-blue-700",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 h-full">
                    <div
                      className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-white font-display text-2xl font-bold mb-4 shadow-lg`}
                    >
                      {item.step}
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="font-body text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">When You Need to Merge PDFs</h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                Instead of sending five separate files, send one. People love it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Work Stuff</h3>
                <ul className="space-y-3 font-body text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Combine invoices from the whole month into one file</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Send complete proposals with all the supporting documents attached</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Put together training manuals from separate sections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Bundle contracts and agreements with their amendments</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Personal Use</h3>
                <ul className="space-y-3 font-body text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Submit job applications with resume, cover letter, and references together</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Keep all your tax documents and receipts in one organized file</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Combine travel confirmations and tickets for your trip</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Put together study materials and notes for easier reference</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-blue-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Common Questions</h2>
              <p className="font-body text-slate-600">Quick answers about merging PDFs</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
                  >
                    <h3 className="font-display text-base font-semibold text-slate-900 pr-4">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="font-body text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="bg-white py-12 px-4 border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-slate max-w-none">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">Why Merge PDFs Together</h2>
              <p className="font-body text-slate-700 mb-4">
                Multiple PDF files are annoying to deal with. You've got to send them all separately, keep track of which one is which, and hope the person on the other end opens them in the right order. One merged file solves all that.
              </p>
              <p className="font-body text-slate-700 mb-4">
                Think about sending a project proposal. Without merging, you're attaching the main proposal, then the budget spreadsheet as PDF, then the timeline, then maybe some references. That's four files minimum. With merging? One file. Everything's in order, nothing gets lost, looks way more professional.
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 mt-6">Who Uses This</h3>
              <p className="font-body text-slate-700">
                Office workers combine monthly reports. Students merge research papers with citations. Freelancers bundle invoices with contracts. Real estate agents put together listing documents. Lawyers assemble case files. Anyone who deals with multiple PDFs regularly ends up needing to merge them at some point.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Ad - Before CTA */}
        <div className="bg-slate-50 py-6 px-4">
          <div className="max-w-4xl mx-auto">
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

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Merge Your PDFs?</h2>
            <p className="font-body text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands using SmallPDF.us every day. Fast, free, no signup needed.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Layers className="w-5 h-5" />
              <span>Start Merging Now</span>
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}