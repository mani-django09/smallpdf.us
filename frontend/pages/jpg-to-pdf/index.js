"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import SEOHead from "../../components/SEOHead"
import { Upload, FileText, AlertCircle, CheckCircle2, Zap, Shield, ChevronDown, Image } from "lucide-react"

export default function JpgToPdf() {
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
    const validTypes = ["image/jpeg", "image/jpg"]
    const maxSize = 50 * 1024 * 1024

    const ext = file.name.toLowerCase()
    const hasValidExtension = ext.endsWith('.jpg') || ext.endsWith('.jpeg')
    const hasValidMimeType = validTypes.includes(file.type)

    if (!hasValidExtension && !hasValidMimeType) {
      return { valid: false, error: "Please select JPG or JPEG image files only" }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "Image files must be smaller than 50MB" }
    }

    return { valid: true }
  }

  const processFiles = async (newFiles) => {
    if (newFiles.length === 0) {
      setError("Please select at least one JPG file")
      return
    }

    if (newFiles.length > 20) {
      setError("You can convert up to 20 images at once")
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

        sessionStorage.setItem("uploadedJpgFiles", JSON.stringify(fileDataArray))

        setTimeout(() => {
          router.push("/jpg-to-pdf/preview")
        }, 600)
      } catch (err) {
        console.error("Error processing files:", err)
        setError("Something went wrong processing your images. Please try again.")
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
      question: "How do I turn JPG images into a PDF?",
      answer:
        "Just upload your JPG files - you can select multiple at once. We'll take you to a preview screen where you can arrange them however you want. Then click convert and you're done. Your PDF is ready to download in seconds.",
    },
    {
      question: "Will my photos look worse in the PDF?",
      answer:
        "Nope, they'll look exactly the same. We embed your original images directly into the PDF without shrinking or compressing them. Every pixel stays perfect. What you upload is what you get.",
    },
    {
      question: "Can I combine multiple photos into one PDF?",
      answer:
        "Absolutely! Upload as many as 20 JPG images at once. We'll put them all in one PDF file in whatever order you choose. Great for making photo albums, reports, or portfolios.",
    },
    {
      question: "What's the biggest image I can convert?",
      answer:
        "Each JPG can be up to 50MB, which is plenty for even high-resolution photos straight from a professional camera. And you can convert multiple large files at the same time.",
    },
    {
      question: "Is it safe to upload my photos here?",
      answer:
        "Yes, totally safe. Everything gets encrypted the moment you upload it. We process your images on secure servers and delete them automatically after one hour. We never look at them, never save them, never share them.",
    },
  ]

  // Custom structured data for jpg-to-pdf page
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "JPG to PDF Converter - SmallPDF.us",
        "url": "https://smallpdf.us/jpg-to-pdf",
        "description": "Convert JPG images to PDF documents online for free with batch processing",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "24567",
        },
        "featureList": [
          "Convert up to 20 JPG images",
          "Merge multiple images into one PDF",
          "Original quality preservation",
          "Drag and drop interface",
          "Batch processing support",
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
        "name": "How to Convert JPG to PDF",
        "description": "Step-by-step guide to converting JPG images to PDF documents",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Upload JPG Images",
            "text": "Select one or more JPG files from your device. You can upload up to 20 images at once, each up to 50MB in size.",
            "position": 1
          },
          {
            "@type": "HowToStep",
            "name": "Arrange Images",
            "text": "Drag and drop to arrange your images in the desired order. The PDF will contain pages in this sequence.",
            "position": 2
          },
          {
            "@type": "HowToStep",
            "name": "Convert and Download",
            "text": "Click the convert button and wait a few seconds. Download your PDF file with all images combined.",
            "position": 3
          }
        ]
      }
    ]
  }

  return (
    <>
      <SEOHead
        title="JPG to PDF Converter - Convert Images to PDF Online Free | SmallPDF.us"
        description="Convert JPG images to PDF documents online for free. Fast, secure JPG to PDF converter with batch processing. Merge multiple JPG files into one PDF. No registration required."
        canonical="https://smallpdf.us/jpg-to-pdf"
        ogImage="/og-jpg-to-pdf.jpg"
        structuredData={structuredData}
      />

      <Layout
        title="JPG to PDF - Convert JPG Images to PDF Documents"
        description="Convert JPG images to PDF documents instantly."
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
          .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
          .font-body { font-family: 'DM Sans', sans-serif; }
          @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -30px) scale(1.05); } 66% { transform: translate(-15px, 15px) scale(0.95); } }
          .animate-blob { animation: blob 8s ease-in-out infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          @keyframes loading-bar { 0% { width: 0%; } 50% { width: 70%; } 100% { width: 100%; } }
          .animate-loading-bar { animation: loading-bar 2s ease-in-out infinite; }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
          .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        `}</style>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 border-b border-blue-200">
          <div className="max-w-4xl mx-auto px-4 pt-4 pb-4 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              JPG to PDF converter
            </h1>

            <p className="font-body text-base text-slate-600 max-w-2xl mx-auto mb-2">
              Convert your photos into PDFs in seconds. Combine multiple images into one document with original quality preservation.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-blue-50 via-slate-100 to-blue-50 py-8 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-8 right-20 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              {isProcessing ? (
                <div className="py-10 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                    <Image className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Getting Your Images Ready</h3>
                  <p className="font-body text-sm text-slate-600">Loading your photos...</p>
                  <div className="mt-5 max-w-xs mx-auto">
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full animate-loading-bar"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative rounded-xl transition-all duration-300 ${
                      dragActive
                        ? "border-4 border-blue-500 bg-blue-50 scale-102 shadow-lg"
                        : "border-3 border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md"
                    }`}
                    style={{ borderWidth: dragActive ? "4px" : "3px" }}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".jpg,.jpeg,image/jpeg"
                      multiple
                      onChange={handleFileChange}
                    />

                    <div className="p-10 text-center">
                      <div className="mb-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
                          <Image className="w-8 h-8 text-white animate-bounce-slow" />
                        </div>
                      </div>

                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        {dragActive ? "Release to Upload!" : "Drop Your JPG Images Here"}
                      </h3>
                      <p className="font-body text-sm text-slate-500 mb-4">
                        Drag images into this area or click below to browse your device
                      </p>

                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Select JPG Files</span>
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>JPG/JPEG Only</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-slate-600" />
                          <span>Encrypted Transfer</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Quick Results</span>
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
                  Maximum <span className="font-bold text-blue-600">50MB</span> per file |{" "}
                  <span className="font-bold text-blue-600">20 files</span> maximum
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
                Why Use Our JPG to PDF Converter?
              </h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                Transform your photos into professional PDF documents with ease. Perfect for creating photo albums, presentations, and reports.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  title: "Combine Multiple Photos",
                  desc: "Upload up to 20 images at once and we'll merge them all in one PDF. Perfect for photo albums, presentations, or reports with lots of pictures.",
                },
                {
                  icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                  title: "Perfect Quality Preservation",
                  desc: "Your images stay exactly as they are - no fuzzy compression, no quality loss. We embed your original photos directly into the PDF without touching them.",
                },
                {
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                  title: "Lightning Fast Processing",
                  desc: "Convert your images in just a few seconds. Even if you're uploading lots of images. No waiting around.",
                },
                {
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                  title: "Complete Privacy Protection",
                  desc: "Everything gets encrypted during upload. We process your images on secure servers and delete them after one hour. We never look at your photos or save them permanently.",
                },
                {
                  icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
                  title: "Universal Device Support",
                  desc: "Use it on your phone, tablet, or computer. No app to download. Just open your browser and convert. Works on iPhone, Android, Windows, Mac - everything.",
                },
                {
                  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Completely Free Forever",
                  desc: "No tricks, no hidden fees, no premium plans. Convert as many images as you want, whenever you want. It's genuinely free forever.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* How It Works */}
        <div className="bg-gradient-to-b from-blue-50 to-white py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">
                Three Simple Steps to Create Your PDF
              </h2>
              <p className="font-body text-slate-600 max-w-2xl mx-auto">
                Turn your photos into a professional PDF document in less than a minute
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Upload Images",
                  desc: "Pick your JPG files. You can select multiple photos at once - up to 20 images.",
                  color: "bg-blue-600",
                },
                {
                  step: "2",
                  title: "Arrange Photos",
                  desc: "We'll show you all your images. Drag them around to put them in whatever order you want.",
                  color: "bg-blue-700",
                },
                {
                  step: "3",
                  title: "Download PDF",
                  desc: "Click convert and your PDF is ready instantly. Download it right away or save it for later.",
                  color: "bg-blue-800",
                },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 h-full">
                    <div
                      className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-4 shadow-xl`}
                    >
                      <span className="font-display text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="font-body text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">
                Common Questions About JPG to PDF Conversion
              </h2>
              <p className="font-body text-slate-600">
                Quick answers to help you convert your images to PDF
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-display font-semibold text-slate-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      openFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <div className="px-6 pb-4 pt-2">
                      <p className="font-body text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            ></div>
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Your PDF?
            </h2>
            <p className="font-body text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands who convert their JPG images to professional PDFs every day. No signup, no payment, no hassle.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Upload className="w-6 h-6" />
              <span>Start Converting Now</span>
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}