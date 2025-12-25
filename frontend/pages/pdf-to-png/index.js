"use client"

import { useState, useCallback } from "react"
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
  ImageIcon,
  Sparkles,
  Monitor,
} from "lucide-react"
import Head from "next/head"

export default function PDFtoPNG() {
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

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: "Please select a PDF file only" }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "PDF file must be smaller than 100MB" }
    }

    return { valid: true }
  }

  const processFile = async (newFile) => {
    const validation = validateFile(newFile)
    
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Create FormData and send to API
      const formData = new FormData()
      formData.append("pdf", newFile)

      const response = await fetch("http://localhost:5000/api/pdf-to-png", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        // Store conversion result
        sessionStorage.setItem(
          "pdfToPngResult",
          JSON.stringify({
            ...result,
            originalName: newFile.name,
            originalSize: newFile.size,
          }),
        )

        setTimeout(() => {
          router.push("/pdf-to-png/preview")
        }, 600)
      } else {
        setError(result.error || "Conversion failed. Please try again.")
        setIsProcessing(false)
      }
    } catch (err) {
      console.error("Error converting file:", err)
      setError("Failed to convert file. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError("")

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e) => {
    setError("")
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
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
      question: "How do I turn a PDF into PNG images?",
      answer:
        "Just upload your PDF. We'll automatically split it into separate pages and convert each one to a PNG image. Then you can preview all of them and download the ones you want - either individually or all at once in a zip file.",
    },
    {
      question: "Will the images be sharp and clear?",
      answer:
        "Yep, they'll look great. We convert at 150 DPI which keeps text crisp and images detailed. PNG also supports transparency, so if your PDF has transparent elements, those stay transparent in the images too.",
    },
    {
      question: "Can I get each page as a separate image?",
      answer:
        "Absolutely. Every page becomes its own PNG file. After conversion, you'll see all the pages. Pick the specific ones you need, or just grab them all in one zip download.",
    },
    {
      question: "Is my PDF safe during conversion?",
      answer:
        "Yes, totally secure. Your file gets encrypted during upload. We process it on secure servers and then delete everything after one hour. We never look at your documents or keep them around.",
    },
    {
      question: "Do I need to download any software?",
      answer:
        "Nope, it all works in your browser. Use it on Windows, Mac, Linux, your phone - whatever you've got. No apps, no downloads, no installation. Just open it and go.",
    },
  ]

  return (
    <>
      <Head>
        <title>PDF to PNG Converter Online Free | Extract Images from PDF - SmallPDF.us</title>
        <meta
          name="description"
          content="Convert PDF to PNG images online for free. Extract high-quality PNG images from PDF pages instantly. Supports transparency, batch conversion, no registration required. Try SmallPDF.us now."
        />
        <meta
          name="keywords"
          content="pdf to png, convert pdf to png, pdf to png converter, extract images from pdf, pdf to image online, png from pdf, pdf page to png, smallpdf"
        />
        <link rel="canonical" href="https://smallpdf.us/pdf-to-png" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smallpdf.us/pdf-to-png" />
        <meta property="og:title" content="PDF to PNG Converter Online Free | Extract Images from PDF - SmallPDF.us" />
        <meta
          property="og:description"
          content="Convert PDF pages to high-quality PNG images instantly. Free, secure, and easy to use."
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PDF to PNG Converter - SmallPDF.us",
              url: "https://smallpdf.us/pdf-to-png",
              description: "Convert PDF pages to high-quality PNG images online for free",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.7",
                ratingCount: "19824",
              },
            }),
          }}
        />
      </Head>

      <Layout
        title="PDF to PNG - Convert PDF to Images Online"
        description="Convert PDF pages to high-quality PNG images instantly."
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
              PDF to PNG Converter <span className="text-blue-600">Online Free</span>
            </h1>

            <p className="font-body text-base text-slate-600 max-w-2xl mx-auto mb-2">
              Convert PDF pages into PNG images with transparency support. Fast and secure with{" "}
              <strong>SmallPDF.us</strong>
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 py-8 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-6">
              {isProcessing ? (
                <div className="py-10 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                    <ImageIcon className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Converting Your PDF</h3>
                  <p className="font-body text-sm text-slate-600">Extracting pages and creating PNG images...</p>
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
                      onChange={handleFileChange}
                    />

                    <div className="p-10 text-center">
                      <div className="mb-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
                          <ImageIcon className="w-8 h-8 text-white animate-bounce-slow" />
                        </div>
                      </div>

                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        {dragActive ? "Drop Your PDF Here!" : "Select PDF to Convert"}
                      </h3>
                      <p className="font-body text-sm text-slate-500 mb-4">
                        Drag and drop your PDF or click to browse
                      </p>

                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Choose PDF File</span>
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span>PDF Only</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          <span>Secure</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Fast Convert</span>
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
                  Up to <span className="font-bold text-blue-600">100MB</span> per file •{" "}
                  <span className="font-bold text-blue-600">High-Quality PNG</span> output
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
                Why Use Our PDF to PNG Converter?
              </h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                We make it easy to extract images from PDFs. No complicated settings, just upload and download.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "Crystal Clear Images",
                  description: "150 DPI resolution keeps text sharp and images detailed. Every page looks great.",
                  color: "from-blue-500 to-indigo-600",
                },
                {
                  icon: ImageIcon,
                  title: "Transparency Works",
                  description: "PNG keeps transparent backgrounds intact. If your PDF has transparency, it stays that way.",
                  color: "from-cyan-500 to-blue-600",
                },
                {
                  icon: Shield,
                  title: "Your Files Stay Private",
                  description: "Everything's encrypted during upload. We delete your files after an hour automatically.",
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  icon: Monitor,
                  title: "Works Everywhere",
                  description: "Use it in any browser on any device. Windows, Mac, Linux, phone - all good.",
                  color: "from-violet-500 to-purple-600",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="font-body text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Three Easy Steps</h2>
              <p className="font-body text-slate-600">Get PNG images from your PDF in less than a minute</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload PDF",
                  description: "Pick your PDF file. We'll grab all the pages automatically.",
                  color: "bg-blue-600",
                },
                {
                  step: "2",
                  title: "Preview Pages",
                  description: "Look through all the converted PNG images. See what you're getting before you download.",
                  color: "bg-indigo-600",
                },
                {
                  step: "3",
                  title: "Download Images",
                  description: "Grab individual PNGs or download everything in one zip file. Your choice.",
                  color: "bg-blue-700",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`w-14 h-14 ${item.color} text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg`}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="font-body text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">
              Why Convert PDFs to PNG Images?
            </h2>
            <div className="prose prose-slate max-w-none space-y-4 font-body text-slate-700">
              <p>
                There are times when only images would be enough and not documents. In case you are uploading pages to a website, making a presentation, sharing on the social media, or just need certain pages as images, then converting PDF to PNG is the right thing to do.
              </p>
              <p>
                PNG is a great choice for this as it keeps the file visually attractive. In comparison to JPG which can result in blurry text, PNG is able to keep every detail intact. Besides that, it is able to support transparent backgrounds, so if your PDF had a transparent background, it would still be like that in the PNG. Perfect for logos, illustrations, or any kind of files with a transparent background.
              </p>
              <p>
                We built this tool to be simple. Upload your PDF, we split it into pages and convert each one, you
                download what you need. No complicated settings, no confusing options. Just the PNGs you want.
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-6 mb-3">When You'll Need This</h3>
              <p>
                Need to extract pages for a website? Want to share specific slides as images? Converting reports to
                images for review? Extracting diagrams or charts? Making thumbnails? All perfect uses. Basically,
                anytime you need PDF pages as individual image files, this tool has you covered.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Common Questions</h2>
              <p className="font-body text-slate-600">Quick answers about PDF to PNG conversion</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-display font-semibold text-slate-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="font-body text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="bg-white py-12 px-4 border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">More PDF Tools</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: "PNG to PDF", href: "/png-to-pdf" },
                { name: "JPG to PDF", href: "/jpg-to-pdf" },
                { name: "Merge PDF", href: "/merge-pdf" },
                { name: "Compress PDF", href: "/compress-pdf" },
                { name: "Split PDF", href: "/split-pdf" },
              ].map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors font-medium text-sm"
                >
                  {tool.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-white font-semibold font-body">Rated 4.7/5 by over 19,000 users</p>
            <p className="text-blue-100 font-body text-sm mt-1">The easiest way to convert PDFs to PNG images</p>
          </div>
        </div>
      </Layout>
    </>
  )
}