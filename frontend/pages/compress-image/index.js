"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import SEOHead from "../../components/SEOHead"
import { Upload, AlertCircle, CheckCircle2, Zap, Shield, ChevronDown, Trash2, Minimize2 } from "lucide-react"

export default function CompressImage() {
  const router = useRouter()
  const [files, setFiles] = useState([])
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
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const maxSize = 50 * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Only JPG, PNG, and WEBP image files are supported" }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "Each file must be under 50MB for optimal compression" }
    }

    return { valid: true }
  }

  const processFiles = (newFiles) => {
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
          preview: URL.createObjectURL(file),
        })
      } else {
        setError(validation.error)
        hasError = true
        break
      }
    }

    if (!hasError && validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles])
      setError("")
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

  const removeFile = (id) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleContinue = async () => {
    if (files.length === 0) {
      setError("Please add at least 1 image to compress")
      return
    }

    setIsProcessing(true)

    try {
      const fileDataArray = await Promise.all(
        files.map(async (f) => {
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

      sessionStorage.setItem("uploadedCompressImages", JSON.stringify(fileDataArray))

      setTimeout(() => {
        router.push("/compress-image/preview")
      }, 600)
    } catch (err) {
      console.error("Error processing files:", err)
      setError("Failed to process files. Please try again.")
      setIsProcessing(false)
    }
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "Will my photos look worse after compression?",
      answer:
        "Nope. We use smart compression that keeps your images looking sharp. You probably won't even notice the difference, but your file sizes will drop by 50-80%. Text stays readable, colors stay vibrant, details stay crisp.",
    },
    {
      question: "What kinds of images can I compress here?",
      answer:
        "JPG, PNG, and WEBP - those are the big three. Pretty much any photo or graphic you've got will work. Phone photos, screenshots, graphics from Photoshop, whatever.",
    },
    {
      question: "Can I do a bunch of images at the same time?",
      answer:
        "Yeah, up to 20 at once. Great for when you've got a whole folder of photos that need shrinking. Upload them all, we'll compress them all, you download them all in one ZIP file.",
    },
    {
      question: "Why should I bother compressing images anyway?",
      answer:
        "Smaller files mean faster websites, quicker uploads, less storage space eaten up. If you're putting images on a website, compressed versions load way faster. Your visitors won't sit there waiting for huge photos to appear.",
    },
    {
      question: "What happens to my images after I compress them?",
      answer:
        "We delete everything after an hour. Your originals, the compressed versions, all of it. We encrypt the upload process too, so nobody can peek at your photos while we're working on them.",
    },
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Image Compressor - SmallPDF.us",
        "url": "https://smallpdf.us/compress-image",
        "description": "Compress images online free - reduce file size without quality loss",
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
          "ratingCount": "19652",
        },
        "featureList": [
          "Compress up to 20 images",
          "50-80% file size reduction",
          "Supports JPG, PNG, WEBP",
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
        "name": "How to Compress Images",
        "description": "Step-by-step guide to compressing images without losing quality",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Upload Images",
            "text": "Upload your JPG, PNG, or WEBP files. Add up to 20 images for batch compression.",
            "position": 1
          },
          {
            "@type": "HowToStep",
            "name": "Smart Compression",
            "text": "Our system automatically optimizes each image to reduce file size by 50-80% while maintaining visual quality.",
            "position": 2
          },
          {
            "@type": "HowToStep",
            "name": "Download Compressed Images",
            "text": "Download your optimized images individually or get all files in a convenient ZIP archive.",
            "position": 3
          }
        ]
      }
    ]
  }

  return (
    <>
      <SEOHead
        title="Compress Images Online Free - Reduce Image Size | SmallPDF.us"
        description="Compress JPG, PNG, WEBP images online for free. Reduce image file size up to 80% without losing quality. Fast batch image compression tool for web and social media."
        canonical="https://smallpdf.us/compress-image"
        ogImage="/og-compress-image.jpg"
        structuredData={structuredData}
      />

      <Layout
        title="Compress Image - Reduce File Size Online"
        description="Shrink your images without losing quality. Fast and free."
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
              Compress Images <span className="text-blue-600">Online Free</span>
            </h1>

            <p className="font-body text-base text-slate-600 max-w-2xl mx-auto mb-2">
              Shrink JPG, PNG, and WEBP files by up to 80% without losing quality. Perfect for websites, social media, and email on{" "}
              <strong>SmallPDF.us</strong>
            </p>
          </div>
        </div>

        {/* Upload Section - Hidden when files are selected */}
        {files.length === 0 ? (
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
                      <Minimize2 className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Getting Ready</h3>
                    <p className="font-body text-sm text-slate-600">
                      Preparing {files.length} image{files.length > 1 ? "s" : ""} for compression...
                    </p>
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
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileChange}
                      />

                      <div className="p-10 text-center">
                        <div className="mb-3">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
                            <Minimize2 className="w-8 h-8 text-white animate-bounce-slow" />
                          </div>
                        </div>

                        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                          {dragActive ? "Drop Your Images Here!" : "Select Images to Compress"}
                        </h3>
                        <p className="font-body text-sm text-slate-500 mb-4">
                          Drag and drop your images or click to browse
                        </p>

                        <button
                          type="button"
                          onClick={handleButtonClick}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Upload className="w-5 h-5" />
                          <span>Choose Images</span>
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>JPG, PNG, WEBP</span>
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
                    Up to <span className="font-bold text-blue-600">50MB</span> per file |{" "}
                    <span className="font-bold text-blue-600">20 images</span> maximum
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      Selected Images ({files.length})
                    </h3>
                    <button
                      onClick={handleButtonClick}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add More
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="relative group bg-blue-50 border-2 border-blue-200 rounded-lg p-2 hover:bg-blue-100 transition-colors"
                      >
                        <div className="aspect-square bg-white rounded-lg overflow-hidden mb-2">
                          <img
                            src={f.preview || "/placeholder.svg"}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-medium text-slate-900 truncate">{f.name}</p>
                        <p className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</p>
                        <button
                          onClick={() => removeFile(f.id)}
                          className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                <button
                  onClick={handleContinue}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105"
                >
                  <Minimize2 className="w-5 h-5" />
                  <span>
                    Compress {files.length} Image{files.length > 1 ? "s" : ""}
                  </span>
                </button>

                {error && (
                  <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="font-body text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">
                Why Use Our Image Compressor
              </h2>
              <p className="font-body text-slate-600 max-w-3xl mx-auto">
                Big image files slow everything down. We make them smaller without making them look worse. Simple as that.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  title: "Shrink Files Way Down",
                  desc: "Your images get 50-80% smaller. A 5MB photo might become 1MB. Same picture, way smaller file. Websites load faster, uploads finish quicker.",
                },
                {
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                  title: "Do a Bunch at Once",
                  desc: "Got 20 photos that need compressing? Upload them all together. We'll handle them all at the same time and give you everything back in a ZIP file.",
                },
                {
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                  title: "Still Looks Good",
                  desc: "We use smart compression. Your eyes won't spot the difference between the original and compressed version, but the file size difference is huge.",
                },
                {
                  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                  title: "Your Photos Stay Private",
                  desc: "Everything's encrypted when you upload. We compress your images and then delete both the originals and compressed versions after an hour. Nobody sees your stuff.",
                },
                {
                  icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                  title: "Works With Common Formats",
                  desc: "JPG from your camera, PNG screenshots, WEBP graphics - we handle all of them. Whatever image format you've got, we can make it smaller.",
                },
                {
                  icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
                  title: "Makes Websites Faster",
                  desc: "Smaller images mean pages load in a flash. Good for your visitors, good for Google rankings. If you run a website, this is a must-have tool.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Three Quick Steps</h2>
              <p className="font-body text-slate-600">Compress your images in under a minute</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload Images",
                  desc: "Drop your JPG, PNG, or WEBP files. Add up to 20 images if you want to compress a whole batch.",
                  color: "bg-blue-600",
                },
                {
                  step: "2",
                  title: "We Compress Them",
                  desc: "Our system figures out the best way to shrink each image without wrecking the quality. Takes just seconds.",
                  color: "bg-indigo-600",
                },
                {
                  step: "3",
                  title: "Download Results",
                  desc: "Grab your compressed images one by one or download them all in a ZIP. Done deal.",
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
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Common Questions</h2>
              <p className="font-body text-slate-600">Everything you need to know about image compression</p>
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
                When You Need to Compress Images
              </h2>
              <p className="font-body text-slate-700 mb-4">
                Big image files are a pain. They take forever to upload, eat up storage space, and make websites crawl. If you've ever waited for a webpage to load because some huge photo is taking its sweet time, you know what I'm talking about.
              </p>
              <p className="font-body text-slate-700 mb-4">
                That's where compression comes in. We squeeze the file size down - way down - without making your images look bad. A 10MB photo becomes 2MB. Still looks great, but now it loads fast and doesn't hog space.
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 mt-6">
                Why File Size Actually Matters
              </h3>
              <p className="font-body text-slate-700 mb-4">
                Smaller files load faster on websites. Google likes fast websites, so compressed images help your SEO. They're easier to email - nobody wants to wait while a 50MB attachment uploads. They use less cloud storage. They're friendlier to people on mobile data plans. Basically, smaller is better for everyone involved.
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 mt-6">Real Uses for This</h3>
              <p className="font-body text-slate-700">
                Website owners compress images so pages load lightning fast. Photographers shrink portfolios for online galleries. Marketers optimize graphics for email campaigns and social posts. Bloggers compress photos before uploading to WordPress. Anyone who deals with images regularly needs this tool in their back pocket.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Shrink Your Images?
            </h2>
            <p className="font-body text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands who use SmallPDF.us to compress images every day. Free, fast, no account needed.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
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