"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import { Upload, FileText, AlertCircle, CheckCircle2, Zap, Shield, Star, ChevronDown, Sparkles, Home } from "lucide-react"
import Head from "next/head"

export default function WordToPDF() {
  const router = useRouter()
  const [file, setFile] = useState(null)
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
    const validTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    const maxSize = 100 * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid Word document (.doc or .docx)")
      return false
    }

    if (file.size > maxSize) {
      setError("File size must be less than 100MB")
      return false
    }

    return true
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError("")

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        handleContinue(droppedFile)
      }
    }
  }, [])

  const handleFileChange = (e) => {
    setError("")
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        handleContinue(selectedFile)
      }
    }
  }

  const handleButtonClick = () => {
    document.getElementById('file-upload').click()
  }

  const handleContinue = (fileToConvert) => {
    if (!fileToConvert) return
    
    setFile(fileToConvert)
    setIsProcessing(true)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const fileData = {
          name: fileToConvert.name,
          size: fileToConvert.size,
          type: fileToConvert.type,
          lastModified: fileToConvert.lastModified,
          data: e.target.result
        }
        sessionStorage.setItem("uploadedFile", JSON.stringify(fileData))
        
        setTimeout(() => {
          router.push("/word-to-pdf/preview")
        }, 800)
      } catch (err) {
        console.error("Error storing file:", err)
        setError("Failed to process file. Please try again.")
        setIsProcessing(false)
        setFile(null)
      }
    }
    reader.onerror = () => {
      setError("Failed to read file. Please try again.")
      setIsProcessing(false)
      setFile(null)
    }
    reader.readAsDataURL(fileToConvert)
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "Will my Word formatting stay exactly the same in the PDF?",
      answer: "Yes, everything stays just as you made it - spacing, fonts, colors, tables, even headers and page numbers. The same formatting, just in a PDF format. Your PDF will look identical to what you see in Word."
    },
    {
      question: "What if my Word document has a password on it?",
      answer: "You'll need to remove that password first. Just open your document in Word, go to File > Info > Protect Document > Encrypt with Password, then delete the password. After that you'll be able to upload and use it. We cannot ask for passwords for security reasons."
    },
    {
      question: "Is there really a difference between converting DOC vs DOCX files?",
      answer: "DOCX files convert more reliably because Microsoft made them newer. They handle images, fonts, and fancy formatting more cleanly. DOC files work fine too, but if you have the choice, go DOCX. Your Word should be able to save old files as DOCX through Save As."
    },
    {
      question: "How big can my Word document be?",
      answer: "Up to 100MB. You can convert pretty large documents full of images without problems. If your file is bigger, try compressing images inside Word by right-clicking on them and selecting compress, or split the document into smaller parts."
    },
    {
      question: "How do I know my document is safe during conversion?",
      answer: "Your files are encrypted during transfer and automatically deleted after 1 hour. No one can access your content. We use HTTPS encryption and never store files permanently on our servers."
    },
  ]

  return (
    <>
      <Head>
        <title>Word to PDF Converter - Transform Word Docs into PDF Format | SmallPDF.us</title>
        <meta
          name="description"
          content="Convert Word documents to professional PDF files instantly. Preserve formatting, fonts, and images perfectly. Free, secure, and no registration required."
        />
        <meta
          name="keywords"
          content="word to pdf, convert word to pdf, docx to pdf, doc to pdf, word converter, pdf converter, free converter"
        />
        <link rel="canonical" href="https://smallpdf.us/word-to-pdf" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smallpdf.us/word-to-pdf" />
        <meta property="og:title" content="Word to PDF Converter - Transform Word Docs into PDF Format" />
        <meta
          property="og:description"
          content="Convert Word files to PDF format while keeping your original formatting intact. Fast, secure, and completely free."
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Word to PDF Converter - SmallPDF.us",
              url: "https://smallpdf.us/word-to-pdf",
              description: "Convert Word documents to PDF format online for free with perfect formatting preservation",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.5",
                ratingCount: "30892"
              }
            })
          }}
        />
      </Head>

      <Layout
        title="Word to PDF - Transform Word Documents into PDF Format"
        description="Convert Word documents to PDF files while preserving formatting."
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
              Convert Word to PDF online
            </h1>

            <p className="font-body text-base text-slate-600 max-w-2xl mx-auto mb-2">
              Convert your Word files to PDF format instantly. Perfect formatting preservation, cross-platform compatibility, and professional results every time.
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
                    <FileText className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Processing Your Document</h3>
                  <p className="font-body text-sm text-slate-600">
                    Converting your Word file to PDF format...
                  </p>
                  <div className="mt-5 max-w-xs mx-auto">
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
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
                        : "border-3 border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md"
                    }`}
                    style={{ borderWidth: dragActive ? "4px" : "3px" }}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />

                    <div className="p-10 text-center">
                      <div className="mb-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
                          <FileText className="w-8 h-8 text-white animate-bounce-slow" />
                        </div>
                      </div>

                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        {dragActive ? "Release to Upload!" : "Drop Your Word Files Here"}
                      </h3>
                      <p className="font-body text-sm text-slate-500 mb-4">
                        Drag Word documents into this area or click below to browse your device
                      </p>

                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Select Word Files</span>
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>DOC & DOCX</span>
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
                  Maximum <span className="font-bold text-blue-600">100MB</span> per document |{" "}
                  <span className="font-bold text-blue-600">DOC & DOCX</span> formats supported
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
                Why Peoples Choose Our Word to PDF Converter
              </h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                Convert your Doc files into PDF files that look perfect on any device. Perfect for business reports, academic papers, resumes, and any document you want to share or print.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  title: "Perfect Format Preservation",
                  desc: "Every things of your Word document like fonts, spacing, colors, tables, headers, and footers - translates flawlessly into your PDF.",
                },
                {
                  icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
                  title: "Universal Compatibility",
                  desc: "PDFs open perfectly on any device, platform, or operating system. Share with confidence knowing everyone sees exactly what you intended.",
                },
                {
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                  title: "Your Privacy Comes First",
                  desc: "Documents are encrypted during transfer, processed in isolated memory, and automatically purged. We never see or store your content.",
                },
                {
                  icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                  title: "Images and Graphics Intact",
                  desc: "Images, diagrams, charts, and logos are preserved at original quality and positioned exactly where they appeared in your original document.",
                },
                {
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                  title: "Lightning Fast Conversion",
                  desc: "Most documents convert in under 3 seconds. No waiting around - upload your Word file and download your PDF immediately.",
                },
                {
                  icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
                  title: "No Software Installation",
                  desc: "Conversion happens in the cloud, so you get consistent results without worrying about software versions or system compatibility.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
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
                From Word to PDF in Three Simple Steps
              </h2>
              <p className="font-body text-slate-600 max-w-2xl mx-auto">
                No technical skills required. Just upload, wait a few seconds, and download your professional PDF document.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Upload Your Word File",
                  desc: "Drag your DOC or DOCX file into the upload zone or click to browse. Both legacy and modern Word formats are supported.",
                  color: "bg-blue-600",
                },
                {
                  step: "2",
                  title: "Automatic Processing",
                  desc: "Our system reads your Word document, preserves all formatting, and converts everything to PDF format with perfect accuracy.",
                  color: "bg-blue-700",
                },
                {
                  step: "3",
                  title: "Download & Share",
                  desc: "Your PDF file is ready within seconds. Download it and share with anyone - it will look perfect on any device or platform.",
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
                Common Questions About Word to PDF Conversion
              </h2>
              <p className="font-body text-slate-600">
                Got questions? Here are answers to what users ask most frequently.
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
              Ready to Convert Your Word Documents?
            </h2>
            <p className="font-body text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Joined thousands of users who convert their Word files to PDFs every day. No signup, no payment, no hassle required.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <FileText className="w-6 h-6" />
              <span>Convert Your First Document</span>
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}