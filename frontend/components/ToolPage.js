// components/ToolPage.js - Reusable Tool Component
import { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FileText, Upload, Download, ArrowLeft, CheckCircle, Loader } from 'lucide-react';

export default function ToolPage({ 
  title, 
  description, 
  apiEndpoint, 
  acceptedFormats,
  multiple = false,
  icon: Icon = FileText 
}) {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (multiple) {
      setFiles(selectedFiles);
    } else {
      setFile(selectedFiles[0]);
    }
    setError(null);
    setResult(null);
  }, [multiple]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (multiple) {
      setFiles(droppedFiles);
    } else {
      setFile(droppedFiles[0]);
    }
    setError(null);
    setResult(null);
  }, [multiple]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && files.length === 0) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (multiple) {
        files.forEach(f => formData.append('files', f));
      } else {
        formData.append('file', file);
      }

      const response = await fetch(`http://localhost:5000${apiEndpoint}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to process file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <Head>
        <title>{title} - PDF Tools</title>
        <meta name="description" content={description} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">PDF Tools</span>
              </Link>
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tool Header */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Upload Area */}
          {!result && (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <form onSubmit={handleSubmit}>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept={acceptedFormats}
                    multiple={multiple}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      Drop your {multiple ? 'files' : 'file'} here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: {acceptedFormats}
                    </p>
                  </label>
                </div>

                {(file || files.length > 0) && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Selected Files:</h3>
                    <div className="space-y-2">
                      {multiple ? (
                        files.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-700">{f.name}</span>
                            <span className="text-xs text-gray-500">
                              {(f.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (!file && files.length === 0)}
                  className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Convert {multiple ? 'Files' : 'File'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="text-center mb-8">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Success!
                </h2>
                <p className="text-gray-600">
                  {result.message}
                </p>
              </div>

              {result.originalSize && result.compressedSize && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Original Size</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(result.originalSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Saved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(((result.originalSize - result.compressedSize) / result.originalSize) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">New Size</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(result.compressedSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`http://localhost:5000${result.downloadUrl}`}
                  download
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download File</span>
                </a>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-white text-gray-900 py-4 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition"
                >
                  Convert Another
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
              <p className="text-sm text-gray-600">
                Maintain original quality with advanced processing
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Secure</h3>
              <p className="text-sm text-gray-600">
                Files processed locally, never uploaded to servers
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Loader className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Process files in seconds with optimized algorithms
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}