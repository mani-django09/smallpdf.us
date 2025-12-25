import Layout from "../components/Layout"
import { FileText, Shield, AlertCircle } from "lucide-react"

export default function Terms() {
  return (
    <Layout
      title="Terms of Service - SmallPDF.us"
      description="Read our Terms of Service to understand the rules and regulations for using SmallPDF.us PDF tools."
    >
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <FileText className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl text-red-50">Last updated: December 24, 2024</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">Please Read Carefully</h3>
                <p className="text-blue-800">
                  By accessing and using SmallPDF.us, you agree to be bound by these Terms of Service. 
                  If you do not agree with any part of these terms, please do not use our services.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  1
                </span>
                Acceptance of Terms
              </h2>
              <p className="text-slate-600 leading-relaxed">
                By accessing or using SmallPDF.us ("the Service"), you agree to comply with and be bound by 
                these Terms of Service. These terms apply to all visitors, users, and others who access or 
                use the Service.
              </p>
            </section>

            {/* 2. Use of Service */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  2
                </span>
                Use of Service
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                SmallPDF.us provides online PDF tools for converting, merging, compressing, splitting, and 
                editing PDF files. You agree to use the Service only for lawful purposes and in accordance 
                with these Terms.
              </p>
              <h3 className="font-bold text-slate-900 mb-2">You agree NOT to:</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
                <li>Upload files containing illegal, harmful, or offensive content</li>
                <li>Attempt to gain unauthorized access to our systems or networks</li>
                <li>Use the Service to distribute malware, viruses, or malicious code</li>
                <li>Violate any applicable local, state, national, or international law</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service excessively</li>
              </ul>
            </section>

            {/* 3. File Upload and Processing */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  3
                </span>
                File Upload and Processing
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                <strong>File Size Limits:</strong> Individual file uploads are limited to 100MB per file.
              </p>
              <p className="text-slate-600 leading-relaxed mb-3">
                <strong>File Storage:</strong> Uploaded files are temporarily stored on our servers for 
                processing purposes only. All files are automatically deleted within 24 hours of upload.
              </p>
              <p className="text-slate-600 leading-relaxed">
                <strong>File Responsibility:</strong> You are solely responsible for the content of files 
                you upload. We do not review, edit, or endorse user-uploaded content.
              </p>
            </section>

            {/* 4. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  4
                </span>
                Intellectual Property
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                The Service and its original content, features, and functionality are owned by SmallPDF.us 
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-slate-600 leading-relaxed">
                You retain all rights to the content of your files. By uploading files to our Service, you 
                grant us a temporary, limited license to process and convert your files solely for the 
                purpose of providing the Service to you.
              </p>
            </section>

            {/* 5. Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  5
                </span>
                Disclaimer of Warranties
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                <p className="text-yellow-900 font-medium">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
                </p>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free. 
                We do not warrant that the results obtained from the use of the Service will be accurate or 
                reliable.
              </p>
            </section>

            {/* 6. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  6
                </span>
                Limitation of Liability
              </h2>
              <p className="text-slate-600 leading-relaxed">
                In no event shall SmallPDF.us, its directors, employees, partners, agents, suppliers, or 
                affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including loss of profits, data, or other intangible losses, resulting from your use of or 
                inability to use the Service.
              </p>
            </section>

            {/* 7. Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  7
                </span>
                Privacy and Data Protection
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy 
                Policy to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            {/* 8. Modifications to Service */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  8
                </span>
                Modifications to Service
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) 
                at any time, with or without notice. We shall not be liable to you or any third party for 
                any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            {/* 9. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  9
                </span>
                Changes to Terms
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We reserve the right to update or modify these Terms of Service at any time without prior 
                notice. Your continued use of the Service after any changes constitutes acceptance of the 
                new Terms.
              </p>
            </section>

            {/* 10. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  10
                </span>
                Governing Law
              </h2>
              <p className="text-slate-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United 
                States, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* 11. Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                  11
                </span>
                Contact Information
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-900 font-medium">Email: support@smallpdf.us</p>
              </div>
            </section>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Have Questions About Our Terms?
            </h3>
            <p className="text-slate-600 mb-6">
              We're here to help clarify anything you need
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}