"use client"

import { useState, useEffect, memo } from "react"
import Layout from "../components/Layout"
import SEOHead from "../components/SEOHead"
import { 
  FileText, 
  Merge, 
  Scissors, 
  Gauge, 
  FileImage, 
  ArrowRight, 
  Check, 
  Upload,
  Download,
  Lock,
  Zap,
  ChevronRight,
  Shield,
  Clock,
  Users,
  ChevronDown,
  Star
} from "lucide-react"

// Memoized SVG Illustration Components for Performance
const HeroIllustration = memo(() => (
  <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" aria-hidden="true">
    <rect x="50" y="40" width="120" height="160" rx="8" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="2"/>
    <rect x="60" y="50" width="100" height="12" rx="2" fill="#F87171"/>
    <rect x="60" y="70" width="80" height="6" rx="1" fill="#FECACA"/>
    <rect x="60" y="82" width="90" height="6" rx="1" fill="#FECACA"/>
    <rect x="60" y="94" width="70" height="6" rx="1" fill="#FECACA"/>
    <rect x="60" y="120" width="100" height="60" rx="4" fill="#FCA5A5" opacity="0.5"/>
    <path d="M190 120 L230 120" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4">
      <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M225 115 L235 120 L225 125" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="250" y="40" width="120" height="160" rx="8" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="2"/>
    <rect x="260" y="50" width="100" height="12" rx="2" fill="#22C55E"/>
    <rect x="260" y="70" width="80" height="6" rx="1" fill="#BBF7D0"/>
    <rect x="260" y="82" width="90" height="6" rx="1" fill="#BBF7D0"/>
    <rect x="260" y="94" width="70" height="6" rx="1" fill="#BBF7D0"/>
    <rect x="260" y="120" width="100" height="60" rx="4" fill="#86EFAC" opacity="0.5"/>
    <circle cx="350" cy="60" r="16" fill="#22C55E"/>
    <path d="M343 60 L348 65 L358 55" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="30" cy="80" r="8" fill="#FED7AA" opacity="0.8">
      <animate attributeName="cy" values="80;70;80" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="390" cy="180" r="6" fill="#BFDBFE" opacity="0.8">
      <animate attributeName="cy" values="180;190;180" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <rect x="80" y="220" width="260" height="50" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
    <text x="120" y="250" fontSize="11" fill="#6B7280" fontFamily="system-ui">Files processed</text>
    <text x="220" y="250" fontSize="14" fill="#111827" fontWeight="bold" fontFamily="system-ui">30M+</text>
    <circle cx="100" cy="245" r="10" fill="#FEE2E2"/>
    <path d="M96 245 L100 249 L104 241" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
  </svg>
))
HeroIllustration.displayName = 'HeroIllustration'

const SecureIllustration = memo(() => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" aria-hidden="true">
    <circle cx="40" cy="40" r="35" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="2"/>
    <rect x="28" y="32" width="24" height="20" rx="3" fill="#22C55E"/>
    <rect x="32" y="24" width="16" height="12" rx="8" fill="none" stroke="#22C55E" strokeWidth="3"/>
    <circle cx="40" cy="42" r="3" fill="white"/>
    <rect x="38" y="44" width="4" height="5" rx="1" fill="white"/>
  </svg>
))
SecureIllustration.displayName = 'SecureIllustration'

const FastIllustration = memo(() => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" aria-hidden="true">
    <circle cx="40" cy="40" r="35" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="2"/>
    <path d="M45 25 L35 42 H43 L38 55 L50 38 H42 L47 25 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
  </svg>
))
FastIllustration.displayName = 'FastIllustration'

const FreeIllustration = memo(() => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" aria-hidden="true">
    <circle cx="40" cy="40" r="35" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2"/>
    <circle cx="40" cy="40" r="18" fill="#3B82F6"/>
    <text x="40" y="45" fontSize="16" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">$0</text>
  </svg>
))
FreeIllustration.displayName = 'FreeIllustration'

// Memoized Tool Card Component
const ToolCard = memo(({ tool }) => (
  <a
    href={tool.href}
    className="group relative flex items-center gap-3 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 transition-all duration-300 hover:shadow-lg active:scale-[0.98] border border-gray-100 hover:border-gray-200 touch-manipulation"
  >
    <div className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br ${tool.gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      <tool.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
        {tool.name}
      </h3>
      <p className="text-xs text-gray-500 truncate">
        {tool.shortDesc}
      </p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
  </a>
))
ToolCard.displayName = 'ToolCard'

// Memoized Feature Mini Card
const FeatureMiniCard = memo(({ title, description, Illustration }) => (
  <div className="group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
    <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
      <Illustration />
    </div>
    <div>
      <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
))
FeatureMiniCard.displayName = 'FeatureMiniCard'

// Stats Mini Component
const StatItem = memo(({ value, label, Icon }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
    </div>
    <div>
      <div className="text-base sm:text-lg font-bold text-gray-900">{value}</div>
      <div className="text-[10px] sm:text-xs text-gray-500">{label}</div>
    </div>
  </div>
))
StatItem.displayName = 'StatItem'

// FAQ Accordion Component
const FAQItem = memo(({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-gray-200 transition-colors">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 sm:p-5 text-left touch-manipulation"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">{question}</span>
      <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-600 text-sm leading-relaxed">
        {answer}
      </p>
    </div>
  </div>
))
FAQItem.displayName = 'FAQItem'

// Tools Data
const tools = [
  { name: "Merge PDF", shortDesc: "Combine multiple PDFs", href: "/merge-pdf", Icon: Merge, gradient: "from-red-500 to-rose-500" },
  { name: "Split PDF", shortDesc: "Extract pages from PDF", href: "/split-pdf", Icon: Scissors, gradient: "from-orange-500 to-amber-500" },
  { name: "Compress PDF", shortDesc: "Reduce file size", href: "/compress-pdf", Icon: Gauge, gradient: "from-emerald-500 to-green-500" },
  { name: "PDF to Word", shortDesc: "Convert to DOCX", href: "/pdf-to-word", Icon: FileText, gradient: "from-blue-500 to-cyan-500" },
  { name: "Word to PDF", shortDesc: "Convert DOCX to PDF", href: "/word-to-pdf", Icon: FileText, gradient: "from-indigo-500 to-blue-500" },
  { name: "PDF to JPG", shortDesc: "Extract images", href: "/pdf-to-jpg", Icon: FileImage, gradient: "from-yellow-500 to-orange-500" },
  { name: "JPG to PDF", shortDesc: "Images to PDF", href: "/jpg-to-pdf", Icon: FileImage, gradient: "from-pink-500 to-rose-500" },
  { name: "PNG to PDF", shortDesc: "PNG to PDF format", href: "/png-to-pdf", Icon: FileImage, gradient: "from-cyan-500 to-teal-500" },
  { name: "PDF to PNG", shortDesc: "Export as PNG", href: "/pdf-to-png", Icon: FileImage, gradient: "from-violet-500 to-purple-500" },
  { name: "Compress Image", shortDesc: "Optimize images", href: "/compress-image", Icon: FileImage, gradient: "from-fuchsia-500 to-pink-500" },
  { name: "WebP to PNG", shortDesc: "WebP conversion", href: "/webp-to-png", Icon: FileImage, gradient: "from-teal-500 to-emerald-500" },
  { name: "PNG to WebP", shortDesc: "Convert to WebP", href: "/png-to-webp", Icon: FileImage, gradient: "from-lime-500 to-green-500" },
]

// FAQ Data - Rewritten to sound more human and natural
const faqs = [
  {
    question: "Is your website really free to use?",
    answer: "Absolutely! Everything here is free forever. There are no trial periods, premium plans, or surprise charges lurking around the corner. We believe PDF tools should be accessible to everyone. That's why you can merge, split, compress, and convert as many files as you want without ever reaching for your wallet. We keep the lights on with some minimal ads, but they won't interrupt your work or bombard you with pop-ups."
  },
  {
    question: "How secure are my files when I upload them?",
    answer: "We take your privacy seriously. When you upload a file, it's immediately encrypted with industry-standard 256-bit SSL protection during transfer. This means nobody can intercept or peek at your documents while they're being processed. Once we finish converting or editing your file, it sits on our server just long enough for you to download it. After two hours maximum, it's permanently deleted. We don't keep copies, we don't analyze content, and we definitely don't share anything with third parties. Your files are yours alone."
  },
  {
    question: "What file formats does this support?",
    answer: "We've got you covered for pretty much everything you'll need! On the document side, you can work with PDFs, Word files (both DOC and DOCX), Excel spreadsheets, and PowerPoint presentations. For images, we handle JPG, JPEG, PNG, WebP, GIF, and more. Whether you're trying to turn a scanned receipt into a searchable PDF, compress a massive file so you can email it, stitch together multiple documents, or pull images out of a presentation, there's a tool here that'll do the job. Just scroll up to see the complete list of what we offer."
  },
  {
    question: "Do I need to create an account?",
    answer: "Nope, not at all. No registration, no login screens, no password resets, no verification emails cluttering your inbox. We built this to be as simple as possible: you show up, pick a tool, drop in your file, and you're off to the races. We won't ask for your email, phone number, or any other personal details. You get full access to every single feature without jumping through hoops or filling out forms. It's honestly the way web tools should work."
  },
  {
    question: "Can I use this on my phone or tablet?",
    answer: "You bet! The entire site works seamlessly on any device you throw at it. Whether you're on an iPhone, Android phone, iPad, Surface tablet, MacBook, or Windows desktop, you'll get the same fast, smooth experience. Everything's been designed to work perfectly with touchscreens too, so tapping buttons and dragging files feels natural on mobile devices. There's no separate app to download or install. Just open your browser, visit the site, and start working. It's that straightforward."
  }
]

// Main Homepage Component
export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [openFAQ, setOpenFAQ] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? -1 : index)
  }

  return (
    <>
      <SEOHead />
      <Layout>
        {/* Compact Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-10 sm:py-12 md:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              {/* Left Content */}
              <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight tracking-tight">
                  Your complete{" "}
                  <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                    PDF toolkit
                  </span>
                  {" "}that's actually free
                </h1>

                {/* Subheading */}
                <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-5 sm:mb-6 leading-relaxed">
                  Convert documents, shrink file sizes, merge PDFs, and edit with ease. 
                  <span className="text-gray-700 font-medium"> No signup, no fees, no nonsense.</span>
                </p>

                {/* CTA + Trust */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <a 
                    href="#tools" 
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:shadow-xl hover:shadow-red-500/20 active:scale-[0.98] transition-all duration-300 touch-manipulation"
                    aria-label="Start using free PDF tools"
                  >
                    <span className="text-sm sm:text-base">Get Started Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      <span>Secure</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 border-t border-gray-100">
                  <StatItem value="30M+" label="Files processed" Icon={FileText} />
                  <StatItem value="100M+" label="Happy users" Icon={Users} />
                  <StatItem value="99.9%" label="Uptime" Icon={Shield} />
                </div>
              </div>

              {/* Right Illustration */}
              <div className={`hidden lg:block transition-all duration-500 delay-150 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-red-100/50 to-orange-100/50 rounded-3xl blur-2xl" />
                  <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-xl">
                    <HeroIllustration />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid Section - Compact */}
        <section id="tools" className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-1 sm:mb-2">
                  All PDF Tools
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  Everything you need to work with PDF files
                </p>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Compact Inline */}
        <section className="py-10 sm:py-12 md:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-center">
              {/* Left - Title */}
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2 sm:mb-3">
                  Simple as 1-2-3
                </h2>
                <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
                  No complicated steps. Just upload, process, and download.
                </p>
                <a 
                  href="#tools" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                  aria-label="Try PDF tools now"
                >
                  Try it now
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Right - Steps */}
              <div className="lg:col-span-3 flex flex-col sm:flex-row gap-3 sm:gap-4">
                {[
                  { num: "1", Icon: Upload, title: "Upload", desc: "Select your file" },
                  { num: "2", Icon: Zap, title: "Process", desc: "Instant conversion" },
                  { num: "3", Icon: Download, title: "Download", desc: "Get your file" },
                ].map((step, i) => (
                  <div key={i} className="flex-1 relative">
                    <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <step.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white border-2 border-red-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-red-500">
                          {step.num}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm sm:text-base">{step.title}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{step.desc}</div>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="hidden sm:block absolute top-1/2 -right-2 transform translate-x-full -translate-y-1/2 text-gray-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Compact */}
        <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-1 sm:mb-2">
                Why SmallPDF.us?
              </h2>
              <p className="text-sm sm:text-base text-gray-500">Enterprise features, completely free</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <FeatureMiniCard 
                title="Bank-Level Security"
                description="256-bit encryption. Files auto-delete after processing."
                Illustration={SecureIllustration}
              />
              <FeatureMiniCard 
                title="Lightning Fast"
                description="Process files in seconds with optimized servers."
                Illustration={FastIllustration}
              />
              <FeatureMiniCard 
                title="Always Free"
                description="No hidden fees. No signup. No limits."
                Illustration={FreeIllustration}
              />
            </div>
          </div>
        </section>

        {/* Content Section - What We Offer - More human and natural */}
        <section className="py-10 sm:py-12 md:py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-3 sm:mb-4">
                Why We Built This
              </h2>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                Look, PDFs can be incredibly frustrating to deal with. We've all been there: frantically trying to combine multiple files while a deadline looms overhead, struggling to shrink a massive document so it'll actually send through email, or desperately wanting to convert a PDF to Word without the formatting turning into absolute chaos. Sound familiar?
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                That frustration is exactly why we created this site. We wanted to build something different, something that actually works the way you'd expect it to. No confusing menus buried three clicks deep, no surprise paywalls popping up right when you need something, and absolutely no forcing you to create yet another account just to resize an image or merge two files.
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Whether you're a student pulling together research papers at midnight, a professional handling contracts and invoices, or just someone who needs to quickly sign and send a document, these tools are designed to save you time and spare you the headache. We've refined every feature based on real user feedback, and we keep improving because your time matters more than anything else.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials/Social Proof */}
        <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
              
              <div className="relative grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-3 sm:mb-4 leading-relaxed">
                    "The best PDF tool I've ever used. Fast, free, and just works."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      M
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">Michael Chen</div>
                      <div className="text-gray-400 text-xs sm:text-sm">Product Designer</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 sm:gap-4">
                  <p className="text-gray-400 text-xs sm:text-sm">Trusted by teams at</p>
                  <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 items-center">
                    {["Google", "Microsoft", "Amazon", "Meta"].map((company) => (
                      <div key={company} className="text-gray-500 font-bold text-base sm:text-lg opacity-50 hover:opacity-100 transition-opacity">
                        {company}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 sm:py-12 md:py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 sm:mb-3">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => toggleFAQ(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Premium CTA - Compact */}
        <section className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 py-12 px-4 md:px-6 overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                  Unlock the full power of PDF tools
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 bg-white/20 rounded-full p-1" />
                    <p className="font-medium">Unlimited file size and batch processing</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 bg-white/20 rounded-full p-1" />
                    <p className="font-medium">Advanced OCR for scanned documents</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 bg-white/20 rounded-full p-1" />
                    <p className="font-medium">Desktop and mobile apps included</p>
                  </div>
                </div>

                <button className="bg-white text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-all hover:shadow-xl text-base">
                  ⭐ Get Premium Now
                </button>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-all duration-300 hover:scale-105">
                  <div className="text-5xl mb-4 text-center">🎉</div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Premium Features</h3>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Unlimited conversions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>No file size limits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Batch processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Ad-free experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Compact */}
        <section className="py-8 sm:py-10 md:py-12 px-4 bg-gradient-to-r from-red-600 to-orange-500">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2">
                  Ready to get started?
                </h2>
                <p className="text-sm sm:text-base text-white/80">
                  Start converting your PDFs now. No signup needed.
                </p>
              </div>
              <a 
                href="#tools" 
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-100 hover:shadow-xl active:scale-[0.98] transition-all duration-300 touch-manipulation"
                aria-label="Choose a PDF tool to start"
              >
                <span className="text-sm sm:text-base">Choose a Tool</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/20">
              {[
                { Icon: Lock, text: "SSL Secured" },
                { Icon: Check, text: "GDPR Compliant" },
                { Icon: Clock, text: "Auto-delete files" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                  <item.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}
