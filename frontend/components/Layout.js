"use client"

import { useState } from "react"
import { Menu, X, ChevronDown, FileText, Zap, Shield, Globe } from "lucide-react"
import Script from "next/script"

export default function Layout({ children, title, description }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Google AdSense Script - Place in <head> */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6913093595582462"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-2.5 group">
                <div className="flex items-center">
                  <span className="text-xl md:text-2xl font-bold text-gray-900">Small</span>
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">PDF</span>
                  <span className="text-sm text-gray-500 ml-1">.us</span>
                </div>
              </a>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                <a
                  href="/merge-pdf"
                  className="text-sm font-semibold text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition-all hover:bg-red-50"
                >
                  Merge PDF
                </a>
                <a
                  href="/split-pdf"
                  className="text-sm font-semibold text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition-all hover:bg-red-50"
                >
                  Split PDF
                </a>
                <a
                  href="/compress-pdf"
                  className="text-sm font-semibold text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition-all hover:bg-red-50"
                >
                  Compress
                </a>

                {/* Convert Dropdown */}
                <div className="relative group">
                  <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition-all hover:bg-red-50">
                    Convert
                    <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">PDF Conversion</div>
                    <a href="/pdf-to-word" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      PDF to Word
                    </a>
                    <a href="/word-to-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      Word to PDF
                    </a>
                    <a href="/pdf-to-jpg" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      PDF to JPG
                    </a>
                    <a href="/jpg-to-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      JPG to PDF
                    </a>
                    <a href="/png-to-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      PNG to PDF
                    </a>
                    <a href="/pdf-to-png" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      PDF to PNG
                    </a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Tools</div>
                    <a href="/webp-to-png" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      WebP to PNG
                    </a>
                    <a href="/png-to-webp" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      PNG to WebP
                    </a>
                  </div>
                </div>

                {/* All Tools Dropdown */}
                <div className="relative group">
                  <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition-all hover:bg-red-50">
                    All Tools
                    <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <a href="/compress-image" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      Compress Image
                    </a>
                    <a href="/webp-to-png" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      WebP to PNG
                    </a>
                    <a href="/png-to-webp" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      PNG to WebP
                    </a>
                  </div>
                </div>
              </nav>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-gray-200 py-3 space-y-1">
                <a href="/merge-pdf" className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Merge PDF
                </a>
                <a href="/split-pdf" className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Split PDF
                </a>
                <a href="/compress-pdf" className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Compress PDF
                </a>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Convert</div>
                <a href="/pdf-to-word" className="block px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  PDF to Word
                </a>
                <a href="/word-to-pdf" className="block px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Word to PDF
                </a>
                <a href="/compress-image" className="block px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Compress Image
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-300 mt-20">
          {/* Main Footer Content */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-white">Small</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">PDF</span>
                    <span className="text-sm text-gray-400 ml-1">.us</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-sm">
                  Your trusted online PDF toolkit. Fast, secure, and 100% free. Process unlimited PDFs with no sign-up required.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400">Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Fast</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400">Free</span>
                  </div>
                </div>
              </div>

              {/* PDF Tools */}
              <div>
                <h3 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">PDF Tools</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="/merge-pdf" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Merge PDF</a></li>
                  <li><a href="/split-pdf" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Split PDF</a></li>
                  <li><a href="/compress-pdf" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Compress PDF</a></li>
                  <li><a href="/pdf-to-word" className="hover:text-white transition-colors hover:translate-x-1 inline-block">PDF to Word</a></li>
                  <li><a href="/word-to-pdf" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Word to PDF</a></li>
                </ul>
              </div>

              {/* Convert Tools */}
              <div>
                <h3 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Convert</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="/pdf-to-jpg" className="hover:text-white transition-colors hover:translate-x-1 inline-block">PDF to JPG</a></li>
                  <li><a href="/jpg-to-pdf" className="hover:text-white transition-colors hover:translate-x-1 inline-block">JPG to PDF</a></li>
                  <li><a href="/png-to-pdf" className="hover:text-white transition-colors hover:translate-x-1 inline-block">PNG to PDF</a></li>
                  <li><a href="/compress-image" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Compress Image</a></li>
                  <li><a href="/webp-to-png" className="hover:text-white transition-colors hover:translate-x-1 inline-block">WebP to PNG</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Company</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="/about" className="hover:text-white transition-colors hover:translate-x-1 inline-block">About Us</a></li>
                  <li><a href="/blog" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Blog</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Contact</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-sm text-gray-400">
                  © 2025 <span className="text-white font-semibold">SmallPDF.us</span> - All rights reserved
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                  <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                </div>
              </div>
              <p className="text-center md:text-left text-xs text-gray-500 mt-4">
                Made with <span className="text-red-500">❤</span> for PDF lovers everywhere
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}