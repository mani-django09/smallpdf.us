import Layout from "../components/Layout"
import { Shield, Lock, Eye, Trash2, Server, FileText } from "lucide-react"

export default function Privacy() {
  return (
    <Layout
      title="Privacy Policy - SmallPDF.us"
      description="Learn how SmallPDF.us protects your privacy and handles your data when you use our PDF tools."
    >
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-red-50">Last updated: December 24, 2024</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Key Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Encrypted Transfer</h3>
              <p className="text-sm text-slate-600">All files are encrypted during upload and download</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Auto-Delete</h3>
              <p className="text-sm text-slate-600">Files automatically deleted within 24 hours</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">No Access</h3>
              <p className="text-sm text-slate-600">We never view or share your documents</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                At SmallPDF.us, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our PDF processing services. Please 
                read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the site.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-red-600" />
                Information We Collect
              </h2>
              
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">1. Files You Upload</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                When you use our PDF tools, you upload files to our servers for processing. We temporarily 
                store these files to perform the requested operations (conversion, merging, compression, etc.). 
                These files are automatically deleted from our servers within 24 hours.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">2. Automatically Collected Information</h3>
              <p className="text-slate-600 leading-relaxed mb-2">We may automatically collect certain information, including:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4 mb-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Referring website</li>
                <li>Pages visited and time spent on our site</li>
                <li>Date and time of access</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">3. Cookies and Tracking Technologies</h3>
              <p className="text-slate-600 leading-relaxed">
                We may use cookies and similar tracking technologies to improve your experience on our website. 
                You can control cookie preferences through your browser settings.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Server className="w-6 h-6 text-red-600" />
                How We Use Your Information
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
                <li>Process your files and provide the requested PDF services</li>
                <li>Improve and optimize our website and services</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Ensure the security of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* File Security */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-red-600" />
                File Security and Storage
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-green-900 mb-2">Our Security Measures:</h4>
                <ul className="space-y-1 text-green-800">
                  <li>✓ SSL/TLS encryption for all data transfers</li>
                  <li>✓ Secure server infrastructure</li>
                  <li>✓ Regular security audits</li>
                  <li>✓ Access controls and authentication</li>
                  <li>✓ Automatic file deletion within 24 hours</li>
                </ul>
              </div>

              <p className="text-slate-600 leading-relaxed">
                While we implement reasonable security measures, no method of transmission over the Internet or 
                electronic storage is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-600" />
                Data Retention
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                <strong>Uploaded Files:</strong> All files uploaded to SmallPDF.us are automatically deleted 
                from our servers within 24 hours of upload. We do not permanently store your documents.
              </p>
              <p className="text-slate-600 leading-relaxed">
                <strong>Log Data:</strong> We may retain server logs and analytics data for up to 90 days for 
                security and operational purposes.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                We may use third-party services for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4">
                <li>Website analytics (e.g., Google Analytics)</li>
                <li>Cloud hosting and infrastructure</li>
                <li>Content delivery networks (CDN)</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                These third parties have their own privacy policies and we encourage you to review them.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Privacy Rights</h2>
              <p className="text-slate-600 leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Disable cookies through your browser settings</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Children's Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our Service is not intended for children under the age of 13. We do not knowingly collect 
                personally identifiable information from children under 13. If you are a parent or guardian 
                and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">International Users</h2>
              <p className="text-slate-600 leading-relaxed">
                Our servers are located in the United States. If you are accessing our Service from outside 
                the United States, please be aware that your information may be transferred to, stored, and 
                processed in the United States.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-900 font-medium mb-2">Email: privacy@smallpdf.us</p>
                <p className="text-slate-600">We typically respond within 24-48 hours</p>
              </div>
            </section>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Your Privacy is Our Priority
            </h3>
            <p className="text-slate-600 mb-6">
              We're committed to protecting your data and being transparent about our practices
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Contact Us
              </a>
              <a
                href="/terms"
                className="inline-flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-lg font-semibold border-2 border-slate-300 hover:border-red-600 hover:text-red-600 transition-all"
              >
                Read Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}