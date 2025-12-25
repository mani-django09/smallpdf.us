import Layout from "../components/Layout"
import { FileText, Shield, Zap, Users, Award, Globe } from "lucide-react"

export default function About() {
  return (
    <Layout
      title="About Us - SmallPDF.us"
      description="Learn about SmallPDF.us - Your trusted online PDF tool for converting, merging, compressing, and editing PDF files with ease."
    >
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About SmallPDF.us</h1>
            <p className="text-xl text-red-50">
              Your trusted partner for all PDF operations - fast, secure, and completely free
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-4">
              At SmallPDF.us, we believe that working with PDF files should be simple, fast, and accessible to everyone. 
              Our mission is to provide high-quality PDF tools that help individuals and businesses accomplish their 
              document tasks efficiently without the need for expensive software or complicated processes.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We're committed to delivering a seamless user experience while maintaining the highest standards 
              of security and privacy for your documents.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Lightning Fast</h3>
              <p className="text-slate-600">
                Our optimized tools process your PDFs in seconds, saving you valuable time and boosting productivity.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Private</h3>
              <p className="text-slate-600">
                Your files are encrypted during transfer and automatically deleted from our servers after processing.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">All-in-One Solution</h3>
              <p className="text-slate-600">
                Convert, merge, split, compress, and edit PDFs - everything you need in one convenient platform.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Works Everywhere</h3>
              <p className="text-slate-600">
                Access our tools from any device - desktop, tablet, or mobile. No installation required.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Choose SmallPDF.us?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">100% Free to Use</h3>
                  <p className="text-slate-600">
                    No hidden fees, no subscriptions, no watermarks. All our tools are completely free forever.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Your Privacy Matters</h3>
                  <p className="text-slate-600">
                    We don't store your files permanently. All uploads are automatically deleted within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">User-Friendly Interface</h3>
                  <p className="text-slate-600">
                    Simple, intuitive design that anyone can use - no technical knowledge required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">High-Quality Results</h3>
                  <p className="text-slate-600">
                    Advanced algorithms ensure your PDFs maintain perfect quality after conversion or compression.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-slate-600 mb-8">
              Join thousands of users who trust SmallPDF.us for their PDF needs
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
            >
              <FileText className="w-5 h-5" />
              Explore Our Tools
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}