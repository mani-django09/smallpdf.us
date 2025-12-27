"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import SEOHead from "../../components/SEOHead"
import {
  Upload,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  Star,
  ChevronDown,
  Sparkles,
  FileImage,
  Camera,
  Layers,
} from "lucide-react"

export default function PDFToJPG() {
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
    const validTypes = ["application/pdf"]
    const maxSize = 100 * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid PDF document (.pdf)")
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
    document.getElementById("file-upload").click()
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
          data: e.target.result,
        }
        sessionStorage.setItem("uploadedPDFFile", JSON.stringify(fileData))

        setTimeout(() => {
          router.push("/pdf-to-jpg/preview")
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
      question: "Will my images look good or will they be blurry?",
      answer:
        "They'll look great. We convert each page at 300 DPI, which is professional print quality. Text stays sharp, photos keep their detail, and graphics look crisp. You can use these images anywhere without worrying about quality.",
    },
    {
      question: "How many pages can I turn into images at once?",
      answer:
        "You can convert up to 200 pages in one go. Each page becomes its own JPG file. If your PDF is bigger than that, just split it into chunks first using our split tool, then convert each section.",
    },
    {
      question: "Can I post these images on social media?",
      answer:
        "Absolutely. JPG works on every platform - Instagram, Facebook, Twitter, LinkedIn, you name it. The images are already sized right for web use, so you can upload them straight away without editing.",
    },
    {
      question: "What if my PDF has a password on it?",
      answer:
        "You'll need to remove the password first. Open the PDF in any PDF reader, go to security settings, and unlock it. Once it's password-free, come back and upload it here - then it'll convert just fine.",
    },
    {
      question: "Does this mess with my original PDF file?",
      answer:
        "Not at all. Your original stays exactly as it was. We make image copies of the pages but never touch the source file. Plus, we delete both the PDF and the images from our servers after an hour.",
    },
    {
      question: "Is JPG the same thing as JPEG?",
      answer:
        "Yeah, they're identical. JPG and JPEG are just different ways to write the file extension - some systems prefer three letters, some prefer four. The actual image format is exactly the same either way.",
    },
  ]

  // Custom structured data for pdf-to-jpg page
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "PDF to JPG Converter - SmallPDF.us",
        "url": "https://smallpdf.us/pdf-to-jpg",
        "description": "Convert PDF documents to JPG images online for free with high quality 300 DPI output",
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
          "ratingCount": "21834",
        },
        "featureList": [
          "Convert up to 200 PDF pages",
          "300 DPI high quality output",
          "Extract all pages to JPG",
          "Batch ZIP download",
          "Professional quality images",
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
        "name": "How to Convert PDF to JPG",
        "description": "Step-by-step guide to extracting images from PDF documents",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Upload PDF Document",
            "text": "Select a PDF file from your device. Files up to 100MB and 200 pages are supported.",
            "position": 1
          },
          {
            "@type": "HowToStep",
            "name": "Automatic Conversion",
            "text": "Our system converts each PDF page to a high-quality 300 DPI JPG image. This takes just a few seconds.",
            "position": 2
          },
          {
            "@type": "HowToStep",
            "name": "Download Images",
            "text": "Download individual images or get all pages in a ZIP file. Your images are ready to use anywhere.",
            "position": 3
          }
        ]
      }
    ]
  }

  return (
    <>
      <SEOHead
        title="PDF to JPG Converter Online Free - Extract Images from PDF | SmallPDF.us"
        description="Convert PDF to JPG images online for free. Turn PDF pages into high-quality 300 DPI pictures instantly. Extract images from any PDF document. No watermarks, fast and secure."
        canonical="https://smallpdf.us/pdf-to-jpg"
        ogImage="/og-pdf-to-jpg.jpg"
        structuredData={structuredData}
      />

      <Layout
        title="PDF to JPG - Convert PDF Pages to Images"
        description="Turn any PDF page into a high-quality JPG image in seconds."
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
              PDF to JPG <span className="text-blue-600">Online Free</span>
            </h1>

            <p className="font-body text-base text-slate-600 max-w-2xl mx-auto mb-2">
              Turn PDF pages into JPG images. Perfect for social media, presentations, or anywhere you need pictures instead of documents on{" "}
              <strong>SmallPDF.us</strong>
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 py-8 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-8 right-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-6">
              {isProcessing ? (
                <div className="py-10 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                    <ImageIcon className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Reading Your PDF</h3>
                  <p className="font-body text-sm text-slate-600">Getting ready to make images...</p>
                  <div className="mt-5 max-w-xs mx-auto">
                    <div className="bg-blue-200 rounded-full h-2 overflow-hidden">
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
                          <FileImage className="w-8 h-8 text-white animate-bounce-slow" />
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
                        <span>Choose PDF</span>
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
                          <span>Fast</span>
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
                  <span className="font-bold text-blue-600">200 pages</span> maximum
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
                Why People Choose This PDF to JPG Tool
              </h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                We make it dead simple to pull images out of PDFs. No confusing settings, no software to install. Just upload and download.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Camera,
                  title: "Images Look Professional",
                  desc: "Each page converts at 300 DPI - that's print-quality resolution. Your text stays readable, your photos stay clear, and nothing gets fuzzy or pixelated.",
                },
                {
                  icon: Layers,
                  title: "Handle Multi-Page PDFs",
                  desc: "Got a 50-page document? No problem. Every page becomes its own JPG. We bundle them all into a ZIP file so you can download everything at once.",
                },
                {
                  icon: Star,
                  title: "Works Everywhere",
                  desc: "JPG is the most common image format on the planet. Use these images in emails, on websites, in presentations, on social media - literally anywhere.",
                },
                {
                  icon: Shield,
                  title: "Your Files Stay Private",
                  desc: "We encrypt everything when you upload. Process your PDF on secure servers. Then delete both the PDF and the images after an hour. We never look at your stuff.",
                },
                {
                  icon: Zap,
                  title: "Converts in Seconds",
                  desc: "Upload, wait a few seconds, download. Even big PDFs with hundreds of pages finish converting before you can grab a coffee.",
                },
                {
                  icon: Sparkles,
                  title: "Completely Free",
                  desc: "No trial period, no premium version, no limits. Convert as many PDFs as you want, whenever you want. This is the full tool, forever free.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="font-body text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Three Simple Steps</h2>
              <p className="font-body text-slate-600">Get your images in under a minute</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload PDF",
                  desc: "Drop your file or click to browse. We'll accept any PDF up to 100MB.",
                  color: "bg-blue-600",
                },
                {
                  step: "2",
                  title: "We Convert It",
                  desc: "Our system reads through each page and turns them into crisp JPG images. Takes just a few seconds.",
                  color: "bg-indigo-600",
                },
                {
                  step: "3",
                  title: "Download Images",
                  desc: "Grab your images individually or download them all at once in a ZIP file. Done.",
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

        {/* FAQ Section */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Questions People Ask</h2>
              <p className="font-body text-slate-600">Quick answers about converting PDFs to JPG</p>
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

        {/* SEO Content Section */}
        <div className="bg-blue-50 py-12 px-4 border-t border-blue-200">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-slate max-w-none">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
                When Do You Need PDF Pages as Images?
              </h2>
              <p className="font-body text-slate-700 mb-4">
                Sometimes a PDF just isn't the right format. Maybe you want to post a page on Instagram. Maybe you need to insert it into a presentation. Maybe you're building a website and need images, not documents. That's when this tool comes in handy.
              </p>
              <p className="font-body text-slate-700 mb-4">
                Think about it - PDFs are great for reading and printing, but terrible for social media. You can't post a PDF to Instagram or use it as a thumbnail on YouTube. You need JPG for that stuff. And manually taking screenshots of each page? That's a pain, plus the quality usually stinks.
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 mt-6">
                Why JPG Instead of Other Formats?
              </h3>
              <p className="font-body text-slate-700 mb-4">
                JPG files are small but still look good. That's the magic. A PNG might give you slightly better quality, but the file will be three times bigger. For most uses - web, email, social media - JPG hits the sweet spot between quality and file size.
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 mt-6">Real Uses for This Tool</h3>
              <p className="font-body text-slate-700">
                Marketing teams use it to grab pages from reports for social posts. Teachers convert textbook pages to share with students. Real estate agents pull floor plans from listing PDFs. Designers extract pages from portfolios. Basically, anytime you've got content locked in a PDF and you need it as an image, this does the job.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Convert Your PDF?
            </h2>
            <p className="font-body text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands who use SmallPDF.us every day. Quick, free, and no signup needed.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <FileImage className="w-5 h-5" />
              <span>Start Converting Now</span>
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}