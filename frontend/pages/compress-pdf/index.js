"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import SEOHead from "../../components/SEOHead"
import { Upload, FileText, AlertCircle, CheckCircle2, Zap, Shield, ChevronDown, Minimize2 } from "lucide-react"

export default function CompressPdf() {
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

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      return { valid: false, error: "Please upload PDF files only" }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "Files must be smaller than 100MB" }
    }

    return { valid: true }
  }

  const processFiles = async (newFiles) => {
    if (newFiles.length === 0) {
      setError("Please select at least one PDF file")
      return
    }

    if (newFiles.length > 10) {
      setError("You can compress up to 10 files at once")
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

    if (!hasError && validFiles.length > 0) {
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

        sessionStorage.setItem("uploadedPdfFiles", JSON.stringify(fileDataArray))

        setTimeout(() => {
          router.push("/compress-pdf/preview")
        }, 600)
      } catch (err) {
        console.error("Error processing files:", err)
        setError("Something went wrong processing your files. Please try again.")
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
      question: "How much smaller will my PDF become?",
      answer:
        "It depends on what's in your PDF and which compression setting you pick. Files with lots of images usually shrink the most - sometimes by 70% or more. Text-heavy documents won't compress as dramatically, but you'll still see a decent size reduction. Our balanced setting gives you the best mix of quality and smaller file size.",
    },
    {
      question: "Will compression make my PDF look worse?",
      answer:
        "Not if you choose the right setting. Text always stays crystal clear no matter what. For images, our maximum quality mode keeps everything looking great. The balanced mode is perfect for most people - you won't notice any difference in quality. Only use extreme compression if you absolutely need the smallest possible file.",
    },
    {
      question: "Can I compress PDFs that are password protected?",
      answer:
        "Yes, you can compress password-protected PDFs, but you'll need to enter the password during compression. After we're done compressing it, your PDF keeps the same password protection it had before.",
    },
    {
      question: "What kind of PDFs compress the best?",
      answer:
        "PDFs with lots of photos, scanned documents, and graphics shrink the most dramatically. We can optimize those images really well. Text-only PDFs are already pretty efficient, so they won't get as much smaller, but we can still trim some fat. PDFs with embedded fonts and graphics fall somewhere in between.",
    },
    {
      question: "Is it safe to upload my documents here?",
      answer:
        "Absolutely. Everything gets encrypted the moment you upload it. We process your files in secure, isolated containers. Then we automatically delete everything within one hour. We never look at your files, never save them permanently, and never share them with anyone.",
    },
  ]

  // Custom structured data for compress-pdf page
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "PDF Compressor - SmallPDF.us",
        "url": "https://smallpdf.us/compress-pdf",
        "description": "Compress PDF files online for free with intelligent compression up to 80% size reduction",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "24891",
        },
        "featureList": [
          "Compress up to 10 PDF files",
          "Up to 80% size reduction",
          "Smart image optimization",
          "Batch processing",
          "No quality loss",
          "Free forever"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      },
      {
        "@type": "HowTo",
        "name": "How to Compress PDF Files",
        "description": "Step-by-step guide to reducing PDF file size online",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Upload PDF Files",
            "text": "Select one or more PDF files from your device. You can compress up to 10 files at once, each up to 100MB.",
            "position": 1
          },
          {
            "@type": "HowToStep",
            "name": "Choose Compression Level",
            "text": "Select maximum quality, balanced, or extreme compression based on your needs. Balanced is recommended for most users.",
            "position": 2
          },
          {
            "@type": "HowToStep",
            "name": "Download Compressed Files",
            "text": "Wait a few seconds for compression to complete. Download your smaller PDF files instantly.",
            "position": 3
          }
        ]
      }
    ]
  }

  return (
    <>
      <SEOHead
        title="Compress PDF Online Free - Reduce PDF File Size up to 80% | SmallPDF.us"
        description="Compress PDF files online for free. Reduce PDF file size by up to 80% without losing quality. Fast, secure PDF compressor with batch processing support. No registration required."
        canonical="https://smallpdf.us/compress-pdf"
        ogImage="/og-compress-pdf.jpg"
        structuredData={structuredData}
      />

      <Layout
        title="Compress PDF - Reduce PDF File Size"
        description="Compress PDF files online for free with up to 80% size reduction."
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
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 pt-4 pb-4 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Compress PDF Files <span className="text-rose-600">Online Free</span>
            </h1>

            <p className="font-body text-base text-slate-600 max-w-2xl mx-auto mb-2">
              Make your PDFs smaller without losing quality. Compress files by up to 80% in seconds with{" "}
              <strong>SmallPDF.us</strong>
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 py-8 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-8 right-20 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              {isProcessing ? (
                <div className="py-10 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-rose-600 border-r-rose-600 rounded-full animate-spin"></div>
                    <Minimize2 className="absolute inset-0 m-auto w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Getting Everything Ready</h3>
                  <p className="font-body text-sm text-slate-600">Preparing your files for compression...</p>
                  <div className="mt-5 max-w-xs mx-auto">
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-rose-600 h-full rounded-full animate-loading-bar"></div>
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
                        ? "border-4 border-rose-500 bg-rose-50 scale-102 shadow-lg"
                        : "border-3 border-dashed border-slate-300 hover:border-rose-400 hover:bg-slate-50 hover:shadow-md"
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
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-600 rounded-2xl mb-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
                          <Minimize2 className="w-8 h-8 text-white animate-bounce-slow" />
                        </div>
                      </div>

                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        {dragActive ? "Drop Your PDFs Here!" : "Select PDFs to Compress"}
                      </h3>
                      <p className="font-body text-sm text-slate-500 mb-4">
                        Drag and drop your files or click to browse
                      </p>

                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="inline-flex items-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Choose PDF Files</span>
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>PDF Only</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-slate-600" />
                          <span>Secure</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Up to 80% Smaller</span>
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
                  Up to <span className="font-bold text-rose-600">100MB</span> per file |{" "}
                  <span className="font-bold text-rose-600">10 files</span> maximum
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">
                Why People Choose Our PDF Compressor
              </h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                We've helped millions shrink their PDFs without compromising quality. Here's what makes us different.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Smart Image Optimization</h3>
                <p className="font-body text-slate-600 text-sm">
                  Our technology figures out the best way to compress each image in your PDF. Photos get optimized
                  differently than diagrams or screenshots, so you get maximum compression with minimum quality loss.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Really Fast</h3>
                <p className="font-body text-slate-600 text-sm">
                  Even huge files compress in just seconds. We've optimized every step of the process so you're not
                  sitting around waiting. Upload, compress, download - done.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Your Files Stay Private</h3>
                <p className="font-body text-slate-600 text-sm">
                  Everything gets encrypted during upload. We compress your files in secure containers and delete
                  everything automatically after one hour. Nobody can access your documents - not even us.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-50 py-12 px-4 border-y border-slate-200">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">How to Make Your PDFs Smaller</h2>
              <p className="font-body text-slate-600">Three simple steps to compress your documents</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-rose-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  1
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Pick Your Files</h3>
                <p className="font-body text-slate-600 text-sm">
                  Upload one PDF or several at once. You can compress up to 10 files in one go.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-rose-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  2
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Choose Your Setting</h3>
                <p className="font-body text-slate-600 text-sm">
                  Pick maximum quality, balanced, or extreme compression based on what you need.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-rose-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  3
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Download Smaller Files</h3>
                <p className="font-body text-slate-660 text-sm">
                  Get your compressed PDFs instantly. They'll work exactly like before, just much smaller.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Questions People Ask</h2>
              <p className="font-body text-slate-600">Quick answers about PDF compression</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-display font-semibold text-slate-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                      <p className="font-body text-slate-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="bg-slate-50 py-12 px-4 border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-slate max-w-none">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
                Why Compress Your PDF Files?
              </h2>
              <p className="font-body text-slate-700 mb-4">
                Big PDF files cause all kinds of headaches. They take forever to email, use up storage space, and slow
                down everything. Our free compressor fixes these problems by shrinking your files dramatically while
                keeping them looking good.
              </p>
              <p className="font-body text-slate-700 mb-4">
                We use smart technology that looks at each part of your PDF individually. Images get optimized
                differently than text. Repeated elements get deduplicated. Unnecessary data gets stripped out. The
                result? Much smaller files that work exactly the same as the originals.
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 mt-6">When You Should Compress</h3>
              <p className="font-body text-slate-700">
                Compress your PDFs before emailing them (most email servers have size limits), uploading to websites
                that restrict file sizes, storing large document collections, or sending files to people with slow
                internet. You'll save time, bandwidth, and storage space while making life easier for everyone who
                receives your files.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Compress Your PDFs?
            </h2>
            <p className="font-body text-lg text-rose-100 mb-8 max-w-2xl mx-auto">
              Join millions using SmallPDF.us to reduce file sizes. Fast, free, no signup needed.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-rose-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Minimize2 className="w-5 h-5" />
              <span>Start Compressing Now</span>
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}