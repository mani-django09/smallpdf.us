"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  Download,
  Upload,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Clock,
  Filter,
  RefreshCw,
  LogOut,
  BarChart3,
  Eye,
  Search,
  Calendar,
} from "lucide-react"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState(null)
  const [stats, setStats] = useState(null)
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    type: "",
    action: "",
    status: "",
  })
  const [selectedLog, setSelectedLog] = useState(null)

  // REMOVED localStorage check - storage APIs are not supported in artifacts

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5011/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setIsAuthenticated(true)
        // REMOVED localStorage.setItem - not supported
        fetchDashboardData(data.token)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure the backend is running on port 5011.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setToken(null)
    // REMOVED localStorage.removeItem - not supported
    setStats(null)
    setActivityLogs([])
  }

  const fetchDashboardData = async (authToken) => {
    try {
      // Fetch stats
      const statsResponse = await fetch("http://localhost:5011/api/admin/stats", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      
      if (!statsResponse.ok) {
        throw new Error(`Stats request failed: ${statsResponse.status}`)
      }
      
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch activity logs
      fetchActivityLogs(authToken, 1)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(`Failed to load dashboard data: ${err.message}`)
    }
  }

  const fetchActivityLogs = async (authToken, page = 1) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page,
        limit: 50,
        ...filters,
      })

      const response = await fetch(`http://localhost:5011/api/admin/activity?${queryParams}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (!response.ok) {
        throw new Error(`Activity logs request failed: ${response.status}`)
      }

      const data = await response.json()
      setActivityLogs(data.logs)
      setCurrentPage(data.pagination.page)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      console.error("Error fetching logs:", err)
      setError(`Failed to load activity logs: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    if (token) {
      fetchDashboardData(token)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "blocked":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "upload":
        return <Upload className="w-4 h-4" />
      case "download":
        return <Download className="w-4 h-4" />
      case "conversion":
        return <Activity className="w-4 h-4" />
      case "security_incident":
        return <Shield className="w-4 h-4" />
      case "admin":
        return <Users className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-600 text-sm mt-2">SmallPDF.us Activity Monitor</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              Default credentials: admin / admin123
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (!stats || !stats.total) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-3 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-xs text-slate-500">SmallPDF.us Activity Monitor</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            {
              label: "Total Conversions",
              value: stats.total.conversions || 0,
              change: stats.last24Hours.conversions || 0,
              icon: Activity,
              color: "from-blue-500 to-indigo-600",
            },
            {
              label: "Total Downloads",
              value: stats.total.downloads || 0,
              change: stats.last24Hours.downloads || 0,
              icon: Download,
              color: "from-green-500 to-emerald-600",
            },
            {
              label: "Total Uploads",
              value: stats.total.uploads || 0,
              change: stats.last24Hours.uploads || 0,
              icon: Upload,
              color: "from-purple-500 to-violet-600",
            },
            {
              label: "Total Errors",
              value: stats.total.errors || 0,
              change: stats.last24Hours.errors || 0,
              icon: AlertCircle,
              color: "from-red-500 to-rose-600",
            },
            {
              label: "Security Incidents",
              value: stats.total.securityIncidents || 0,
              change: 0,
              icon: Shield,
              color: "from-orange-500 to-amber-600",
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.change > 0 && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{stat.change}</span>
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-2">Last 24h: {stat.change}</div>
            </div>
          ))}
        </div>

        {/* Popular Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Popular Tools
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.popularTools || {}).map(([tool, count], idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{tool}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full w-32">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${(count / Object.values(stats.popularTools)[0]) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(stats.popularTools || {}).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No data yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Errors by Type
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.errorsByType || {}).length > 0 ? (
                Object.entries(stats.errorsByType).map(([error, count], idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{error}</span>
                    <span className="text-sm font-semibold text-red-600">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No errors recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  <option value="upload">Uploads</option>
                  <option value="conversion">Conversions</option>
                  <option value="download">Downloads</option>
                  <option value="security_incident">Security</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="failed">Failed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button
                  onClick={() => fetchActivityLogs(token, 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        <span className="text-sm font-medium text-slate-900">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.filename || log.tool || log.jobId || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {activityLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchActivityLogs(token, currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchActivityLogs(token, currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Details</h3>
            <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
            <button
              onClick={() => setSelectedLog(null)}
              className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}